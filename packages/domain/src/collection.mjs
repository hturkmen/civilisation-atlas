import {visiblePlaces, normalize} from './catalog.mjs';
import {visibleBoundaries} from './boundaries.mjs';

function historyStop(places, boundaries, year) {
  const areas = visibleBoundaries(boundaries, year);
  const settlements = visiblePlaces(places, year);
  return {year, mode: 'history', areaCount: areas.length, placeCount: settlements.length,
    names: [...areas.map(item => item.polity.name), ...settlements.map(place => place.name)]};
}

/** Discovery dates are explicit samples, never inferred historical events. */
export function collectionStops(places, boundaries, maps = []) {
  const years = new Set([...places.map(place => place.suggestedYear), ...boundaries.records.map(record => record.sampleYear)]);
  return [...Array.from(years, year => historyStop(places, boundaries, year)),
    ...maps.map(map => ({year: map.publicationYear, mode: 'known', areaCount: 0, placeCount: 0, names: [map.title]}))]
    .sort((a, b) => a.year - b.year || a.mode.localeCompare(b.mode));
}

/** Find actual coverage edges, not a distant suggested date inside a record. */
export function nearbyCoveredYears(places, boundaries, year) {
  const periods = [...places.map(place => place.period), ...boundaries.records.map(record => record.period)];
  const previous = periods.filter(period => period.endExclusive <= year).map(period => period.endExclusive - 1);
  const next = periods.filter(period => period.start > year).map(period => period.start);
  return {
    previous: previous.length ? historyStop(places, boundaries, Math.max(...previous)) : null,
    next: next.length ? historyStop(places, boundaries, Math.min(...next)) : null,
  };
}

/** Search only published collection records; gaps are never combined into a lifetime. */
export function searchOtherPeriods(places, boundaries, year, query) {
  const needle = normalize(query.trim());
  if (!needle) return {polities: [], places: []};
  const polities = boundaries.polities.filter(polity => normalize(polity.name + ' ' + polity.sourceName).includes(needle))
    .map(polity => ({polity, records: boundaries.records
      .filter(record => record.polityId === polity.id && !(record.period.start <= year && year < record.period.endExclusive))
      .sort((a, b) => a.period.start - b.period.start || a.id.localeCompare(b.id))}))
    .filter(group => group.records.length);
  const settlements = places.filter(place => !(place.period.start <= year && year < place.period.endExclusive)
    && normalize([place.name, place.culture, place.region, ...place.aliases].join(' ')).includes(needle));
  return {polities, places: settlements};
}
