import {containsYear} from './chronology.mjs';
import {normalize} from './catalog.mjs';

export function visibleBoundaries(collection, year, query = '') {
  const needle = normalize(query);
  return collection.records.filter(record => containsYear(record.period, year)).map(record => ({
    record, polity: collection.polities.find(polity => polity.id === record.polityId)
  })).filter(({polity}) => normalize(polity.name + ' ' + polity.sourceName).includes(needle));
}

export function validateBoundaryCollection(collection) {
  const source = collection.source;
  if (!source?.title || !source.publisher || !source.version || !source.uncertainty || !source.adaptation
    || source.license !== 'CC BY 4.0' || !/^[a-f0-9]{40}$/.test(source.commit)) throw new Error('Incomplete boundary provenance');
  for (const key of ['url', 'paperUrl', 'licenseUrl', 'licenseRecordUrl', 'archiveUrl']) {
    if (new URL(source[key]).protocol !== 'https:') throw new Error('Unsafe boundary source URL');
  }
  if (!/^\/data\/[a-z0-9-]+\.geojson$/.test(collection.geometryPath)
    || !/^[a-f0-9]{64}$/.test(collection.geometrySha256)) throw new Error('Invalid geometry artifact');
  const polities = new Map();
  for (const polity of collection.polities) {
    if (!/^[a-z0-9-]+$/.test(polity.id) || polities.has(polity.id) || !polity.name || !polity.sourceName
      || !/^#[a-fA-F0-9]{6}$/.test(polity.color)) throw new Error('Invalid polity');
    polities.set(polity.id, polity);
  }
  const ids = new Set();
  const fromSource = value => {
    if (!Number.isSafeInteger(value) || value === 0) throw new Error('Ambiguous source year');
    return value < 0 ? value + 1 : value;
  };
  for (const record of collection.records) {
    if (ids.has(record.id) || !polities.has(record.polityId) || !Number.isSafeInteger(record.sourceIndex)
      || record.sourceIndex < 0 || record.id !== 'cliopatria-' + record.sourceIndex) throw new Error('Invalid boundary identity');
    ids.add(record.id);
    if (record.period.start !== fromSource(record.sourceFromYear)
      || record.period.endExclusive !== fromSource(record.sourceToYear) + 1
      || !containsYear(record.period, record.sampleYear)) throw new Error('Boundary dates differ from source');
    if (!Number.isFinite(record.sourceAreaKm2) || record.sourceAreaKm2 <= 0) throw new Error('Invalid source area');
    const [x, y] = record.labelPoint;
    const [west, south, east, north] = record.bbox;
    if (![x, y, west, south, east, north].every(Number.isFinite) || west >= east || south >= north
      || west < -180 || east > 180 || south < -90 || north > 90
      || x < west || x > east || y < south || y > north) throw new Error('Invalid boundary position');
    if (record.wikidata && !/^Q[0-9]+$/.test(record.wikidata)) throw new Error('Invalid Wikidata identifier');
  }
  for (const polity of polities.values()) {
    const records = collection.records.filter(record => record.polityId === polity.id).sort((a, b) => a.period.start - b.period.start);
    if (!records.length) throw new Error('Polity without records');
    for (let i = 1; i < records.length; i++) {
      if (records[i].period.start < records[i - 1].period.endExclusive) throw new Error('Ambiguous overlapping periods for one polity');
    }
  }
  return collection;
}

export function validateBoundaryGeometry(bundle, collection) {
  if (bundle.type !== 'FeatureCollection' || bundle.features.length !== collection.records.length) throw new Error('Geometry count mismatch');
  const seen = new Set();
  for (const feature of bundle.features) {
    const record = collection.records.find(item => item.id === feature.id);
    if (!record || seen.has(feature.id) || feature.type !== 'Feature') throw new Error('Unknown geometry record');
    seen.add(feature.id);
    const polity = collection.polities.find(item => item.id === record.polityId);
    const props = feature.properties;
    if (props.recordId !== record.id || props.polityId !== polity.id || props.name !== polity.name
      || props.color !== polity.color || props.start !== record.period.start
      || props.endExclusive !== record.period.endExclusive) throw new Error('Geometry metadata mismatch');
    const geometry = feature.geometry;
    if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) throw new Error('Unsupported boundary geometry');
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    if (!polygons.length) throw new Error('Empty geometry');
    for (const polygon of polygons) {
      if (!polygon.length) throw new Error('Empty polygon');
      for (const ring of polygon) {
        if (ring.length < 4 || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) throw new Error('Unclosed polygon ring');
        for (const point of ring) {
          if (point.length !== 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) throw new Error('Invalid geometry coordinate');
        }
      }
    }
  }
  return bundle;
}
