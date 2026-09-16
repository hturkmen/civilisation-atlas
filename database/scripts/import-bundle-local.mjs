import {resolve} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {postgis} from '@electric-sql/pglite-postgis';
import {migrateLocal} from '../src/migrate-local.mjs';
import {importBundleFile} from '../src/import-bundle.mjs';
const args=process.argv.slice(2);
if(args.length!==4 || args[0]!=='--input' || args[2]!=='--data-dir' || !args[1]?.trim() || !args[3]?.trim())throw new Error('Usage: --input absolute-local.json --data-dir dedicated-local-directory');
const db=new PGlite({dataDir:resolve(args[3]),extensions:{postgis}});
try{
  await migrateLocal(db);
  const result=await importBundleFile(db,args[1]);
  console.log(JSON.stringify(result));
  if(result.outcome==='quarantined')process.exitCode=2;
} finally{await db.close();}
