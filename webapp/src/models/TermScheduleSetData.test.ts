import { TermScheduleSetData } from './TermScheduleSetData';
import { TERMS } from './__test__/Term.TestData';

describe('Validate TermScheduleSetData.constructor()', () => {
  it('should import data properly', () => {
    const term = TERMS.WINTER_2020;
    const object = new TermScheduleSetData([], term);
    expect(object).toHaveProperty('term');
    expect(object.term).toEqual(term);
    expect(object).toHaveProperty('current_schedule_index', 0);
    expect(object).toHaveProperty('schedules');
    expect(object.schedules.length).toBe(0);
  });
});

describe('Validate TermScheduleSetData.compareByTermDate()', () => {
  const WINTER_2020 = new TermScheduleSetData([], TERMS.WINTER_2020);
  const SUMMER_2020 = new TermScheduleSetData([], TERMS.SUMMER_2020);
  const FALL_2020 = new TermScheduleSetData([], TERMS.FALL_2020);
  const WINTER_2021 = new TermScheduleSetData([], TERMS.WINTER_2021);
  expect(TermScheduleSetData.compareByTermDate(WINTER_2020, SUMMER_2020)).toBeLessThan(0);
  expect(TermScheduleSetData.compareByTermDate(FALL_2020, SUMMER_2020)).toBeGreaterThan(0);
  expect(TermScheduleSetData.compareByTermDate(WINTER_2020, WINTER_2020)).toBe(0);
  expect(TermScheduleSetData.compareByTermDate(WINTER_2020, WINTER_2021)).toBeLessThan(0);
});

describe('Validate TermScheduleSetData.compareByTermDateReverse()', () => {
  const WINTER_2020 = new TermScheduleSetData([], TERMS.WINTER_2020);
  const SUMMER_2020 = new TermScheduleSetData([], TERMS.SUMMER_2020);
  const FALL_2020 = new TermScheduleSetData([], TERMS.FALL_2020);
  const WINTER_2021 = new TermScheduleSetData([], TERMS.WINTER_2021);
  expect(TermScheduleSetData.compareByTermDateReverse(WINTER_2020, SUMMER_2020)).toBeGreaterThan(0);
  expect(TermScheduleSetData.compareByTermDateReverse(FALL_2020, SUMMER_2020)).toBeLessThan(0);
  expect(TermScheduleSetData.compareByTermDateReverse(WINTER_2020, WINTER_2020)).toBe(0);
  expect(TermScheduleSetData.compareByTermDateReverse(WINTER_2020, WINTER_2021)).toBeGreaterThan(0);
});
