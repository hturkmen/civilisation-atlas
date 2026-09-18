import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectionStops, nearbyCoveredYears, searchOtherPeriods} from '../src/collection.mjs';
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
  assert.equal(simultaneous[0].areaCount, 8);
  assert.equal(simultaneous[0].names.length, 8);
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

test('period search groups actual records by identity without bridging gaps', () => {
  const result = searchOtherPeriods([], collection, 1700, '  MALİ  ');
  assert.equal(result.polities.length, 1);
  const records = result.polities[0].records;
  assert.deepEqual(records.map(r => r.sampleYear), [1325, 1500]);
  assert.ok(records[0].period.endExclusive < records[1].period.start);
  assert.deepEqual(searchOtherPeriods([], collection, 1500, 'Mali').polities[0].records.map(r => r.sampleYear), [1325]);
  assert.equal(searchOtherPeriods([], collection, 1700, 'Roman').polities[0].polity.name, 'Roma İmparatorluğu');
  assert.deepEqual(searchOtherPeriods([], collection, 1700, '   '), {polities: [], places: []});
  assert.deepEqual(searchOtherPeriods([], collection, 1700, 'unmatched'), {polities: [], places: []});
});

test('period search preserves BCE endpoints, matches place aliases and leaves input untouched', () => {
  // Synthetic records test chronology and grouping, not historical assertions.
  const fixture = {...collection, polities: [{id: 'one', name: 'Örnek', sourceName: 'Fixture'}, {id: 'two', name: 'Örnek', sourceName: 'Fixture'}], records: [
    {id: 'b', polityId: 'one', period: {start: 0, endExclusive: 1}, sampleYear: 0},
    {id: 'a', polityId: 'one', period: {start: -10, endExclusive: -5}, sampleYear: -7},
    {id: 'c', polityId: 'two', period: {start: 0, endExclusive: 1}, sampleYear: 0},
  ]};
  const before = JSON.stringify(fixture);
  const result = searchOtherPeriods([], fixture, 1, 'ORNEK');
  assert.equal(result.polities.length, 2);
  assert.deepEqual(result.polities[0].records.map(r => r.id), ['a', 'b']);
  assert.equal(formatYear(result.polities[0].records[1].period.endExclusive - 1), 'MÖ 1');
  assert.equal(JSON.stringify(fixture), before);
  const places = [{id: 'test', name: 'Örnek', culture: 'Test', region: 'Test', aliases: ['Ancient test'], period: {start: 0, endExclusive: 1}, suggestedYear: 0}];
  assert.equal(searchOtherPeriods(places, fixture, 1, 'ancient').places[0], places[0]);
  assert.equal(searchOtherPeriods(places, fixture, 0, 'ancient').places.length, 0);
});
