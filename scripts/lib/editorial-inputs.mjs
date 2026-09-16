import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateBoundaryCollection, validateBoundaryGeometry} from '../../packages/domain/src/boundaries.mjs';

// The adapter, not a client-supplied hash, resolves exact entity/geometry content.
export async function loadEditorialInputs() {
  const root = new URL('../../', import.meta.url);
  const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
  const [sources, candidates, preview, boundaries, maps] = await Promise.all([
    read('data/editorial/sources.json'), read('data/editorial/candidates.json'),
    read('data/preview-collection.json'), read('data/boundary-collection.json'), read('data/historical-maps.json'),
  ]);
  validateBoundaryCollection(boundaries);
  // Fixed repository path; metadata cannot redirect this reader outside the checkout.
  const raw = await readFile(new URL('apps/web/public/data/polity-boundaries.geojson', root));
  if (createHash('sha256').update(raw).digest('hex') !== boundaries.geometrySha256) throw new Error('Boundary geometry checksum mismatch');
  const geometry = validateBoundaryGeometry(JSON.parse(raw), boundaries);
  const features = new Map(geometry.features.map(feature => [feature.id, feature]));
  const entities = [
    ...preview.places.map(place => ({kind: 'settlement', id: place.id, content: place})),
    ...maps.map(map => ({kind: 'perspective', id: map.id, content: map})),
    ...boundaries.records.map(record => ({kind: 'boundary_record', id: record.id, content: {
      ...record, polity: boundaries.polities.find(polity => polity.id === record.polityId),
      geometry: features.get(record.id), collectionSource: boundaries.source,
    }})),
  ];
  const resolveEntity = ref => entities.find(entity => entity.kind === ref.kind && entity.id === ref.id);
  return {sources, candidates, entities, resolveEntity};
}
