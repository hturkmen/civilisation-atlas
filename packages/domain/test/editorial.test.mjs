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
    id: 'fixture-source', revisionNote: 'Fixture has no stable revision', publishedOnNote: 'Fixture has no publication date', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
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
    id: 'fixture-cc0-with-exception', revisionNote: 'Fixture has no stable revision', publishedOnNote: 'Fixture has no publication date', title: 'Fixture CC0 dataset', authorOrInstitution: 'Fixture Author',
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
    language: 'en', locatorUrl: 'https://example.invalid/fixture', accessedOn: '2026-09-15', revisionNote: 'fixture has no stable revision', publishedOnNote: 'fixture',
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
    language: 'en', locatorUrl: 'https://example.invalid/support', accessedOn: '2026-09-15', revisionNote: 'fixture has no stable revision', publishedOnNote: 'fixture',
    licenseName: 'Fixture License', mandatoryAttribution: 'fixture', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  const contradictingSource = {
    id: 'fixture-contradicting', title: 'Contradicting fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
    language: 'en', locatorUrl: 'https://example.invalid/contradict', accessedOn: '2026-09-15', revisionNote: 'fixture has no stable revision', publishedOnNote: 'fixture',
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
    id: 'fixture-stale-source', revisionNote: 'Fixture has no stable revision', publishedOnNote: 'Fixture has no publication date', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
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
    id: 'fixture-unreviewed-source', revisionNote: 'Fixture has no stable revision', publishedOnNote: 'Fixture has no publication date', title: 'Fixture', authorOrInstitution: 'Fixture Author', sourceType: 'fixture',
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
  assert.throws(() => validateEditorialSources([{id: 'bad id with spaces'}]), /Invalid source id \(expected lowercase slug\)/);
  const duplicate = {...sources[0]};
  assert.throws(() => validateEditorialSources([sources[0], duplicate]), /Duplicate source id/);
  const fixtureSource = sources[0];
  assert.throws(() => validateEditorialCandidates([{id: 'no-extent', entityRef: {kind: 'settlement', id: 'x'}, claimPredicate: 'x', claimStatement: 'x', status: 'ready_for_review', reviewStatus: 'unreviewed', editor: 'x', minutesSpent: 0}], [fixtureSource]), /Missing extent/);
  const badChecksum = {...fixtureSource, id: 'bad-checksum', checksumBasis: 'sha256_of_archived_file', checksum: 'not-a-hash'};
  assert.throws(() => validateEditorialSources([badChecksum]), /Missing or malformed checksum/);
});

// --- Regression tests for defects found in the P02-001 contract review
// (agent/claude/p02-001-contract-review-20260915). Each one fails against the
// implementation merged in PR #47 and passes after the fix in this branch.

test('regression: an object-level restriction is not bypassed by evidence that names no locator', () => {
  // PR #47 resolved rights via the general source status whenever the evidence
  // had no locator, so a rights-managed object could be published by simply
  // omitting the locator. The gate must fail closed instead.
  const source = {
    id: 'fixture-exception-no-locator', title: 'Fixture dataset', authorOrInstitution: 'Fixture Author',
    sourceType: 'fixture', language: 'en', locatorUrl: 'https://example.invalid/fixture',
    revisionNote: 'fixture has no stable revision', publishedOnNote: 'fixture', accessedOn: '2026-09-15',
    licenseName: 'CC0', mandatoryAttribution: 'none', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference',
    objectRightsExceptions: [{objectLocator: 'figure-3-photograph', rightsStatus: 'rejected', note: 'separately rights-managed'}]
  };
  const candidate = {
    id: 'fixture-unlocated-evidence', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-exception-no-locator', locator: null, locatorMissingReason: 'whole dataset used', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer', editor: 'fixture-editor', minutesSpent: 1
  };
  candidate.reviewedContentHash = contentHash(candidate);
  const result = evaluatePublishability(candidate, [source]);
  assert.equal(result.publishable, false, 'unlocated evidence must not inherit the permissive general status');
  assert.match(result.reasons.join(' '), /rejected/);
  assert.match(result.reasons.join(' '), /names no object locator/);
});

test('regression: the most restrictive status wins when several exceptions could apply', () => {
  const base = {
    id: 'fixture-restrictive', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revisionNote: 'none', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'CC0', mandatoryAttribution: 'none', reuseScope: 'fixture',
    rightsStatus: 'approved', rightsNote: 'fixture', checksumBasis: 'not_applicable_text_reference'
  };
  // Two exceptions for the same object would have let the first (permissive)
  // entry win; duplicates are now rejected outright.
  assert.throws(() => validateEditorialSources([{...base, objectRightsExceptions: [
    {objectLocator: 'plate-1', rightsStatus: 'approved', note: 'a'},
    {objectLocator: 'plate-1', rightsStatus: 'rejected', note: 'b'}
  ]}]), /Duplicate object rights exception locator/);
});

