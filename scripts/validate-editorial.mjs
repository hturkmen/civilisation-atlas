import {readFile} from 'node:fs/promises';
import {validateEditorialCandidates} from '../packages/domain/src/editorial.mjs';
import {createEditorialRevision, validateRevisionManifest, evaluateRevisionPublishability} from '../packages/domain/src/editorial-revisions.mjs';
import {loadEditorialInputs} from './lib/editorial-inputs.mjs';

const {sources, candidates, entities, resolveEntity} = await loadEditorialInputs();
const registry = Object.fromEntries(['settlement', 'boundary_record', 'perspective'].map(kind => [kind, entities.filter(entity => entity.kind === kind).map(entity => entity.id)]));
validateEditorialCandidates(candidates, sources, registry);
const revisions = validateRevisionManifest(JSON.parse(await readFile(new URL('../data/editorial/revisions.json', import.meta.url), 'utf8')));
// No authenticated review service exists yet. Never manufacture an attestation from candidate flags.
const report = candidates.map(candidate => {
  const entity = resolveEntity(candidate.entityRef);
  const current = createEditorialRevision(candidate, sources, entity);
  const revision = revisions.find(item => item.revisionId === current.revisionId);
  if (!revision) throw new Error('Missing current revision pin: ' + candidate.id + '. Run prepare-editorial-revisions.mjs after reviewing the change.');
  return {id: candidate.id, ...evaluateRevisionPublishability(candidate, sources, entity, revision)};
});
for (const entry of report) console.log(`${entry.id}: publishable=${entry.publishable} (${entry.reasons.join('; ')})`);
console.log(`\nEditorial contract: ${sources.length} sources, ${candidates.length} candidates, ${entities.length} existing entities, ${report.filter(entry => entry.publishable).length} publishable. Revision pins verified; authenticated reviews not implemented.`);
