import { expect } from 'chai';
import Course from './Course';
import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseData, CourseSectionData } from './types';

const course_data: CourseData = {
  id: 123456789,
  school: 'school',
  term: {
    year: 2020,
    season: 'winter',
  },
};

const section_data: CourseSectionData = { id: 'D' };
const base_component = {
  start_time: '00:00',
  end_time: '00:00',
  day: 'MO',
} as CourseSectionComponent;
// Note: Using the start time to uniquely identify groups of components
const lec0 = {
  ...base_component,
  id: 'D00-LEC-0',
  type: 'LEC',
} as CourseSectionComponent;
const lec1 = {
  ...base_component,
  id: 'D00-LEC-1',
  type: 'LEC',
  start_time: '01:00',
} as CourseSectionComponent;
const lab1 = {
  ...base_component,
  id: 'D01-LAB',
  type: 'LAB',
  start_time: '02:00',
} as CourseSectionComponent;
const lab2 = {
  ...base_component,
  id: 'D02-LAB',
  type: 'LAB',
  start_time: '02:00',
} as CourseSectionComponent;
const lab3 = {
  ...base_component,
  id: 'D03-LAB',
  type: 'LAB',
  start_time: '02:00',
} as CourseSectionComponent;
const tut6 = {
  ...base_component,
  id: 'D06-TUT',
  type: 'TUT',
  start_time: '03:00',
} as CourseSectionComponent;
const components = [lec0, lec1, lab1, lab2, lab3, tut6];

describe('Validate CourseSection model', () => {
  let course: Course;

  before(() => {
    course = new Course(course_data);
  });

  describe('.constructor()', () => {
    let section: CourseSection;

    before(() => {
      course = new Course(course_data);
      section = new CourseSection(course, section_data, components);
    });

    it('should import the course', () => {
      expect(section.course).to.equal(course);
    });

    it('should import the section data', () => {
      expect(section.id).to.equal(section_data.id);
    });

    it('should import the components', () => {
      expect(section.components).to.have.length(components.length);
      expect(section.components).to.contain(lec0);
      expect(section.components).to.contain(lab2);
      expect(section.components).to.contain(tut6);
    });
  });

  describe('.addComponent()', () => {
    it('should add a component to the CourseSection', () => {
      const section = new CourseSection(course, section_data);
      expect(section.components).to.not.contain(lec0);
      section.addComponent(lec0);
      expect(section.components).to.contain(lec0);
    });
  });

  describe('.removeComponent()', () => {
    it('should remove a component from the CourseSection', () => {
      const section = new CourseSection(course, section_data, [lec0]);
      expect(section.components).to.contain(lec0);
      section.removeComponent(lec0);
      expect(section.components).to.not.contain(lec0);
    });
  });

  describe('.filterComponents()', () => {
    it('should not contain any components not in list of ids', () => {
      const section = new CourseSection(course, section_data, [lec0, lec1, lab1, tut6]);
      const include_ids = [lec0.id, lec1.id];
      section.filterComponents([lec0.id, lec1.id]);
      expect(section.components).to.have.length(include_ids.length);
      expect(section.components).to.contain(lec0);
      expect(section.components).to.contain(lec1);
      expect(section.components).to.not.contain(lab1);
      expect(section.components).to.not.contain(tut6);
    });
  });

  describe('.getScheduleComponents()', () => {
    let section: CourseSection;

    before(() => {
      section = new CourseSection(course, section_data, components);
    });

    it('should return the same Map object when called twice in a row', () => {
      const schedule_components_1 = section.getScheduleComponents();
      const schedule_components_2 = section.getScheduleComponents();
      expect(schedule_components_1).to.equal(schedule_components_2);
    });

    it('should contain the correct ScheduleComponent types', () => {
      const schedule_components = section.getScheduleComponents();
      expect(schedule_components).to.have.keys(['LEC', 'LAB', 'TUT']);
    });

    it('should contain the correct number of lecture ScheduleComponent entries', () => {
      const schedule_components = section.getScheduleComponents();
      expect(schedule_components.get('LEC')).to.have.length(2);
    });

    it('should contain the correct number of lab ScheduleComponent entries', () => {
      const schedule_components = section.getScheduleComponents();
      expect(schedule_components.get('LAB')).to.have.length(1);
    });

    it('should contain the correct number of tutorial ScheduleComponent entries', () => {
      const schedule_components = section.getScheduleComponents();
      expect(schedule_components.get('TUT')).to.have.length(1);
    });

    it('should contain the correct number of lab components in the lab ScheduleComponent entries', () => {
      const schedule_components = section.getScheduleComponents();
      expect(schedule_components.get('LAB')?.[0].components).to.have.length(3);
    });
  });
});
