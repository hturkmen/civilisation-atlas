import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  validateEditorialSources,
  validateEditorialCandidates,
  evaluatePublishability,
  contentHash
} from '../src/editorial.mjs';

const sources = JSON.parse(readFileSync(new URL('../../../data/editorial/sources.json', import.meta.url)));
const candidates = JSON.parse(readFileSync(new URL('../../../data/editorial/candidates.json', import.meta.url)));

test('real Gate A sources and candidates are structurally valid', () => {
  assert.equal(validateEditorialSources(sources), sources);
  assert.equal(validateEditorialCandidates(candidates, sources), candidates);
  assert.equal(sources.length, 5);
  assert.equal(candidates.length, 5);
});

test('every real candidate stays unreviewed and is not reported publishable', () => {
  for (const candidate of candidates) {
    assert.equal(candidate.reviewStatus, 'unreviewed');
    assert.equal(evaluatePublishability(candidate, sources).publishable, false);
  }
});

test('the blocked Roman alternative documents a real researched-but-unusable candidate', () => {
  const blocked = candidates.find(candidate => candidate.id === 'gate-a-roman-117-alternative-blocked');
  assert.equal(blocked.status, 'blocked');
  assert.ok(blocked.blockedReason.length > 0);
  assert.equal(blocked.extent, undefined);
  const result = evaluatePublishability(blocked, sources);
  assert.equal(result.publishable, false);
  assert.match(result.reasons.join(' '), /blocked/);
});

test('the Roman 117 boundary candidate references the existing boundary record, not new geometry', () => {
  const roman = candidates.find(candidate => candidate.id === 'gate-a-roman-empire-117-boundary');
  assert.equal(roman.entityRef.kind, 'boundary_record');
  assert.equal(roman.entityRef.id, 'cliopatria-1235');
  assert.equal(roman.extent.startEarliest, 117);
  assert.equal(roman.extent.endLatestExclusive, 127);
});

// --- Fixture-only tests below. These construct deliberately invalid or
// deliberately "fully approved" fixtures purely to exercise validator
// branches; they are not real sources, candidates or reviews.

