import {createHash} from 'node:crypto';
import {validateTemporalExtent} from './chronology.mjs';

/**
 * P02-001 source/evidence contract. This module enforces the *shape* of a
 * source or candidate record and the *publication gate*, not historical
 * accuracy. A structurally valid draft and a publishable record are
 * different questions: validateEditorialSources/validateEditorialCandidates
 * answer the first, evaluatePublishability answers the second.
 *
 * Three identities are kept apart on purpose, per P02-001 ("kaynak, veri
 * sürümü ve lisans istisnası birbirinden ayrılır") and the source_revision /
 * evidence_link tables in docs/04-low-level-design.md:
 *   - source identity   : `id`, stable across revisions of the same source.
 *   - source revision   : `revision` (or an explicit `revisionNote` saying why
 *                         the source has no stable revision identifier).
 *   - object-level use  : `objectRightsExceptions`, which override the general
 *                         rights status for one object inside the source only.
 *
 * Every rights decision here fails closed: when the contract cannot show that
 * a restricted object was *not* used, the restrictive status wins.
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

/** Higher wins when several rights statuses could apply. Restriction beats permission. */
const RIGHTS_RESTRICTION_ORDER = {approved: 0, unknown: 1, revoked: 2, rejected: 3};

const SHA256_HEX = /^[a-f0-9]{64}$/;

function assertPlainObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(message);
}

function assertHttps(url, message) {
  if (typeof url !== 'string' || !url.trim()) throw new Error(message);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    // Without this the caller would surface a bare "TypeError: Invalid URL"
    // with no indication of which record or field was at fault.
    throw new Error(message + ' (not a parseable URL: "' + url + '")');
  }
  if (parsed.protocol !== 'https:') throw new Error(message);
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

function mostRestrictive(statuses) {
  return statuses.reduce((worst, status) =>
    RIGHTS_RESTRICTION_ORDER[status] > RIGHTS_RESTRICTION_ORDER[worst] ? status : worst);
}

/**
 * Source identity, source revision, license, mandatory attribution, reuse
 * scope, rights status and checksum basis are kept separate fields on
 * purpose: a license existing does not mean this specific object may be
 * archived, an access date is not a publication date, and a source id is
 * not a source revision.
 */
export function validateEditorialSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) throw new Error('Editorial sources must be a non-empty array');
  const ids = new Set();
  for (const [index, source] of sources.entries()) {
    assertPlainObject(source, 'Editorial source at index ' + index + ' must be an object');
    assertNonEmptyString(source.id, 'Missing source id at index ' + index);
    if (!/^[a-z0-9-]+$/.test(source.id)) throw new Error('Invalid source id (expected lowercase slug): ' + source.id);
    if (ids.has(source.id)) throw new Error('Duplicate source id: ' + source.id);
    ids.add(source.id);
    for (const field of ['title', 'authorOrInstitution', 'sourceType', 'language', 'licenseName', 'mandatoryAttribution', 'reuseScope', 'rightsNote']) {
      assertNonEmptyString(source[field], 'Missing source field "' + field + '" on ' + source.id);
    }
    assertHttps(source.locatorUrl, 'Unsafe or missing source locator URL: ' + source.id);
    if (source.licenseUrl !== undefined) assertHttps(source.licenseUrl, 'Unsafe license URL: ' + source.id);
    if (source.licenseVersion !== undefined) assertNonEmptyString(source.licenseVersion, 'Empty licenseVersion on ' + source.id);
    assertIsoDate(source.accessedOn, 'Invalid accessedOn on ' + source.id);

    // Source revision is separate from source identity. A source without a
    // stable revision must say so explicitly instead of leaving it implied.
    if (source.revision !== undefined) {
      assertNonEmptyString(source.revision, 'Empty revision on ' + source.id);
      if (source.revisionNote !== undefined) {
        throw new Error('Source with a revision must not also carry revisionNote: ' + source.id);
      }
    } else {
      assertNonEmptyString(source.revisionNote, 'Source without a stable revision needs revisionNote explaining why: ' + source.id);
    }

    if (source.publishedOn !== undefined) {
      assertIsoDate(source.publishedOn, 'Invalid publishedOn on ' + source.id);
      if (source.publishedOnNote !== undefined) {
        throw new Error('Source with publishedOn must not also carry publishedOnNote: ' + source.id);
      }
    } else {
      assertNonEmptyString(source.publishedOnNote, 'Source without publishedOn needs publishedOnNote: ' + source.id);
    }
    assertEnum(source.rightsStatus, RIGHTS_STATUSES, 'Invalid rightsStatus on ' + source.id);
    assertEnum(source.checksumBasis, CHECKSUM_BASES, 'Invalid checksumBasis on ' + source.id);
    if (source.checksumBasis === 'not_applicable_text_reference') {
      if (source.checksum !== undefined) throw new Error('Checksum present without a file/commit checksum basis on ' + source.id);
    } else if (!SHA256_HEX.test(source.checksum || '')) {
      throw new Error('Missing or malformed checksum for checksumBasis "' + source.checksumBasis + '" on ' + source.id);
    }
    const seenLocators = new Set();
    for (const exception of source.objectRightsExceptions ?? []) {
      assertPlainObject(exception, 'Object rights exception must be an object on ' + source.id);
      assertNonEmptyString(exception.objectLocator, 'Missing object rights exception locator on ' + source.id);
      if (seenLocators.has(exception.objectLocator)) {
        throw new Error('Duplicate object rights exception locator "' + exception.objectLocator + '" on ' + source.id);
      }
      seenLocators.add(exception.objectLocator);
      assertEnum(exception.rightsStatus, RIGHTS_STATUSES, 'Invalid object rights exception status on ' + source.id);
      assertNonEmptyString(exception.note, 'Missing object rights exception note on ' + source.id);
    }
  }
  return sources;
}

