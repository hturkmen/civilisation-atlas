import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
import {importEditorial} from '../src/import-editorial.mjs';
import {migrateLocal} from '../src/migrate-local.mjs';
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--data-dir' || !args[1].trim())) throw new Error('Usage: node scripts/import-local.mjs [--data-dir dedicated-local-directory]');
const directory=args.length?resolve(args[1]):undefined;
const db=new PGlite({...(directory?{dataDir:directory}:{}),extensions:{postgis}});
try {
  await migrateLocal(db);
  const inputs=await loadEditorialInputs();
  const pins=JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'));
  console.log(JSON.stringify({mode:directory?'local-persistent':'memory-check',...await importEditorial(db,inputs,pins),published:0}));
} finally {await db.close();}
