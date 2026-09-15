import {readFile} from 'node:fs/promises';
import {validateEditorialCandidates, validateEditorialSources, evaluatePublishability} from '../packages/domain/src/editorial.mjs';

const sources = JSON.parse(await readFile(new URL('../data/editorial/sources.json', import.meta.url), 'utf8'));
const candidates = JSON.parse(await readFile(new URL('../data/editorial/candidates.json', import.meta.url), 'utf8'));

validateEditorialSources(sources);
validateEditorialCandidates(candidates, sources);

const report = candidates.map(candidate => ({id: candidate.id, status: candidate.status, reviewStatus: candidate.reviewStatus, ...evaluatePublishability(candidate, sources)}));
for (const entry of report) {
  console.log(`${entry.id}: publishable=${entry.publishable}${entry.reasons.length ? ' (' + entry.reasons.join('; ') + ')' : ''}`);
}

const publishedCount = report.filter(entry => entry.publishable).length;
console.log(`\nEditorial contract: ${sources.length} source(s), ${candidates.length} candidate(s) structurally valid, ${publishedCount} publishable.`);
if (publishedCount > 0) {
  console.warn('Warning: at least one candidate reports publishable=true. Verify this is expected before any export step relies on it.');
}
