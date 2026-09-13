import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateBoundaryCollection, validateBoundaryGeometry} from '../packages/domain/src/boundaries.mjs';

const collection = validateBoundaryCollection(JSON.parse(await readFile(new URL('../data/boundary-collection.json', import.meta.url), 'utf8')));
const raw = await readFile(new URL('../apps/web/public' + collection.geometryPath, import.meta.url));
if (createHash('sha256').update(raw).digest('hex') !== collection.geometrySha256) throw new Error('Boundary geometry checksum mismatch');
validateBoundaryGeometry(JSON.parse(raw), collection);
console.log('Boundary metadata, dates and geometry artifact verified.');
