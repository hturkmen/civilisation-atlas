import {validateArchiveMaps, type ArchiveMap} from '@atlas/domain/archive';
import rawArchive from '../../../../data/historical-maps.json';

export const archiveMaps = validateArchiveMaps(rawArchive as ArchiveMap[]);
