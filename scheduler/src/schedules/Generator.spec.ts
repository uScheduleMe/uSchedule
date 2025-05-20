import { expect } from 'chai';
import { Course } from '@courses';
import Generator from './Generator';
import { test_data } from './__test__/SchedulesGenerator_courses';
import { schedule_generate_filters_schema } from '@route_handlers/schemas';

const csi2120: Course = new Course(test_data.csi2120);
const csi3104: Course = new Course(test_data.csi3104);
const mat1348: Course = new Course(test_data.mat1348);
const csi3131: Course = new Course(test_data.csi3131);
const iti1121: Course = new Course(test_data.iti1121);
const chm1321: Course = new Course(test_data.chm1321);

describe('CourseSchedule', () => {
  describe('Validate CourseSchedule.constructor()', () => {
    let generator: Generator;

    before(() => {
      generator = new Generator([csi2120, csi3104]);
    });

    it('should have the two input courses', () => {
      const expected = 2;
      expect(generator).to.have.own.property('courses').that.is.a('map').with.lengthOf(expected);

      expect(Array.from(generator.courses.keys())).to.have.members([3, 9]);
    });

    it('should store the courses in the order of their combination count', () => {
      const expected1 = 2;
      expect(generator)
        .to.have.own.property('course_ids')
        .that.is.an('array')
        .with.lengthOf(expected1);
      const expected2 = 9;
      expect(generator.course_ids[0]).to.equal(expected2);
      const expected3 = 3;
      expect(generator.course_ids[1]).to.equal(expected3);
    });

    it('should initialize the schedules to null', () => {
      expect(generator).to.have.own.property('schedules').that.is.null;
    });

    it('should initialize the schedule_sets to []', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(0);
    });

    it('should initialize the schedule_set_profiles to []', () => {
      expect(generator)
        .to.have.own.property('schedule_set_profiles')
        .that.is.an('array')
        .with.lengthOf(0);
    });

    it('should initialize the filters to undefined', () => {
      expect(generator).to.have.own.property('filters').that.is.undefined;
    });

    it('should initialize the min_num_before_start_filter to NaN', () => {
      expect(generator).to.have.own.property('min_num_before_start_filter').that.is.NaN;
    });

    it('should initialize the min_mum_after_end_filter to NaN', () => {
      expect(generator).to.have.own.property('min_mum_after_end_filter').that.is.NaN;
    });
  });

  describe('Validate CourseSchedule.generateSchedules() with no filters', () => {
    let generator: Generator;

    before(() => {
      generator = new Generator([csi2120, csi3104]);
      generator.generateSchedules();
    });

    it('should find 6 schedules', () => {
      const expected = 6;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 3 schedule sets', () => {
      const expected = 3;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate minimize_before_time filters', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        minimize_before_time: '10:00',
      });
      generator = new Generator([csi2120, csi3104], filters);
      generator.generateSchedules();
    });

    it('should find 3 schedules', () => {
      const expected = 6;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 2 schedule sets', () => {
      const expected = 2;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate minimize_after_time filters', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        minimize_after_time: '15:00',
      });
      generator = new Generator([mat1348, csi3104], filters);
      generator.generateSchedules();
    });

    it('should find 7 schedules', () => {
      const expected = 7;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 3 schedule sets', () => {
      const expected = 3;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate break filter for an impossible lunch break', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        breaks: [{ start: '11:00', end: '13:00', size: '00:45' }],
      });
      generator = new Generator([mat1348, csi3104], filters);
      generator.generateSchedules();
    });

    it('should find 0 schedules', () => {
      expect(generator).to.have.own.property('schedules').that.is.an('array').with.lengthOf(0);
    });

    it('should find 0 schedule sets', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(0);
    });
  });

  describe('Validate break filter for a lunch break', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        breaks: [{ start: '10:00', end: '12:00', size: '00:45' }],
      });
      generator = new Generator([mat1348, csi3104], filters);
      generator.generateSchedules();
    });

    it('should find 6 schedules', () => {
      const expected = 6;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 6 schedule sets', () => {
      const expected = 6;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate time conflict filter NONE', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_time_conflicts: 'NONE',
      });
      generator = new Generator([csi3131, csi2120], filters);
      generator.generateSchedules();
    });

    it('should find 0 schedules', () => {
      expect(generator).to.have.own.property('schedules').that.is.an('array').with.lengthOf(0);
    });

    it('should find 0 schedule sets', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(0);
    });
  });

  describe('Validate time conflict filter NON_LEC with no results', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_time_conflicts: 'NON_LEC',
      });
      generator = new Generator([csi3131, csi2120], filters);
      generator.generateSchedules();
    });

    it('should find 0 schedules', () => {
      expect(generator).to.have.own.property('schedules').that.is.an('array').with.lengthOf(0);
    });

    it('should find 0 schedule sets', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(0);
    });
  });

  describe('Validate time conflict filter NON_LEC with results', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_time_conflicts: 'NON_LEC',
      });
      generator = new Generator([csi3131, mat1348], filters);
      generator.generateSchedules();
    });

    it('should find 56 schedules', () => {
      const expected = 56;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 7 schedule sets', () => {
      const expected = 7;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate time conflict filter ALL', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_time_conflicts: 'ALL',
      });
      generator = new Generator([csi3131, csi2120], filters);
      generator.generateSchedules();
    });

    it('should find 48 schedules', () => {
      const expected = 48;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 3 schedule sets', () => {
      const expected = 3;
      expect(generator)
        .to.have.own.property('schedule_sets')
        .that.is.an('array')
        .with.lengthOf(expected);
    });
  });

  describe('Validate show closed components filter', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_closed_components: true,
      });
      generator = new Generator([csi3131], filters);
      generator.generateSchedules();
    });

    it('should find 8 schedules', () => {
      const expected = 8;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 1 schedule sets', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(1);
    });
  });

  describe('Validate hide closed components filter', () => {
    let generator: Generator;

    before(() => {
      const filters = schedule_generate_filters_schema.parse({
        allow_closed_components: false,
      });
      generator = new Generator([csi3131], filters);
      generator.generateSchedules();
    });

    it('should find 6 schedules', () => {
      const expected = 6;
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(expected);
    });

    it('should find 1 schedule sets', () => {
      expect(generator).to.have.own.property('schedule_sets').that.is.an('array').with.lengthOf(1);
    });
  });

  describe('Validate ScheduleGenerator.getNumResults()', () => {
    let generator: Generator;

    before(() => {
      generator = new Generator([csi3131]);
      generator.generateSchedules();
    });

    it('should find 6 schedules', () => {
      expect(generator.getNumResults()).to.equal(1);
    });
  });

  describe('Validate schedule generation limit (not reached)', () => {
    let generator: Generator;

    before(() => {
      generator = new Generator([csi3131]);
      generator.generateSchedules();
    });

    it('should not reach the limit', () => {
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf.lessThan(Generator.LIMIT);
    });

    it('should detect that the limit has not been reached', () => {
      expect(generator).to.have.own.property('did_reach_limit').that.is.false;
    });
  });

  describe('Validate schedule generation limit (reached)', () => {
    let generator: Generator;

    before(() => {
      generator = new Generator([chm1321, iti1121, mat1348]);
      generator.generateSchedules();
    });

    it('should reach the limit', () => {
      expect(generator)
        .to.have.own.property('schedules')
        .that.is.an('array')
        .with.lengthOf(Generator.LIMIT);
    });

    it('should detect that the limit has been reached', () => {
      expect(generator).to.have.own.property('did_reach_limit').that.is.true;
    });
  });
});
