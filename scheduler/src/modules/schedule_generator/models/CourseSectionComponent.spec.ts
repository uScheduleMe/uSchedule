import { expect } from 'chai';
import Course from './Course';
import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseData, CourseSectionComponentData, CourseSectionData } from './types';

const course_data: CourseData = {
  id: 123456789,
  school: 'school',
  term: {
    year: 2020,
    season: 'winter',
  },
};

const section_data: CourseSectionData = { id: 'A' };

const component_data_1: CourseSectionComponentData = {
  id: 'A00-LEC-0',
  type: 'LEC',
  is_closed: true,
  day: 'SU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:00',
  end_time: '09:30',
};

const component_data_2: CourseSectionComponentData = {
  ...component_data_1,
  is_closed: false,
};

function getSupportingObjects() {
  const course = new Course(course_data);
  const section = new CourseSection(course, section_data);
  course.addSection(section);
  return { course, section };
}

describe('Validate CourseSectionComponent model', () => {
  describe('.constructor()', () => {
    it('should import the component data', () => {
      const { section } = getSupportingObjects();
      const component = new CourseSectionComponent(section, component_data_1);

      expect(component.section).to.equal(section);
      expect(component.id).to.equal(component_data_1.id);
      expect(component.type).to.equal(component_data_1.type);
      expect(component.is_closed).to.equal(component_data_1.is_closed);
      expect(component.day).to.equal(component_data_1.day);
      expect(component.start_date).to.equal(component_data_1.start_date);
      expect(component.end_date).to.equal(component_data_1.end_date);
      expect(component.start_time).to.equal(component_data_1.start_time);
      expect(component.end_time).to.equal(component_data_1.end_time);
    });
  });

  describe('.course getter', () => {
    it('should return the course object', () => {
      const { section, course } = getSupportingObjects();
      const component = new CourseSectionComponent(section, component_data_1);

      expect(component.course).to.equal(course);
    });
  });

  describe('.guid getter', () => {
    it('should return the guid in the correct format', () => {
      const { section } = getSupportingObjects();
      const component = new CourseSectionComponent(section, component_data_1);

      const expected = `${course_data.id}-${section_data.id}-${component_data_1.id}`;
      expect(component.guid).to.equal(expected);
    });
  });

  describe('.is_closed getter', () => {
    it('should return `true` when the component status is `CLOSED`', () => {
      const { section } = getSupportingObjects();
      const component = new CourseSectionComponent(section, component_data_1);

      expect(component.is_closed).to.be.true;
    });

    it('should return `false` when the component status is `OPEN`', () => {
      const { section } = getSupportingObjects();
      const component = new CourseSectionComponent(section, component_data_2);

      expect(component.is_closed).to.be.false;
    });
  });
});
