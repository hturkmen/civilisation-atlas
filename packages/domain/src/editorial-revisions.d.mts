import type {EditorialCandidate, EditorialSource, EntityRefKind, PublishabilityResult} from './editorial.mjs';
export interface ResolvedEditorialEntity {kind: EntityRefKind; id: string; content: {id: string; [key: string]: unknown}}
export interface EditorialRevision {
  formatVersion: 1; candidateId: string; claimHash: string; revisionId: string;
  entity: {kind: EntityRefKind; id: string; contentHash: string};
  sources: {sourceId: string; contentHash: string}[];
}
export interface RevisionReview {revisionId: string; reviewer: string}
export function createEditorialRevision(candidate: EditorialCandidate, sources: EditorialSource[], entity: ResolvedEditorialEntity): EditorialRevision;
export function validateRevisionManifest(revisions: EditorialRevision[]): EditorialRevision[];
export function evaluateRevisionPublishability(candidate: EditorialCandidate, sources: EditorialSource[], entity: ResolvedEditorialEntity, revision: EditorialRevision, review?: RevisionReview): PublishabilityResult;
