import {containsYear, toAstronomicalYear, toDisplayYear} from './chronology.mjs';

export const MIN_YEAR = -3999;
export const DEFAULT_YEAR = -2499;
export const RELEASE_ID = 'preview-2026-09-13.4';

/** The window means source coverage, never the complete lifetime of a polity. */
export function visiblePlaces(places, year, query = '') {
  const needle = normalize(query);
  return places.filter(place => containsYear(place.period, year)
    && normalize([place.name, place.culture, place.region, ...place.aliases].join(' ')).includes(needle));
}

export function normalize(value) {
  return value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
}

export function parseView(params, maxYear, places, boundaryRecords = []) {
  const raw = params.get('year');
  const era = params.get('era');
  let year = DEFAULT_YEAR;
  if (raw && /^[1-9][0-9]{0,5}$/.test(raw) && (era === 'BCE' || era === 'CE')) {
    const candidate = toAstronomicalYear({year: Number(raw), era});
    if (candidate >= MIN_YEAR && candidate <= maxYear) year = candidate;
  }
  const mode = params.get('mode') === 'known' ? 'known' : 'history';
  const selectedPolityId = mode === 'history' ? boundaryRecords.find(record => record.polityId === params.get('polity') && containsYear(record.period, year))?.polityId : undefined;
  const selectedId = mode === 'history' && !selectedPolityId
    ? visiblePlaces(places, year).find(p => p.id === params.get('place'))?.id ?? null
    : null;
  return {year, mode, selectedId, ...(selectedPolityId ? {selectedPolityId} : {})};
}

export function viewQuery(view) {
  const display = toDisplayYear(view.year);
  const params = new URLSearchParams({year: String(display.year), era: display.era, mode: view.mode});
  if (view.mode === 'history' && view.selectedPolityId) params.set('polity', view.selectedPolityId);
  else if (view.mode === 'history' && view.selectedId) params.set('place', view.selectedId);
  return '?' + params.toString();
}

export function validateCatalog(catalog) {
  const ids = new Set();
  const sources = new Map(catalog.sources.map(source => [source.id, source]));
  if (sources.size !== catalog.sources.length) throw new Error('Duplicate source');
  for (const source of sources.values()) {
    if (!source.title || !source.publisher || !source.accessedOn || !source.license) throw new Error('Incomplete source');
    for (const url of [source.url, source.licenseUrl]) {
      if (new URL(url).protocol !== 'https:') throw new Error('Unsafe source URL');
    }
  }
  for (const place of catalog.places) {
    if (!/^[a-z0-9-]+$/.test(place.id) || ids.has(place.id)) throw new Error('Invalid place identity');
    ids.add(place.id);
    containsYear(place.period, place.period.start);
    const [longitude, latitude] = place.coordinates;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)
      || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) throw new Error('Invalid coordinates');
    if (place.kind !== 'settlement' || place.period.kind !== 'source-focus') throw new Error('Unapproved representation');
    if (!containsYear(place.period, place.suggestedYear)) throw new Error('Invalid suggested year');
    if (!place.coordinateNote || !place.period.note || !place.editorialStatus) throw new Error('Missing uncertainty');
    for (const key of ['summary', 'period', 'coordinates']) {
      const evidence = place.evidence[key];
      if (!evidence?.locator || !sources.has(evidence.sourceId)) throw new Error('Missing evidence: ' + key);
    }
  }
  return catalog;
}
