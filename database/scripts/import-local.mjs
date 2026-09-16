import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
import {importEditorial} from '../src/import-editorial.mjs';
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--data-dir' || !args[1].trim())) throw new Error('Usage: node scripts/import-local.mjs [--data-dir dedicated-local-directory]');
const directory=args.length?resolve(args[1]):undefined;
const db=new PGlite({...(directory?{dataDir:directory}:{}),extensions:{postgis}});
try {
  const exists=(await db.query("SELECT to_regclass('atlas.schema_migration') AS name")).rows[0].name;
  let versions=exists?(await db.query('SELECT version FROM atlas.schema_migration ORDER BY version')).rows.map(r=>r.version):[];
  if(![JSON.stringify([]),JSON.stringify([1]),JSON.stringify([1,2])].includes(JSON.stringify(versions))) throw new Error('Unsupported local schema migration history');
  for(const [index,file] of ['0001_revision_core.sql','0002_spatial_import.sql'].entries()) {
    if(!versions.includes(index+1)) await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
  }
  const inputs=await loadEditorialInputs();
  const pins=JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'));
  console.log(JSON.stringify({mode:directory?'local-persistent':'memory-check',...await importEditorial(db,inputs,pins),published:0}));
} finally {await db.close();}