test('regression: a candidate with no evidence at all is never publishable', () => {
  // The rights loop used to iterate zero times and report publishable=true.
  const source = {
    id: 'fixture-noev-source', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revisionNote: 'none', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'L', mandatoryAttribution: 'M', reuseScope: 'R',
    rightsStatus: 'approved', rightsNote: 'N', checksumBasis: 'not_applicable_text_reference'
  };
  const candidate = {
    id: 'fixture-no-evidence-gate', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer', editor: 'fixture-editor', minutesSpent: 0
  };
  candidate.reviewedContentHash = contentHash(candidate);
  const result = evaluatePublishability(candidate, [source]);
  assert.equal(result.publishable, false);
  assert.match(result.reasons.join(' '), /no evidence link/);
});

test('regression: malformed input produces a named validation error, not a raw TypeError', () => {
  const base = {
    id: 'fixture-malformed', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revisionNote: 'none', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'L', mandatoryAttribution: 'M', reuseScope: 'R',
    rightsStatus: 'approved', rightsNote: 'N', checksumBasis: 'not_applicable_text_reference'
  };
  for (const [label, input] of [
    ['unparseable locatorUrl', [{...base, locatorUrl: 'not a url'}]],
    ['null source entry', [null]],
    ['non-object source entry', ['just a string']]
  ]) {
    assert.throws(() => validateEditorialSources(input), error => {
      assert.equal(error.constructor.name, 'Error', label + ' must not surface a raw TypeError');
      assert.ok(error.message.length > 0);
      return true;
    }, label);
  }
  assert.throws(() => validateEditorialCandidates([null], [base]), error => {
    assert.equal(error.constructor.name, 'Error');
    assert.match(error.message, /must be an object/);
    return true;
  });
});

