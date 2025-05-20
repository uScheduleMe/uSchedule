/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CourseScheduleExtended } from './CourseScheduleExtended';
import { TermSeasons } from './Term';
import { SCHEDULE_EXT, SCHEDULE_CONFLICTS_EXT } from './__test__/CourseSchedule.TestData';

describe('Validate CourseScheduleExtended.constructor()', () => {
  it('should import data properly', () => {
    expect(SCHEDULE_EXT.id).toBe(1);
    expect(SCHEDULE_EXT.in_calendar).toBe(true);
    expect(SCHEDULE_EXT.name).toBe('schedule with name');
    expect(SCHEDULE_EXT.term.year).toBe(2020);
    expect(SCHEDULE_EXT.term.season).toBe(TermSeasons.Winter);

    expect(SCHEDULE_CONFLICTS_EXT.id).toBe(2);
    expect(SCHEDULE_CONFLICTS_EXT.in_calendar).toBe(false);
    expect(SCHEDULE_CONFLICTS_EXT.name).toBe('');
    expect(SCHEDULE_CONFLICTS_EXT.term.year).toBe(2021);
    expect(SCHEDULE_CONFLICTS_EXT.term.season).toBe(TermSeasons.Fall);
  });
});

describe('Validate CourseScheduleExtended.compareByTermDate()', () => {
  expect(CourseScheduleExtended.compareByTermDate(SCHEDULE_EXT, SCHEDULE_EXT)).toBe(0);
  expect(
    CourseScheduleExtended.compareByTermDate(SCHEDULE_EXT, SCHEDULE_CONFLICTS_EXT),
  ).toBeLessThan(0);
  expect(
    CourseScheduleExtended.compareByTermDate(SCHEDULE_CONFLICTS_EXT, SCHEDULE_EXT),
  ).toBeGreaterThan(0);
});

describe('Validate CourseScheduleExtended.compareByTermDateReverse()', () => {
  expect(CourseScheduleExtended.compareByTermDateReverse(SCHEDULE_EXT, SCHEDULE_EXT)).toBe(0);
  expect(
    CourseScheduleExtended.compareByTermDateReverse(SCHEDULE_EXT, SCHEDULE_CONFLICTS_EXT),
  ).toBeGreaterThan(0);
  expect(
    CourseScheduleExtended.compareByTermDateReverse(SCHEDULE_CONFLICTS_EXT, SCHEDULE_EXT),
  ).toBeLessThan(0);
});
