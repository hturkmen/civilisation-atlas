import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectionStops, nearbyCoveredYears} from '../src/collection.mjs';
import {formatYear} from '../src/chronology.mjs';

const collection = JSON.parse(readFileSync(new URL('../../../data/boundary-collection.json', import.meta.url)));

test('nearest available years use source coverage edges and respect the end of the collection', () => {
  const gap = nearbyCoveredYears([], collection, 207);
  assert.equal(gap.previous.year, 206); // Last included source year, not the suggested 200.
  assert.equal(gap.next.year, 387); // Gupta source record begins before the 400 stop.
  assert.deepEqual(gap.previous.names.sort(), ['Han Hanedanı', 'Roma İmparatorluğu']);
  const end = nearbyCoveredYears([], collection, 2026);
  assert.equal(end.previous.year, 1914);
  assert.equal(end.next, null);
});

test('discovery stops combine simultaneous areas without merging the archive mode', () => {
  // Synthetic archive at the same year checks future data without publishing an invented map.
  const stops = collectionStops([], collection, [{publicationYear: 1500, title: 'Test archive'}]);
  const simultaneous = stops.filter(stop => stop.year === 1500);
  assert.deepEqual(simultaneous.map(stop => stop.mode), ['history', 'known']);
  assert.equal(simultaneous[0].areaCount, 5);
  assert.equal(simultaneous[0].names.length, 5);
  assert.equal(stops.filter(stop => stop.year === 1453 && stop.mode === 'history').length, 1);
});

test('coverage suggestions preserve the BCE/CE boundary and never invent results for empty data', () => {
  const fixture = {...collection, records: [{...collection.records[0], period: {start: 0, endExclusive: 1}, sampleYear: 0}]};
  const beforeCE = nearbyCoveredYears([], fixture, 1);
  assert.equal(formatYear(beforeCE.previous.year), 'MÖ 1');
  assert.equal(beforeCE.next, null);
  const empty = {...collection, polities: [], records: []};
  assert.deepEqual(nearbyCoveredYears([], empty, 1), {previous: null, next: null});
  assert.deepEqual(collectionStops([], empty), []);
});