test('regression: source identity, source revision and object rights are three separate things', () => {
  const pinned = {
    id: 'fixture-pinned', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revision: 'rev-1', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'L', mandatoryAttribution: 'M', reuseScope: 'R',
    rightsStatus: 'approved', rightsNote: 'N', checksumBasis: 'not_applicable_text_reference'
  };
  // A source must either pin a revision or say why it cannot.
  const {revision, ...withoutRevision} = pinned;
  assert.throws(() => validateEditorialSources([withoutRevision]), /needs revisionNote/);
  assert.throws(() => validateEditorialSources([{...pinned, revisionNote: 'both'}]), /must not also carry revisionNote/);

  const candidate = {
    id: 'fixture-pinned-candidate', entityRef: {kind: 'settlement', id: 'fixture-entity'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-pinned', sourceRevision: 'rev-1', locator: 'p1', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'independently_reviewed', reviewer: 'fixture-reviewer', editor: 'fixture-editor', minutesSpent: 1
  };
  candidate.reviewedContentHash = contentHash(candidate);
  assert.equal(evaluatePublishability(candidate, [pinned]).publishable, true);

  // Bumping the source revision invalidates evidence recorded against rev-1,
  // even though the candidate's own content hash is unchanged.
  const bumped = [{...pinned, revision: 'rev-2'}];
  assert.throws(() => validateEditorialCandidates([candidate], bumped), /is now at revision "rev-2"/);
  const stale = evaluatePublishability(candidate, bumped);
  assert.equal(stale.publishable, false, 'a source revision bump must invalidate the recorded review');
  assert.match(stale.reasons.join(' '), /rev-2/);
});

test('regression: a candidate must target an entity that exists, with the declared kind', () => {
  const source = {
    id: 'fixture-registry-source', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revisionNote: 'none', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'L', mandatoryAttribution: 'M', reuseScope: 'R',
    rightsStatus: 'approved', rightsNote: 'N', checksumBasis: 'not_applicable_text_reference'
  };
  const candidate = {
    id: 'fixture-registry-candidate', entityRef: {kind: 'settlement', id: 'real-place'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-registry-source', locator: 'p1', relation: 'supports', sourceStatement: 'fixture', editorialInference: 'fixture'}],
    reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 1
  };
  const registry = {settlement: ['real-place'], boundary_record: ['real-boundary'], perspective: []};
  assert.equal(validateEditorialCandidates([candidate], [source], registry)[0], candidate);

  const typo = {...candidate, id: 'fixture-typo', entityRef: {kind: 'settlement', id: 'real-plce'}};
  assert.throws(() => validateEditorialCandidates([typo], [source], registry), /does not exist/);

  // Right id, wrong kind: 'real-boundary' exists, but not as a settlement.
  const wrongKind = {...candidate, id: 'fixture-wrong-kind', entityRef: {kind: 'settlement', id: 'real-boundary'}};
  assert.throws(() => validateEditorialCandidates([wrongKind], [source], registry), /does not exist/);
});

test('regression: the runtime validator agrees with candidate.schema.json on blocked and review fields', () => {
  const source = {
    id: 'fixture-schema-source', title: 'Fixture', authorOrInstitution: 'A', sourceType: 'fixture', language: 'en',
    locatorUrl: 'https://example.invalid/fixture', revisionNote: 'none', publishedOnNote: 'fixture',
    accessedOn: '2026-09-15', licenseName: 'L', mandatoryAttribution: 'M', reuseScope: 'R',
    rightsStatus: 'approved', rightsNote: 'N', checksumBasis: 'not_applicable_text_reference'
  };
  const blockedWithExtent = {
    id: 'fixture-blocked-extent', entityRef: {kind: 'settlement', id: 'x'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'blocked', blockedReason: 'no usable source',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    reviewStatus: 'unreviewed', editor: 'fixture-editor', minutesSpent: 1
  };
  assert.throws(() => validateEditorialCandidates([blockedWithExtent], [source]), /Blocked candidate must not carry extent/);

  const badHash = {
    id: 'fixture-bad-hash', entityRef: {kind: 'settlement', id: 'x'},
    claimPredicate: 'fixture', claimStatement: 'fixture', status: 'ready_for_review',
    extent: {startEarliest: 1, startLatest: 1, endEarliestExclusive: 2, endLatestExclusive: 2},
    originalExpression: 'fixture', editorialClass: 'documented', rationale: 'fixture',
    evidence: [{sourceId: 'fixture-schema-source', locator: 'p1', relation: 'supports', sourceStatement: 'f', editorialInference: 'f'}],
    reviewStatus: 'independently_reviewed', reviewer: 'r', reviewedContentHash: 'NOT-A-SHA256', editor: 'e', minutesSpent: 1
  };
  assert.throws(() => validateEditorialCandidates([badHash], [source]), /Malformed reviewedContentHash/);

  assert.throws(() => validateEditorialSources([{...source, publishedOn: '2020-01-01'}]), /must not also carry publishedOnNote/);
});

test('every real candidate resolves to an entity that exists in the shipped collections', () => {
  const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
  const preview = load('../../../data/preview-collection.json');
  const boundaries = load('../../../data/boundary-collection.json');
  const maps = load('../../../data/historical-maps.json');
  const registry = {
    settlement: preview.places.map(place => place.id),
    boundary_record: boundaries.records.map(record => record.id),
    perspective: maps.map(map => map.id)
  };
  assert.equal(validateEditorialCandidates(candidates, sources, registry), candidates);
});


test('regression: direct publication checks reject incomplete claims despite a matching review hash', () => {
  // Synthetic review only; no real candidate or review is written to disk.
  const candidate = structuredClone(candidates[0]);
  candidate.status = 'ready_for_review';
  candidate.reviewStatus = 'independently_reviewed';
  candidate.reviewer = 'synthetic-validator-test-reviewer';
  candidate.reviewedContentHash = contentHash(candidate);
  assert.equal(evaluatePublishability(candidate, sources).publishable, true);
  for (const field of ['claimStatement', 'reviewer', 'extent']) {
    const invalid = structuredClone(candidate);
    delete invalid[field];
    invalid.reviewedContentHash = contentHash(invalid);
    const result = evaluatePublishability(invalid, sources);
    assert.equal(result.publishable, false, field + ' must be required even on a direct gate call');
    assert.match(result.reasons.join(' '), /Invalid editorial input/);
  }
});

test('regression: direct publication checks return a rejection for malformed containers', () => {
  const candidate = structuredClone(candidates[0]);
  candidate.status = 'ready_for_review';
  candidate.reviewStatus = 'independently_reviewed';
  candidate.reviewer = 'synthetic-validator-test-reviewer';
  candidate.reviewedContentHash = contentHash(candidate);
  for (const invalidEvidence of [{}, 42, 'invalid']) {
    const invalid = {...candidate, evidence: invalidEvidence};
    invalid.reviewedContentHash = contentHash(invalid);
    assert.equal(evaluatePublishability(invalid, sources).publishable, false);
  }
  const malformedSources = structuredClone(sources);
  malformedSources[0].objectRightsExceptions = {};
  assert.equal(evaluatePublishability(candidate, malformedSources).publishable, false);
});
