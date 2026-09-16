import {createHash} from 'node:crypto';
import {contentHash, validateEditorialCandidates, evaluatePublishability} from './editorial.mjs';

// Local JSON content identity, not a publisher-issued version or an authenticity proof.
function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + Array.from(value, canonical).join(',') + ']';
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  }
  throw new Error('Revision payload must contain only finite JSON values');
}
function hash(value) {return createHash('sha256').update(canonical(value)).digest('hex');}
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isText = value => typeof value === 'string' && value.trim().length > 0;
function hasKeys(value, keys) {
  return value && Object.getPrototypeOf(value) === Object.prototype
    && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

/** Caller resolves the entity from trusted storage, including its geometry/perspective payload. */
export function createEditorialRevision(candidate, sources, entity) {
  if (!entity || !entity.content || entity.content.id !== entity.id || entity.kind !== candidate?.entityRef?.kind || entity.id !== candidate.entityRef.id) {
    throw new Error('Missing or mismatched resolved entity');
  }
  validateEditorialCandidates([candidate], sources, {[entity.kind]: [entity.id]});
  const usedIds = [...new Set((candidate.evidence ?? []).map(item => item.sourceId))].sort();
  const payload = {
    formatVersion: 1,
    candidateId: candidate.id,
    claimHash: contentHash(candidate),
    entity: {kind: entity.kind, id: entity.id, contentHash: hash(entity.content)},
    sources: usedIds.map(sourceId => ({sourceId, contentHash: hash(sources.find(source => source.id === sourceId))})),
  };
  return {...payload, revisionId: hash(payload)};
}

/** Preserve earlier pins; duplicate/corrupt entries cannot silently be replaced. */
export function validateRevisionManifest(revisions) {
  if (!Array.isArray(revisions)) throw new Error('Revision manifest must be an array');
  const ids = new Set();
  for (const revision of revisions) {
    if (!revision || typeof revision !== 'object' || Array.isArray(revision)) throw new Error('Invalid revision entry');
    const {revisionId, ...payload} = revision;
    if (!hasKeys(revision, ['formatVersion', 'candidateId', 'claimHash', 'entity', 'sources', 'revisionId'])
      || revision.formatVersion !== 1 || !isText(revision.candidateId)
      || !hasKeys(revision.entity, ['kind', 'id', 'contentHash']) || !isText(revision.entity.id)
      || !['settlement', 'boundary_record', 'perspective'].includes(revision.entity.kind)
      || !Array.isArray(revision.sources) || !isHash(revision.claimHash) || !isHash(revision.entity.contentHash)
      || revision.sources.some(source => !hasKeys(source, ['sourceId', 'contentHash']) || !isText(source.sourceId) || !isHash(source.contentHash))
      || new Set(revision.sources.map(source => source.sourceId)).size !== revision.sources.length
      || revisionId !== hash(payload)) throw new Error('Invalid revision content hash or shape');
    if (ids.has(revisionId)) throw new Error('Duplicate revision id: ' + revisionId);
    ids.add(revisionId);
  }
  return revisions;
}

/** Full offline gate. Review attestations must eventually come from an authorized server, never the browser. */
export function evaluateRevisionPublishability(candidate, sources, entity, revision, review) {
  try {
    const current = createEditorialRevision(candidate, sources, entity);
    validateRevisionManifest([revision]);
    const {reasons} = evaluatePublishability(candidate, sources);
    if (canonical(current) !== canonical(revision)) reasons.push('Revision is stale: claim, entity, geometry or source content changed');
    if (!review || review.revisionId !== current.revisionId || review.reviewer !== candidate.reviewer
      || typeof review.reviewer !== 'string' || !review.reviewer.trim()) reasons.push('Missing or mismatched revision review');
    if (!candidate.evidence?.some(evidence => evidence.relation === 'supports' && typeof evidence.locator === 'string' && evidence.locator.trim())) {
      reasons.push('Publication requires supporting evidence with an exact locator; context alone is insufficient');
    }
    return {publishable: reasons.length === 0, reasons};
  } catch (error) {
    return {publishable: false, reasons: ['Invalid revision input: ' + (error instanceof Error ? error.message : 'validation failed')]};
  }
}
