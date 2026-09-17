import {randomUUID} from 'node:crypto';
import {bundleChecksum,importBundleFile} from '../../database/src/import-bundle.mjs';

export async function enqueueImport(db,file) {
  const hash=await bundleChecksum(file);
  // An exact input has one task for this adapter/policy; terminal tasks are never silently reopened.
  await db.query('INSERT INTO atlas.import_task(id,input_sha256) VALUES ($1,$2) ON CONFLICT (input_sha256,adapter_version,policy_version) DO NOTHING',[randomUUID(),hash]);
  return (await db.query("SELECT id,state,attempt,input_sha256 FROM atlas.import_task WHERE input_sha256=$1 AND adapter_version='gate-a-bundle-v1' AND policy_version='bounded-json-v1'",[hash])).rows[0];
}
export async function claimImport(db,id) {
  return (await db.query('SELECT * FROM atlas.claim_import_task($1,$2)',[id,randomUUID()])).rows[0]??null;
}
export async function heartbeatImport(db,claim) {
  return (await db.query('SELECT atlas.heartbeat_import_task($1,$2) AS ok',[claim.id,claim.lease_token])).rows[0].ok;
}
export async function failImport(db,claim,code,retry) {
  return (await db.query('SELECT atlas.fail_import_task($1,$2,$3,$4) AS ok',[claim.id,claim.lease_token,code,retry])).rows[0].ok;
}
export function classifyFailure(error) {
  if(error.code==='INPUT_CHANGED' || error.code==='INPUT_UNAVAILABLE')return {code:error.code,retry:false};
  if(error.code==='TIME_BUDGET' || error.code==='57014')return {code:'TIME_BUDGET',retry:true};
  if(['40001','40P01','55P03'].includes(error.code) || /^08/.test(error.code??''))return {code:'TRANSIENT_DATABASE',retry:true};
  return {code:'UNEXPECTED_FAILURE',retry:false};
}
export async function executeImportClaim(db,claim,file) {
  const budgetError=()=>Object.assign(new Error('Import ownership or time budget expired'),{code:'TIME_BUDGET'});
  try {
    if(!await heartbeatImport(db,claim))throw budgetError();
    // The import receipt, atlas writes and task completion share ONE transaction.
    // The importer can roll back invalid geometry, then open a fresh quarantine transaction.
    const guarded={transaction:work=>db.transaction(async tx=>{
      if(!await heartbeatImport(tx,claim))throw budgetError();
      await tx.query("SELECT set_config('statement_timeout','25000',true)");
      const receipt=await work(tx);
      const ok=(await tx.query('SELECT atlas.finish_import_task($1,$2,$3) AS ok',[claim.id,claim.lease_token,receipt.jobId])).rows[0].ok;
      if(!ok)throw budgetError();
      return receipt;
    })};
    const receipt=await importBundleFile(guarded,file,{expectedSha256:claim.input_sha256});
    return {taskId:claim.id,attempt:claim.attempt,state:receipt.outcome,receiptId:receipt.jobId};
  } catch(error) {
    const failure=classifyFailure(error);
    const recorded=await failImport(db,claim,failure.code,failure.retry);
    if(!recorded)return {taskId:claim.id,state:'lease_lost'};
    // Never echo raw DB messages, SQL, file paths or ownership tokens.
    return {taskId:claim.id,attempt:claim.attempt,state:failure.retry&&claim.attempt<3?'queued':'failed',errorCode:failure.code};
  }
}
export async function runImportOnce(db,id,file) {
  const claim=await claimImport(db,id);
  if(!claim){
    const row=(await db.query('SELECT state,attempt,available_at FROM atlas.import_task WHERE id=$1',[id])).rows[0];
    return {taskId:id,state:row?.state??'missing',attempt:row?.attempt??0,worked:false};
  }
  return {...await executeImportClaim(db,claim,file),worked:true};
}
