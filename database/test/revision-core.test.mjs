import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const db = new PGlite();
await db.exec(await readFile(new URL('../migrations/0001_revision_core.sql', import.meta.url), 'utf8'));
after(() => db.close());
const id = n => `'00000000-0000-0000-0000-${String(n).padStart(12, '0')}'`;
const hash = "repeat('a',64)";
const members = [['entity_revision_id',4],['source_revision_id',5],['assertion_revision_id',6],['geometry_revision_id',7],['perspective_revision_id',8],['evidence_link_id',9],['evidence_link_id',10],['evidence_link_id',11]];
async function seed(rights = 'approved') {
  // Synthetic fixtures only: no real historical records or reviewer approvals.
  await db.exec(`
    INSERT INTO atlas.entity VALUES (${id(1)},'settlement','fixture');
    INSERT INTO atlas.source VALUES (${id(2)},'fixture-source');
    INSERT INTO atlas.temporal_extent VALUES (${id(3)},0,0,1,1,'1 BCE fixture');
    INSERT INTO atlas.entity_revision VALUES (${id(4)},${id(1)},1,${hash},'{}');
    INSERT INTO atlas.source_revision VALUES (${id(5)},${id(2)},1,${hash},'${rights}','{}');
    INSERT INTO atlas.assertion_revision VALUES (${id(6)},${id(4)},${id(3)},'fixture','{}',${hash});
    INSERT INTO atlas.geometry_revision VALUES (${id(7)},${id(4)},${id(3)},${hash},'fixture feature',${hash});
    INSERT INTO atlas.perspective_revision VALUES (${id(8)},'fixture observer',${id(3)},${id(3)},${hash},${hash},'{}');
    INSERT INTO atlas.dataset_release(id,data_as_of,app_schema_version) VALUES (${id(12)},'2026-09-16',1);
  `);
  for (const [n, column, target] of [[9,'assertion_revision_id',6],[10,'geometry_revision_id',7],[11,'perspective_revision_id',8]]) {
    await db.exec(`INSERT INTO atlas.evidence_link(id,source_revision_id,${column},relation,locator,source_statement,editorial_inference) VALUES (${id(n)},${id(5)},${id(target)},'supports','fixture page','fixture statement','fixture inference')`);
  }
  for (const [i,[column,n]] of members.entries()) {
    await db.exec(`INSERT INTO atlas.release_member(id,release_id,${column}) VALUES (${id(20+i)},${id(12)},${id(n)})`);
  }
}
const seal = () => db.exec(`UPDATE atlas.dataset_release SET state='validated',manifest_hash=${hash} WHERE id=${id(12)}`);
async function rejects(sql, code) {
  await db.exec('SAVEPOINT negative_case');
  try {await assert.rejects(db.exec(sql), error => error.code === code);}
  finally {await db.exec('ROLLBACK TO SAVEPOINT negative_case; RELEASE SAVEPOINT negative_case');}
}
function scenario(name, run, rights) {
  test(name, async () => {
    await db.exec('BEGIN');
    try {await seed(rights); await run();} finally {await db.exec('ROLLBACK');}
  });
}

