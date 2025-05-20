import { ScheduleGenerateFilters } from '@route_handlers/schemas';
import { Course } from '@courses';
import CourseSchedule from './models/CourseSchedule';
import { FormattedSchedules } from './schemas';
import { MetaResult, createResult } from '@utils/api_responses';
import { SCHED_2001, SCHED_2002, SCHED_2004 } from '@utils/scheduler_messages';
import StatusCodes from '@utils/StatusCodes';
import ApiError from '@utils/errors/ApiError';
import { parseStringToInt } from '@utils/helpers';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

/**
 * This class generates schedules with a given set of courses and filter requirements
 */
export default class Generator {
  static readonly LIMIT_FALLBACK = 2000;

  static readonly TIME_LIMIT_FALLBACK_MS = 9500;

  /**
   * The maximum number of schedules to generate
   */
  static readonly LIMIT = parseStringToInt(
    process.env.GENERATOR_LIMIT,
    Generator.LIMIT_FALLBACK,
    1,
  );

  /**
   * The maximum number time for the worker to be allowed to work
   */
  static readonly TIME_LIMIT_MS = parseStringToInt(
    process.env.TIME_LIMIT_MS,
    Generator.TIME_LIMIT_FALLBACK_MS,
  );

  static readonly IS_TIME_LIMIT_ENABLED = process.env.ENABLE_TIME_LIMIT === 'true';

  /**
   * The map of courses to use when generating schedules
   * The key of the map is the course id
   */
  courses: Map<Course['id'], Course>;

  /**
   * A list of course ids, used to store the order of the courses in the generator
   */
  course_ids: Array<Course['id']>;

  /**
   * A filters object used to set requirements for the schedules being generated
   */
  filters: ScheduleGenerateFilters | undefined;

  /**
   * The smallest number of components with a start time before the start time filter amongst the schedules
   */
  min_num_before_start_filter: number;

  /**
   * The smallest number of components with an end time before the end time filter amongst the schedules
   */
  min_mum_after_end_filter: number;

  /**
   * Whether the schedule limit has been reached when generating schedules
   */
  private did_reach_limit = false;

  /**
   * A list of all schedules generated
   */
  private schedules: CourseSchedule[] | null;

  /**
   * A list of schedules generated, grouped by sets with matching profiles
   */
  private schedule_sets: CourseSchedule[][];

  /**
   * A list of profiles, one for each schedule set.
   * The profile index matches the schedule set index
   */
  private readonly schedule_set_profiles: string[];

  /**
   * Create a new ScheduleGenerator object
   * @param courses the list of Course objects to use when generating schedules
   * @param filters the filters object to use when generating schedules
   */
  constructor(courses: Course[], filters?: ScheduleGenerateFilters) {
    // Initialize instance variables
    this.courses = new Map<Course['id'], Course>();
    this.course_ids = [];
    this.schedules = null;
    this.schedule_sets = [];
    this.schedule_set_profiles = [];
    this.filters = filters;
    this.min_num_before_start_filter = NaN;
    this.min_mum_after_end_filter = NaN;

    // Sort the courses by number of combinations in order to start the search space as small as possible.
    //   The idea being to cause maximal time conflicts as early as possible in the search space.
    courses.sort(Course.compareByCombinationCount);

    // Add the courses to the generator by their id
    courses.forEach((course: Course) => {
      this.courses.set(course.id, course);
      this.course_ids.push(course.id);
    });
  }

  /**
   * Gets the number of results generated
   * @returns the number of results generated
   */
  getNumResults(): number {
    return this.schedule_sets.length;
  }

