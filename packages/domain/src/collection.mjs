import {visiblePlaces} from './catalog.mjs';
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
