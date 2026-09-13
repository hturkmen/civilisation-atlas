export interface ArchiveMap {
  id: string; title: string; creator: string; publicationYear: number;
  representation: 'facsimile'; knowledgeDate: string; copyDate: string;
  perspective: string; summary: string; holdingInstitution: string;
  sourceUrl: string; sourceLocator: string; imageSourceUrl: string;
  license: string; licenseUrl: string; accessedOn: string;
  image: {src: string; downloadUrl: string; sha256: string; width: number; height: number};
}
export function archiveMapsAtYear(maps: ArchiveMap[], year: number): ArchiveMap[];
export function validateArchiveMaps<T extends ArchiveMap[]>(maps: T): T;
