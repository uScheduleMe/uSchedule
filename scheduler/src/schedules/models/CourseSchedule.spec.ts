import { expect } from 'chai';
import CourseSchedule from './CourseSchedule';
import { Course, CourseSectionComponent } from '@courses';
import { schedule_generate_filters_schema } from '@route_handlers/schemas';
import { CourseData } from '@services/DataAccess';

const course_data: CourseData = {
  id: 3,
  sections: {
    A: {
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
    },
  },
  school: 'uottawa',
  year: 2020,
  term: 'winter',
  subject_code: 'CSI',
  course_code: '2120',
  course_name: 'Programming Paradigms',
};

const course: Course = new Course(course_data);
const course_configurations: CourseSectionComponent[][] = course.getCombinations();

const schedule: CourseSchedule = new CourseSchedule();
const schedule_copy: CourseSchedule = schedule.copy();
schedule_copy.addCourseConfiguration(course_configurations[0]);

describe('CourseSchedule', () => {
  describe('Validate CourseSchedule.constructor()', () => {
    it('should have a "components" property which is an empty array', () => {
      expect(schedule).to.have.own.property('components').that.is.an('array').with.lengthOf(0);
    });

    it('should have a "components_by_day" property which is not null', () => {
      expect(schedule).to.have.own.property('components_by_day').that.is.a('map').which.is.not.null;
    });

    it('should have a "num_courses" property with a number value of 0', () => {
      expect(schedule).to.have.own.property('num_courses').that.is.a('number').which.equals(0);
    });

    it('should have a "num_courses_attempted" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_courses_attempted')
        .that.is.a('number')
        .which.equals(0);
    });

    it('should have a "start_time" property with a number value of NaN', () => {
      expect(schedule).to.have.own.property('start_time').that.is.a('number').which.is.NaN;
    });

    it('should have an "end_time" property with a number value of NaN', () => {
      expect(schedule).to.have.own.property('end_time').that.is.a('number').which.is.NaN;
    });

    it('should have a "num_before_start_filter" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_before_start_filter')
        .that.is.a('number')
        .which.equals(0);
    });

    it('should have a "num_after_end_filter" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_after_end_filter')
        .that.is.a('number')
        .which.equals(0);
    });

    it('should have a "num_time_conflicts" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_time_conflicts')
        .that.is.a('number')
        .which.equals(0);
    });

    it('should have a "num_lec_time_conflicts" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_lec_time_conflicts')
        .that.is.a('number')
        .which.equals(0);
    });

    it('should have a "num_closed_components" property with a number value of 0', () => {
      expect(schedule)
        .to.have.own.property('num_closed_components')
        .that.is.a('number')
        .which.equals(0);
    });
  });

  describe('Validate CourseSchedule.addCourseConfiguration()', () => {
    it('should have a "num_courses" property with a number value of 1', () => {
      expect(schedule_copy)
        .to.have.own.property('num_courses_attempted')
        .that.is.a('number')
        .which.equals(1);
    });

    it('should have a "num_courses_attempted" property with a number value of 1', () => {
      expect(schedule_copy)
        .to.have.own.property('num_courses_attempted')
        .that.is.a('number')
        .which.equals(1);
    });

    it('should have a "components_by_day" property that has a size of 3 with keys "2020winterMO", "2020winterTU", "2020winterTH"', () => {
      const expected = 3;
      expect(schedule_copy)
        .to.have.own.property('components_by_day')
        .with.lengthOf(expected)
        .and.has.all.keys('2020winterMO', '2020winterTU', '2020winterTH');
    });

    it('should have a "components" property that is an array with length 4', () => {
      const expected = 4;
      expect(schedule_copy).to.have.own.property('components').with.lengthOf(expected);
    });

    it('should have a "start_time" property that is a number with a value of 30600', () => {
      const expected = 30600;
      expect(schedule_copy)
        .to.have.own.property('start_time')
        .that.is.a('number')
        .which.equals(expected);
    });

    it('should have a "end_time" property that is a number with a value of 62400', () => {
      const expected = 62400;
      expect(schedule_copy)
        .to.have.own.property('end_time')
        .that.is.a('number')
        .which.equals(expected);
    });
  });

  describe('Validate CourseSchedule.copy()', () => {
    it('should have different number of num_courses', () => {
      expect(schedule.num_courses).does.not.equal(schedule_copy.num_courses);
    });

    it('should have different number of num_courses_attempted', () => {
      expect(schedule.num_courses_attempted).does.not.equal(schedule_copy.num_courses_attempted);
    });

    it('should have different number of components', () => {
      expect(schedule.components.length).does.not.equal(schedule_copy.components.length);
    });

    it('should have different number of components_by_day keys', () => {
      expect(schedule.components_by_day.size).does.not.equal(schedule_copy.components_by_day.size);
    });
  });

  describe('Validate CourseSchedule.incrementNumCoursesAttempted()', () => {
    it('should have increase the nun_courses_attempted by 3', () => {
      const expected = 3;
      const prev: number = schedule.num_courses_attempted;
      schedule.incrementNumCoursesAttempted(expected);
      expect(schedule.num_courses_attempted).to.equal(prev + expected);
    });
  });

  describe('Validate CourseSchedule.getProfile()', () => {
    it('should return a string representation of the schedule profile for schedule 1', () => {
      const profile: string = schedule.getProfile();
      const target_profile = '00';
      expect(profile).to.equal(target_profile);
    });

    it('should return a string representation of the schedule profile for schedule 2', () => {
      const profile: string = schedule_copy.getProfile();
      const target_profile =
        '002020winterMO3ALAB08:302020winterTH3ALEC14:303ATUT16:002020winterTU3ALEC16:00';
      expect(profile).to.equal(target_profile);
    });
  });

  describe('Validate CourseSchedule.checkFilters()', () => {
    it('should return false if a requested break is not available', () => {
      const filter_break_fail = schedule_generate_filters_schema.parse({
        breaks: [{ start: '14:30', end: '15:50', size: '00:30' }],
      });
      const should_be_false: boolean = schedule_copy.checkFilters(filter_break_fail);
      expect(should_be_false).to.be.false;
    });

    it('should return true if a requested break is available', () => {
      const filters_break_pass = schedule_generate_filters_schema.parse({
        breaks: [{ start: '10:30', end: '15:50', size: '00:30' }],
      });
      const should_be_true: boolean = schedule_copy.checkFilters(filters_break_pass);
      expect(should_be_true).to.be.true;
    });
  });
});
