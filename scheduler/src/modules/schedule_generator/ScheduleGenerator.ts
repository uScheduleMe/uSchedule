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
   * A filters object used to set requirements for the schedules being generated
   */
  readonly filters: ScheduleGenerateFilters | undefined;

  /**
   * A list of all schedules generated
   */
  private schedules: Set<Schedule> | null = null;

  /**
   * A stack to perform a DFS of the possible schedules.
   * It is seeded with an empty schedule.
   */
  private readonly stack: Schedule[] = [new Schedule()];

  /**
   * The best before start filter value (minimum value)
   */
  private best_num_before_start_filter = Number.POSITIVE_INFINITY;

  /**
   * Create a new ScheduleGenerator object
   * @param courses the list of Course objects to use when generating schedules
   * @param config configuration options for the scheduler generator
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
   * Whether the schedule limit has been reached when generating schedules
   */
  limitWasReached() {
    return (this.schedules?.size ?? 0) >= this.config.limit;
  }

  /**
   * Generates a list of schedules with the courses and filters in the instance
   * @returns a list of CourseSchedule objects representing the generated schedules
   */
  generateSchedules(): IterableIterator<Schedule> {
    if (this.schedules) {
      return this.schedules.values();
    }

    // Because all the courses could have been filtered out (or none were provided)
    if (!this.courses.length) {
      this.schedules = new Set();
      return this.schedules.values();
    }

    this.schedules = new Set();

    /* eslint-disable no-labels */
    stack_loop: while (this.stack.length) {
      // Get the schedule at the top of the stack
      // Not possible for it to be undefined here since we don't remove from the stack anywhere else
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const partial_schedule = this.stack.pop()!;

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

    return this.schedules.values();
  }

  /**
   * Either adds the schedule to the results, pushes it back onto the stack, or discards it.
   * @param schedule the CourseSchedule to be processed
   * @returns true if the schedule was added to the results and the scheduler limit is reached, false otherwise
   */
  private pushOrAddAndCheckLimit(schedule: Schedule): boolean {
    if (schedule.num_courses_attempted !== this.courses.length) {
      if (schedule.num_before_start_filter <= this.best_num_before_start_filter) {
        this.stack.push(schedule);
      }
    } else if (schedule.num_courses) {
      if (schedule.num_before_start_filter < this.best_num_before_start_filter) {
        this.best_num_before_start_filter = schedule.num_before_start_filter;
        // Since we don't care about schedules with a worse value, throw them away!
        this.schedules = new Set();
      }
      if (schedule.num_before_start_filter === this.best_num_before_start_filter) {
        // Check if the schedule has courses because of non-mandatory course option
        this.schedules?.add(schedule);
        return this.limitWasReached();
      }
    }

    return false;
  }

  private applyPostGenerationFilters(): void {
    if (!this.schedules?.size) {
      return;
    }

    // Note: Schedules that have a worse num before start time will have been filtered out already

    let min_mum_after_end_filter = Number.POSITIVE_INFINITY;

    for (const schedule of this.schedules) {
      if (schedule.num_after_end_filter < min_mum_after_end_filter) {
        min_mum_after_end_filter = schedule.num_after_end_filter;
      }
    }

    // Remove schedules that do not match the minNumAfterEndFilter
    for (const schedule of this.schedules) {
      if (min_mum_after_end_filter !== schedule.num_after_end_filter) {
        this.schedules.delete(schedule);
      }
    }
  }
}
