import {validateCatalog, type Catalog} from '@atlas/domain/catalog';
import rawCatalog from '../../../../data/preview-collection.json';

// Static preview repository. Replace with the release repository behind this
// boundary when P03 ships; route/UI files do not own data access or chronology.
export const catalog = validateCatalog(rawCatalog as Catalog);
