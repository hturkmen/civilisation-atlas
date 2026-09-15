import {readFile} from 'node:fs/promises';
import {validateEditorialCandidates, validateEditorialSources, evaluatePublishability} from '../packages/domain/src/editorial.mjs';

const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

const sources = await read('../data/editorial/sources.json');
const candidates = await read('../data/editorial/candidates.json');

// An entityRef that points at nothing is a broken claim, not a valid draft.
// The ids come from the collections that already exist; the domain module
// stays file-system free and only receives the resolved lists.
const [preview, boundaries, maps] = await Promise.all([
  read('../data/preview-collection.json'),
  read('../data/boundary-collection.json'),
  read('../data/historical-maps.json')
]);
const entityRegistry = {
  settlement: preview.places.map(place => place.id),
  boundary_record: boundaries.records.map(record => record.id),
  perspective: maps.map(map => map.id)
};

validateEditorialSources(sources);
validateEditorialCandidates(candidates, sources, entityRegistry);

const report = candidates.map(candidate => ({id: candidate.id, status: candidate.status, reviewStatus: candidate.reviewStatus, ...evaluatePublishability(candidate, sources)}));
for (const entry of report) {
  console.log(`${entry.id}: publishable=${entry.publishable}${entry.reasons.length ? ' (' + entry.reasons.join('; ') + ')' : ''}`);
}

const publishedCount = report.filter(entry => entry.publishable).length;
console.log(`\nEditorial contract: ${sources.length} source(s), ${candidates.length} candidate(s) structurally valid against ${entityRegistry.settlement.length + entityRegistry.boundary_record.length + entityRegistry.perspective.length} existing entities, ${publishedCount} publishable.`);
if (publishedCount > 0) {
  console.warn('Warning: at least one candidate reports publishable=true. Verify this is expected before any export step relies on it.');
}
