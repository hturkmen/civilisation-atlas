export interface Source {
  id: string; title: string; publisher: string; url: string; accessedOn: string;
  license: string; licenseUrl: string; adaptation: string;
}
export interface Evidence { sourceId: string; locator: string }
export interface Place {
  id: string; name: string; aliases: string[]; culture: string; region: string;
  kind: 'settlement'; coordinates: [number, number]; coordinateNote: string;
  summary: string; significance: string; editorialStatus: string;
  period: {start: number; endExclusive: number; label: string; kind: 'source-focus'; note: string};
  suggestedYear: number;
  evidence: {summary: Evidence; period: Evidence; coordinates: Evidence};
}
export interface Catalog { sources: Source[]; places: Place[] }
export interface View { year: number; mode: 'history' | 'known'; selectedId: string | null }
export const MIN_YEAR: number;
export const DEFAULT_YEAR: number;
export const RELEASE_ID: string;
export function normalize(value: string): string;
export function visiblePlaces(places: Place[], year: number, query?: string): Place[];
export function parseView(params: URLSearchParams, maxYear: number, places: Place[]): View;
export function viewQuery(view: View): string;
export function validateCatalog<T extends Catalog>(catalog: T): T;
