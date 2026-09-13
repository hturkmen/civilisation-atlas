export interface BoundarySource {
  id: string; title: string; publisher: string; version: string; commit: string;
  url: string; paperUrl: string; license: string; licenseUrl: string; licenseRecordUrl: string;
  archiveUrl: string; archiveSha256: string; archiveMember: string;
  accessedOn: string; adaptation: string; uncertainty: string;
}
export interface Polity {id: string; name: string; sourceName: string; color: string}
export interface BoundaryRecord {
  id: string; polityId: string; sourceIndex: number; sourceFromYear: number; sourceToYear: number;
  period: {start: number; endExclusive: number}; sampleYear: number; sourceAreaKm2: number;
  wikidata: string; seshatId: string; labelPoint: [number, number]; bbox: [number, number, number, number];
}
export interface BoundaryCollection {source: BoundarySource; geometryPath: string; geometrySha256: string; polities: Polity[]; records: BoundaryRecord[]}
export interface VisibleBoundary {polity: Polity; record: BoundaryRecord}
export function visibleBoundaries(collection: BoundaryCollection, year: number, query?: string): VisibleBoundary[];
export function validateBoundaryCollection<T extends BoundaryCollection>(collection: T): T;
export function validateBoundaryGeometry<T>(bundle: T, collection: BoundaryCollection): T;
