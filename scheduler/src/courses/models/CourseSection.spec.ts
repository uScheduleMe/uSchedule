import { expect } from 'chai';
import CourseSection from './CourseSection';
import Course from './Course';
import { CourseData, CourseSectionData } from '@services/DataAccess';

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
  components: {
    'A01-LAB': {
      id: 'A01-LAB',
      day: 'MO',
      room: '800 King Edward (STE) 2060',
      type: 'LAB',
      label: 'A01-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '09:50',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '08:30',
      description: '',
      session_type: 'FullSess',
    },
    'A02-LAB': {
      id: 'A02-LAB',
      day: 'MO',
      room: '800 King Edward (STE) 2052',
      type: 'LAB',
      label: 'A02-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '09:50',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '08:30',
      description: '',
      session_type: 'FullSess',
    },
    'A03-LAB': {
      id: 'A03-LAB',
      day: 'MO',
      room: '800 King Edward (STE) 0131',
      type: 'LAB',
      label: 'A03-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '09:50',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '08:30',
      description: '',
      session_type: 'FullSess',
    },
    'A04-LAB': {
      id: 'A04-LAB',
      day: 'TH',
      room: '161 Louis Pasteur (CBY) B02',
      type: 'LAB',
      label: 'A04-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '11:20',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '10:00',
      description: '',
      session_type: 'FullSess',
    },
    'A05-LAB': {
      id: 'A05-LAB',
      day: 'TH',
      room: '800 King Edward (STE) 2060',
      type: 'LAB',
      label: 'A05-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '11:20',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '10:00',
      description: '',
      session_type: 'FullSess',
    },
    'A06-TUT': {
      id: 'A06-TUT',
      day: 'TH',
      room: '100 Louis Pasteur (CRX) C240',
      type: 'TUT',
      label: 'A06-TUT',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '17:20',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '16:00',
      description: '',
      session_type: 'FullSess',
    },
    'A07-LAB': {
      id: 'A07-LAB',
      day: 'TH',
      room: '161 Louis Pasteur (CBY) B02',
      type: 'LAB',
      label: 'A07-LAB',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '12:50',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '11:30',
      description: '',
      session_type: 'FullSess',
    },
    'A00-LEC-0': {
      id: 'A00-LEC-0',
      day: 'TU',
      room: '100 Louis Pasteur (CRX) C140',
      type: 'LEC',
      label: 'A00-LEC',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '17:20',
      instructor: 'Jochen Lang',
      start_date: '2020-01-06',
      start_time: '16:00',
      description: '',
      session_type: 'FullSess',
    },
    'A00-LEC-1': {
      id: 'A00-LEC-1',
      day: 'TH',
      room: '100 Louis Pasteur (CRX) C140',
      type: 'LEC',
      label: 'A00-LEC',
      status: 'OPEN',
      end_date: '2020-04-04',
      end_time: '15:50',
      instructor: 'Staff',
      start_date: '2020-01-06',
      start_time: '14:30',
      description: '',
      session_type: 'FullSess',
    },
  },
  instructor: 'Jochen Lang',
  description: '',
};

const course_section: CourseSection = new CourseSection(course, section_data);
const course_section_plain = course_section.toJSON();

