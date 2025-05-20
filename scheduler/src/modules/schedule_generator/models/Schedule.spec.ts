import {
  ScheduleGenerateFilters,
  schedule_generate_filters_schema,
} from '@modules/schedule_generator/schemas';
import { expect } from 'chai';
import Course from './Course';
import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import Schedule from './Schedule';
import { CourseData, CourseSectionComponentData, CourseSectionData } from './types';

const course_data_1: CourseData = {
  id: 123456789,
  school: 'school',
  term: { year: 2020, season: 'winter' },
};
const section_data_1_a: CourseSectionData = { id: 'A' };

const component_data_1_1: CourseSectionComponentData = {
  id: 'A00-LEC-0',
  type: 'LEC',
  is_closed: true, // Have at least one closed component for some tests
  day: 'SU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:00',
  end_time: '09:30',
};

const component_data_1_2: CourseSectionComponentData = {
  id: 'A00-LAB-0',
  type: 'LAB',
  is_closed: false,
  day: 'MO',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '19:00',
  end_time: '22:50',
};

const course_data_2: CourseData = {
  id: 234567890,
  school: 'school',
  term: { year: 2020, season: 'winter' },
};
const section_data_2_b: CourseSectionData = { id: 'B' };

const component_data_2_1: CourseSectionComponentData = {
  id: 'B00-LEC-0',
  type: 'LEC',
  is_closed: false,
  day: 'SU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:00',
  end_time: '09:30',
};

const course_data_3: CourseData = {
  id: 345678901,
  school: 'school',
  term: { year: 2020, season: 'winter' },
};
const section_data_3_c: CourseSectionData = { id: 'C' };

const component_data_3_1: CourseSectionComponentData = {
  id: 'C00-LEC-0',
  type: 'LEC',
  is_closed: false,
  day: 'MO',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '19:00',
  end_time: '20:50',
};

function getSupportingObjectsCourse1() {
  const course = new Course(course_data_1);
  const section = new CourseSection(course, section_data_1_a);
  course.addSection(section);
  const component = new CourseSectionComponent(section, component_data_1_1);
  section.addComponent(component);
  return { course, section };
}

function getSupportingObjectsCourse2() {
  const course = new Course(course_data_2);
  const section = new CourseSection(course, section_data_2_b);
  course.addSection(section);
  const component = new CourseSectionComponent(section, component_data_2_1);
  section.addComponent(component);
  return { course, section };
}

function getSupportingObjectsCourse3() {
  const course = new Course(course_data_3);
  const section = new CourseSection(course, section_data_3_c);
  course.addSection(section);
  const component = new CourseSectionComponent(section, component_data_3_1);
  section.addComponent(component);
  return { course, section };
}

function getScheduleWithConfiguration(filters?: ScheduleGenerateFilters) {
  const { course, section } = getSupportingObjectsCourse1();
  const configuration = course.getConfigurations()[0];
  const schedule = new Schedule();
  schedule.addCourseConfiguration(configuration, filters);
  return { schedule, course, section, configuration };
}

