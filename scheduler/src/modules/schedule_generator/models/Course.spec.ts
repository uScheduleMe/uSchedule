import { expect } from 'chai';
import { CourseSkeleton } from '../schemas';
import Course from './Course';
import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseData, CourseMeta, CourseSectionData } from './types';

const course_data: CourseData = {
  id: 123456789,
  school: 'school',
  term: {
    year: 2020,
    season: 'winter',
  },
};

const a = { id: 'A' } as CourseSection;
const b = { id: 'B' } as CourseSection;
const c = { id: 'C' } as CourseSection;

const course_meta: CourseMeta = {
  sections_to_include: [a.id],
  is_mandatory: false,
};

const section_d_data: CourseSectionData = { id: 'D' };
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
  start_time: '03:00',
} as CourseSectionComponent;
const tut6 = {
  ...base_component,
  id: 'D06-TUT',
  type: 'TUT',
  start_time: '04:00',
} as CourseSectionComponent;
const section_d_components = [lec0, lec1, lab1, lab2, lab3, tut6];

describe('Validate Course model', () => {
  describe('.constructor()', () => {
    it('should import the course data', () => {
      const course = new Course(course_data);
      expect(course.id).to.equal(course_data.id);
      expect(course.school).to.equal(course_data.school);
      expect(course.term).to.eql(course_data.term);
    });

    it('should import the given sections', () => {
      const course = new Course(course_data, [a, b]);
      expect(course.sections).to.include(a);
      expect(course.sections).to.include(b);
    });

    it('should set the correct default values for the course meta', () => {
      const course = new Course(course_data, [a, b]);
      expect(course.is_mandatory).to.be.true;
      expect(course.sections).to.include(a);
      expect(course.sections).to.include(b);
    });

    it('should import and apply the course meta', () => {
      const course = new Course(course_data, [a, b], course_meta);
      expect(course.is_mandatory).to.equal(course_meta.is_mandatory);
      expect(course.sections).to.include(a);
      expect(course.sections).to.not.include(b);
    });
  });

  describe('.addSection()', () => {
    it('should add a section to the Course', () => {
      const course = new Course(course_data);
      expect(course.sections).to.not.contain(a);
      course.addSection(a);
      expect(course.sections).to.contain(a);
    });
  });

  describe('.removeSection()', () => {
    it('should remove a section from the Course', () => {
      const course = new Course(course_data, [a]);
      expect(course.sections).to.contain(a);
      course.removeSection(a);
      expect(course.sections).to.not.contain(a);
    });
  });

  describe('.filterSections()', () => {
    it('should not contain any sections not in list of ids', () => {
      const course = new Course(course_data, [a, b, c]);
      course.filterSections([b.id]);
      expect(course.sections).to.not.contain(a);
      expect(course.sections).to.contain(b);
      expect(course.sections).to.not.contain(c);
    });
  });

  describe('.filterContent()', () => {
    const course: Course = new Course(course_data, [a, b, c]);
    let course_skeleton: CourseSkeleton;

    before(() => {
      course_skeleton = {
        id: course_data.id,
        sections: { D: [lec0.id, lec1.id, lab1.id, tut6.id] },
      };
      const d = new CourseSection(course, { id: 'D' }, section_d_components);
      course.addSection(d);
      course.filterContent(course_skeleton);
    });

    it('Should only have section D', () => {
      expect(course.sections).to.have.length(1);
      expect(course.sections.get('D')).to.not.be.undefined;
    });

    it('Should have the correct components in section D', () => {
      const course_section = course.sections.get('D');
      const expected = course_skeleton.sections.D.length;
      expect(course_section?.components).to.have.length(expected);
      expect(course_section?.components.get(lec0.id)).to.equal(lec0);
      expect(course_section?.components.get(lec1.id)).to.equal(lec1);
      expect(course_section?.components.get(lab1.id)).to.equal(lab1);
      expect(course_section?.components.get(tut6.id)).to.equal(tut6);
      expect(course_section?.components.get(lab3.id)).to.be.undefined;
    });
  });

  describe('.getConfigurationCount()', () => {
    it('should contain a single configuration when there are no other options', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1, lab1, tut6]);
      course.addSection(section);

      expect(course.getConfigurationCount()).to.equal(1);
    });

    it('should contain the correct configuration count when there are other options', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1, lab1, lab3, tut6]);
      course.addSection(section);

      expect(course.getConfigurationCount()).to.equal(2);
    });
  });

  describe('.getConfigurations()', () => {
    it('should return the same array when called twice in a row', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1, lab1, tut6]);
      course.addSection(section);

      const call_1 = course.getConfigurations();
      const call_2 = course.getConfigurations();
      expect(call_1).to.equal(call_2);
    });

    it('should add the lectures to all configurations', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1, lab1, lab3, tut6]);
      course.addSection(section);

      const configurations = course.getConfigurations();

      for (const config of configurations) {
        expect(config.map((sc) => sc.type)).to.include('LEC');
      }
    });

    it('should return the correct configurations when the course has only lecture components', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1]);
      course.addSection(section);

      const configurations = course.getConfigurations();

      expect(configurations.length).to.equal(1);
      expect(configurations[0].length).to.equal(2);
      expect(configurations[0].map((sc) => sc.type)).to.have.members(['LEC', 'LEC']);
    });

    it('should return the correct configurations when the course has only 1 non-lecture component', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lec0, lec1, lab1]);
      course.addSection(section);

      const configurations = course.getConfigurations();

      expect(configurations.length).to.equal(1);
      expect(configurations[0].length).to.equal(3);
      expect(configurations[0].map((sc) => sc.type)).to.include.members(['LAB', 'LEC']);
    });

    it('should return the correct configurations when the course has no lecture components', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lab1, tut6]);
      course.addSection(section);

      const configurations = course.getConfigurations();

      expect(configurations.length).to.equal(1);
      expect(configurations[0].length).to.equal(2);
      expect(configurations[0].map((sc) => sc.type)).to.include.members(['LAB', 'TUT']);
    });

    it('should return the correct configurations when the course has only one non-lecture component', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data, [lab1]);
      course.addSection(section);

      const configurations = course.getConfigurations();

      expect(configurations.length).to.equal(1);
      expect(configurations[0].length).to.equal(1);
      expect(configurations[0].map((sc) => sc.type)).to.have.members(['LAB']);
    });

    it('should return no configurations when the section has no components', () => {
      const course: Course = new Course(course_data);
      const section = new CourseSection(course, section_d_data);
      course.addSection(section);

      const configurations = course.getConfigurations();

      expect(configurations.length).to.equal(0);
    });
  });

  describe('.compareByConfigurationCount()', () => {
    it('should be 0 when the configuration count is the same', () => {
      const course_a: Course = new Course(course_data);
      const section_1 = new CourseSection(course_a, section_d_data, [lec0, lec1, lab1, tut6]);
      course_a.addSection(section_1);

      const course_b: Course = new Course(course_data);
      const section_2 = new CourseSection(course_b, section_d_data, [lec0, lec1, lab1, tut6]);
      course_b.addSection(section_2);

      const actual = Course.compareByConfigurationCount(course_a, course_b);
      expect(actual).to.equal(0);
    });

    it('should be negative when the configuration count of course a is less than course b', () => {
      const course_a: Course = new Course(course_data);
      const section_1 = new CourseSection(course_a, section_d_data, [lec0, lec1, lab1, tut6]);
      course_a.addSection(section_1);

      const course_b: Course = new Course(course_data);
      const section_2 = new CourseSection(course_b, section_d_data, [lec0, lec1, lab1, lab3, tut6]);
      course_b.addSection(section_2);

      const actual = Course.compareByConfigurationCount(course_a, course_b);
      expect(actual).to.be.lessThan(0);
    });

    it('should be positive when the configuration count of course a is greater than course b', () => {
      const course_a: Course = new Course(course_data);
      const section_1 = new CourseSection(course_a, section_d_data, [lec0, lec1, lab1, lab3, tut6]);
      course_a.addSection(section_1);

      const course_b: Course = new Course(course_data);
      const section_2 = new CourseSection(course_b, section_d_data, [lec0, lec1, lab1, tut6]);
      course_b.addSection(section_2);

      const actual = Course.compareByConfigurationCount(course_a, course_b);
      expect(actual).to.be.greaterThan(0);
    });
  });
});
