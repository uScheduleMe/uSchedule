import {
  ScheduleGenerateFilters,
  ScheduleGeneratorConfig,
  schedule_generator_config_schema,
} from './schemas';
import { Course, Schedule } from './models';
import { z } from 'zod';

/**
 * This class generates schedules with a given set of courses and filter requirements
 */
export default class ScheduleGenerator {
  readonly config: z.output<typeof schedule_generator_config_schema>;

  /**
   * The list of courses to use when generating schedules
   */
  readonly courses: Course[];

  /**
   * A list of all schedules generated
   */
  private _schedules: Set<Schedule> | null = null;

  /**
   * A stack to perform a DFS of the possible schedules.
   * It is seeded with an empty schedule.
   */
  private _stack: Schedule[] = [new Schedule()];

  /**
   * A filters object used to set requirements for the schedules being generated
   */
  readonly filters: ScheduleGenerateFilters | undefined;

  /**
   * The best before start filter value (minimum value)
   */
  private _best_num_before_start_filter = Number.POSITIVE_INFINITY;

  /**
   * Create a new ScheduleGenerator object
   * @param courses the list of Course objects to use when generating schedules
   * @param filters the filters object to use when generating schedules
   */
  constructor(
    courses: Readonly<Course[]>,
    config?: Readonly<ScheduleGeneratorConfig>,
    filters?: Readonly<ScheduleGenerateFilters>,
  ) {
    this.config = schedule_generator_config_schema.parse(config ?? {});
    this.filters = filters;

    // Sort the courses by number of configurations in order to start the search space as small as possible.
    // Also remove courses with no configurations to accommodate async or unscheduled courses, or courses
    // where the user selected no sections
    this.courses = courses
      .filter((c) => c.getConfigurationCount())
      .sort(Course.compareByConfigurationCount);
  }

  /**
   * Generates a list of schedules with the courses and filters in the instance
   * @return a list of CourseSchedule objects representing the generated schedules
   */
  generateSchedules(): IterableIterator<Schedule> {
    if (this._schedules) {
      return this._schedules.values();
    }

    // Because all the courses could have been filtered out (or none were provided)
    if (!this.courses.length) {
      this._schedules = new Set();
      return this._schedules.values();
    }

    this._schedules = new Set();

    /* eslint-disable no-labels */
    stack_loop: while (this._stack.length) {
      // Get the schedule at the top of the stack
      // Not possible for it to be undefined here since we don't remove from the stack anywhere else
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const partial_schedule = this._stack.pop()!;

      // Find the next course to be added and get the cartesian product (combinations) of its components
      const course = this.courses[partial_schedule.num_courses_attempted];
      const course_configurations = course.getConfigurations();

      // If the course is not mandatory, then push a new schedule without the course before attempting to add the course
      if (!course.is_mandatory) {
        const new_schedule = partial_schedule.copy();
        // Pretend the skipped course was added
        new_schedule.incrementNumCoursesAttempted();

        if (this.pushOrAddAndCheckLimit(new_schedule)) {
          break stack_loop;
        }
      }

      // Attempt to add all the configurations for the current course
      for (const course_configuration of course_configurations) {
        const new_schedule = partial_schedule.copy();

        if (
          new_schedule.addCourseConfiguration(course_configuration, this.filters) &&
          this.pushOrAddAndCheckLimit(new_schedule)
        ) {
          break stack_loop;
        }
      }
    }

    this.applyPostGenerationFilters();

    return this._schedules.values();
  }

  /**
   * Either adds the schedule to the results, pushes it back onto the stack, or discards it.
   * @param schedule the CourseSchedule to be processed
   * @return true if the schedule was added to the results and the scheduler limit is reached, false otherwise
   */
  private pushOrAddAndCheckLimit(schedule: Schedule): boolean {
    if (schedule.num_courses_attempted !== this.courses.length) {
      if (schedule.num_before_start_filter <= this._best_num_before_start_filter) {
        this._stack.push(schedule);
      }
    } else if (schedule.num_courses) {
      if (schedule.num_before_start_filter < this._best_num_before_start_filter) {
        this._best_num_before_start_filter = schedule.num_before_start_filter;
        // Since we don't care about schedules with a worse value, throw them away!
        this._schedules = new Set();
      }
      if (schedule.num_before_start_filter === this._best_num_before_start_filter) {
        // Check if the schedule has courses because of non-mandatory course option
        this._schedules?.add(schedule);
        return this.limitWasReached();
      }
    }

    return false;
  }

  private applyPostGenerationFilters(): void {
    if (!this._schedules?.size) {
      return;
    }

    // Note: Schedules that have a worse num before start time will have been filtered out already

    let min_mum_after_end_filter = Number.POSITIVE_INFINITY;

    for (const schedule of this._schedules) {
      if (schedule.num_after_end_filter < min_mum_after_end_filter) {
        min_mum_after_end_filter = schedule.num_after_end_filter;
      }
    }

    // Remove schedules that do not match the minNumAfterEndFilter
    for (const schedule of this._schedules) {
      if (min_mum_after_end_filter !== schedule.num_after_end_filter) {
        this._schedules.delete(schedule);
      }
    }
  }

  /**
   * Whether the schedule limit has been reached when generating schedules
   */
  limitWasReached() {
    return (this._schedules?.size ?? 0) >= this.config.limit;
  }
}
