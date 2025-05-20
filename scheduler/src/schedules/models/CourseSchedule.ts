import { ScheduleGenerateFilters, schedule_generate_filters_schema } from '@route_handlers/schemas';
import { CourseSectionComponent } from '@courses';

/**
 * This class is a model for a Schedule of Courses.
 * It contains course components.
 */
export default class CourseSchedule {
  /**
   * The list of components that make up this schedule
   */
  components: CourseSectionComponent[];

  /**
   * The list of components that make up this schedule, grouped by day
   * The day is the 'day of the term', meaning it is a string containing
   *   the year, term and day of week for the component
   */
  components_by_day: Map<string, CourseSectionComponent[]>;

  /**
   * The number of courses successfully added to the schedule
   */
  num_courses: number;

  /**
   * The number of courses attempted to be added to the schedule
   */
  num_courses_attempted: number;

  /**
   * The unix timestamp representing the earliest time of day with components in this schedule
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  start_time: number;

  /**
   * The unix timestamp representing the latest time of day with components in this schedule
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  end_time: number;

  /**
   * The number of components with a start time before the start time filter
   */
  num_before_start_filter: number;

  /**
   * The number of components with an end time before the end time filter
   */
  num_after_end_filter: number;

  /**
   * The number of components which have time conflicts within this schedule
   */
  num_time_conflicts: number;

  /**
   * The number of lecture components which have time conflicts within this schedule
   */
  num_lec_time_conflicts: number;

  /**
   * The number of closed components within this schedule
   */
  num_closed_components: number;

  /**
   * Create a new CourseSchedule object
   */
  constructor() {
    // Initialize instance variables
    this.num_courses = 0;
    this.num_courses_attempted = 0;
    this.start_time = NaN;
    this.end_time = NaN;
    this.components = [];
    this.components_by_day = new Map<string, CourseSectionComponent[]>();
    this.num_before_start_filter = 0;
    this.num_after_end_filter = 0;
    this.num_time_conflicts = 0;
    this.num_lec_time_conflicts = 0;
    this.num_closed_components = 0;
  }

  /**
   * Create a deep copy of the CourseSchedule object
   * @returns a new CourseSchedule object with the same details as this instance
   */
  copy(): CourseSchedule {
    // Use <array>.slice to create a copy of arrays instead of copying the reference
    const copy = new CourseSchedule();
    copy.components = this.components.slice();
    for (const [k, v] of this.components_by_day) {
      copy.components_by_day.set(k, v.slice());
    }
    copy.num_courses = this.num_courses;
    copy.num_courses_attempted = this.num_courses_attempted;
    copy.start_time = this.start_time;
    copy.end_time = this.end_time;
    copy.num_before_start_filter = this.num_before_start_filter;
    copy.num_after_end_filter = this.num_after_end_filter;
    copy.num_time_conflicts = this.num_time_conflicts;
    copy.num_lec_time_conflicts = this.num_lec_time_conflicts;
    copy.num_closed_components = this.num_closed_components;
    return copy;
  }

  /**
   * Attempts to add a set of components, representing a course configuration, to this schedule
   * @param course_components the set of components that represent a course configuration
   * @param filters the filters object to use when deciding whether or not to add the components
   * @returns true if the components were successfully added, false otherwise
   */
  addCourseConfiguration(
    course_components: CourseSectionComponent[],
    filters: ScheduleGenerateFilters = schedule_generate_filters_schema.parse({}),
  ): boolean {
    this.num_courses_attempted++;

    for (const component of course_components) {
      if (!this.addComponent(component, filters)) {
        return false;
      }
      if (
        filters.minimize_before_time !== undefined &&
        filters.minimize_before_time > component.start_timestamp
      ) {
        this.num_before_start_filter++;
      }
      if (
        filters.minimize_after_time !== undefined &&
        filters.minimize_after_time < component.end_timestamp
      ) {
        this.num_after_end_filter++;
      }
      if (component.status.toLowerCase() === 'closed') {
        this.num_closed_components++;
      }
    }

    this.num_courses++;

    return true;
  }