  /**
   * Generates a list of schedules with the courses and filters in the instance
   * @throws an error if the time limit is enabled and the time is exceeded
   * @returns a list of CourseSchedule objects representing the generated schedules
   */
  generateSchedules(): CourseSchedule[] {
    if (!this.schedules) {
      const log_data = {
        term: this.courses.size
          ? `${this.courses.get(this.course_ids[0])?.season} ${this.courses.get(this.course_ids[0])
              ?.year}`
          : 'N/A',
        courses: Array.from(this.courses.values(), (c) => ({
          id: c.id,
          label: `${c.subject_code} ${c.course_code}: ${c.course_name}`,
          sections: Array.from(c.sections.values(), (s) => ({
            id: s.id,
            label: s.label,
            components: Array.from(s.components.values(), (com) => ({
              id: com.id,
              label: com.label,
            })),
          })),
        })),
      };

      logger.info(`Generating schedule for: ${JSON.stringify(log_data)}`);
      logger.info(
        `Natalia's secret log message (actually just some stats): ${JSON.stringify({
          filters: this.filters,
          num_courses: this.courses.size,
          num_courses_optional: Array.from(this.courses.values()).reduce(
            (total, c) => (!c.is_mandatory ? total + 1 : total),
            0,
          ),
        })}`,
      );

      // Create an empty schedules array
      this.schedules = [];

      // Create a queue to perform a BFS of the possible schedules
      const q: CourseSchedule[] = [];

      // Seed the queue with an empty schedule
      const initial_schedule = new CourseSchedule();
      q.push(initial_schedule);
      const num_courses: number = this.courses.size;

      const time_cutoff = new Date().getTime() + Generator.TIME_LIMIT_MS;

      /* eslint-disable no-labels */
      queue_loop: while (q.length) {
        if (Generator.IS_TIME_LIMIT_ENABLED && new Date().getTime() >= time_cutoff) {
          throw new ApiError(SCHED_2004, StatusCodes.REQUEST_TIMEOUT);
        }

        // Get the incomplete schedule at the front of the queue
        const partial_schedule = q.shift();
        if (!partial_schedule) {
          continue;
        }

        // Find the next course to be added and get the cartesian product (combinations) of its components
        const course = this.courses.get(this.course_ids[partial_schedule.num_courses_attempted]);
        if (!course) {
          continue;
        }
        const combinations = course.getCombinations();

        // If the course is not mandatory, then enqueue a new schedule without the course before attempting to add the course
        // or, if there are no combinations for the course, allow it to be skipped (for async or unscheduled courses)
        if (!course.is_mandatory || !combinations.length) {
          const new_schedule = partial_schedule.copy();
          // Pretend the skipped course was added
          new_schedule.incrementNumCoursesAttempted();

          // If this is the last course in the list, add it, otherwise, enqueue the course
          if (new_schedule.num_courses_attempted === num_courses) {
            // If we hit the limit, break out of the q's while loop
            if (!this.addSchedule(new_schedule)) {
              break queue_loop;
            }
          } else {
            q.push(new_schedule);
          }
        }

        // Attempt to add the course
        for (const course_components of combinations) {
          const new_schedule = partial_schedule.copy();

          if (new_schedule.addCourseConfiguration(course_components, this.filters)) {
            // If this is the last course in the list, add it, otherwise, enqueue the course
            if (new_schedule.num_courses_attempted === num_courses) {
              // If we hit the limit, break out of the q's while loop
              if (!this.addSchedule(new_schedule)) {
                break queue_loop;
              }
            } else {
              q.push(new_schedule);
            }
          }
        }
      }

      this.applyWholeScheduleFilters();
    }

    return this.schedules;
  }

  /**
   * Returns the list of schedules formatted into a plain object that can be converted
   *   into JSON for the front-end to consume
   * @returns a plain JavaScript object representing the set of schedules
   */
  getFormattedSchedules(): FormattedSchedules {
    // Generate the schedules only if they have not already been generated
    if (!this.schedules) {
      this.generateSchedules();
    }

    const output: FormattedSchedules = {
      schedule_sets: new Array(this.schedule_sets.length),
      courses: {},
    };

    const result_meta: Omit<FormattedSchedules, 'courses' | 'schedule_sets'> = {
      num_schedules: this.schedules?.length ?? 0,
      num_schedule_sets: this.schedule_sets.length,
      limit: Generator.LIMIT,
      did_reach_limit: this.did_reach_limit,
    };

    logger.info(`Generator Results Meta: ${JSON.stringify(result_meta)}`);

    // Add the courses to the output object
    for (const [id, course] of this.courses) {
      output.courses[id] = course.toJSON();
    }

    // Iterate over the schedule sets and create the output object for each
    for (let set_id = 0; set_id < this.schedule_sets.length; set_id++) {
      output.schedule_sets[set_id] = [];
      const output_set = output.schedule_sets[set_id];

      for (const schedule of this.schedule_sets[set_id]) {
        const schedule_id: number = output_set.length;
        output_set.push({
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          num_courses: schedule.num_courses,
          num_courses_attempted: schedule.num_courses_attempted,
          num_before_start_filter: schedule.num_before_start_filter,
          num_after_end_filter: schedule.num_after_end_filter,
          num_lec_time_conflicts: schedule.num_lec_time_conflicts,
          components: [],
          conflicts: {},
        });

        for (const c of schedule.components) {
          // Add the component meta data to the output
          output_set[schedule_id].components.push({
            course_id: c.course.id,
            section_id: c.section.id,
            component_id: c.id,
            guid: c.guid,
          });

          // Create the conflicts array
          output_set[schedule_id].conflicts[c.guid] = [];

          // If time conflicts are allowed, find components that conflict with the current component
          if (this.filters?.allow_time_conflicts !== 'NONE') {
            for (const z of schedule.components) {
              if (
                c.guid !== z.guid &&
                c.course.year === z.course.year &&
                c.course.season === z.course.season &&
                c.day === z.day &&
                c.end_timestamp > z.start_timestamp &&
                c.start_timestamp < z.end_timestamp
              ) {
                output_set[schedule_id].conflicts[c.guid].push({
                  course_id: z.course.id,
                  section_id: z.section.id,
                  component_id: z.id,
                  guid: z.guid,
                });
              }
            }
          }
        }
      }
    }

    return output;
  }

