/* eslint-disable @typescript-eslint/no-magic-numbers */
import { WINTER } from '@models/__test__/Course.TestData';
import { Course } from './Course';

describe('Validate Course.constructor()', () => {
  it('should import data properly', () => {
    const course = WINTER.CSI_2120;
    expect(course).toHaveProperty('id', 753);
    expect(course).toHaveProperty('school', 'uottawa');
    const YEAR = 2021;
    expect(course).toHaveProperty('year', YEAR);
    expect(course).toHaveProperty('term', 'winter');
    expect(course).toHaveProperty('subject_code', 'CSI');
    expect(course).toHaveProperty('course_code', '2120');
    expect(course).toHaveProperty('course_name', 'Programming Paradigms');

    expect(course).toHaveProperty('sections');
    expect(course.sections.size).toBe(1);
    expect(course.sections.has('A')).toBe(true);
    expect(course.sections.has('B')).toBe(false);

    expect(course).toHaveProperty('is_mandatory', true);
  });
});

describe('Validate Course.getSection()', () => {
  const section = WINTER.CSI_2120.getSection('A');
  expect(section?.id).toBe('A');
  const section2 = WINTER.CSI_2120.getSection('B');
  expect(section2).toBe(undefined);
});

describe('Validate Course.getComponent()', () => {
  const component = WINTER.CSI_2120.getComponent('A', 'A00-LEC-0');
  expect(component?.id).toBe('A00-LEC-0');
  const component2 = WINTER.CSI_2120.getComponent('A', 'A00-LEC-5');
  expect(component2).toBe(undefined);
  const component3 = WINTER.CSI_2120.getComponent('E', 'A00-LEC-0');
  expect(component3).toBe(undefined);
});

describe('Validate Course.getCourseMeta()', () => {
  const selection = WINTER.CSI_2120.getCourseMeta();
  const id = 753;
  expect(selection).toHaveProperty('id', id);
  expect(selection).toHaveProperty('is_mandatory', WINTER.CSI_2120.is_mandatory);
});

describe('Validate Course.getConfigurationSignature()', () => {
  const course = WINTER.CSI_2120;
  expect(course.getConfigurationSignature()).toBe('753y-A');
  const course2 = WINTER.ITI_1120;
  course2.is_mandatory = false;
  expect(course2.getConfigurationSignature()).toBe('1562n-E-F');
  const course3 = WINTER.ITI_1121;
  expect(course3.getConfigurationSignature()).toBe('1563y');
});

describe('Validate Course.compareBySubjectAndCode()', () => {
  const course = WINTER.CSI_2120;
  const course2 = WINTER.ITI_1120;
  expect(Course.compareBySubjectAndCode(course, course2)).toBeLessThan(0);
  expect(Course.compareBySubjectAndCode(course2, course)).toBeGreaterThan(0);
  expect(Course.compareBySubjectAndCode(course, course)).toBe(0);
});
