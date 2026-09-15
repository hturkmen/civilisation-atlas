import type {Place} from './catalog.mjs';
import type {BoundaryCollection} from './boundaries.mjs';
import type {ArchiveMap} from './archive.mjs';
export interface CollectionStop {year: number; mode: 'history' | 'known'; areaCount: number; placeCount: number; names: string[]}
export function collectionStops(places: Place[], boundaries: BoundaryCollection, maps?: ArchiveMap[]): CollectionStop[];
export function nearbyCoveredYears(places: Place[], boundaries: BoundaryCollection, year: number): {previous: CollectionStop | null; next: CollectionStop | null};
