import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseView, validateCatalog, viewQuery, visiblePlaces} from '../src/catalog.mjs';

const catalog = JSON.parse(readFileSync(new URL('../../../data/preview-collection.json', import.meta.url)));

test('every preview claim, period and coordinate has a resolvable source', () => {
  assert.equal(validateCatalog(catalog), catalog);
  const broken = structuredClone(catalog);
  broken.places[0].evidence.period.sourceId = 'missing';
  assert.throws(() => validateCatalog(broken), /Missing evidence/);
  const unsafe = structuredClone(catalog);
  unsafe.sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validateCatalog(unsafe), /Unsafe source/);
});

test('source focus filters do not imply continuous worldwide coverage', () => {
  assert.deepEqual(visiblePlaces(catalog.places, -2499).map(p => p.id), ['mohenjo-daro', 'caral-supe']);
  assert.deepEqual(visiblePlaces(catalog.places, 1300).map(p => p.id), ['great-zimbabwe']);
  for (const year of [-3999, 0, 1, 2026]) assert.equal(visiblePlaces(catalog.places, year).length, 0);
  assert.equal(visiblePlaces(catalog.places, -1799)[0].id, 'caral-supe'); // 1800 BCE included
  assert.equal(visiblePlaces(catalog.places, -1798).length, 0); // 1799 BCE outside focus
  assert.equal(visiblePlaces(catalog.places, 1450).length, 1);
  assert.equal(visiblePlaces(catalog.places, 1451).length, 0);
});

test('Turkish search and aliases resolve only within the selected year', () => {
  assert.equal(visiblePlaces(catalog.places, -2499, 'İNDUS')[0].id, 'mohenjo-daro');
  assert.equal(visiblePlaces(catalog.places, 1300, 'sona')[0].id, 'great-zimbabwe');
  assert.equal(visiblePlaces(catalog.places, -2499, 'Zimbabwe').length, 0);
});

test('share URLs round trip eras and discard stale or unknown selections', () => {
  for (const year of [-3999, -2499, 0, 1, 1300, 2026]) {
    const view = {year, mode: 'history', selectedId: null};
    assert.deepEqual(parseView(new URLSearchParams(viewQuery(view)), 2026, catalog.places), view);
  }
  assert.equal(parseView(new URLSearchParams('year=1300&era=CE&place=caral-supe'), 2026, catalog.places).selectedId, null);
  assert.equal(parseView(new URLSearchParams('year=2500&era=BCE&place=caral-supe&mode=known'), 2026, catalog.places).selectedId, null);
  for (const invalid of ['0', '-1', 'NaN', '1e3', '4001', '999999999999']) {
    assert.equal(parseView(new URLSearchParams({year: invalid, era: 'BCE'}), 2026, catalog.places).year, -2499);
  }
});

test('coordinates are reproducible conversions of source DMS, not estimates', () => {
  const expected = [[68+8/60+20/3600,27+19/60+45/3600],[-(77+31/60+17/3600),-(10+53/60+30/3600)],
    [30+55/60+59.768/3600,-(20+16/60+16.212/3600)]];
  catalog.places.forEach((place, i) => place.coordinates.forEach((value, axis) => assert.ok(Math.abs(value - expected[i][axis]) < 0.00000001)));
});
