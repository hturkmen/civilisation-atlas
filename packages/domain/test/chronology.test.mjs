import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toAstronomicalYear, toDisplayYear, formatYear, containsYear, classifyYear} from '../src/chronology.mjs';

test('BCE and CE meet without a user-visible year zero', () => {
  assert.equal(toAstronomicalYear({year: 4000, era: 'BCE'}), -3999);
  assert.equal(toAstronomicalYear({year: 1, era: 'BCE'}), 0);
  assert.equal(toAstronomicalYear({year: 1, era: 'CE'}), 1);
  assert.equal(formatYear(0), 'MÖ 1');
  assert.equal(formatYear(1), 'MS 1');
});

test('every year in the initial product range round-trips', () => {
  for (let year = -3999; year <= 2026; year++) {
    assert.equal(toAstronomicalYear(toDisplayYear(year)), year);
  }
});

test('invalid and ambiguous user input is rejected', () => {
  for (const year of [0, -1, 1.5, NaN, Infinity, '1453']) {
    assert.throws(() => toAstronomicalYear({year, era: 'CE'}), RangeError);
  }
  assert.throws(() => toAstronomicalYear({year: 1, era: 'BC'}), RangeError);
  assert.throws(() => toDisplayYear(Number.MIN_SAFE_INTEGER), RangeError);
});

test('exclusive interval end does not show a previous state one year too long', () => {
  const interval = {start: -1, endExclusive: 1};
  assert.equal(containsYear(interval, -1), true);
  assert.equal(containsYear(interval, 0), true);
  assert.equal(containsYear(interval, 1), false);
  assert.throws(() => containsYear({start: 1, endExclusive: 1}, 1), RangeError);
});

test('approximate dates distinguish possible and certain presence', () => {
  const extent = {startEarliest: 100, startLatest: 110, endEarliestExclusive: 150, endLatestExclusive: 160};
  for (const [year, expected] of [[99,'absent'],[100,'possible'],[109,'possible'],[110,'certain'],[149,'certain'],[150,'possible'],[159,'possible'],[160,'absent']]) {
    assert.equal(classifyYear(extent, year), expected);
  }
});

test('an uncertainty envelope can have no certain interior', () => {
  const extent = {startEarliest: 100, startLatest: 120, endEarliestExclusive: 110, endLatestExclusive: 130};
  for (let year = 100; year < 130; year++) assert.equal(classifyYear(extent, year), 'possible');
});

test('malformed uncertainty and non-integer queries fail closed', () => {
  assert.throws(() => classifyYear({startEarliest: 10, startLatest: 9, endEarliestExclusive: 20, endLatestExclusive: 21}, 15), RangeError);
  assert.throws(() => classifyYear({startEarliest: 10, startLatest: 11, endEarliestExclusive: 10, endLatestExclusive: 21}, 15), RangeError);
  assert.throws(() => classifyYear({startEarliest: 10, startLatest: 11, endEarliestExclusive: 20, endLatestExclusive: 21}, 10.5), RangeError);
});
