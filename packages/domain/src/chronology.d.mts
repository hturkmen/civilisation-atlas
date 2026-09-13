export type Era = 'BCE' | 'CE';
export interface DisplayYear { year: number; era: Era }
export interface Interval { start: number; endExclusive: number }
export interface TemporalExtent {
  startEarliest: number;
  startLatest: number;
  endEarliestExclusive: number;
  endLatestExclusive: number;
}
export function toAstronomicalYear(input: DisplayYear): number;
export function toDisplayYear(year: number): DisplayYear;
export function formatYear(year: number, locale?: 'tr' | 'en'): string;
export function containsYear(interval: Interval, year: number): boolean;
export function validateTemporalExtent(extent: TemporalExtent): TemporalExtent;
export function classifyYear(extent: TemporalExtent, year: number): 'absent' | 'possible' | 'certain';
