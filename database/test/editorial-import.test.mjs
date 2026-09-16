import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
import {createEditorialRevision} from '../../packages/domain/src/editorial-revisions.mjs';
import {importEditorial} from '../src/import-editorial.mjs';
const inputs=await loadEditorialInputs();
const pins=JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'));
const db=new PGlite({extensions:{postgis}});
for(const file of ['0001_revision_core.sql','0002_spatial_import.sql']) await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
after(()=>db.close());
const count=async table=>(await db.query(`SELECT count(*)::int AS n FROM atlas.${table}`)).rows[0].n;

test('real Gate A package imports once without public release or review approval',async()=>{
  assert.deepEqual(await importEditorial(db,inputs,pins),{imported:4,blocked:1,unchanged:0});
  assert.equal(await count('editorial_import'),5);
  assert.equal(await count('source_revision'),5);
  assert.equal(await count('assertion_revision'),3);
  assert.equal(await count('geometry_revision'),1);
  assert.equal(await count('perspective_revision'),1);
  assert.equal(await count('dataset_release'),0);
  assert.equal(await count('release_member'),0);
  assert.deepEqual((await db.query('SELECT DISTINCT review_status FROM atlas.editorial_import')).rows,[{review_status:'unreviewed'}]);
});
test('repeated package is idempotent across all relational dependencies',async()=>{
  const tables=['editorial_import','entity','entity_revision','source_revision','temporal_extent','evidence_link','geometry_payload','editorial_import_source'];
  const before=await Promise.all(tables.map(count));
  assert.deepEqual(await importEditorial(db,inputs,pins),{imported:0,blocked:0,unchanged:5});
  assert.deepEqual(await Promise.all(tables.map(count)),before);
});
test('PostGIS stores the exact source geometry, indexes it and preserves unknown knowledge date',async()=>{
  const {rows}=await db.query(`SELECT ST_SRID(geom) AS srid,ST_IsValid(geom) AS valid,ST_GeometryType(geom) AS kind,
    ST_Intersects(geom,ST_MakeEnvelope(-10,30,40,55,4326)) AS intersects,original_geojson FROM atlas.geometry_payload`);
  assert.equal(rows[0].srid,4326);assert.equal(rows[0].valid,true);assert.equal(rows[0].kind,'ST_MultiPolygon');assert.equal(rows[0].intersects,true);
  const roman=inputs.candidates.find(c=>c.entityRef.kind==='boundary_record'&&c.status!=='blocked');
  assert.deepEqual(rows[0].original_geojson,inputs.resolveEntity(roman.entityRef).content.geometry.geometry);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname='atlas' AND indexname='geometry_payload_gist'")).rows[0].n,1);
  const perspective=(await db.query(`SELECT knowledge_extent_id,knowledge_date_note,t.start_earliest FROM atlas.perspective_revision p JOIN atlas.temporal_extent t ON t.id=p.artifact_extent_id`)).rows[0];
  assert.equal(perspective.knowledge_extent_id,null);assert.equal(perspective.start_earliest,1507);assert.ok(perspective.knowledge_date_note.includes('Tek bir bilgi tarihi yok'));
  const blocked=(await db.query("SELECT disposition,candidate_payload,assertion_revision_id,geometry_revision_id FROM atlas.editorial_import WHERE disposition='blocked'")).rows[0];
  assert.equal(blocked.geometry_revision_id,null);assert.equal(blocked.assertion_revision_id,null);assert.ok(blocked.candidate_payload.blockedReason.length>0);
});
test('changed source gets a new immutable revision; old pins and source payload remain readable',async()=>{
  const sources=structuredClone(inputs.sources);const candidate=inputs.candidates[0];
  const source=sources.find(s=>s.id===candidate.evidence[0].sourceId);const oldTitle=source.title;source.title+=' [synthetic test edit]';
  const changed={...inputs,sources,candidates:[candidate]};
  const pin=createEditorialRevision(candidate,sources,inputs.resolveEntity(candidate.entityRef));
  assert.deepEqual(await importEditorial(db,changed,[...pins,pin]),{imported:1,blocked:0,unchanged:0});
  const rows=(await db.query('SELECT revision_no,payload FROM atlas.source_revision r JOIN atlas.source s ON s.id=r.source_id WHERE s.stable_key=$1 ORDER BY revision_no',[source.id])).rows;
  assert.equal(rows.length,2);assert.equal(rows[0].payload.title,oldTitle);assert.equal(rows[1].revision_no,2);
  assert.equal(await count('dataset_release'),0);
});
test('stale/missing pins and candidate review flags fail before any writes',async()=>{
  const before=await count('editorial_import');
  await assert.rejects(importEditorial(db,inputs,[]),/Missing or stale/);
  const candidates=structuredClone(inputs.candidates);candidates[0].claimStatement+=' synthetic edit';
  await assert.rejects(importEditorial(db,{...inputs,candidates},pins),/Missing or stale/);
  candidates[0].reviewStatus='in_review';
  await assert.rejects(importEditorial(db,{...inputs,candidates},pins),/only unreviewed/);
  assert.equal(await count('editorial_import'),before);
});
test('a late invalid geometry rolls back all earlier candidate/source writes in the batch',async()=>{
  const candidates=structuredClone(inputs.candidates.filter(c=>c.status!=='blocked'&&c.entityRef.kind!=='perspective')).slice(0,3);
  candidates[0].claimStatement+=' synthetic rollback case';
  const entities=structuredClone(inputs.entities);
  const roman=entities.find(e=>e.kind==='boundary_record'&&e.id===candidates[2].entityRef.id);
  // Synthetic self-crossing ring, not a modification of the shipped artifact.
  roman.content.geometry.geometry={type:'MultiPolygon',coordinates:[[[[0,0],[2,2],[0,2],[2,0],[0,0]]]]};
  const changed={...inputs,candidates,resolveEntity:ref=>entities.find(e=>e.kind===ref.kind&&e.id===ref.id)};
  const newPins=candidates.map(c=>createEditorialRevision(c,inputs.sources,changed.resolveEntity(c.entityRef)));
  const tables=['editorial_import','assertion_revision','entity_revision','temporal_extent','geometry_revision'];
  const before=await Promise.all(tables.map(count));
  await assert.rejects(importEditorial(db,changed,newPins),e=>e.code==='23514');
  assert.deepEqual(await Promise.all(tables.map(count)),before);
});
test('spatial schema rejects wrong SRID, wrong shape, out-of-range coordinates and mutation',async()=>{
  const id=(await db.query('SELECT geometry_revision_id FROM atlas.geometry_payload')).rows[0].geometry_revision_id;
  await assert.rejects(db.query('UPDATE atlas.geometry_payload SET original_geojson=original_geojson'),e=>e.code==='55000');
  for(const geometry of [
    {type:'Point',coordinates:[0,0]},
    {type:'MultiPolygon',coordinates:[[[[180,0],[182,0],[182,1],[180,0]]]]},
    {type:'MultiPolygon',crs:{type:'name',properties:{name:'EPSG:3857'}},coordinates:[[[[0,0],[1,0],[1,1],[0,0]]]]},
  ]) {
    // Conversion/check expression is evaluated before the existing primary-key conflict.
    await assert.rejects(db.query('INSERT INTO atlas.geometry_payload VALUES ($1,$2,DEFAULT)',[id,JSON.stringify(geometry)]),e=>['22023','23514'].includes(e.code));
  }
});
