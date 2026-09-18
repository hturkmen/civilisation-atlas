import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {visibleBoundaries, validateBoundaryCollection, validateBoundaryGeometry} from '../src/boundaries.mjs';
import {parseView, viewQuery} from '../src/catalog.mjs';

const collection = JSON.parse(readFileSync(new URL('../../../data/boundary-collection.json', import.meta.url)));
const rawGeometry = readFileSync(new URL('../../../apps/web/public/data/polity-boundaries.geojson', import.meta.url));
const ids = year => visibleBoundaries(collection, year).map(item => item.polity.id).sort();

test('boundary export is pinned to evidence and the exact geometry artifact', () => {
  validateBoundaryCollection(collection);
  assert.equal(collection.polities.length, 24);
  assert.equal(collection.records.length, 225);
  assert.equal(createHash('sha256').update(rawGeometry).digest('hex'), collection.geometrySha256);
  validateBoundaryGeometry(JSON.parse(rawGeometry), collection);
});

test('inclusive BCE source endpoints convert once and uncovered years stay empty', () => {
  assert.deepEqual(ids(-2499), ['old-kingdom-egypt', 'sumer']); // 2500 BCE
  assert.deepEqual(ids(-2300), ['old-kingdom-egypt', 'sumer']); // 2301 BCE, included
  assert.deepEqual(ids(-2299), []); // 2300 BCE, no imported record
  assert.deepEqual(ids(-3999), []);
  assert.deepEqual(ids(2026), []);
});

test('CE boundaries retain independent source coverage and never interpolate gaps', () => {
  assert.deepEqual(ids(116), []);
  assert.deepEqual(ids(117), ['han-dynasty', 'roman-empire']);
  assert.deepEqual(ids(126), ['han-dynasty', 'roman-empire']);
  assert.deepEqual(ids(127), ['han-dynasty']);
  assert.deepEqual(ids(1601), ['ethiopian-empire', 'kingdom-of-kongo', 'ming-dynasty', 'mughal-empire', 'ottoman-empire', 'safavid-dynasty', 'songhai-empire', 'tokugawa-shogunate']);
  assert.deepEqual(ids(1602), ids(1601));
  assert.notEqual(visibleBoundaries(collection,1601).find(x=>x.polity.id==='ottoman-empire').record.id, visibleBoundaries(collection,1602).find(x=>x.polity.id==='ottoman-empire').record.id);
  assert.deepEqual(ids(1914), ['ottoman-empire']);
  assert.deepEqual(ids(1915), []);
});

test('expanded world snapshot links eight selected political areas to independent records', () => {
  assert.deepEqual(ids(1500), ['aztec-triple-alliance', 'ethiopian-empire', 'inca-empire', 'kingdom-of-kongo', 'mali-empire', 'ming-dynasty', 'ottoman-empire', 'songhai-empire']);
  assert.deepEqual(ids(1000), ['byzantine-empire', 'ghana-empire', 'khmer-empire']);
  assert.deepEqual(ids(-249), ['maurya-empire']);
  assert.equal(visibleBoundaries(collection, 1500, 'İNKA')[0].polity.id, 'inca-empire');
});

test('early modern coverage retains source ranges through 1750', () => {
  assert.deepEqual(ids(1700), ['ethiopian-empire','mughal-empire','ottoman-empire','qing-dynasty','safavid-dynasty','tokugawa-shogunate']);
  assert.deepEqual(ids(1750), ['ethiopian-empire','mughal-empire','ottoman-empire','qing-dynasty','tokugawa-shogunate']);
  for(let year=1400;year<=1750;year++) assert.equal(visibleBoundaries(collection,year).filter(x=>x.polity.id==='ottoman-empire').length,1);
  for(const r of collection.records){
    assert.ok(visibleBoundaries(collection,r.period.start).some(x=>x.record.id===r.id));
    assert.ok(!visibleBoundaries(collection,r.period.endExclusive).some(x=>x.record.id===r.id));
  }
});

test('shared polity links are validated against year and mode, with no ambiguous selection', () => {
  const parse = query => parseView(new URLSearchParams(query), 2026, [], collection.records);
  const view = parse('year=117&era=CE&polity=roman-empire&place=caral-supe');
  assert.equal(view.selectedPolityId, 'roman-empire');
  assert.equal(view.selectedId, null);
  assert.equal(viewQuery(view), '?year=117&era=CE&mode=history&polity=roman-empire');
  assert.equal(parse('year=116&era=CE&polity=roman-empire').selectedPolityId, undefined);
  assert.equal(parse('year=117&era=CE&mode=known&polity=roman-empire').selectedPolityId, undefined);
  assert.equal(parse('year=117&era=CE&polity=unknown').selectedPolityId, undefined);
  assert.equal(visibleBoundaries(collection, 117, 'ROMA')[0].polity.id, 'roman-empire');
});

test('modified dates, ambiguous records and unclosed geometries fail validation', () => {
  const changed = structuredClone(collection);
  changed.records[0].period.endExclusive++;
  assert.throws(() => validateBoundaryCollection(changed), /dates differ/);
  const duplicate = structuredClone(collection);
  duplicate.records.push(structuredClone(duplicate.records[0]));
  assert.throws(() => validateBoundaryCollection(duplicate), /identity/);
  const bundle = JSON.parse(rawGeometry);
  const coordinates = bundle.features[0].geometry.coordinates;
  coordinates[0].pop();
  assert.throws(() => validateBoundaryGeometry(bundle, collection), /ring/);
});
