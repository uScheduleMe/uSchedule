import { expect } from 'chai';
import CourseSection from './CourseSection';
import Course from './Course';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseData, CourseSectionComponentData, CourseSectionData } from '@services/DataAccess';

const course_data: CourseData = {
  id: 3,
  sections: {},
  school: 'uottawa',
  year: 2020,
  term: 'winter',
  subject_code: 'CSI',
  course_code: '2120',
  course_name: 'Programming Paradigms',
};

const course: Course = new Course(course_data);

const section_data: CourseSectionData = {
  id: 'A',
  label: 'A',
  components: {},
  instructor: 'Jochen Lang',
  description: '',
};

const course_section: CourseSection = new CourseSection(course, section_data);

const component_data: CourseSectionComponentData = {
  id: 'A00-LEC-1',
  day: 'TH',
  room: '100 Louis Pasteur (CRX) C140',
  type: 'LEC',
  label: 'A00-LEC',
  status: 'OPEN',
  end_date: '2020-04-04',
  end_time: '15:50',
  instructor: 'Jochen Lang',
  start_date: '2020-01-06',
  start_time: '14:30',
  description: '',
  session_type: 'FullSess',
};

const component: CourseSectionComponent = new CourseSectionComponent(
  course_section,
  component_data,
);
const component_plain = component.toJSON();

