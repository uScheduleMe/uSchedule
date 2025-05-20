/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CourseSectionComponent } from './CourseSectionComponent';
import { WINTER } from './__test__/Course.TestData';
import { SCHEDULE, SCHEDULE_CONFLICTS } from './__test__/CourseSchedule.TestData';

describe('Validate CourseSchedule.constructor()', () => {
  it('should import data properly', () => {
    expect(SCHEDULE).toHaveProperty('start_timestamp', 30600);
    expect(SCHEDULE).toHaveProperty('end_timestamp', 62400);
    expect(SCHEDULE).toHaveProperty('view_ids');
    expect(SCHEDULE.view_ids.size).toBe(2);
    expect(SCHEDULE).toHaveProperty('components');
    expect(SCHEDULE.components.size).toBe(7);
  });
});

describe('Validate CourseSchedule.getComponent()', () => {
  expect(SCHEDULE.getComponent('not-a-component')).toBe(undefined);
  expect(SCHEDULE.getComponent('2021winter753AA00-LEC-0')).toEqual(
    WINTER.CSI_2120.getComponent('A', 'A00-LEC-0'),
  );
});

describe('Validate CourseSchedule.swapComponents()', () => {
  const A01 = WINTER.CSI_2120.getComponent('A', 'A01-LAB') as CourseSectionComponent;
  const A02 = WINTER.CSI_2120.getComponent('A', 'A02-LAB') as CourseSectionComponent;
  SCHEDULE.swapComponents(A01, A02);
  SCHEDULE.swapComponents(A02, A02);
  expect(SCHEDULE.getComponent('2021winter753AA01-LAB')).toBe(undefined);
  expect(SCHEDULE.getComponent('2021winter753AA02-LAB')).toEqual(A02);
});

describe('Validate CourseSchedule.getConflicts()', () => {
  const A01 = WINTER.CSI_2120.getComponent('A', 'A01-LAB') as CourseSectionComponent;
  // One component means no conflicts, since the list returned includes the component being checked
  expect(SCHEDULE.getConflicts(A01).length).toBe(1);

  const LEC_0 = WINTER.CSI_3131.getComponent('A', 'A00-LEC-0') as CourseSectionComponent;
  expect(SCHEDULE_CONFLICTS.getConflicts(LEC_0).length).toBe(2);
});

describe('Validate CourseSchedule.getConflicts()', () => {
  it('should return the conflict data in the proper format', () => {
    const DOWNLOAD_FORMAT = SCHEDULE.getCourseSkeletons();
    expect(DOWNLOAD_FORMAT).toMatchSnapshot();
  });
});

describe('Validate CourseSchedule.getViewId()', () => {
  const A01 = WINTER.CSI_2120.getComponent('A', 'A01-LAB') as CourseSectionComponent;
  const E01 = WINTER.ITI_1120.getComponent('E', 'E01-LAB') as CourseSectionComponent;
  const A02 = WINTER.CSI_3131.getComponent('A', 'A02-LAB') as CourseSectionComponent;
  expect(SCHEDULE.getViewId(A01)).toBe(1);
  expect(SCHEDULE.getViewId(E01)).toBe(2);
  expect(SCHEDULE.getViewId(A02)).toBe(0);
});
