import { expect } from 'chai';
import Course from './Course';
import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import ScheduleComponent from './ScheduleComponent';
import { CourseData, CourseSectionComponentData, CourseSectionData } from './types';

const course_data: CourseData = {
  id: 123456789,
  school: 'school',
  term: {
    year: 2020,
    season: 'winter',
  },
};

const section_data_a: CourseSectionData = { id: 'A' };
const section_data_b: CourseSectionData = { id: 'B' };

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

const component_data_3: CourseSectionComponentData = {
  ...component_data_1,
  day: 'TU',
};

function getSupportingObjects(component_data: CourseSectionComponentData) {
  const course = new Course(course_data);
  const section = new CourseSection(course, section_data_a);
  course.addSection(section);
  const component = new CourseSectionComponent(section, component_data);
  section.addComponent(component);
  return { course, section, component };
}

function getScheduleComponent() {
  const { component, course, section } = getSupportingObjects(component_data_1);
  const schedule_component = new ScheduleComponent(component);
  return { schedule_component, component, course, section };
}

describe('Validate ScheduleComponent model', () => {
  describe('.constructor()', () => {
    it('should import the component', () => {
      const { schedule_component, component } = getScheduleComponent();

      expect(schedule_component.components).to.include(component);
    });

    it('should set the timestamps properly', () => {
      const { schedule_component } = getScheduleComponent();

      const eight_oclock_in_seconds = 28800;
      const nine_thirty_in_seconds = 34200;
      expect(schedule_component.start_timestamp).to.equal(eight_oclock_in_seconds);
      expect(schedule_component.end_timestamp).to.equal(nine_thirty_in_seconds);
    });
  });

  describe('.addCourseComponent()', () => {
    it('should add a component to the list', () => {
      const { schedule_component, section } = getScheduleComponent();
      const component_2 = new CourseSectionComponent(section, component_data_2);
      schedule_component.addCourseComponent(component_2);

      expect(schedule_component.components).to.have.length(2);
      expect(schedule_component.components).to.include(component_2);
    });

    it('should throw an error if the component does not have the same schedule_component_id', () => {
      const { schedule_component, section } = getScheduleComponent();
      const component_3 = new CourseSectionComponent(section, component_data_3);
      section.addComponent(component_3);

      expect(() => schedule_component.addCourseComponent(component_3)).to.throw('invalid');
    });

    it('should throw an error if the component does not have the same course', () => {
      const { schedule_component } = getScheduleComponent();
      const { component } = getSupportingObjects(component_data_2);

      expect(() => schedule_component.addCourseComponent(component)).to.throw('invalid');
    });

    it('should throw an error if the component does not have the same section', () => {
      const { schedule_component, course } = getScheduleComponent();
      const section = new CourseSection(course, section_data_b);
      course.addSection(section);
      const component_2 = new CourseSectionComponent(section, component_data_2);

      expect(() => schedule_component.addCourseComponent(component_2)).to.throw('invalid');
    });
  });

  describe('.all_are_closed getter', () => {
    it('should return true with only component 1', () => {
      const { schedule_component } = getScheduleComponent();

      expect(schedule_component.all_are_closed).to.be.true;
    });

    it('should return false with both component 1 and 2', () => {
      const { schedule_component, section } = getScheduleComponent();
      const component_2 = new CourseSectionComponent(section, component_data_2);
      schedule_component.addCourseComponent(component_2);

      expect(schedule_component.all_are_closed).to.be.false;
    });
  });

  describe('.type getter', () => {
    it('should return the correct type', () => {
      const { schedule_component } = getScheduleComponent();

      expect(schedule_component.type).to.equal(component_data_1.type);
    });
  });

  describe('.day_of_week getter', () => {
    it('should return the correct day of the week', () => {
      const { schedule_component } = getScheduleComponent();

      expect(schedule_component.day_of_week).to.equal(component_data_1.day);
    });
  });

  describe('.term getter', () => {
    it('should return the correct term', () => {
      const { schedule_component } = getScheduleComponent();

      expect(schedule_component.term).to.deep.equal({ ...course_data.term });
    });
  });

  describe('.getScheduleComponentId', () => {
    it('should return the schedule component id in the correct format', () => {
      const { component, section } = getSupportingObjects(component_data_1);

      const actual = ScheduleComponent.getScheduleComponentId(
        new CourseSectionComponent(section, component),
      );

      const expected = `${component.type}${component.start_time}${component.day}${component.end_time}`;
      expect(actual).to.equal(expected);
    });
  });
});
