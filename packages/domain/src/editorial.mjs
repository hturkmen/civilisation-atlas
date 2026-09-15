import {createHash} from 'node:crypto';
import {validateTemporalExtent} from './chronology.mjs';

/**
 * P02-001 source/evidence contract. This module enforces the *shape* of a
 * source or candidate record and the *publication gate*, not historical
 * accuracy. A structurally valid draft and a publishable record are
 * different questions: validateEditorialSources/validateEditorialCandidates
 * answer the first, evaluatePublishability answers the second.
 *
 * Nothing in this module performs network access. It only inspects the
 * plain objects it is given.
 */

export const RIGHTS_STATUSES = ['unknown', 'approved', 'rejected', 'revoked'];
export const EDITORIAL_CLASSES = ['documented', 'scholarly_reconstruction', 'approximate', 'disputed', 'unknown'];
export const EVIDENCE_RELATIONS = ['supports', 'contradicts', 'context'];
export const REVIEW_STATUSES = ['unreviewed', 'in_review', 'independently_reviewed', 'rejected'];
export const CANDIDATE_STATUSES = ['draft', 'blocked', 'ready_for_review'];
export const CHECKSUM_BASES = ['sha256_of_archived_file', 'sha256_of_pinned_commit', 'not_applicable_text_reference'];
export const ENTITY_REF_KINDS = ['settlement', 'boundary_record', 'perspective'];

function assertHttps(url, message) {
  if (typeof url !== 'string' || new URL(url).protocol !== 'https:') throw new Error(message);
}

function assertNonEmptyString(value, message) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
}

function assertIsoDate(value, message) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw new Error(message);
}

function assertEnum(value, allowed, message) {
  if (!allowed.includes(value)) throw new Error(message);
}

/** Deterministic stringify so unrelated key order never changes a content hash. */
function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

/**
 * Source identity/version, license, mandatory attribution, reuse scope,
 * rights status and checksum basis are kept separate fields on purpose:
 * a license existing does not mean this specific object may be archived,
 * and an access date is not a publication date.
 */
export function validateEditorialSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) throw new Error('Editorial sources must be a non-empty array');
  const ids = new Set();
  for (const source of sources) {
    assertNonEmptyString(source.id, 'Missing source id');
    if (!/^[a-z0-9-]+$/.test(source.id) || ids.has(source.id)) throw new Error('Invalid or duplicate source id: ' + source.id);
    ids.add(source.id);
    for (const field of ['title', 'authorOrInstitution', 'sourceType', 'language', 'licenseName', 'mandatoryAttribution', 'reuseScope', 'rightsNote']) {
      assertNonEmptyString(source[field], 'Missing source field "' + field + '" on ' + source.id);
    }
    assertHttps(source.locatorUrl, 'Unsafe or missing source locator URL: ' + source.id);
    if (source.licenseUrl !== undefined) assertHttps(source.licenseUrl, 'Unsafe license URL: ' + source.id);
    assertIsoDate(source.accessedOn, 'Invalid accessedOn on ' + source.id);
    if (source.publishedOn !== undefined) {
      assertIsoDate(source.publishedOn, 'Invalid publishedOn on ' + source.id);
    } else {
      assertNonEmptyString(source.publishedOnNote, 'Source without publishedOn needs publishedOnNote: ' + source.id);
    }
    assertEnum(source.rightsStatus, RIGHTS_STATUSES, 'Invalid rightsStatus on ' + source.id);
    assertEnum(source.checksumBasis, CHECKSUM_BASES, 'Invalid checksumBasis on ' + source.id);
    if (source.checksumBasis === 'not_applicable_text_reference') {
      if (source.checksum !== undefined) throw new Error('Checksum present without a file/commit checksum basis on ' + source.id);
    } else if (!/^[a-f0-9]{64}$/.test(source.checksum || '')) {
      throw new Error('Missing or malformed checksum for checksumBasis "' + source.checksumBasis + '" on ' + source.id);
    }
    for (const exception of source.objectRightsExceptions ?? []) {
      assertNonEmptyString(exception.objectLocator, 'Missing object rights exception locator on ' + source.id);
      assertEnum(exception.rightsStatus, RIGHTS_STATUSES, 'Invalid object rights exception status on ' + source.id);
      assertNonEmptyString(exception.note, 'Missing object rights exception note on ' + source.id);
    }
  }
  return sources;
}

function findSource(sources, id) {
  return sources.find(source => source.id === id);
}

/** An object-level rights exception overrides the source's general rights status for that one locator only. */
function objectRightsStatus(source, locator) {
  if (locator) {
    const exception = (source.objectRightsExceptions ?? []).find(item => item.objectLocator === locator);
    if (exception) return exception.rightsStatus;
  }
  return source.rightsStatus;
}

/**
 * One evidence link targets exactly one existing source revision and must
 * separate what the source states from what the editor concluded.
 */
export function validateEditorialEvidence(evidence, sources) {
  assertNonEmptyString(evidence.sourceId, 'Missing evidence sourceId');
  const source = findSource(sources, evidence.sourceId);
  if (!source) throw new Error('Evidence references a source revision that does not exist: ' + evidence.sourceId);
  if (evidence.locator !== undefined && evidence.locator !== null) {
    assertNonEmptyString(evidence.locator, 'Empty evidence locator for ' + evidence.sourceId);
  } else {
    assertNonEmptyString(evidence.locatorMissingReason, 'Evidence without a locator needs locatorMissingReason for ' + evidence.sourceId);
  }
  assertEnum(evidence.relation, EVIDENCE_RELATIONS, 'Invalid evidence relation for ' + evidence.sourceId);
  assertNonEmptyString(evidence.sourceStatement, 'Missing sourceStatement (what the source says) for ' + evidence.sourceId);
  assertNonEmptyString(evidence.editorialInference, 'Missing editorialInference (what the editor concluded) for ' + evidence.sourceId);
  return evidence;
}

