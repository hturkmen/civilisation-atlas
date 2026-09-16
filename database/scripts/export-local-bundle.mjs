import {readFile,writeFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {loadEditorialInputs} from '../../scripts/lib/editorial-inputs.mjs';
const args=process.argv.slice(2);
if(args.length!==2 || args[0]!=='--output' || !isAbsolute(args[1]) || !args[1].endsWith('.json'))throw new Error('Usage: --output new-absolute-local.json');
const {sources,candidates,entities}=await loadEditorialInputs();
const revisions=JSON.parse(await readFile(new URL('../../data/editorial/revisions.json',import.meta.url),'utf8'));
// Limit the bundle to referenced entities; do not expand the source collection or fabricate a review.
const selected=entities.filter(e=>candidates.some(c=>c.entityRef.kind===e.kind && c.entityRef.id===e.id));
await writeFile(args[1],JSON.stringify({formatVersion:1,sources,candidates,entities:selected,revisions}),{flag:'wx',mode:0o600});
console.log('Local unreviewed bundle created. No publication or remote request.');
