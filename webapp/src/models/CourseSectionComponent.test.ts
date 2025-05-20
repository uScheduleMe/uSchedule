import { COURSE, SECTION, COMPONENTS } from '@models/__test__/Course.TestData';
import { CourseSectionComponent } from './CourseSectionComponent';

describe('Validate CourseSectionComponent.constructor()', () => {
  it('should import data properly', () => {
    const component = COMPONENTS.E00_LEC_0;
    expect(component).toHaveProperty('id', 'E00-LEC-0');
    expect(component).toHaveProperty('guid', '2021winter1562EE00-LEC-0');
    expect(component).toHaveProperty('course', COURSE);
    expect(component).toHaveProperty('section', SECTION);
    expect(component).toHaveProperty('label', 'E00-LEC');
    expect(component).toHaveProperty('status', 'open');
    expect(component).toHaveProperty('type', 'LEC');
    expect(component).toHaveProperty('day', 'MO');
    expect(component).toHaveProperty('day_idx', 1);
    expect(component).toHaveProperty('start_time', '13:00');
    expect(component).toHaveProperty('start_time_12hr', '1:00 pm');
    expect(component).toHaveProperty('end_time', '14:20');
    expect(component).toHaveProperty('end_time_12hr', '2:20 pm');
    const START_TIMESTAMP = 46800;
    expect(component).toHaveProperty('start_timestamp', START_TIMESTAMP);
    const END_TIMESTAMP = 51600;
    expect(component).toHaveProperty('end_timestamp', END_TIMESTAMP);
    expect(component).toHaveProperty('start_date', '2021-01-11');
    expect(component).toHaveProperty('end_date', '2021-04-14');
    expect(component).toHaveProperty('room', 'Online');
    expect(component).toHaveProperty('instructor', 'Mohamad Hoda');
    expect(component).toHaveProperty('session_type', 'FULLSESS');
    expect(component).toHaveProperty('description', 'Component Description');
  });
});

describe('Validate CourseSectionComponent.getDayIdx()', () => {
  const component = COMPONENTS.E01_LAB;
  const component2 = COMPONENTS.E05_LAB;
  const component3 = COMPONENTS.E00_LEC_0;
  const alternates = component.getAlternates();
  const NUM_ALTERNATES = 2;
  expect(alternates.length).toBe(NUM_ALTERNATES);
  expect(alternates).toEqual(expect.arrayContaining([component]));
  expect(alternates).toEqual(expect.arrayContaining([component2]));
  expect(alternates).not.toEqual(expect.arrayContaining([component3]));
});

describe('Validate CourseSectionComponent.isNotOpen()', () => {
  const component = COMPONENTS.E01_LAB;
  expect(component.isNotOpen()).toBe(true);
});

describe('Validate CourseSectionComponent.compareByLabel()', () => {
  const component = COMPONENTS.E01_LAB;
  const component2 = COMPONENTS.E05_LAB;
  expect(CourseSectionComponent.compareByLabel(component, component2)).toBeLessThan(0);
  expect(CourseSectionComponent.compareByLabel(component2, component)).toBeGreaterThan(0);
  expect(CourseSectionComponent.compareByLabel(component, component)).toBe(0);
});

describe('Validate CourseSectionComponent.compareByCourseAndLabel()', () => {
  const component = COMPONENTS.A00_LEC_0;
  const component2 = COMPONENTS.E01_LAB;
  expect(CourseSectionComponent.compareByCourseAndLabel(component, component2)).toBeLessThan(0);
  expect(CourseSectionComponent.compareByCourseAndLabel(component2, component)).toBeGreaterThan(0);
  expect(CourseSectionComponent.compareByCourseAndLabel(component, component)).toBe(0);
});