/**
 * A candidate is a draft covering one entity/claim. Blocked candidates skip
 * the evidence/extent requirement because they document a researched-but-
 * unusable option, not a claim ready for review.
 */
export function validateEditorialCandidates(candidates, sources) {
  validateEditorialSources(sources);
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('Editorial candidates must be a non-empty array');
  const ids = new Set();
  for (const candidate of candidates) {
    assertNonEmptyString(candidate.id, 'Missing candidate id');
    if (!/^[a-z0-9-]+$/.test(candidate.id) || ids.has(candidate.id)) throw new Error('Invalid or duplicate candidate id: ' + candidate.id);
    ids.add(candidate.id);
    if (!candidate.entityRef || !ENTITY_REF_KINDS.includes(candidate.entityRef.kind) || !candidate.entityRef.id) {
      throw new Error('Invalid entityRef on ' + candidate.id);
    }
    assertNonEmptyString(candidate.claimPredicate, 'Missing claimPredicate on ' + candidate.id);
    assertNonEmptyString(candidate.claimStatement, 'Missing claimStatement on ' + candidate.id);
    assertEnum(candidate.status, CANDIDATE_STATUSES, 'Invalid status on ' + candidate.id);

    if (candidate.status === 'blocked') {
      assertNonEmptyString(candidate.blockedReason, 'Blocked candidate needs blockedReason: ' + candidate.id);
    } else {
      if (candidate.blockedReason !== undefined) throw new Error('Non-blocked candidate must not carry blockedReason: ' + candidate.id);
      if (!candidate.extent || typeof candidate.extent !== 'object') throw new Error('Missing extent on ' + candidate.id);
      validateTemporalExtent(candidate.extent);
      assertNonEmptyString(candidate.originalExpression, 'Missing originalExpression on ' + candidate.id);
      assertEnum(candidate.editorialClass, EDITORIAL_CLASSES, 'Invalid editorialClass on ' + candidate.id);
      assertNonEmptyString(candidate.rationale, 'Missing rationale on ' + candidate.id);
      if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) throw new Error('Candidate needs at least one evidence link: ' + candidate.id);
    }
    for (const evidence of candidate.evidence ?? []) validateEditorialEvidence(evidence, sources);

    assertEnum(candidate.reviewStatus, REVIEW_STATUSES, 'Invalid reviewStatus on ' + candidate.id);
    if (candidate.reviewStatus === 'independently_reviewed') {
      assertNonEmptyString(candidate.reviewer, 'Independently reviewed candidate needs a reviewer: ' + candidate.id);
      assertNonEmptyString(candidate.reviewedContentHash, 'Independently reviewed candidate needs reviewedContentHash: ' + candidate.id);
    } else if (candidate.reviewer !== undefined || candidate.reviewedContentHash !== undefined) {
      throw new Error('Only an independently_reviewed candidate may carry reviewer/reviewedContentHash: ' + candidate.id);
    }
    assertNonEmptyString(candidate.editor, 'Missing editor on ' + candidate.id);
    if (!Number.isFinite(candidate.minutesSpent) || candidate.minutesSpent < 0) throw new Error('Invalid minutesSpent on ' + candidate.id);
  }
  return candidates;
}

/** Hash of everything except the review fields, so a stale review can be detected after any content edit. */
export function contentHash(candidate) {
  const {reviewStatus, reviewer, reviewedContentHash, ...rest} = candidate;
  return createHash('sha256').update(stableStringify(rest)).digest('hex');
}

/**
 * A candidate is publishable only when it is ready_for_review, has passed an
 * independent review whose recorded hash still matches its current content,
 * and every evidence source (respecting object-level exceptions) is rights
 * "approved". Rights and historical review are independent gates: passing
 * one never substitutes for the other.
 */
export function evaluatePublishability(candidate, sources) {
  const reasons = [];
  if (candidate.status === 'blocked') {
    reasons.push('candidate is blocked: ' + candidate.blockedReason);
  } else if (candidate.status !== 'ready_for_review') {
    reasons.push('candidate status is "' + candidate.status + '", not "ready_for_review"');
  }
  if (candidate.reviewStatus !== 'independently_reviewed') {
    reasons.push('reviewStatus is "' + candidate.reviewStatus + '", not "independently_reviewed"');
  } else if (candidate.reviewedContentHash !== contentHash(candidate)) {
    reasons.push('reviewedContentHash is stale: candidate content changed after the recorded review');
  }
  for (const evidence of candidate.evidence ?? []) {
    const source = findSource(sources, evidence.sourceId);
    if (!source) { reasons.push('evidence references a missing source: ' + evidence.sourceId); continue; }
    const status = objectRightsStatus(source, evidence.locator);
    if (status !== 'approved') reasons.push('evidence source "' + evidence.sourceId + '" rights status is "' + status + '", not "approved"');
  }
  return {publishable: reasons.length === 0, reasons};
}
