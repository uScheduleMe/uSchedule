import { ScheduleGenerateFilters, schedule_generate_filters_schema } from '../schemas';
import ScheduleComponent from './ScheduleComponent';

export default class Schedule {
  /**
   * The list of components that make up this schedule, grouped by day
   * The day is the 'day of the term', meaning it is a string containing
   *   the year, term and day of week for the component
   */
  readonly components_by_day = new Map<string, Readonly<ScheduleComponent>[]>();

  /**
   * The number of courses successfully added to the schedule
   */
  num_courses = 0;

  /**
   * The number of courses attempted to be added to the schedule
   */
  num_courses_attempted = 0;

  /**
   * The number of components with a start time before the start time filter
   */
  num_before_start_filter = 0;

  /**
   * The number of components with an end time before the end time filter
   */
  num_after_end_filter = 0;

  /**
   * The list of components that make up this schedule
   */
  get components(): Readonly<Readonly<ScheduleComponent>[]> {
    return [...this.components_by_day.values()].flat();
  }

  /**
   * Create a deep copy of the CourseSchedule object
   * @returns a new CourseSchedule object with the same details as this instance
   */
  copy(): Schedule {
    const copy = new Schedule();
    for (const [k, v] of this.components_by_day) {
      copy.components_by_day.set(k, [...v]);
    }
    copy.num_courses = this.num_courses;
    copy.num_courses_attempted = this.num_courses_attempted;
    copy.num_before_start_filter = this.num_before_start_filter;
    copy.num_after_end_filter = this.num_after_end_filter;
    return copy;
  }

  /**
   * Attempts to add a set of components, representing a course configuration, to this schedule
   * @param schedule_components the set of components that represent a course configuration
   * @param filters the filters object to use when deciding whether or not to add the components
   * @returns true if the components were successfully added, false otherwise
   */
  addCourseConfiguration(
    schedule_components: Readonly<ScheduleComponent[]>,
    filters: Readonly<ScheduleGenerateFilters> = schedule_generate_filters_schema.parse({}),
  ): boolean {
    this.num_courses_attempted++;

    for (const component of schedule_components) {
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
    }

    if (!this.checkBreakFilter(filters)) {
      return false;
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
   * Attempts to add a particular component to this schedule
   * @param component the component to be added
   * @param filters the filters object to use when deciding whether or not to add the component
   * @returns true if the component was successfully added to the schedule, false otherwise
   */
  private addComponent(
    component: ScheduleComponent,
    filters: Readonly<ScheduleGenerateFilters>,
  ): boolean {
    // Check closed component filter
    if (!filters.allow_closed_components && component.all_are_closed) {
      return false;
    }

    // The checks below here are all for the time-overlap rules

    const day = `${component.term.year}${component.term.season}${component.day_of_week}`;
    const day_components = this.components_by_day.get(day);

    if (!day_components) {
      // If the day has not been added to the schedule yet, then add it with the component
      this.components_by_day.set(day, [component]);
      return true;
    }

    if (filters.allow_time_conflicts === 'ALL') {
      day_components.push(component);
      return true;
    }

    for (const other_component of day_components) {
      // If there is no time overlap, we don't need to check the other conditions for this component
      if (!component.hasTimeOverlap(other_component)) {
        continue;
      }

      switch (filters.allow_time_conflicts) {
        case 'NONE':
          return false;
        case 'NON_LEC':
          if (other_component.type === 'LEC' && component.type === 'LEC') {
            return false;
          }
          continue;
      }
    }

    day_components.push(component);
    return true;
  }

  /**
   * Checks whether the schedule allows for the requested breaks
   * @param filters the filters object to use when deciding whether the schedule is valid
   * @returns true if the schedule meets the filter requirements, false otherwise
   */
  private checkBreakFilter(filters: Readonly<ScheduleGenerateFilters>): boolean {
    for (const brk of filters.breaks) {
      for (const components of this.components_by_day.values()) {
        const components_in_range = components.filter(
          (c) => c.end_timestamp > brk.start && c.start_timestamp < brk.end,
        );

        if (components_in_range.length) {
          components_in_range.sort((a, b) => a.start_timestamp - b.start_timestamp);
          let period_start = brk.start;

          for (const c of components_in_range) {
            // Check for the break between the current period start time and the start time of the current component
            if (c.start_timestamp - period_start >= brk.size) {
              // If a break exists here, break to go to the next day to check
              break;
            }
            // Shrink the period size to ignore components between its value and the current component end
            period_start = c.end_timestamp;
          }

          // If no break is found yet and there is no break at the end, then fail the break filter
          if (brk.end - period_start < brk.size) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
