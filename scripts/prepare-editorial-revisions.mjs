import {readFile, writeFile} from 'node:fs/promises';
import {loadEditorialInputs} from './lib/editorial-inputs.mjs';
import {createEditorialRevision, validateRevisionManifest} from '../packages/domain/src/editorial-revisions.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--write')) throw new Error('Usage: node scripts/prepare-editorial-revisions.mjs [--write]');
const write = args[0] === '--write';
const file = new URL('../data/editorial/revisions.json', import.meta.url);
let revisions;
try {revisions = JSON.parse(await readFile(file, 'utf8'));}
catch (error) {if (write && error.code === 'ENOENT') revisions = []; else throw error;}
validateRevisionManifest(revisions);
const {candidates, sources, resolveEntity} = await loadEditorialInputs();
const current = candidates.map(candidate => createEditorialRevision(candidate, sources, resolveEntity(candidate.entityRef)));
const missing = current.filter(revision => !revisions.some(existing => existing.revisionId === revision.revisionId));
if (!write && missing.length) throw new Error('Missing current revision pins: ' + missing.map(item => item.candidateId).join(', ') + '. Review the changes, then run with --write.');
if (write && missing.length) await writeFile(file, JSON.stringify([...revisions, ...missing], null, 2) + '\n');
console.log(`${current.length} current revision pins verified; ${missing.length} ${write ? 'appended' : 'missing'}. No review status changed.`);