describe('CourseSectionComponent', () => {
  describe('Validate CourseSectionComponent.constructor()', () => {
    it('should have an "id" property with a string value of "A00-LEC-1"', () => {
      expect(component).to.have.own.property('id').that.is.a('string').which.equals('A00-LEC-1');
    });

    it('should have a "course" property that is not null', () => {
      expect(component).to.have.own.property('course').that.is.not.null;
    });

    it('should have a "section" property that is not null', () => {
      expect(component).to.have.own.property('section').that.is.not.null;
    });

    it('should have a "label" property with a string value of "A00-LEC"', () => {
      expect(component).to.have.own.property('label').that.is.a('string').which.equals('A00-LEC');
    });

    it('should have a "status" property with a string value of "OPEN"', () => {
      expect(component).to.have.own.property('status').that.is.a('string').which.equals('OPEN');
    });

    it('should have a "type" property with a string value of "LEC"', () => {
      expect(component).to.have.own.property('type').that.is.a('string').which.equals('LEC');
    });

    it('should have a "start_time" property with a string value of "14:30"', () => {
      expect(component)
        .to.have.own.property('start_time')
        .that.is.a('string')
        .which.equals('14:30');
    });

    it('should have a "start_time_12hr" property with a string value of "2:30 pm"', () => {
      expect(component)
        .to.have.own.property('start_time_12hr')
        .that.is.a('string')
        .which.equals('2:30 pm');
    });

    it('should have an "end_time" property with a string value of "15:50"', () => {
      expect(component).to.have.own.property('end_time').that.is.a('string').which.equals('15:50');
    });

    it('should have an "end_time_12hr" property with a string value of "3:50 pm"', () => {
      expect(component)
        .to.have.own.property('end_time_12hr')
        .that.is.a('string')
        .which.equals('3:50 pm');
    });

    it('should have a "start_timestamp" property with a number value of 52200', () => {
      const expected = 52200;
      expect(component)
        .to.have.own.property('start_timestamp')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have an "end_timestamp" property with a number value of 57000', () => {
      const expected = 57000;
      expect(component)
        .to.have.own.property('end_timestamp')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have a "start_date" property with a string value of "2020-01-06"', () => {
      expect(component)
        .to.have.own.property('start_date')
        .that.is.a('string')
        .which.equals('2020-01-06');
    });

    it('should have an "end_date" property with a string value of "2020-04-04"', () => {
      expect(component)
        .to.have.own.property('end_date')
        .that.is.a('string')
        .which.equals('2020-04-04');
    });

    it('should have a "room" property with a string value of "100 Louis Pasteur (CRX) C140"', () => {
      expect(component)
        .to.have.own.property('room')
        .that.is.a('string')
        .which.equals('100 Louis Pasteur (CRX) C140');
    });

    it('should have an "instructor" property with a string value of "Jochen Lang"', () => {
      expect(component)
        .to.have.own.property('instructor')
        .that.is.a('string')
        .which.equals('Jochen Lang');
    });

    it('should have a "session_type" property with a string value of "FullSess"', () => {
      expect(component)
        .to.have.own.property('session_type')
        .that.is.a('string')
        .which.equals('FullSess');
    });

    it('should have a "description" property with an empty string value', () => {
      expect(component).to.have.own.property('description').that.is.a('string').which.equals('');
    });

    it('should have an "is_valid" property that is null', () => {
      expect(component).to.have.own.property('is_valid').that.is.null;
    });
  });

  describe('Validate CourseSectionComponent.toJSON()', () => {
    it('should have a specific set of properties', () => {
      expect(component_plain).to.have.all.keys(
        'course_id',
        'section_id',
        'id',
        'guid',
        'label',
        'status',
        'type',
        'day',
        'start_timestamp',
        'start_time',
        'start_time_12hr',
        'end_timestamp',
        'end_time',
        'end_time_12hr',
        'start_date',
        'end_date',
        'room',
        'instructor',
        'session_type',
        'description',
      );
    });

    it('should have a "course_id" property with a string value of "3"', () => {
      expect(component_plain).to.have.own.property('course_id').that.is.a('number').which.equals(3);
    });

    it('should have a "section_id" property with a string value of "A"', () => {
      expect(component_plain)
        .to.have.own.property('section_id')
        .that.is.a('string')
        .which.equals('A');
    });

    it('should have an "id" property with a string value of "A00-LEC-1"', () => {
      expect(component_plain)
        .to.have.own.property('id')
        .that.is.a('string')
        .which.equals('A00-LEC-1');
    });

    it('should have a "guid" property with a string value of "3-A-A00-LEC-1"', () => {
      expect(component_plain)
        .to.have.own.property('guid')
        .that.is.a('string')
        .which.equals('3-A-A00-LEC-1');
    });

    it('should have a "label" property with a string value of "A00-LEC"', () => {
      expect(component_plain)
        .to.have.own.property('label')
        .that.is.a('string')
        .which.equals('A00-LEC');
    });

    it('should have a "status" property with a string value of "OPEN"', () => {
      expect(component_plain)
        .to.have.own.property('status')
        .that.is.a('string')
        .which.equals('OPEN');
    });

    it('should have a "type" property with a string value of "LEC"', () => {
      expect(component_plain).to.have.own.property('type').that.is.a('string').which.equals('LEC');
    });

    it('should have a "start_time" property with a string value of "14:30"', () => {
      expect(component_plain)
        .to.have.own.property('start_time')
        .that.is.a('string')
        .which.equals('14:30');
    });

    it('should have a "start_time_12hr" property with a string value of "2:30 pm"', () => {
      expect(component_plain)
        .to.have.own.property('start_time_12hr')
        .that.is.a('string')
        .which.equals('2:30 pm');
    });

    it('should have an "end_time" property with a string value of "15:50"', () => {
      expect(component_plain)
        .to.have.own.property('end_time')
        .that.is.a('string')
        .which.equals('15:50');
    });

    it('should have an "end_time_12hr" property with a string value of "3:50 pm"', () => {
      expect(component_plain)
        .to.have.own.property('end_time_12hr')
        .that.is.a('string')
        .which.equals('3:50 pm');
    });

    it('should have a "start_timestamp" property with a number value of 52200', () => {
      const expected = 52200;
      expect(component_plain)
        .to.have.own.property('start_timestamp')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have an "end_timestamp" property with a number value of 57000', () => {
      const expected = 57000;
      expect(component_plain)
        .to.have.own.property('end_timestamp')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have a "start_date" property with a string value of "2020-01-06"', () => {
      expect(component_plain)
        .to.have.own.property('start_date')
        .that.is.a('string')
        .which.equals('2020-01-06');
    });

    it('should have an "end_date" property with a string value of "2020-04-04"', () => {
      expect(component_plain)
        .to.have.own.property('end_date')
        .that.is.a('string')
        .which.equals('2020-04-04');
    });

    it('should have a "room" property with a string value of "100 Louis Pasteur (CRX) C140"', () => {
      expect(component_plain)
        .to.have.own.property('room')
        .that.is.a('string')
        .which.equals('100 Louis Pasteur (CRX) C140');
    });

    it('should have an "instructor" property with a string value of "Jochen Lang"', () => {
      expect(component_plain)
        .to.have.own.property('instructor')
        .that.is.a('string')
        .which.equals('Jochen Lang');
    });

    it('should have a "session_type" property with a string value of "FullSess"', () => {
      expect(component_plain)
        .to.have.own.property('session_type')
        .that.is.a('string')
        .which.equals('FullSess');
    });

    it('should have a "description" property with an empty string value', () => {
      expect(component_plain)
        .to.have.own.property('description')
        .that.is.a('string')
        .which.equals('');
    });

    it('should not have an "is_valid" property', () => {
      expect(component_plain).to.not.have.own.property('is_valid');
    });
  });

  describe('Validate CourseSectionComponent.validate()', () => {
    it('should return true for a valid component', () => {
      expect(component.validate()).to.be.true;
    });

    it('should return false for an invalid component', () => {
      const component_invalid: CourseSectionComponent = new CourseSectionComponent(
        course_section,
        component_data,
      );
      component_invalid.day = 'NA';

      expect(component_invalid.validate()).to.be.false;
    });
  });
});
