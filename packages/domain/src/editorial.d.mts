import type {TemporalExtent} from './chronology.d.mts';

export type RightsStatus = 'unknown' | 'approved' | 'rejected' | 'revoked';
export type EditorialClass = 'documented' | 'scholarly_reconstruction' | 'approximate' | 'disputed' | 'unknown';
export type EvidenceRelation = 'supports' | 'contradicts' | 'context';
export type ReviewStatus = 'unreviewed' | 'in_review' | 'independently_reviewed' | 'rejected';
export type CandidateStatus = 'draft' | 'blocked' | 'ready_for_review';
export type ChecksumBasis = 'sha256_of_archived_file' | 'sha256_of_pinned_commit' | 'not_applicable_text_reference';
export type EntityRefKind = 'settlement' | 'boundary_record' | 'perspective';

export interface ObjectRightsException {
  objectLocator: string;
  rightsStatus: RightsStatus;
  note: string;
}

export interface EditorialSource {
  id: string;
  title: string;
  authorOrInstitution: string;
  sourceType: string;
  language: string;
  locatorUrl: string;
  doiOrIsbn?: string;
  publishedOn?: string;
  publishedOnNote?: string;
  accessedOn: string;
  licenseName: string;
  licenseVersion?: string;
  licenseUrl?: string;
  mandatoryAttribution: string;
  reuseScope: string;
  rightsStatus: RightsStatus;
  rightsNote: string;
  checksumBasis: ChecksumBasis;
  checksum?: string;
  objectRightsExceptions?: ObjectRightsException[];
}

export interface EditorialEvidence {
  sourceId: string;
  locator?: string | null;
  locatorMissingReason?: string;
  relation: EvidenceRelation;
  sourceStatement: string;
  editorialInference: string;
  note?: string;
}

export interface EditorialCandidate {
  id: string;
  entityRef: {kind: EntityRefKind; id: string};
  claimPredicate: string;
  claimStatement: string;
  status: CandidateStatus;
  blockedReason?: string;
  extent?: TemporalExtent;
  originalExpression?: string;
  editorialClass?: EditorialClass;
  rationale?: string;
  evidence?: EditorialEvidence[];
  reviewStatus: ReviewStatus;
  reviewer?: string;
  reviewedContentHash?: string;
  editor: string;
  minutesSpent: number;
}

export interface PublishabilityResult {publishable: boolean; reasons: string[]}

export const RIGHTS_STATUSES: RightsStatus[];
export const EDITORIAL_CLASSES: EditorialClass[];
export const EVIDENCE_RELATIONS: EvidenceRelation[];
export const REVIEW_STATUSES: ReviewStatus[];
export const CANDIDATE_STATUSES: CandidateStatus[];
export const CHECKSUM_BASES: ChecksumBasis[];
export const ENTITY_REF_KINDS: EntityRefKind[];

export function validateEditorialSources<T extends EditorialSource[]>(sources: T): T;
export function validateEditorialEvidence<T extends EditorialEvidence>(evidence: T, sources: EditorialSource[]): T;
export function validateEditorialCandidates<T extends EditorialCandidate[]>(candidates: T, sources: EditorialSource[]): T;
export function contentHash(candidate: EditorialCandidate): string;
export function evaluatePublishability(candidate: EditorialCandidate, sources: EditorialSource[]): PublishabilityResult;