  /**
   * Creates the response data for this generator
   * @throws APIError if there are no results
   * @returns The response data for this generator
   */
  getResult(): MetaResult<FormattedSchedules> {
    const result = createResult<FormattedSchedules>(this.getFormattedSchedules());

    if (!this.getNumResults()) {
      const course = this.courses.get(this.course_ids[0]);
      throw new ApiError(
        {
          ...SCHED_2001,
          message: `There are no possible schedules for the requested courses during the ${course?.year} ${course?.season} term. Please adjust the filters and/or course list and try again.`,
          vars: {
            term: { year: course?.year, season: course?.season },
          },
        },
        StatusCodes.NOT_FOUND,
      );
    }

    if (this.did_reach_limit) {
      result.messages.push(SCHED_2002);
    }

    return result;
  }

  /**
   * Applies filters that need to be applied after the schedules have been generated
   */
  private applyWholeScheduleFilters(): void {
    const min_num_before_sets = [];

    // Find the minimum number of components before the start time filter
    for (const set of this.schedule_sets) {
      if (
        isNaN(this.min_num_before_start_filter) ||
        this.min_num_before_start_filter > set[0].num_before_start_filter
      ) {
        this.min_num_before_start_filter = set[0].num_before_start_filter;
      }
    }

    // Keep sets that match the minNumBeforeStartFilter
    for (const set of this.schedule_sets) {
      if (this.min_num_before_start_filter === set[0].num_before_start_filter) {
        min_num_before_sets.push(set);
      }
    }

    // Reset the instance variable
    this.schedule_sets = [];

    // Find the minimum number of components after the end time filter
    for (const set of min_num_before_sets) {
      if (
        isNaN(this.min_mum_after_end_filter) ||
        this.min_mum_after_end_filter > set[0].num_after_end_filter
      ) {
        this.min_mum_after_end_filter = set[0].num_after_end_filter;
      }
    }

    // Keep sets that match the minNumAfterEndFilter
    for (const set of min_num_before_sets) {
      if (this.min_mum_after_end_filter === set[0].num_after_end_filter) {
        this.schedule_sets.push(set);
      }
    }
  }

  /**
   * Adds a schedule to the set of schedule and the appropriate schedule set
   * @param schedule the CourseSchedule to be added
   * @returns true if the schedule was added successfully, false otherwise
   */
  private addSchedule(schedule: CourseSchedule): boolean {
    // Make sure we don't exceed the limit of schedules
    if ((this.schedules?.length ?? 0) >= Generator.LIMIT) {
      this.did_reach_limit = true;
      return false;
    }

    if (schedule.num_courses > 0 && schedule.checkFilters(this.filters)) {
      this.schedules?.push(schedule);
      const new_profile = schedule.getProfile();
      for (let i = 0; i < this.schedule_set_profiles.length; i++) {
        if (this.schedule_set_profiles[i] === new_profile) {
          this.schedule_sets[i].push(schedule);
          return true;
        }
      }
      this.schedule_set_profiles.push(new_profile);
      const new_schedule_set: CourseSchedule[] = [];
      new_schedule_set.push(schedule);
      this.schedule_sets.push(new_schedule_set);
    }

    return true;
  }
}
