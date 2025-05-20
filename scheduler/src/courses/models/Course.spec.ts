import { expect } from 'chai';
import { CourseFullSkeleton } from '@services/DataAccess';
import Course from './Course';
import { CSI_2120_DATA, ITI_1120_DATA } from '../__test__/course.data';

const CSI_2120 = new Course(CSI_2120_DATA);
const CSI_2120_PLAIN = CSI_2120.toJSON();

const course_skeleton_partial: CourseFullSkeleton = {
  id: 3,
  school: 'uottawa',
  year: 2020,
  term: 'winter',
  subject_code: 'CSI',
  course_code: '2120',
  sections: {
    A: ['A00-LEC-0', 'A00-LEC-1', 'A01-LAB', 'A06-TUT'],
  },
};

describe('Course Model Testing', () => {
  describe('Validate Course.constructor()', () => {
    it('Should have an "id" property with a number value of "3"', () => {
      const expected = 3;
      expect(CSI_2120).to.have.own.property('id').that.is.a('number').which.equals(expected);
    });

    it('Should have a "school" property with a string value of "uottawa"', () => {
      expect(CSI_2120).to.have.own.property('school').that.is.a('string').which.equals('uottawa');
    });

    it('Should have a "year" property with a number value of 2020', () => {
      const expected = 2020;
      expect(CSI_2120).to.have.own.property('year').that.is.a('number').which.equals(expected);
    });

    it('Should have a "season" property with a string value of "winter"', () => {
      expect(CSI_2120).to.have.own.property('season').that.is.a('string').which.equals('winter');
    });

    it('Should have a "subject_code" property with a string value of "CSI"', () => {
      expect(CSI_2120).to.have.own.property('subject_code').that.is.a('string').which.equals('CSI');
    });

    it('Should have a "course_code" property with a string value of "2120"', () => {
      expect(CSI_2120).to.have.own.property('course_code').that.is.a('string').which.equals('2120');
    });

    it('Should have a "course_name" property with a string value of "Programming Paradigms"', () => {
      expect(CSI_2120)
        .to.have.own.property('course_name')
        .that.is.a('string')
        .which.equals('Programming Paradigms');
    });

    it('Should have an "is_mandatory" property with a boolean value of true', () => {
      expect(CSI_2120).to.have.own.property('is_mandatory').that.is.a('boolean').which.is.true;
    });

    it('Should have a "sections" property that is a map with the key "A"', () => {
      expect(CSI_2120).to.have.own.property('sections').that.is.a('map').which.has.all.keys('A');
    });

    it('Should have a "combinations" property that is null', () => {
      expect(CSI_2120).to.have.own.property('combinations').with.is.null;
    });
  });

  describe('Validate Course.constructor() with CourseMeta', () => {
    const ITI_1120_NO_META = new Course(ITI_1120_DATA);
    const ITI_1120_EMPTY_META = new Course(ITI_1120_DATA, {});

    it('Should include all sections when no meta is added', () => {
      expect(ITI_1120_NO_META)
        .to.have.own.property('sections')
        .that.is.a('map')
        .which.has.all.keys(['A', 'B', 'C']);
    });

    it('Should include all sections when the sections part of the meta is undefined', () => {
      expect(ITI_1120_EMPTY_META)
        .to.have.own.property('sections')
        .that.is.a('map')
        .which.has.all.keys(['A', 'B', 'C']);
    });

    it('Should include no sections when the sections part of the meta has no items', () => {
      const ITI_1120 = new Course(ITI_1120_DATA, { sections: [] });
      expect(ITI_1120).to.have.own.property('sections').that.is.a('map').which.is.empty;
    });

    it('Should include only the requested sections when the sections meta has items', () => {
      const ITI_1120 = new Course(ITI_1120_DATA, { sections: ['A', 'C'] });
      expect(ITI_1120)
        .to.have.own.property('sections')
        .that.is.a('map')
        .which.has.all.keys(['A', 'C']);
    });

    it('Should have is_mandatory be true when no meta is provided', () => {
      expect(ITI_1120_NO_META).to.have.own.property('is_mandatory').that.is.true;
    });

    it('Should have is_mandatory be true when the is_mandatory part of the meta is undefined', () => {
      expect(ITI_1120_EMPTY_META).to.have.own.property('is_mandatory').that.is.true;
    });

    it('Should have is_mandatory match the is_mandatory part of the meta', () => {
      expect(new Course(ITI_1120_DATA, { is_mandatory: true })).to.have.own.property('is_mandatory')
        .that.is.true;
      expect(new Course(ITI_1120_DATA, { is_mandatory: false })).to.have.own.property(
        'is_mandatory',
      ).that.is.false;
    });
  });

  describe('Validate Course.toJSON()', () => {
    it('Should have a specific set of properties', () => {
      expect(CSI_2120_PLAIN).to.have.all.keys(
        'id',
        'school',
        'year',
        'term',
        'season',
        'subject_code',
        'course_code',
        'course_name',
        'sections',
      );
    });

    it('Should have an "id" property with a number value of "3"', () => {
      const expected = 3;
      expect(CSI_2120).to.have.own.property('id').that.is.a('number').which.equals(expected);
    });

    it('Should have a "school" property with a string value of "uottawa"', () => {
      expect(CSI_2120).to.have.own.property('school').that.is.a('string').which.equals('uottawa');
    });

    it('Should have a "year" property with a number value of 2020', () => {
      const expected = 2020;
      expect(CSI_2120).to.have.own.property('year').that.is.a('number').which.equals(expected);
    });

    it('Should have a "season" property with a string value of "winter"', () => {
      expect(CSI_2120).to.have.own.property('season').that.is.a('string').which.equals('winter');
    });

    it('Should have a "subject_code" property with a string value of "CSI"', () => {
      expect(CSI_2120).to.have.own.property('subject_code').that.is.a('string').which.equals('CSI');
    });

    it('Should have a "course_code" property with a string value of "2120"', () => {
      expect(CSI_2120).to.have.own.property('course_code').that.is.a('string').which.equals('2120');
    });

    it('Should have a "course_name" property with a string value of "Programming Paradigms"', () => {
      expect(CSI_2120)
        .to.have.own.property('course_name')
        .that.is.a('string')
        .which.equals('Programming Paradigms');
    });

    it('Should have a "sections" property with a property of "A"', () => {
      expect(CSI_2120_PLAIN).to.have.own.property('sections').with.own.property('A');
    });

    it('Should not have an "is_mandatory" property', () => {
      expect(CSI_2120_PLAIN).to.not.have.own.property('is_mandatory');
    });

    it('Should not have a "combinations" property', () => {
      expect(CSI_2120_PLAIN).to.not.have.own.property('combinations');
    });
  });

  describe('Validate Course.removeSection( section: CourseSection )', () => {
    it('Should have a "sections" property with a size of 0', () => {
      // Create a new, local, course so as to not interfere with the other tests
      const course: Course = new Course(CSI_2120_DATA);
      const section = course.sections.get('A');
      if (section) {
        course.removeSection(section);
      }

      expect(course).to.have.own.property('sections').with.is.empty;
    });
  });

  describe('Validate Course.listToPlainObjects( list: Course[] )', () => {
    const expected = 6;

    it('Should return 6', () => {
      expect(CSI_2120.getCombinationCount()).to.be.a('number').that.equals(expected);
    });

    it('Should have a "combinations" property with a size of 6', () => {
      expect(CSI_2120).to.have.own.property('combinations').with.lengthOf(expected);
    });
  });

  describe('Validate Course.filterSections()', () => {
    let course: Course;

    before(() => {
      // Create a new, local, course so as to not interfere with the other tests
      course = new Course(CSI_2120_DATA);
      course.filterSections(['A']);
    });

    it('Should keep only section A', () => {
      expect(course.sections.size).to.equal(1);
      expect(course.sections.get('A')).to.not.be.undefined;
    });

    it('Should have no sections', () => {
      course.filterSections([]);
      expect(course.sections.size).to.equal(0);
      expect(course.sections.get('A')).to.be.undefined;
    });
  });

  describe('Validate Course.filterContent()', () => {
    let course: Course;

    before(() => {
      // Create a new, local, course so as to not interfere with the other tests
      course = new Course(CSI_2120_DATA);
      course.filterContent(course_skeleton_partial);
    });

    it('Should only have section A', () => {
      expect(course.sections.size).to.equal(1);
      expect(course.sections.get('A')).to.not.be.undefined;
    });

    it('Should have the correct components in section A', () => {
      const course_section = course.sections.get('A');
      const expected = 4;
      expect(course_section?.components.size).to.equal(expected);
      expect(course_section?.components.get('A00-LEC-0')).to.not.be.undefined;
      expect(course_section?.components.get('A00-LEC-1')).to.not.be.undefined;
      expect(course_section?.components.get('A01-LAB')).to.not.be.undefined;
      expect(course_section?.components.get('A06-TUT')).to.not.be.undefined;
      expect(course_section?.components.get('A02-LAB')).to.be.undefined;
    });
  });
});
