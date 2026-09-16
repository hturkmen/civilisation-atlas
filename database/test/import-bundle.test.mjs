import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {migrateLocal} from '../src/migrate-local.mjs';
import {importBundleFile,IMPORT_LIMITS} from '../src/import-bundle.mjs';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
import {createEditorialRevision} from '../../packages/domain/src/editorial-revisions.mjs';

let db,dir;
before(async()=>{
  db=new PGlite({extensions:{postgis}}); await migrateLocal(db);
  dir=await mkdtemp(join(tmpdir(),'atlas-import-test-'));
});
after(async()=>{if(db)await db.close();if(dir)await rm(dir,{recursive:true,force:true});});
const jobCount=async()=>Number((await db.query('SELECT count(*)::int AS n FROM atlas.local_import_job')).rows[0].n);

test('malformed JSON is quarantined without atlas content writes',async()=>{
  const file=join(dir,'broken.json'); await writeFile(file,'{"formatVersion":1,');
  const result=await importBundleFile(db,file);
  assert.equal(result.outcome,'quarantined'); assert.equal(result.reasonCode,'INVALID_JSON');
  assert.equal(await jobCount(),1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM atlas.editorial_import')).rows[0].n,0);
});

test('oversized local input is quarantined before parsing',async()=>{
  const before=await jobCount();
  const file=join(dir,'oversized.json'); await writeFile(file,'x'.repeat(IMPORT_LIMITS.bytes+1));
  const result=await importBundleFile(db,file);
  assert.equal(result.outcome,'quarantined'); assert.equal(result.reasonCode,'BYTE_LIMIT');
  assert.equal(await jobCount(),before+1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM atlas.editorial_import')).rows[0].n,0);
});

const inputs=await loadEditorialInputs();
const template={formatVersion:1,sources:inputs.sources,candidates:inputs.candidates,
  entities:inputs.entities.filter(e=>inputs.candidates.some(c=>c.entityRef.kind===e.kind&&c.entityRef.id===e.id)),
  revisions:JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'))};
const repin=b=>{b.revisions=b.candidates.map(c=>createEditorialRevision(c,b.sources,b.entities.find(e=>e.kind===c.entityRef.kind&&e.id===c.entityRef.id)));};
async function run(name,value){const file=join(dir,name+'.json');await writeFile(file,typeof value==='string'?value:JSON.stringify(value));return importBundleFile(db,file);}
test('successful bundle reuses the receipt and content; receipts link all five revisions',async()=>{
  const first=await run('valid',template);assert.equal(first.outcome,'imported');
  assert.deepEqual(first.result,{imported:4,blocked:1,unchanged:0});
  const before=await jobCount();
  const second=await importBundleFile(db,join(dir,'valid.json'));
  assert.equal(second.jobId,first.jobId);assert.equal(second.reused,true);assert.equal(await jobCount(),before);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM atlas.local_import_job_revision WHERE job_id=$1',[first.jobId])).rows[0].n,5);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM atlas.dataset_release')).rows[0].n,0);
});
test('known bad checksum reuses quarantine without saving raw content or paths',async()=>{
  const before=await jobCount();const result=await importBundleFile(db,join(dir,'broken.json'));
  assert.equal(result.reused,true);assert.equal(result.reasonCode,'INVALID_JSON');assert.equal(await jobCount(),before);
  const rows=(await db.query('SELECT * FROM atlas.local_import_job WHERE id=$1',[result.jobId])).rows;
  assert.ok(!JSON.stringify(rows).includes(dir));assert.deepEqual(rows[0].result,{});assert.match(rows[0].input_sha256,/^[a-f0-9]{64}$/);
});
test('depth, node, record and vertex budgets reject bounded but expensive input',async()=>{
  assert.equal((await run('depth','['.repeat(65)+'0'+']'.repeat(65))).reasonCode,'DEPTH_LIMIT');
  assert.equal((await run('nodes',Array(IMPORT_LIMITS.nodes+1).fill(0))).reasonCode,'NODE_LIMIT');
  const records=structuredClone(template);records.candidates=Array(101).fill(records.candidates[0]);
  assert.equal((await run('records',records)).reasonCode,'RECORD_LIMIT');
  const vertices=structuredClone(template);
  vertices.entities.find(e=>e.kind==='boundary_record').content.geometry.geometry.coordinates=[[Array(IMPORT_LIMITS.vertices+1).fill([0,0])]];
  assert.equal((await run('vertices',vertices)).reasonCode,'VERTEX_LIMIT');
});
test('URL and terminal symlink inputs are rejected without network access',async()=>{
  const original=globalThis.fetch;let requests=0;
  globalThis.fetch=()=>{requests++;throw new Error('network forbidden');};
  try{
    for(const url of ['https://example.org/bundle.json','http://169.254.169.254/bundle.json'])assert.equal((await importBundleFile(db,url)).reasonCode,'LOCAL_JSON_REQUIRED');
    await symlink(join(dir,'valid.json'),join(dir,'alias.json'));
    assert.equal((await importBundleFile(db,join(dir,'alias.json'))).reasonCode,'REGULAR_FILE_REQUIRED');
    assert.equal(requests,0);
  }finally{globalThis.fetch=original;}
});
test('stale pins, supplied review flags and unsupported perspective dates are quarantined',async()=>{
  const stale=structuredClone(template);stale.candidates[0].claimStatement+=' changed';
  assert.equal((await run('stale',stale)).reasonCode,'INVALID_CONTRACT');
  const reviewed=structuredClone(template);reviewed.candidates[0].reviewStatus='in_review';
  assert.equal((await run('reviewed',reviewed)).reasonCode,'INVALID_CONTRACT');
  const dates=structuredClone(template);dates.entities.find(e=>e.kind==='perspective').content.publicationYear=1508;repin(dates);
  assert.equal((await run('dates',dates)).reasonCode,'INVALID_CONTRACT');
});
test('late PostGIS failure rolls back earlier candidate writes before recording quarantine',async()=>{
  const b=structuredClone(template);b.candidates[0].claimStatement+=' rollback test';
  b.entities.find(e=>e.kind==='boundary_record').content.geometry.geometry.coordinates=[[[[0,0],[2,2],[0,2],[2,0],[0,0]]]];repin(b);
  const tables=['editorial_import','entity_revision','assertion_revision','temporal_extent','source_revision'];
  const counts=async()=>Promise.all(tables.map(async t=>(await db.query(`SELECT count(*)::int AS n FROM atlas.${t}`)).rows[0].n));
  const before=await counts();const result=await run('invalid-topology',b);
  assert.equal(result.reasonCode,'GEOMETRY_OR_CONSTRAINT');assert.deepEqual(await counts(),before);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM atlas.local_import_job_revision WHERE job_id=$1',[result.jobId])).rows[0].n,0);
});
test('receipts are immutable and infrastructure failures are not mislabeled as quarantined data',async()=>{
  await assert.rejects(db.query('UPDATE atlas.local_import_job SET result=result'),e=>e.code==='55000');
  await assert.rejects(db.query('TRUNCATE atlas.local_import_job_revision'),e=>e.code==='55000');
  let attempts=0;const failure=Object.assign(new Error('database unavailable'),{code:'08006'});
  await assert.rejects(importBundleFile({transaction:async()=>{attempts++;throw failure;}},join(dir,'valid.json')),e=>e===failure);
  assert.equal(attempts,1);
});