function findSource(sources, id) {
  return sources.find(source => source && source.id === id);
}

/**
 * Resolve the rights status that actually applies to one piece of evidence.
 *
 * An object-level exception overrides the source's general rights status for
 * that one locator. Evidence that names no locator at all cannot be shown to
 * fall outside the restricted objects, so it inherits the most restrictive
 * status on the source rather than the permissive general one.
 */
function resolveRightsStatus(source, locator) {
  const exceptions = source.objectRightsExceptions ?? [];
  if (exceptions.length === 0) return {status: source.rightsStatus, basis: 'general source rights status'};

  if (typeof locator !== 'string' || !locator.trim()) {
    const status = mostRestrictive([source.rightsStatus, ...exceptions.map(item => item.rightsStatus)]);
    return {
      status,
      basis: 'most restrictive status on a source that carries object-level exceptions, because this evidence names no object locator'
    };
  }

  const matching = exceptions.filter(item => item.objectLocator === locator);
  if (matching.length === 0) return {status: source.rightsStatus, basis: 'general source rights status'};
  return {status: mostRestrictive(matching.map(item => item.rightsStatus)), basis: 'object-level exception for "' + locator + '"'};
}

/**
 * One evidence link targets exactly one existing source, optionally pinned to
 * a specific revision of it, and must separate what the source states from
 * what the editor concluded.
 */
