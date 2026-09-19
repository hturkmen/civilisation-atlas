import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {archiveMapsAtYear, validateArchiveMaps} from '../src/archive.mjs';

const maps = JSON.parse(readFileSync(new URL('../../../data/historical-maps.json', import.meta.url)));

test('an archive facsimile appears only at its documented publication year', () => {
  assert.equal(archiveMapsAtYear(maps, 1507)[0].id, 'waldseemuller-1507');
  for (const year of [-2499, 1506, 1508, 2026]) assert.deepEqual(archiveMapsAtYear(maps, year), []);
});

test('archive publication needs separate knowledge/copy metadata and a pinned image', () => {
  assert.equal(validateArchiveMaps(maps), maps);
  for (const field of ['knowledgeDate', 'copyDate', 'sourceLocator']) {
    const broken = structuredClone(maps); broken[0][field] = '';
    assert.throws(() => validateArchiveMaps(broken), /Missing archive metadata/);
  }
  const unpinned = structuredClone(maps); unpinned[0].image.sha256 = '';
  assert.throws(() => validateArchiveMaps(unpinned), /Unpinned archive image/);
  const unsafe = structuredClone(maps); unsafe[0].image.src = '/../private.jpg';
  assert.throws(() => validateArchiveMaps(unsafe), /Unpinned archive image/);
});

test('Ortelius has its own source date and does not fill neighbouring years', () => {
  assert.equal(archiveMapsAtYear(maps, 1570)[0].id, 'ortelius-1570');
  assert.deepEqual(archiveMapsAtYear(maps, 1569), []);
  assert.deepEqual(archiveMapsAtYear(maps, 1571), []);
  assert.equal(archiveMapsAtYear(maps, 1507).length, 1);
});