  /**
   * Increments the number of courses that were attempted to be added to this schedule by the provided amount
   * @param amount the amount to increment by
   */
  incrementNumCoursesAttempted(amount: number = 1): void {
    this.num_courses_attempted += Math.floor(amount);
  }

  /**
   * Returns a string representing a profile for this schedule.
   * This is used to uniquely identify and group schedules by down to the types of components at a specific time for a specific course.
   * This is used to group schedules with multiple of the same component at the same time. ex. schedules with more than one lab at the same time.
   * @returns A string representation of the schedule profile
   */
  getProfile(): string {
    let profile = '';
    let profile_items: string[];

    profile += this.num_before_start_filter.toString() + this.num_after_end_filter.toString();

    const days: string[] = Array.from(this.components_by_day.keys()).sort();
    days.sort();
    const appendValue = (val: string) => (profile += val);

    for (const day of days) {
      profile += day;
      profile_items = [];
      for (const c of this.components_by_day.get(day) ?? []) {
        profile_items.push(c.course.id + c.section.id + c.type + c.start_time);
      }
      profile_items.sort();
      profile_items.forEach(appendValue);
    }

    return profile;
  }

  /**
   * Checks whether the schedule satisfies the filter requirements
   * @param filters the filters object to use when deciding whether the schedule is valid
   * @returns true if the schedule meets the filter requirements, false otherwise
   */
  checkFilters(filters?: ScheduleGenerateFilters): boolean {
    if (!filters) {
      return true;
    }

    if (!filters.allow_closed_components && this.num_closed_components > 0) {
      return false;
    }

    for (const brk of filters.breaks) {
      for (const [, components] of this.components_by_day) {
        // Get all the components in the break range
        const components_in_range: CourseSectionComponent[] = [];
        components.forEach((c) => {
          if (c.end_timestamp > brk.start && c.start_timestamp < brk.end) {
            components_in_range.push(c);
          }
        });
        if (components_in_range.length) {
          components_in_range.sort(function (a, b) {
            return a.start_timestamp - b.start_timestamp;
          });
          let has_available_break = false;
          let period_start = brk.start;

          for (const c of components_in_range) {
            // Check for the break between the current period start time and the start time of the current component
            if (c.start_timestamp - period_start >= brk.size) {
              has_available_break = true;
              break;
            }
            // Shrink the period size to ignore components between its value and the current component end
            period_start = c.end_timestamp;
          }

          // If no break is already available and there is no break at the end, then fail the break filter
          if (!has_available_break && brk.end - period_start < brk.size) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Attempts to add a particular component to this schedule
   * @param component the component to be added
   * @param filters the filters object to use when deciding whether or not to add the component
   * @returns true if the component was successfully added to the schedule, false otherwise
   */
  private addComponent(
    component: CourseSectionComponent,
    filters: ScheduleGenerateFilters = schedule_generate_filters_schema.parse({}),
  ): boolean {
    // Check for closed components
    if (!filters.allow_closed_components && component.is_closed) {
      return false;
    }

    const day = `${component.course.year}${component.course.season}${component.day}`;

    if (this.components_by_day.has(day)) {
      // Check for conflicts
      for (const c of this.components_by_day.get(day) ?? []) {
        if (
          c.end_timestamp > component.start_timestamp &&
          c.start_timestamp < component.end_timestamp
        ) {
          // Conflict Detected
          switch (filters.allow_time_conflicts) {
            case 'NONE':
              return false;
            case 'NON_LEC':
              if (c.type === 'LEC' && component.type === 'LEC') {
                return false;
              }
            case 'ALL':
              this.num_time_conflicts++;
              break;
          }
        }
      }
    }

    // If the day has not been added to the schedule yet, then add it
    if (!this.components_by_day.has(day)) {
      this.components_by_day.set(day, []);
    }

    // If there was not a conflict, add the component
    this.components_by_day.get(day)?.push(component);
    this.components.push(component);

    if (isNaN(this.start_time) || component.start_timestamp < this.start_time) {
      this.start_time = component.start_timestamp;
    }

    if (isNaN(this.end_time) || component.end_timestamp > this.end_time) {
      this.end_time = component.end_timestamp;
    }

    return true;
  }
}