describe('CourseSection Model Testing', () => {
  describe('Validate CourseSection.constructor()', () => {
    it('should have an "id" property with a string value of "A"', () => {
      expect(course_section).to.have.own.property('id').that.is.a('string').which.equals('A');
    });

    it('should have a "course" property that is not null', () => {
      expect(course_section).to.have.own.property('course').that.is.not.null;
    });

    it('should have a "label" property with a string value of "A"', () => {
      expect(course_section).to.have.own.property('label').that.is.a('string').which.equals('A');
    });

    it('should have an "instructor" property with a string value of "Jochen Lang"', () => {
      expect(course_section)
        .to.have.own.property('instructor')
        .that.is.a('string')
        .which.equals('Jochen Lang');
    });

    it('should have a "description" property with an empty string value', () => {
      expect(course_section)
        .to.have.own.property('description')
        .that.is.a('string')
        .which.equals('');
    });

    it('should have a "components_by_type" property that has a size of 3 with keys "LAB", "LEC", "TUT"', () => {
      const expected = 3;
      expect(course_section)
        .to.have.own.property('components_by_type')
        .that.is.a('map')
        .with.lengthOf(expected)
        .and.has.all.keys('LAB', 'LEC', 'TUT');
    });

    it('should have a "components" property that has a size of 9 with keys for the lectures, labs and tutorial', () => {
      const expected = 9;
      expect(course_section)
        .to.have.own.property('components')
        .that.is.a('map')
        .with.lengthOf(expected)
        .and.has.all.keys(
          'A00-LEC-0',
          'A00-LEC-1',
          'A01-LAB',
          'A02-LAB',
          'A03-LAB',
          'A04-LAB',
          'A05-LAB',
          'A06-TUT',
          'A07-LAB',
        );
    });
  });

  describe('Validate CourseSection.toJSON()', () => {
    it('should have a specific set of properties', () => {
      expect(course_section_plain).to.have.all.keys(
        'course_id',
        'id',
        'label',
        'instructor',
        'description',
        'num_components',
        'components',
      );
    });

    it('should have a "course_id" property with a string value of "3"', () => {
      expect(course_section_plain)
        .to.have.own.property('course_id')
        .that.is.a('number')
        .which.equals(3);
    });

    it('should have an "id" property with a string value of "A"', () => {
      expect(course_section_plain).to.have.own.property('id').that.is.a('string').which.equals('A');
    });

    it('should have a "label" property with a string value of "A"', () => {
      expect(course_section_plain)
        .to.have.own.property('label')
        .that.is.a('string')
        .which.equals('A');
    });

    it('should have an "instructor" property with a string value of "Jochen Lang"', () => {
      expect(course_section_plain)
        .to.have.own.property('instructor')
        .that.is.a('string')
        .which.equals('Jochen Lang');
    });

    it('should have a "description" property with an empty string value', () => {
      expect(course_section_plain)
        .to.have.own.property('description')
        .that.is.a('string')
        .which.equals('');
    });

    it('should have a "num_components" property with a number value of 9', () => {
      const expected = 9;
      expect(course_section_plain)
        .to.have.own.property('num_components')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have a "components" property with keys for each component', () => {
      expect(course_section_plain)
        .to.have.own.property('components')
        .which.has.all.keys(
          'A00-LEC-0',
          'A00-LEC-1',
          'A01-LAB',
          'A02-LAB',
          'A03-LAB',
          'A04-LAB',
          'A05-LAB',
          'A06-TUT',
          'A07-LAB',
        );
    });

    it('should not have a "components_by_type" property', () => {
      expect(course_section_plain).to.not.have.own.property('components_by_type');
    });
  });

  describe('Validate CourseSection.removeComponent( component: CourseSectionComponent )', () => {
    it('should have a "components" property with a size of 8 which does not contain the key "A07-LAB"', () => {
      // Create a new, local, course_section so as to not interfere with the other tests
      const course_section_2: CourseSection = new CourseSection(course, section_data);
      const component = course_section_2.components.get('A07-LAB');
      if (component) {
        course_section_2.removeComponent(component);
      }

      const expected = 8;
      expect(course_section_2)
        .to.have.own.property('components')
        .with.lengthOf(expected)
        .and.not.does.have.any.keys('A07-LAB');
    });
  });

  describe('Validate CourseSection.filterComponents()', () => {
    let course_section_3: CourseSection;

    before(() => {
      // Create a new, local, course_section so as to not interfere with the other tests
      course_section_3 = new CourseSection(course, section_data);
      course_section_3.filterComponents(['A00-LEC-0', 'A00-LEC-1', 'A01-LAB', 'A06-TUT']);
    });

    it('should have only the filtered components', () => {
      const expected = 4;
      expect(course_section_3.components.size).to.equal(expected);
      expect(course_section_3.components.get('A00-LEC-0')).to.not.be.undefined;
      expect(course_section_3.components.get('A00-LEC-1')).to.not.be.undefined;
      expect(course_section_3.components.get('A01-LAB')).to.not.be.undefined;
      expect(course_section_3.components.get('A06-TUT')).to.not.be.undefined;
      expect(course_section_3.components.get('A02-LAB')).to.be.undefined;
    });

    it('should have no components', () => {
      course_section_3.filterComponents([]);
      expect(course_section_3.components.size).to.equal(0);
      expect(course_section_3.components.get('A00-LEC-0')).to.be.undefined;
    });
  });
});
