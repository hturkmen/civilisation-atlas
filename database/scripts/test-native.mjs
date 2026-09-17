import pg from 'pg';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {nativeTestConfig} from '../src/native-test-config.mjs';
import {migrateLocal} from '../src/migrate-local.mjs';
import {importBundleFile} from '../src/import-bundle.mjs';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';

const clients=[];let dir,step='configuration',passed=0,connectionError=false;
const check=(condition,code)=>{if(!condition)throw Object.assign(new Error(code),{code});};
const adapter=client=>({query:(...args)=>client.query(...args),exec:sql=>client.query(sql),transaction:async work=>{
  await client.query('BEGIN');
  try {const result=await work(adapter(client));await client.query('COMMIT');return result;}
  catch(error){await client.query('ROLLBACK');throw error;}
}});
try {
  const config=nativeTestConfig(process.env);
  // pg also reads PGOPTIONS/PGREPLICATION/etc. Clear inherited PG settings in this
  // standalone test process; only the validated explicit configuration may apply.
  for(const key of Object.keys(process.env))if(key.startsWith('PG'))delete process.env[key];
  step='connection';
  for(let i=0;i<3;i++){
    const client=new pg.Client(config);clients.push(client);
    client.on('error',()=>{connectionError=true;});await client.connect();
  }
  const [a,b,observer]=clients;
  step='empty database guard';
  const identity=(await observer.query('SELECT current_database() AS name, version() AS engine')).rows[0];
  check(identity.name===config.database&&!identity.engine.includes('PGlite'),'NATIVE_DATABASE_REQUIRED');
  // Keep this lock until all clients close. Refuse concurrent test runners before migrations.
  check((await observer.query("SELECT pg_try_advisory_lock(732041,1) AS ok")).rows[0].ok,'TEST_DATABASE_IN_USE');
  const schemas=(await observer.query("SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('public','information_schema') AND nspname !~ '^pg_'")).rows;
  const relations=(await observer.query("SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f')")).rows;
  check(schemas.length===0&&relations.length===0,'EMPTY_DATABASE_REQUIRED');
  await migrateLocal(adapter(a));
  await migrateLocal(adapter(a));
  const versions=(await a.query('SELECT version FROM atlas.schema_migration ORDER BY version')).rows.map(r=>r.version);
  assert.deepEqual(versions,[1,2,3,4]);
  const engine=(await a.query('SELECT version() AS postgres, postgis_version() AS postgis')).rows[0];
  console.log(JSON.stringify({engine})); // Version only; never connection strings or errors.
  const pids=await Promise.all([a,b].map(async c=>(await c.query('SELECT pg_backend_pid() AS pid')).rows[0].pid));
  assert.notEqual(pids[0],pids[1]);
  const task=async()=>{
    const id=randomUUID(),hash=createHash('sha256').update(id).digest('hex');
    await observer.query('INSERT INTO atlas.import_task(id,input_sha256) VALUES ($1,$2)',[id,hash]);return id;
  };
  const claim=(c,id,token=randomUUID())=>c.query('SELECT * FROM atlas.claim_import_task($1,$2)',[id,token]);
  const run=async(name,fn)=>{step=name;await fn();check(!connectionError,'CONNECTION_LOST');passed++;console.log(JSON.stringify({test:name,status:'passed'}));};

  await run('simultaneous claims have exactly one owner',async()=>{
    const id=await task();const results=await Promise.all([claim(a,id),claim(b,id)]);
    assert.equal(results.reduce((n,r)=>n+r.rows.length,0),1);
    assert.equal((await observer.query('SELECT attempt FROM atlas.import_task WHERE id=$1',[id])).rows[0].attempt,1);
  });
  await run('SKIP LOCKED does not wait on another connection',async()=>{
    const id=await task();await a.query('BEGIN');
    try {
      await a.query('SELECT id FROM atlas.import_task WHERE id=$1 FOR UPDATE',[id]);
      await b.query("SET statement_timeout='500ms'");
      assert.equal((await claim(b,id)).rows.length,0);
    } finally {await a.query('ROLLBACK');await b.query("SET statement_timeout='10s'");}
    assert.equal((await claim(b,id)).rows.length,1);
  });
  await run('heartbeat checks expiry after waiting for the row lock',async()=>{
    const id=await task(),token=randomUUID();await claim(a,id,token);await a.query('BEGIN');
    let pending;
    try {
      await a.query('SELECT id FROM atlas.import_task WHERE id=$1 FOR UPDATE',[id]);
      pending=b.query('SELECT atlas.heartbeat_import_task($1,$2) AS ok',[id,token]).then(result=>({result}),error=>({error}));
      const deadline=Date.now()+3000;let blocked=false;
      while(Date.now()<deadline){
        blocked=(await observer.query('SELECT $1::int=ANY(pg_blocking_pids($2)) AS blocked',pids)).rows[0].blocked;
        if(blocked)break;await delay(25);
      }
      check(blocked,'EXPECTED_LOCK_WAIT_NOT_OBSERVED');
      await a.query("UPDATE atlas.import_task SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);
      await a.query('COMMIT');
      const outcome=await pending;if(outcome.error)throw outcome.error;
      assert.equal(outcome.result.rows[0].ok,false);
    } finally {await a.query('ROLLBACK');if(pending)await pending;}
  });
  await run('native statement timeout aborts and rolls back task plus audit',async()=>{
    const id=randomUUID(),hash=createHash('sha256').update(id).digest('hex');
    await a.query('BEGIN');
    try {
      await a.query('INSERT INTO atlas.import_task(id,input_sha256) VALUES ($1,$2)',[id,hash]);
      await a.query("SET LOCAL statement_timeout='100ms'");
      await assert.rejects(a.query('SELECT pg_sleep(2)'),{code:'57014'});
    } finally {await a.query('ROLLBACK');}
    for(const [table,column] of [['import_task','id'],['import_task_event','task_id']]){
      assert.equal((await observer.query(`SELECT count(*)::int AS n FROM atlas.${table} WHERE ${column}=$1`,[id])).rows[0].n,0);
    }
  });
  await run('rolled-back claim does not consume an attempt',async()=>{
    const id=await task();await a.query('BEGIN');await claim(a,id);await a.query('ROLLBACK');
    const next=(await claim(b,id)).rows[0];assert.equal(next.attempt,1);
    assert.equal((await observer.query("SELECT count(*)::int AS n FROM atlas.import_task_event WHERE task_id=$1 AND state='running'",[id])).rows[0].n,1);
  });
  await run('reclaimed task rejects the former owner across connections',async()=>{
    const id=await task(),old=randomUUID(),fresh=randomUUID();await claim(a,id,old);
    await observer.query("UPDATE atlas.import_task SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);
    assert.equal((await claim(b,id)).rows.length,0);
    await observer.query("UPDATE atlas.import_task SET available_at=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);
    assert.equal((await claim(b,id,fresh)).rows[0].attempt,2);
    assert.equal((await a.query("SELECT atlas.fail_import_task($1,$2,'UNEXPECTED_FAILURE',false) AS ok",[id,old])).rows[0].ok,false);
    assert.equal((await a.query('SELECT atlas.heartbeat_import_task($1,$2) AS ok',[id,old])).rows[0].ok,false);
  });
  await run('two real imports share one receipt and immutable revisions',async()=>{
    const inputs=await loadEditorialInputs();
    const bundle={formatVersion:1,sources:inputs.sources,candidates:inputs.candidates,
      entities:inputs.entities.filter(e=>inputs.candidates.some(c=>c.entityRef.kind===e.kind&&c.entityRef.id===e.id)),
      revisions:JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'))};
    dir=await mkdtemp(join(tmpdir(),'atlas-native-test-'));const file=join(dir,'bundle.json');await writeFile(file,JSON.stringify(bundle),{mode:0o600});
    const results=await Promise.all([importBundleFile(adapter(a),file),importBundleFile(adapter(b),file)]);
    assert.equal(results[0].jobId,results[1].jobId);assert.equal(results.filter(r=>r.reused).length,1);
    assert.ok(results.every(r=>r.outcome==='imported'));
    assert.equal((await observer.query('SELECT count(*)::int AS n FROM atlas.editorial_import')).rows[0].n,5);
    assert.equal((await observer.query('SELECT count(*)::int AS n FROM atlas.dataset_release')).rows[0].n,0);
  });
  console.log(JSON.stringify({status:'passed',tests:passed,cleanup:'Database retained for inspection; use a new empty database on the next run.'}));
} catch(error) {
  // Never print pg error objects: they can contain SQL, paths or connection credentials.
  const code=/^[A-Z0-9_]{1,64}$/.test(error?.code??'')?error.code:'TEST_FAILED';
  console.error(JSON.stringify({status:'failed',step,code,testsPassed:passed}));process.exitCode=1;
} finally {
  await Promise.allSettled(clients.map(async c=>{try{await c.query('ROLLBACK');}finally{await c.end();}}));
  if(dir)await rm(dir,{recursive:true,force:true});
}