describe('Validate Schedule model', () => {
  describe('.components getter', () => {
    it('should return the aggregated list of schedule components', () => {
      const { schedule, configuration } = getScheduleWithConfiguration();
      expect(schedule.components).to.have.members(configuration);
    });
  });

  describe('.copy()', () => {
    it('should create a new schedule with the same values as the previous one', () => {
      const { schedule } = getScheduleWithConfiguration();
      schedule.incrementNumCoursesAttempted();
      schedule.num_before_start_filter += 2;
      schedule.num_after_end_filter += 5;
      const new_schedule = schedule.copy();
      expect(new_schedule).to.not.equal(schedule);
      expect(new_schedule.components).to.have.members(schedule.components);
      expect(new_schedule.num_courses).to.equal(schedule.num_courses);
      expect(new_schedule.num_courses_attempted).to.equal(schedule.num_courses_attempted);
      expect(new_schedule.num_before_start_filter).to.equal(schedule.num_before_start_filter);
      expect(new_schedule.num_after_end_filter).to.equal(schedule.num_after_end_filter);
    });

    it('should copy the values to a new array when copying the components_by_day', () => {
      const { schedule } = getScheduleWithConfiguration();
      schedule.incrementNumCoursesAttempted();
      const new_schedule = schedule.copy();
      const day = [...new_schedule.components_by_day.keys()][0];

      expect(new_schedule.components_by_day).to.have.key(day);
      expect(schedule.components_by_day).to.have.key(day);
      // Ensure new array is created
      expect(new_schedule.components_by_day.get(day)).to.not.equal(
        schedule.components_by_day.get(day),
      );
      // Ensure the values were copied over
      expect(new_schedule.components_by_day.get(day)).to.have.members(
        schedule.components_by_day.get(day) ?? [],
      );
    });
  });

  describe('.addCourseConfiguration()', () => {
    it('should add a configuration to the schedule', () => {
      const { schedule, configuration } = getScheduleWithConfiguration();
      expect(schedule.components_by_day).to.have.length(1);
      expect(Array.from(schedule.components_by_day.values()).flat()).to.have.members(configuration);
    });

    it('should increment the number of courses', () => {
      const { schedule } = getScheduleWithConfiguration();
      expect(schedule.num_courses).to.equal(1);
    });

    it('should increment the number of courses attempted', () => {
      const { schedule } = getScheduleWithConfiguration();
      expect(schedule.num_courses_attempted).to.equal(1);
    });

    describe('filters', () => {
      it('should increment the num_before_start_filter', () => {
        const filters = schedule_generate_filters_schema.parse({
          minimize_before_time: '13:00',
        });
        const { schedule } = getScheduleWithConfiguration(filters);
        expect(schedule.num_before_start_filter).to.equal(1);
      });

      it('should increment the num_after_end_filter', () => {
        const filters = schedule_generate_filters_schema.parse({
          minimize_after_time: '15:30',
        });
        const { course, section } = getSupportingObjectsCourse1();
        const component2 = new CourseSectionComponent(section, component_data_1_2);
        section.addComponent(component2);

        const configuration = course.getConfigurations()[0];
        const schedule = new Schedule();
        schedule.addCourseConfiguration(configuration, filters);

        expect(schedule.num_after_end_filter).to.equal(1);
      });

      it('should pass a break filter that is possible', () => {
        const filters = schedule_generate_filters_schema.parse({
          breaks: [{ start: '12:30', end: '15:30', size: '00:30' }],
        });

        const { course, section } = getSupportingObjectsCourse1();
        const component2 = new CourseSectionComponent(section, component_data_1_2);
        section.addComponent(component2);

        const configuration = course.getConfigurations()[0];
        const schedule = new Schedule();
        const is_actual = schedule.addCourseConfiguration(configuration, filters);
        expect(is_actual).to.be.true;
      });

      it('should fail a break filter that is impossible', () => {
        const filters = schedule_generate_filters_schema.parse({
          breaks: [{ start: '20:30', end: '21:30', size: '00:30' }],
        });

        const { course, section } = getSupportingObjectsCourse1();
        const component2 = new CourseSectionComponent(section, component_data_1_2);
        section.addComponent(component2);

        const configuration = course.getConfigurations()[0];
        const schedule = new Schedule();
        const is_actual = schedule.addCourseConfiguration(configuration, filters);
        expect(is_actual).to.be.false;
      });

      it('should add closed components when "allow_closed_components" is true', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_closed_components: true,
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const actual = schedule.components.flatMap((c) => c.components).filter((c) => c.is_closed);
        expect(actual).to.have.length.greaterThan(0);
      });

      it('should not add closed components when "allow_closed_components" is false', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_closed_components: false,
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const actual = schedule.components.flatMap((s) => s.components).filter((c) => c.is_closed);
        expect(actual).to.have.length(0);
      });

      it('should not add conflicting components when "allow_time_conflicts" is set to "NONE', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'NONE',
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const { course } = getSupportingObjectsCourse2();
        const is_actual = schedule.addCourseConfiguration(course.getConfigurations()[0], filters);

        expect(is_actual).to.be.false;
      });

      it('should add conflicting lecture components when "allow_time_conflicts" is set to "ALL', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'ALL',
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const { course } = getSupportingObjectsCourse2();
        const is_actual = schedule.addCourseConfiguration(course.getConfigurations()[0], filters);

        expect(is_actual).to.be.true;
      });

      it('should add conflicting lecture and non-lecture components when "allow_time_conflicts" is set to "ALL', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'ALL',
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const { course } = getSupportingObjectsCourse3();
        const is_actual = schedule.addCourseConfiguration(course.getConfigurations()[0], filters);

        expect(is_actual).to.be.true;
      });

      it('should not add lecture conflicting components when "allow_time_conflicts" is set to "NON_LEC', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'NON_LEC',
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const { course } = getSupportingObjectsCourse2();
        const is_actual = schedule.addCourseConfiguration(course.getConfigurations()[0], filters);

        expect(is_actual).to.be.false;
      });

      it('should add non-lecture conflicting components when "allow_time_conflicts" is set to "NON_LEC', () => {
        const filters = schedule_generate_filters_schema.parse({
          allow_time_conflicts: 'NON_LEC',
        });

        const { schedule } = getScheduleWithConfiguration(filters);
        const { course } = getSupportingObjectsCourse3();
        const is_actual = schedule.addCourseConfiguration(course.getConfigurations()[0], filters);

        expect(is_actual).to.be.true;
      });
    });
  });

  describe('.incrementNumCoursesAttempted()', () => {
    it('should increment the number of courses attempted by 1 when there is no argument', () => {
      const { schedule } = getScheduleWithConfiguration();
      schedule.incrementNumCoursesAttempted();
      expect(schedule.num_courses_attempted).to.equal(2);
    });

    it('should increment the number of courses attempted by the number given', () => {
      const { schedule } = getScheduleWithConfiguration();
      schedule.incrementNumCoursesAttempted(3);
      expect(schedule.num_courses_attempted).to.equal(4);
    });
  });
});