test('fixture: rights unknown/rejected/revoked sources block publishability even with a real-shaped review', () => {
  const baseSource = {
    id: 'fixture-source', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15',
    licenseName: 'Fixture License', mandatoryAttribution: 'Fixture attribution', reuseScope: 'fixture-only',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const baseCandidate = {
    id: 'fixture-candidate', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture_predicate', claimStatement: 'Fixture claim for validator testing only.',
    status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-source', locator: 'fixture-locator', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 1
  };

  for (const rightsStatus of ['unknown', 'rejected', 'revoked']) {
    const source = {...baseSource, rightsStatus};
    const candidate = {...baseCandidate, reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer'};
    candidate.reviewedContentHash = contentHash(candidate);
    const result = evaluatePublishability(candidate, [source]);
    assert.equal(result.publishable, false, 'rightsStatus ' + rightsStatus + ' must not be publishable');
    assert.match(result.reasons.join(' '), new RegExp(rightsStatus));
  }
});

test('fixture: an object-level rights exception overrides a generally approved source license', () => {
  const source = {
    id: 'fixture-cc0-with-exception', title: 'Fixture CC0 dataset', authorOrInstitution: 'Fixture Author',
    sourceType: 'fixture', language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15',
    licenseName: 'CC0', mandatoryAttribution: 'none required', reuseScope: 'unrestricted-for-dataset',
    rightsStatus: 'approved', rightsNote: 'Dataset is CC0.', checksumBasis: 'not_applicable_text_reference',
    objectRightsExceptions: [{objectLocator: 'figure-3-photograph', rightsStatus: 'rejected', note: 'One embedded photograph is separately rights-managed.'}]
  };
  const candidateUsingException = {
    id: 'fixture-candidate-exception', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture_predicate', claimStatement: 'Fixture claim referencing the rights-managed figure.',
    status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-cc0-with-exception', locator: 'figure-3-photograph', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer', editor: 'fixture-editor', minutesSpent: 1
  };
  candidateUsingException.reviewedContentHash = contentHash(candidateUsingException);
  const exceptionResult = evaluatePublishability(candidateUsingException, [source]);
  assert.equal(exceptionResult.publishable, false);
  assert.match(exceptionResult.reasons.join(' '), /rejected/);

  const candidateUsingGeneralLicense = structuredClone(candidateUsingException);
  candidateUsingGeneralLicense.id = 'fixture-candidate-general';
  candidateUsingGeneralLicense.evidence[0].locator = 'general-dataset-record';
  candidateUsingGeneralLicense.reviewedContentHash = contentHash(candidateUsingGeneralLicense);
  const generalResult = evaluatePublishability(candidateUsingGeneralLicense, [source]);
  assert.equal(generalResult.publishable, true, 'the general CC0 status must still apply outside the excepted object');
});

test('fixture: missing or wrongly targeted evidence is rejected', () => {
  const source = {
    id: 'fixture-real-source', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15', publishedOnNote: 'fixture',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const candidateNoEvidence = {
    id: 'fixture-no-evidence', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [], reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 1
  };
  assert.throws(() => validateEditorialCandidates([candidateNoEvidence], [source]), /at least one evidence link/);

  const candidateWrongTarget = structuredClone(candidateNoEvidence);
  candidateWrongTarget.id = 'fixture-wrong-target';
  candidateWrongTarget.evidence = [{sourceId: 'does-not-exist', locator: 'x', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}];
  assert.throws(() => validateEditorialCandidates([candidateWrongTarget], [source]), /does not exist/);

  const candidateMissingLocator = structuredClone(candidateNoEvidence);
  candidateMissingLocator.id = 'fixture-missing-locator';
  candidateMissingLocator.evidence = [{sourceId: 'fixture-real-source', locator: null, relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}];
  assert.throws(() => validateEditorialCandidates([candidateMissingLocator], [source]), /locatorMissingReason/);
});

test('fixture: contradicting sources and editorial inference stay distinguishable from supporting evidence', () => {
  const supportingSource = {
    id: 'fixture-supporting', title: 'Supporting fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/support', accessedOn: '2026-09-15', publishedOnNote: 'fixture',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const contradictingSource = {
    id: 'fixture-contradicting', title: 'Contradicting fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/contradict', accessedOn: '2026-09-15', publishedOnNote: 'fixture',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'unknown', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const candidate = {
    id: 'fixture-disputed', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'Two fixture sources disagree.', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'disputed', rationale: 'fixture',
    evidence: [
      {sourceId: 'fixture-supporting', locator: 'p1', relation: 'supports', sourceStatement: 'Fixture source A says X.', editorialInference: 'Editor treats X as the primary reading.'},
      {sourceId: 'fixture-contradicting', locator: 'p9', relation: 'contradicts', sourceStatement: 'Fixture source B says not-X.', editorialInference: 'Editor records this as an unresolved contradiction, not a rejection of X.'}
    ],
    reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 5
  };
  assert.equal(validateEditorialCandidates([candidate], [supportingSource, contradictingSource])[0], candidate);
  const result = evaluatePublishability(candidate, [supportingSource, contradictingSource]);
  assert.equal(result.publishable, false);
  assert.match(result.reasons.join(' '), /fixture-contradicting/);
});

test('fixture: a stale reviewedContentHash after a content edit blocks publication', () => {
  const source = {
    id: 'fixture-stale-source', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const candidate = {
    id: 'fixture-stale-review', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'Original fixture claim.', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-stale-source', locator: 'p1', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer', editor: 'fixture-editor', minutesSpent: 1
  };
  candidate.reviewedContentHash = contentHash(candidate);
  assert.equal(evaluatePublishability(candidate, [source]).publishable, true);

  const edited = structuredClone(candidate);
  edited.claimStatement = 'Claim edited after the review was recorded.';
  const staleResult = evaluatePublishability(edited, [source]);
  assert.equal(staleResult.publishable, false);
  assert.match(staleResult.reasons.join(' '), /stale/);
});

test('fixture: an unreviewed candidate is never reported publishable regardless of rights status', () => {
  const source = {
    id: 'fixture-unreviewed-source', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const candidate = {
    id: 'fixture-unreviewed', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-unreviewed-source', locator: 'p1', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 1
  };
  const result = evaluatePublishability(candidate, [source]);
  assert.equal(result.publishable, false);
  assert.match(result.reasons.join(' '), /independently_reviewed/);
});

test('fixture: validator never performs network access on locator/license URLs', () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { fetchCalled = true; throw new Error('network access attempted'); };
  try {
    validateEditorialSources(sources);
    validateEditorialCandidates(candidates, sources);
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(fetchCalled, false);
});

test('fixture: malformed inputs are rejected structurally', () => {
  assert.throws(() => validateEditorialSources([]), /non-empty array/);
  assert.throws(() => validateEditorialSources([{id: 'bad id with spaces'}]), /Invalid or duplicate source id|Missing source field/);
  const fixtureSource = sources[0];
  assert.throws(() => validateEditorialCandidates([{id: 'no-extent', entityRef: {kind: 'settlement', id: 'x'}, claimPredicate: 'x', claimStatement: 'x', status: 'ready_for_review', reviewStatus: 'unreviewed', editor: 'x', minutesSpent: 0}], [fixtureSource]), /Missing extent/);
  const badChecksum = {...fixtureSource, id: 'bad-checksum', checksumBasis: 'sha256_of_archived_file', checksum: 'not-a-hash'};
  assert.throws(() => validateEditorialSources([badChecksum]), /Missing or malformed checksum/);
});
