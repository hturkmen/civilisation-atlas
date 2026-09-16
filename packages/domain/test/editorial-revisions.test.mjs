import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contentHash} from '../src/editorial.mjs';
import {createEditorialRevision, validateRevisionManifest, evaluateRevisionPublishability} from '../src/editorial-revisions.mjs';
import {loadEditorialInputs} from '../../../scripts/lib/editorial-inputs.mjs';

const inputs = await loadEditorialInputs();
// Synthetic approval on copies only. Real candidates remain unreviewed.
function fixture(index = 0) {
  const candidate = structuredClone(inputs.candidates[index]);
  const sources = structuredClone(inputs.sources);
  const entity = structuredClone(inputs.resolveEntity(candidate.entityRef));
  candidate.reviewStatus = 'independently_reviewed';
  candidate.reviewer = 'fixture-reviewer';
  candidate.reviewedContentHash = contentHash(candidate);
  const revision = createEditorialRevision(candidate, sources, entity);
  const review = {revisionId: revision.revisionId, reviewer: candidate.reviewer};
  return {candidate, sources, entity, revision, review};
}
function evaluate(f) {return evaluateRevisionPublishability(f.candidate, f.sources, f.entity, f.revision, f.review);}

test('real pins resolve to exact existing entities and never create review approvals', async () => {
  const manifest = validateRevisionManifest(JSON.parse(await readFile(new URL('../../../data/editorial/revisions.json', import.meta.url))));
  for (const candidate of inputs.candidates) {
    const entity = inputs.resolveEntity(candidate.entityRef);
    const current = createEditorialRevision(candidate, inputs.sources, entity);
    assert.deepEqual(manifest.find(item => item.revisionId === current.revisionId), current);
    assert.equal(candidate.reviewStatus, 'unreviewed');
    assert.equal(evaluateRevisionPublishability(candidate, inputs.sources, entity, current).publishable, false);
  }
});

test('revision review binds unversioned source content and rights, not just its stable id', () => {
  assert.equal(evaluate(fixture()).publishable, true);
  for (const field of ['title', 'locatorUrl', 'rightsNote', 'revisionNote']) {
    const f = fixture();
    const source = f.sources.find(s => s.id === f.candidate.evidence[0].sourceId);
    source[field] = field === 'locatorUrl' ? 'https://example.invalid/changed' : source[field] + ' fixture change';
    assert.equal(evaluate(f).publishable, false, field);
    f.revision = createEditorialRevision(f.candidate, f.sources, f.entity);
    assert.equal(evaluate(f).publishable, false, 'regenerating pins cannot renew the old review');
  }
  const f = fixture();
  f.sources.find(s => s.id === f.candidate.evidence[0].sourceId).rightsStatus = 'revoked';
  f.revision = createEditorialRevision(f.candidate, f.sources, f.entity);
  f.review.revisionId = f.revision.revisionId;
  assert.equal(evaluate(f).publishable, false, 'new hash cannot override revoked rights');
});

test('entity, geometry and perspective changes invalidate old reviews without changing candidate text', () => {
  for (const kind of ['settlement', 'boundary_record', 'perspective']) {
    const index = inputs.candidates.findIndex(c => c.entityRef.kind === kind && c.status !== 'blocked');
    const f = fixture(index);
    assert.equal(evaluate(f).publishable, true, kind);
    if (kind === 'boundary_record') f.entity.content.geometry.geometry.coordinates[0][0][0][0] += 0.01;
    else if (kind === 'settlement') f.entity.content.coordinates[0] += 0.01;
    else f.entity.content.publicationYear += 1;
    assert.equal(evaluate(f).publishable, false, kind);
  }
});

test('missing entities, tampered pins, mismatched reviewers and claim edits fail closed', () => {
  for (const mutate of [f => {f.entity = undefined;}, f => {f.entity.id = 'wrong';}, f => {f.revision.claimHash = 'a'.repeat(64);},
    f => {f.review = undefined;}, f => {f.review.reviewer = 'another';}, f => {f.candidate.claimStatement += ' changed';}, f => {f.revision = null;}]) {
    const f = fixture(); mutate(f); assert.equal(evaluate(f).publishable, false);
  }
  const f = fixture();
  assert.throws(() => validateRevisionManifest([f.revision, f.revision]), /Duplicate/);
  f.entity.content.invalid = NaN;
  assert.equal(evaluate(f).publishable, false);
});

test('context-only or unlocated bibliography cannot pass the revision gate even with matching review', () => {
  for (const relation of ['context', 'contradicts', 'supports']) {
    const f = fixture();
    f.candidate.evidence.forEach(e => {e.relation = relation; if (relation === 'supports') {e.locator = null; e.locatorMissingReason = 'fixture';}});
    f.candidate.reviewedContentHash = contentHash(f.candidate);
    f.revision = createEditorialRevision(f.candidate, f.sources, f.entity);
    f.review.revisionId = f.revision.revisionId;
    assert.equal(evaluate(f).publishable, false);
  }
});

test('key order and unrelated sources do not change a pin; original inputs remain unchanged', () => {
  const f = fixture(); const before = JSON.stringify(f);
  const reversed = Object.fromEntries(Object.entries(f.entity.content).reverse());
  assert.deepEqual(createEditorialRevision(f.candidate, [...f.sources].reverse(), {...f.entity, content: reversed}), f.revision);
  evaluate(f); assert.equal(JSON.stringify(f), before);
  const unused = f.sources.find(source => !f.candidate.evidence.some(e => e.sourceId === source.id));
  unused.title += ' unrelated edit';
  assert.equal(evaluate(f).publishable, true);
});
