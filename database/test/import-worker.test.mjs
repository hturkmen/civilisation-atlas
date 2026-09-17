import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
import {createEditorialRevision} from '../../packages/domain/src/editorial-revisions.mjs';
import {migrateLocal} from '../src/migrate-local.mjs';
import {enqueueImport,claimImport,heartbeatImport,failImport,classifyFailure,executeImportClaim,runImportOnce} from '../../apps/worker/import-tasks.mjs';
let db,dir;
const inputs=await loadEditorialInputs();
before(async()=>{db=new PGlite({extensions:{postgis}});await migrateLocal(db);dir=await mkdtemp(join(tmpdir(),'atlas-worker-'));});
after(async()=>{await db.close();await rm(dir,{recursive:true,force:true});});
const row=async id=>(await db.query('SELECT * FROM atlas.import_task WHERE id=$1',[id])).rows[0];
const count=async table=>(await db.query(`SELECT count(*)::int AS n FROM atlas.${table}`)).rows[0].n;
async function fixture(name,{broken=false,geometry=false}={}){
  const b={formatVersion:1,sources:structuredClone(inputs.sources),candidates:structuredClone(inputs.candidates),entities:structuredClone(inputs.entities.filter(e=>inputs.candidates.some(c=>c.entityRef.id===e.id&&c.entityRef.kind===e.kind)))};
  b.candidates[0].claimStatement+=' '+name;
  if(geometry)b.entities.find(e=>e.kind==='boundary_record').content.geometry.geometry.coordinates=[[[[0,0],[2,2],[0,2],[2,0],[0,0]]]];
  b.revisions=b.candidates.map(c=>createEditorialRevision(c,b.sources,b.entities.find(e=>e.kind===c.entityRef.kind&&e.id===c.entityRef.id)));
  const file=join(dir,name+'.json');await writeFile(file,broken?'{':JSON.stringify(b));
  return {file,task:await enqueueImport(db,file)};
}
// Only test fixtures move DB timestamps, as trusted owner, to avoid sleeps. Production code uses DB clock exclusively.
const due=async id=>db.query("UPDATE atlas.import_task SET available_at=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);
const expire=async id=>db.query("UPDATE atlas.import_task SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);

test('real queued import commits receipt and task together, with no publication or duplicate task',async()=>{
  const {file,task}=await fixture('success');
  const result=await runImportOnce(db,task.id,file);assert.equal(result.state,'imported');assert.equal(result.attempt,1);
  assert.equal((await row(task.id)).receipt_id,result.receiptId);
  assert.equal((await enqueueImport(db,file)).id,task.id);
  const before=await count('local_import_job');assert.equal((await runImportOnce(db,task.id,file)).worked,false);assert.equal(await count('local_import_job'),before);
  assert.equal(await count('dataset_release'),0);
  assert.deepEqual((await db.query('SELECT state FROM atlas.import_task_event WHERE task_id=$1 ORDER BY id',[task.id])).rows.map(r=>r.state),['queued','running','imported']);
});
test('data errors end in quarantine and are not retried',async()=>{
  const {file,task}=await fixture('bad-json',{broken:true});
  assert.equal((await runImportOnce(db,task.id,file)).state,'quarantined');assert.equal((await row(task.id)).attempt,1);
  assert.equal(await claimImport(db,task.id),null);
});
test('changed queued input fails before atlas writes or receipt creation',async()=>{
  const {file,task}=await fixture('changed');const before=await count('local_import_job');
  await writeFile(file,'{}');const result=await runImportOnce(db,task.id,file);
  assert.equal(result.state,'failed');assert.equal(result.errorCode,'INPUT_CHANGED');assert.equal(await count('local_import_job'),before);
});
test('one claim owns a task and wrong ownership token cannot renew it',async()=>{
  const {task}=await fixture('owner');const claim=await claimImport(db,task.id);
  assert.equal(await claimImport(db,task.id),null);
  assert.equal(await heartbeatImport(db,{...claim,lease_token:randomUUID()}),false);
  assert.equal(await heartbeatImport(db,claim),true);
  await failImport(db,claim,'UNEXPECTED_FAILURE',false);
});
test('lost worker waits for retry, gets a new token, and stale worker cannot complete or fail it',async()=>{
  const {task,file}=await fixture('restart');const old=await claimImport(db,task.id);await expire(task.id);
  assert.equal(await claimImport(db,task.id),null);assert.equal((await row(task.id)).state,'queued');
  assert.equal(await claimImport(db,task.id),null);await due(task.id);
  const fresh=await claimImport(db,task.id);assert.equal(fresh.attempt,2);assert.notEqual(fresh.lease_token,old.lease_token);
  assert.equal(await heartbeatImport(db,old),false);assert.equal(await failImport(db,old,'TIME_BUDGET',true),false);
  assert.equal((await executeImportClaim(db,old,file)).state,'lease_lost');
  assert.equal((await executeImportClaim(db,fresh,file)).state,'imported');
});
test('heartbeat cannot exceed the absolute attempt deadline or revive an expired claim',async()=>{
  const {task}=await fixture('deadline');const claim=await claimImport(db,task.id);
  await db.query("UPDATE atlas.import_task SET lease_until=clock_timestamp()+interval '5 seconds',attempt_deadline=clock_timestamp()+interval '5 seconds' WHERE id=$1",[task.id]);
  const before=(await row(task.id)).attempt_deadline;assert.equal(await heartbeatImport(db,claim),true);
  const renewed=await row(task.id);assert.equal(+new Date(renewed.attempt_deadline),+new Date(before));assert.ok(+new Date(renewed.lease_until)<=+new Date(before));
  await expire(task.id);assert.equal(await heartbeatImport(db,claim),false);
});
test('retryable infrastructure errors stop after three attempts; unexpected errors are not retryable',async()=>{
  const {task}=await fixture('retries');
  for(let attempt=1;attempt<=3;attempt++){
    const claim=await claimImport(db,task.id);assert.equal(claim.attempt,attempt);
    const failure=classifyFailure({code:'40001'});assert.equal(failure.retry,true);
    assert.equal(await failImport(db,claim,failure.code,failure.retry),true);
    assert.equal((await row(task.id)).state,attempt<3?'queued':'failed');
    if(attempt<3){assert.equal(await claimImport(db,task.id),null);await due(task.id);}
  }
  assert.equal(await claimImport(db,task.id),null);
  assert.deepEqual(classifyFailure(new Error('unrecognized')),{code:'UNEXPECTED_FAILURE',retry:false});
});
test('late geometry failure leaves a terminal quarantine task but no partial atlas content',async()=>{
  const {task,file}=await fixture('invalid-geometry',{geometry:true});
  const before=await count('editorial_import');const result=await runImportOnce(db,task.id,file);
  assert.equal(result.state,'quarantined');assert.equal(await count('editorial_import'),before);
});
test('expiry at completion rolls back receipt and imported content before scheduling retry',async()=>{
  const {task,file}=await fixture('late-expiry');const claim=await claimImport(db,task.id);
  const before=await count('local_import_job');const revisions=await count('editorial_import');
  // Simulate DB clock expiry exactly at the last write gate inside the real import transaction.
  const wrapped={query:(...args)=>db.query(...args),transaction:work=>db.transaction(tx=>work({
    exec:(...args)=>tx.exec(...args),
    query:async(sql,args)=>{
      if(sql.includes('atlas.finish_import_task'))await tx.query("UPDATE atlas.import_task SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[task.id]);
      return tx.query(sql,args);
    }
  }))};
  const result=await executeImportClaim(wrapped,claim,file);
  assert.equal(result.state,'queued');assert.equal(result.errorCode,'TIME_BUDGET');
  assert.equal(await count('local_import_job'),before);assert.equal(await count('editorial_import'),revisions);
  assert.equal((await row(task.id)).receipt_id,null);
});
test('terminal tasks, audit events and receipt identity reject mutation',async()=>{
  const {task,file}=await fixture('immutable');await runImportOnce(db,task.id,file);
  await assert.rejects(db.query("UPDATE atlas.import_task SET state='queued',receipt_id=NULL WHERE id=$1",[task.id]),e=>e.code==='55000');
  await assert.rejects(db.query('DELETE FROM atlas.import_task_event'),e=>e.code==='55000');
  const other=await fixture('wrong-receipt');const claim=await claimImport(db,other.task.id);
  await assert.rejects(db.query('SELECT atlas.finish_import_task($1,$2,$3)',[claim.id,claim.lease_token,(await row(task.id)).receipt_id]),e=>e.code==='23514');
  await failImport(db,claim,'UNEXPECTED_FAILURE',false);
});
