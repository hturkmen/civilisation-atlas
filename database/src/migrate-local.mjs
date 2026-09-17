import {readFile} from 'node:fs/promises';
export async function migrateLocal(db) {
  const files=['0001_revision_core.sql','0002_spatial_import.sql','0003_local_import_jobs.sql','0004_import_tasks.sql'];
  const exists=(await db.query("SELECT to_regclass('atlas.schema_migration') AS name")).rows[0].name;
  const versions=exists?(await db.query('SELECT version FROM atlas.schema_migration ORDER BY version')).rows.map(r=>r.version):[];
  if(versions.length>files.length || versions.some((v,i)=>v!==i+1))throw new Error('Unsupported local schema migration history');
  for(const [i,file] of files.entries())if(!versions.includes(i+1))await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
}
