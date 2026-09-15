import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateBoundaryCollection, validateBoundaryGeometry} from '../packages/domain/src/boundaries.mjs';

const collection = validateBoundaryCollection(JSON.parse(await readFile(new URL('../data/boundary-collection.json', import.meta.url), 'utf8')));
const plan = JSON.parse(await readFile(new URL('../data/boundary-import.json', import.meta.url), 'utf8'));
if (JSON.stringify(plan.source) !== JSON.stringify(collection.source)) throw new Error('Boundary source differs from import plan');
if (collection.polities.length !== plan.polities.length || collection.records.length !== plan.polities.reduce((total, polity) => total + polity.years.length, 0)) throw new Error('Stale boundary export: rebuild the import plan');
for (const polity of plan.polities) {
  const published = collection.polities.find(item => item.id === polity.id);
  if (!published || ['name', 'sourceName', 'color'].some(key => polity[key] !== published[key])) throw new Error('Polity differs from import plan');
  for (const year of polity.years) {
    if (!collection.records.some(record => record.polityId === polity.id && record.sampleYear === (year < 0 ? year + 1 : year))) throw new Error('Missing planned boundary sample');
  }
}
const raw = await readFile(new URL('../apps/web/public' + collection.geometryPath, import.meta.url));
if (createHash('sha256').update(raw).digest('hex') !== collection.geometrySha256) throw new Error('Boundary geometry checksum mismatch');
validateBoundaryGeometry(JSON.parse(raw), collection);
console.log('Boundary metadata, dates and geometry artifact verified.');