export function validateEditorialEvidence(evidence, sources) {
  assertPlainObject(evidence, 'Evidence entry must be an object');
  assertNonEmptyString(evidence.sourceId, 'Missing evidence sourceId');
  const source = findSource(sources, evidence.sourceId);
  if (!source) throw new Error('Evidence references a source that does not exist: ' + evidence.sourceId);
  if (evidence.sourceRevision !== undefined) {
    assertNonEmptyString(evidence.sourceRevision, 'Empty sourceRevision on evidence for ' + evidence.sourceId);
    if (source.revision === undefined) {
      throw new Error('Evidence pins sourceRevision "' + evidence.sourceRevision + '" but source ' + evidence.sourceId + ' declares no revision');
    }
    if (evidence.sourceRevision !== source.revision) {
      throw new Error('Evidence pins sourceRevision "' + evidence.sourceRevision + '" but source ' + evidence.sourceId + ' is now at revision "' + source.revision + '"');
    }
  }
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
 *
 * `entityRegistry` is optional. When supplied it maps each entity kind to the
 * ids that actually exist ({settlement: [...], boundary_record: [...],
 * perspective: [...]}), and every candidate must point at a real entity of
 * the declared kind. scripts/validate-editorial.mjs builds it from the
 * existing collection files; this module never reads them itself.
 */
export function validateEditorialCandidates(candidates, sources, entityRegistry) {
  validateEditorialSources(sources);
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('Editorial candidates must be a non-empty array');
  if (entityRegistry !== undefined) assertPlainObject(entityRegistry, 'entityRegistry must be an object keyed by entity kind');
  const ids = new Set();
  for (const [index, candidate] of candidates.entries()) {
    assertPlainObject(candidate, 'Editorial candidate at index ' + index + ' must be an object');
    assertNonEmptyString(candidate.id, 'Missing candidate id at index ' + index);
    if (!/^[a-z0-9-]+$/.test(candidate.id)) throw new Error('Invalid candidate id (expected lowercase slug): ' + candidate.id);
    if (ids.has(candidate.id)) throw new Error('Duplicate candidate id: ' + candidate.id);
    ids.add(candidate.id);
    if (!candidate.entityRef || typeof candidate.entityRef !== 'object' || !ENTITY_REF_KINDS.includes(candidate.entityRef.kind) || !candidate.entityRef.id) {
      throw new Error('Invalid entityRef on ' + candidate.id);
    }
    if (entityRegistry !== undefined) {
      const known = entityRegistry[candidate.entityRef.kind];
      if (!Array.isArray(known)) {
        throw new Error('entityRegistry has no id list for kind "' + candidate.entityRef.kind + '" (candidate ' + candidate.id + ')');
      }
      if (!known.includes(candidate.entityRef.id)) {
        throw new Error('Candidate ' + candidate.id + ' targets ' + candidate.entityRef.kind + ' "' + candidate.entityRef.id + '", which does not exist');
      }
    }
    assertNonEmptyString(candidate.claimPredicate, 'Missing claimPredicate on ' + candidate.id);
    assertNonEmptyString(candidate.claimStatement, 'Missing claimStatement on ' + candidate.id);
    assertEnum(candidate.status, CANDIDATE_STATUSES, 'Invalid status on ' + candidate.id);

    if (candidate.status === 'blocked') {
      assertNonEmptyString(candidate.blockedReason, 'Blocked candidate needs blockedReason: ' + candidate.id);
      // candidate.schema.json forbids extent on a blocked candidate; a blocked
      // record documents why no claim was made, so it carries no dated claim.
      if (candidate.extent !== undefined) throw new Error('Blocked candidate must not carry extent: ' + candidate.id);
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
      if (!SHA256_HEX.test(candidate.reviewedContentHash)) {
        throw new Error('Malformed reviewedContentHash (expected sha256 hex) on ' + candidate.id);
      }
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
 * A candidate is publishable only when it is ready_for_review, carries at
 * least one evidence link, has passed an independent review whose recorded
 * hash still matches its current content, every pinned source revision still
 * matches, and every evidence source (respecting object-level exceptions) is
 * rights "approved". Rights and historical review are independent gates:
 * passing one never substitutes for the other.
 *
 * This is the candidate/rights sub-gate. Storage/export callers must use
 * evaluateRevisionPublishability from editorial-revisions.mjs to also bind
 * resolved entity/geometry and complete source content to a reviewed revision.
 * This function fails closed. It never reports publishable=true for a record
 * it could not fully check.
 */
export function evaluatePublishability(candidate, sources) {
  const reasons = [];
  if (!candidate || typeof candidate !== 'object') return {publishable: false, reasons: ['candidate is not an object']};
  if (!Array.isArray(sources)) return {publishable: false, reasons: ['sources must be an array']};


  // This exported gate must not depend on callers remembering a separate
  // validation step. A matching review hash cannot legitimize invalid data.
  try {
    validateEditorialCandidates([candidate], sources);
  } catch (error) {
    const invalidReasons = ['Invalid editorial input: ' + (error instanceof Error ? error.message : 'validation failed')];
    if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
      invalidReasons.push('candidate carries no evidence link; publication requires at least one');
    }
    return {publishable: false, reasons: invalidReasons};
  }

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

  // No evidence means nothing was checked, not that everything passed.
  if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
    reasons.push('candidate carries no evidence link; publication requires at least one');
  }

  for (const evidence of candidate.evidence ?? []) {
    if (!evidence || typeof evidence !== 'object') { reasons.push('evidence entry is not an object'); continue; }
    const source = findSource(sources, evidence.sourceId);
    if (!source) { reasons.push('evidence references a missing source: ' + evidence.sourceId); continue; }
    if (evidence.sourceRevision !== undefined && evidence.sourceRevision !== source.revision) {
      reasons.push('evidence pins source "' + evidence.sourceId + '" revision "' + evidence.sourceRevision + '" but the source is now at "' + source.revision + '"');
    }
    const {status, basis} = resolveRightsStatus(source, evidence.locator);
    if (status !== 'approved') {
      reasons.push('evidence source "' + evidence.sourceId + '" rights status is "' + status + '", not "approved" (' + basis + ')');
    }
  }
  return {publishable: reasons.length === 0, reasons};
}
