/**
 * Astronomical years are internal only: 0 = 1 BCE, -3999 = 4000 BCE.
 * Historical dates must not be passed to JavaScript Date.
 * Product min/max bounds belong to the release metadata, not this module.
 */
function assertInteger(value, name) {
  if (!Number.isSafeInteger(value)) throw new RangeError(name + ' must be a safe integer');
}

/** @param {{year:number, era:'BCE'|'CE'}} input */
export function toAstronomicalYear({year, era}) {
  assertInteger(year, 'year');
  if (year < 1) throw new RangeError('Display year must be at least 1; there is no display year zero');
  if (era !== 'BCE' && era !== 'CE') throw new RangeError('era must be BCE or CE');
  return era === 'BCE' ? 1 - year : year;
}

/** @param {number} year */
export function toDisplayYear(year) {
  assertInteger(year, 'year');
  const value = year <= 0 ? 1 - year : year;
  assertInteger(value, 'display year');
  return {year: value, era: year <= 0 ? 'BCE' : 'CE'};
}

/** @param {number} year @param {'tr'|'en'} locale */
export function formatYear(year, locale = 'tr') {
  if (locale !== 'tr' && locale !== 'en') throw new RangeError('Unsupported locale');
  const display = toDisplayYear(year);
  if (locale === 'tr') return (display.era === 'BCE' ? 'MÖ ' : 'MS ') + display.year;
  return display.year + ' ' + display.era;
}

/** Half-open interval [start, endExclusive). */
export function containsYear({start, endExclusive}, year) {
  assertInteger(start, 'start');
  assertInteger(endExclusive, 'endExclusive');
  assertInteger(year, 'year');
  if (start >= endExclusive) throw new RangeError('Interval must have positive length');
  return start <= year && year < endExclusive;
}

/**
 * A finite uncertainty envelope for one release. An ongoing source statement
 * must first be bounded by the release's data_as_of by the import layer.
 */
export function validateTemporalExtent(extent) {
  const keys = ['startEarliest', 'startLatest', 'endEarliestExclusive', 'endLatestExclusive'];
  for (const key of keys) assertInteger(extent[key], key);
  const {startEarliest: a, startLatest: b, endEarliestExclusive: c, endLatestExclusive: d} = extent;
  if (a > b || c > d || a >= c || b >= d) throw new RangeError('Invalid temporal extent order');
  return extent;
}

/** @returns {'absent'|'possible'|'certain'} */
export function classifyYear(extent, year) {
  validateTemporalExtent(extent);
  assertInteger(year, 'year');
  const {startEarliest: a, startLatest: b, endEarliestExclusive: c, endLatestExclusive: d} = extent;
  if (year < a || year >= d) return 'absent';
  return b <= year && year < c ? 'certain' : 'possible';
}
