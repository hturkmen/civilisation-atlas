import {randomUUID} from 'node:crypto';
import {importEditorial} from './import-editorial.mjs';
import {IMPORT_LIMITS,Rejection,readBounded} from './bundle-preflight.mjs';
import {preflightFile} from './preflight-process.mjs';
export {IMPORT_LIMITS};
const ADAPTER='gate-a-bundle-v1', POLICY='bounded-json-v1';
const reject=code=>{throw new Rejection(code);};

async function existing(tx, receipt) {
  if(!receipt.sha256)return null;
  const row=(await tx.query(`SELECT id,outcome,reason_code,result FROM atlas.local_import_job
    WHERE input_sha256=$1 AND adapter_version=$2 AND policy_version=$3`,[receipt.sha256,ADAPTER,POLICY])).rows[0];
  return row?{jobId:row.id,outcome:row.outcome,reasonCode:row.reason_code,result:row.result,reused:true}:null;
}
async function record(tx, receipt, outcome, reasonCode, result) {
  const jobId=randomUUID();
  await tx.query(`INSERT INTO atlas.local_import_job(id,adapter_version,policy_version,input_sha256,bytes_observed,outcome,reason_code,result)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,[jobId,ADAPTER,POLICY,receipt.sha256,receipt.bytesObserved,outcome,reasonCode,JSON.stringify(result)]);
  return {jobId,outcome,reasonCode,result,reused:false};
}
// Reuse the same bounded file reader for enqueue; file identity is checked again at execution.
export async function bundleChecksum(file) {
  const receipt={sha256:null,bytesObserved:0};
  await readBounded(file,receipt);
  return receipt.sha256;
}
export async function importBundleFile(db,file,{expectedSha256}={}) {
  const receipt={sha256:null,bytesObserved:0};
  try {
    const prepared=await preflightFile(file,expectedSha256);
    if(prepared.status==='failure')throw Object.assign(new Error(prepared.code),{code:prepared.code});
    Object.assign(receipt,prepared.receipt);
    if(prepared.status==='rejected')reject(prepared.code);
    const {inputs,pins,current}=prepared;
    const registry=new Map(inputs.entities.map(entity=>[JSON.stringify([entity.kind,entity.id]),entity]));
    inputs.resolveEntity=ref=>registry.get(JSON.stringify([ref?.kind,ref?.id]));
    return await db.transaction(async tx=>{
      await tx.exec('LOCK TABLE atlas.local_import_job IN SHARE ROW EXCLUSIVE MODE');
      const previous=await existing(tx,receipt);if(previous)return previous;
      let result;
      try {
        // Reuse the domain importer inside this SAME transaction; no nested transaction/partial receipt.
        result=await importEditorial({transaction:work=>work(tx)},inputs,pins);
      } catch(error) {
        if(['23514','22023'].includes(error.code))reject('GEOMETRY_OR_CONSTRAINT');
        // Unexpected DB/IO/programming failures must remain visible, not be labelled bad source data.
        throw error;
      }
      const job=await record(tx,receipt,'imported',null,result);
      for(const pin of current)await tx.query('INSERT INTO atlas.local_import_job_revision VALUES ($1,$2)',[job.jobId,pin.revisionId]);
      return job;
    });
  } catch(error) {
    if(expectedSha256!==undefined && error instanceof Rejection && receipt.sha256===null)throw Object.assign(new Error('Queued input unavailable'),{code:'INPUT_UNAVAILABLE'});
    if(!(error instanceof Rejection))throw error;
    // Atlas writes rolled back before the rejection receipt is written in a separate transaction.
    return db.transaction(async tx=>{
      await tx.exec('LOCK TABLE atlas.local_import_job IN SHARE ROW EXCLUSIVE MODE');
      return await existing(tx,receipt) ?? await record(tx,receipt,'quarantined',error.code,{});
    });
  }
}
