import { COURSE, SECTIONS } from '@models/__test__/Course.TestData';
import { CourseSection } from './CourseSection';

describe('Validate CourseSection.constructor()', () => {
  it('should import data properly', () => {
    const section = SECTIONS.E;

    expect(section).toHaveProperty('id', 'E');
    expect(section).toHaveProperty('course', COURSE);
    expect(section).toHaveProperty('label', 'Section E');
    expect(section).toHaveProperty('instructor', 'Mohamad Hoda');
    expect(section).toHaveProperty('description', 'This is the description');

    expect(section).toHaveProperty('components');
    expect(section).toHaveProperty('components_by_type');

    const NUM_COMPONENTS = 7;
    expect(section.components.size).toBe(NUM_COMPONENTS);
    expect(section.components.has('E00-LEC-0')).toBe(true);
    expect(section.components.has('A00-LEC-0')).toBe(false);
    const NUM_TYPES = 2;
    expect(section.components_by_type.size).toBe(NUM_TYPES);
    expect(section.components_by_type.has('LEC')).toBe(true);
    expect(section.components_by_type.has('ABC')).toBe(false);
  });
});

describe('Validate CourseSection.getComponent()', () => {
  const component = SECTIONS.E.getComponent('E00-LEC-0');
  expect(component?.id).toBe('E00-LEC-0');
  const component2 = SECTIONS.E.getComponent('E00-LEC-5');
  expect(component2).toBe(undefined);
});

describe('Validate CourseSection.compareByLabel()', () => {
  const section = SECTIONS.E;
  const section2 = SECTIONS.F;
  expect(CourseSection.compareByLabel(section, section2)).toBeLessThan(0);
  expect(CourseSection.compareByLabel(section2, section)).toBeGreaterThan(0);
  expect(CourseSection.compareByLabel(section, section)).toBe(0);
});
