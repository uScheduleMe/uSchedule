import { expect } from 'chai';
import { course_1 } from './fixtures/course_1';
import ScheduleGenerator from './ScheduleGenerator';
import { course_2 } from './fixtures/course_2';
import {
  ScheduleGeneratorConfig,
  schedule_generate_filters_schema,
  schedule_generator_config_schema,
} from './schemas';
import { course_3 } from './fixtures/course_3';
import { course_4 } from './fixtures/course_4';
import { course_5 } from './fixtures/course_5';
import { Course, Schedule } from './models';
import { course_1_optional } from './fixtures/course_1_optional';

describe('Validate ScheduleGenerator', () => {
  let config: ScheduleGeneratorConfig;

  beforeEach(() => {
    config = schedule_generator_config_schema.parse({});
  });

  describe('generateSchedules()', () => {
    const includesCourse = (schedule: Schedule, course: Course): boolean =>
      schedule.components.some(({ components }) => components[0].course === course);

    it('should return no schedules when no courses are provided', () => {
      // Make sure this edge case is handled and no 'Cannot read properties of undefined' errors occur
      const generator = new ScheduleGenerator([], config);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(0);
    });

    it('should return schedules for a single course with valid configurations', () => {
      // Requires a course with a single configuration
      const generator = new ScheduleGenerator([course_1], config);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(1);
    });

    it('should return schedules when one course has no configurations', () => {
      // Requires 2 courses, 1 with no configurations and 1 with at least one valid configuration
      const generator = new ScheduleGenerator([course_1, course_3], config);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(1);
    });

    it('should return schedules when there is a course that conflicts but is optional', () => {
      // Requires 2 courses that conflict (usually return no schedules) but one is optional
      const generator = new ScheduleGenerator([course_1_optional, course_4], config);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.length.greaterThan(0);
    });

    it('should return schedules with an optional course when there are no conflicts', () => {
      // Requires 2 courses that produce at least one schedule ane one of them is optional
      const generator = new ScheduleGenerator([course_1_optional, course_5], config);
      const schedules = [...generator.generateSchedules()];
      const one_has_optional = schedules.some((s) => includesCourse(s, course_1_optional));
      expect(one_has_optional).to.be.true;
    });

    it('should return schedules without an optional course when there are no conflicts', () => {
      // Requires 2 courses that produce at least one schedule ane one of them is optional
      const generator = new ScheduleGenerator([course_1_optional, course_5], config);
      const schedules = [...generator.generateSchedules()];
      const one_not_has_optional = schedules.some((s) => !includesCourse(s, course_1_optional));
      expect(one_not_has_optional).to.be.true;
    });

    describe('config: limit', () => {
      it('should stop generating and return schedules when the limit is reached', () => {
        // Requires courses that produce more than one schedule
        config = schedule_generator_config_schema.parse({ limit: 1 });
        const generator = new ScheduleGenerator([course_1, course_5], config);
        const actual = [...generator.generateSchedules()];
        expect(actual).to.have.lengthOf(1);
      });
    });

    describe('filter: allow_time_conflicts', () => {
      it('should return no schedules for courses with conflicting configurations', () => {
        // Requires courses where all the configurations overlap at least one component
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'NONE',
        });
        const generator = new ScheduleGenerator([course_1, course_2], config, filters);
        const actual = [...generator.generateSchedules()];
        expect(actual).to.have.lengthOf(0);
      });

      it('should return schedules when there are conflicts but the filter is set to allow all conflicts', () => {
        // Requires courses where all the configurations overlap at least one component
        // and at least one overlap is with a lecture
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'ALL',
        });
        const generator = new ScheduleGenerator([course_1, course_2], config, filters);
        const actual = [...generator.generateSchedules()];
        expect(actual).to.have.lengthOf(1);
      });

      it('should return schedules when there are non-lecture conflicts and the filter is set to allow non-lecture conflicts', () => {
        // Requires courses where the configurations have conflicts that are not both lectures
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'NON_LEC',
        });
        const generator = new ScheduleGenerator([course_1, course_4], config, filters);
        const actual = [...generator.generateSchedules()];
        expect(actual).to.have.lengthOf(1);
      });
    });
  });

  describe('filter: minimize_before_time & filter: minimize_after_time', () => {
    it('should return all schedules for course 5 when no filters are applied', () => {
      // Course 5 is setup with 3 sections that do not cause conflicts, but have early, late and neutral components
      const generator = new ScheduleGenerator([course_5], config);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(3);
    });

    it('should filter out early schedules when setting minimize_before_time', () => {
      // Requires courses where the configurations have conflicts that are not both lectures
      const filters = schedule_generate_filters_schema.parse({
        minimize_before_time: '10:00',
      });
      const generator = new ScheduleGenerator([course_5], config, filters);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(2);
    });

    it('should filter our late schedules when setting minimize_after_time', () => {
      // Requires courses where the configurations have conflicts that are not both lectures
      const filters = schedule_generate_filters_schema.parse({
        minimize_after_time: '18:00',
      });
      const generator = new ScheduleGenerator([course_5], config, filters);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(2);
    });
  });

  describe('filter: breaks', () => {
    it('should return schedules when the breaks do not conflict with the course data', () => {
      // Requires a course which has a configuration that does not overlap with the breaks
      const filters = schedule_generate_filters_schema.parse({
        breaks: [{ start: '12:00', end: '13:00', size: '00:30' }],
      });
      const generator = new ScheduleGenerator([course_5], config, filters);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.length.greaterThan(0);
    });

    it('should return no schedules when the breaks conflict with all the course data', () => {
      // Requires a course where all the configurations overlap with the breaks
      const filters = schedule_generate_filters_schema.parse({
        breaks: [{ start: '19:00', end: '21:00', size: '00:30' }],
      });
      const generator = new ScheduleGenerator([course_1], config, filters);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(0);
    });
  });

  describe('filter: allow_closed_components', () => {
    it('should return no schedules when where are no configurations without a closed component', () => {
      // Requires a course where all the configurations have at least one closed schedule component (all course components are closed)
      const filters = schedule_generate_filters_schema.parse({
        allow_closed_components: false,
      });
      const generator = new ScheduleGenerator([course_2], config, filters);
      const actual = [...generator.generateSchedules()];
      expect(actual).to.have.lengthOf(0);
    });
  });
});