test('migration installs exact typed relationships on a fresh PostgreSQL engine', async () => {
  assert.equal((await db.query('SELECT version FROM atlas.schema_migration')).rows[0].version,1);
  const {rows} = await db.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='atlas'");
  assert.equal(rows[0].count,12);
  console.log((await db.query('SELECT version()')).rows[0].version);
});
scenario('time ordering, typed foreign keys and revision uniqueness reject invalid data', async () => {
  await rejects(`INSERT INTO atlas.temporal_extent VALUES (${id(100)},2,1,3,3,'bad ordering')`, '23514');
  await rejects(`INSERT INTO atlas.temporal_extent VALUES (${id(100)},0,0,0,1,'empty possible interval')`, '23514');
  // Empty certain interval is allowed; possible interval remains nonempty.
  await db.exec(`INSERT INTO atlas.temporal_extent VALUES (${id(100)},0,2,1,3,'uncertain fixture')`);
  await rejects(`INSERT INTO atlas.entity_revision VALUES (${id(101)},${id(999)},1,${hash},'{}')`, '23503');
  await rejects(`INSERT INTO atlas.entity_revision VALUES (${id(101)},${id(1)},1,${hash},'{}')`, '23505');
  await rejects(`INSERT INTO atlas.entity_revision VALUES (${id(101)},${id(1)},2,'not-a-hash','{}')`, '23514');
  await rejects(`INSERT INTO atlas.release_member(id,release_id,geometry_revision_id) VALUES (${id(101)},${id(12)},${id(6)})`, '23503');
});
scenario('evidence requires exactly one real target and a locator or reason', async () => {
  const prefix = `INSERT INTO atlas.evidence_link(id,source_revision_id,assertion_revision_id,geometry_revision_id,relation,locator,source_statement,editorial_inference) VALUES (${id(101)},${id(5)},`;
  await rejects(prefix+`NULL,NULL,'supports','page','statement','inference')`, '23514');
  await rejects(prefix+`${id(6)},${id(7)},'supports','page','statement','inference')`, '23514');
  await rejects(prefix+`${id(999)},NULL,'supports','page','statement','inference')`, '23503');
  await rejects(prefix+`${id(6)},NULL,'supports',NULL,'statement','inference')`, '23514');
});
scenario('all snapshot dependencies resist update, delete and truncate', async () => {
  for (const table of ['entity','source','temporal_extent','entity_revision','source_revision','assertion_revision','geometry_revision','perspective_revision','evidence_link']) {
    await rejects(`UPDATE atlas.${table} SET id=id`, '55000');
    await rejects(`DELETE FROM atlas.${table}`, '55000');
    await rejects(`TRUNCATE atlas.${table} CASCADE`, '55000');
  }
});
scenario('release sealing enforces a manifest, same-release dependencies and supporting evidence', async () => {
  await rejects(`UPDATE atlas.dataset_release SET state='validated' WHERE id=${id(12)}`, '23514');
  for (const missing of [20,21,22,23,24,25,26,27]) {
    await db.exec('SAVEPOINT missing_member');
    await db.exec(`DELETE FROM atlas.release_member WHERE id=${id(missing)}`);
    await rejects(`UPDATE atlas.dataset_release SET state='validated',manifest_hash=${hash} WHERE id=${id(12)}`, '23514');
    await db.exec('ROLLBACK TO SAVEPOINT missing_member; RELEASE SAVEPOINT missing_member');
  }
  await seal();
  assert.equal((await db.query('SELECT state FROM atlas.dataset_release')).rows[0].state,'validated');
});
scenario('unknown source rights block relational sealing', async () => {
  await rejects(`UPDATE atlas.dataset_release SET state='validated',manifest_hash=${hash} WHERE id=${id(12)}`, '23514');
}, 'unknown');
scenario('context, contradiction and unlocated evidence cannot replace a located supporting source', async () => {
  for (const relation of ['context','contradicts','supports']) {
    await db.exec('SAVEPOINT replace_evidence');
    const locator = relation === 'supports' ? "NULL,'fixture locator unavailable'" : "'fixture page',NULL";
    await db.exec(`INSERT INTO atlas.evidence_link(id,source_revision_id,assertion_revision_id,relation,locator,locator_missing_reason,source_statement,editorial_inference)
      VALUES (${id(101)},${id(5)},${id(6)},'${relation}',${locator},'fixture statement','fixture inference')`);
    await db.exec(`UPDATE atlas.release_member SET evidence_link_id=${id(101)} WHERE id=${id(25)}`);
    await rejects(`UPDATE atlas.dataset_release SET state='validated',manifest_hash=${hash} WHERE id=${id(12)}`, '23514');
    await db.exec('ROLLBACK TO SAVEPOINT replace_evidence; RELEASE SAVEPOINT replace_evidence');
  }
});
scenario('release member has exactly one typed target and cannot move between releases', async () => {
  await rejects(`INSERT INTO atlas.release_member(id,release_id) VALUES (${id(101)},${id(12)})`, '23514');
  await rejects(`INSERT INTO atlas.release_member(id,release_id,assertion_revision_id,geometry_revision_id) VALUES (${id(101)},${id(12)},${id(6)},${id(7)})`, '23514');
  await db.exec(`INSERT INTO atlas.dataset_release(id,data_as_of,app_schema_version) VALUES (${id(101)},'2026-09-16',1)`);
  await rejects(`UPDATE atlas.release_member SET release_id=${id(101)} WHERE id=${id(20)}`, '55000');
});
scenario('sealed and withdrawn membership cannot be mutated or reopened', async () => {
  await seal();
  for (const state of ['validated','withdrawn']) {
    if (state==='withdrawn') await db.exec(`UPDATE atlas.dataset_release SET state='withdrawn' WHERE id=${id(12)}`);
    await rejects(`DELETE FROM atlas.release_member WHERE id=${id(20)}`, '55000');
    await rejects(`UPDATE atlas.release_member SET entity_revision_id=${id(4)} WHERE id=${id(20)}`, '55000');
    await rejects(`INSERT INTO atlas.release_member(id,release_id,entity_revision_id) VALUES (${id(101)},${id(12)},${id(4)})`, '55000');
    await rejects(`UPDATE atlas.dataset_release SET data_as_of='2027-01-01' WHERE id=${id(12)}`, '55000');
    await rejects(`UPDATE atlas.dataset_release SET state='building' WHERE id=${id(12)}`, '55000');
    await rejects('DELETE FROM atlas.dataset_release', '55000');
    await rejects('TRUNCATE atlas.dataset_release CASCADE', '55000');
  }
});
scenario('new snapshots cannot silently alter an existing release', async () => {
  await seal();
  await db.exec(`INSERT INTO atlas.entity_revision VALUES (${id(101)},${id(1)},2,repeat('b',64),'{"name":"new fixture"}')`);
  assert.equal((await db.query(`SELECT count(*)::int AS count FROM atlas.release_member WHERE release_id=${id(12)}`)).rows[0].count,8);
  await rejects(`INSERT INTO atlas.release_member(id,release_id,entity_revision_id) VALUES (${id(102)},${id(12)},${id(101)})`, '55000');
});
scenario('initial state cannot bypass sealing and no public activation is implemented', async () => {
  await rejects(`INSERT INTO atlas.dataset_release VALUES (${id(101)},'validated',${hash},'2026-09-16',1)`, '55000');
  await rejects(`INSERT INTO atlas.dataset_release VALUES (${id(101)},'active',${hash},'2026-09-16',1)`, '55000');
});
scenario('unprivileged database role has no schema access', async () => {
  await db.exec('CREATE ROLE atlas_fixture_reader; SET LOCAL ROLE atlas_fixture_reader');
  await rejects('SELECT * FROM atlas.entity_revision', '42501');
  await db.exec('RESET ROLE');
});
