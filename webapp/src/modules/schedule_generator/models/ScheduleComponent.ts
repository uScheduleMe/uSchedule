import { time24HrToTimestamp } from '../utils';
import CourseSectionComponent from './CourseSectionComponent';

export default class ScheduleComponent {
  /**
   * The set of components (alternates for each other)
   */
  readonly components: CourseSectionComponent[] = [];

  private _all_are_closed = true;

  /**
   * Whether all the course components in the schedule component are closed
   */
  get all_are_closed() {
    return this._all_are_closed;
  }

  /**
   * The component start time in seconds since the Unix Epoch
   */
  readonly start_timestamp: number;

  /**
   * The component end time in in seconds since the Unix Epoch
   */
  readonly end_timestamp: number;

  /**
   * The string to use for grouping the component with overlapping components.
   */
  private readonly _schedule_component_id: string;

  /**
   * Create a new ScheduleComponent with an initial course component, which determines the
   * type, day of week, start time and end time. This class represents a component of a schedule.
   * It wraps at least one course component; but it can also wrap alternates for the course
   * component. An alternate is a course component which has the same type, day of week,
   * start time and end time.
   * @param component the initial course component
   */
  constructor(component: Readonly<CourseSectionComponent>) {
    this.start_timestamp = time24HrToTimestamp(component.start_time);
    this.end_timestamp = time24HrToTimestamp(component.end_time);
    this._schedule_component_id = ScheduleComponent.getScheduleComponentId(component);
    this.addCourseComponent(component);
  }

  /**
   * Add an alternate course component to the schedule component
   * @throws an error if the component does not have the same schedule_component_id (the same type, day of week, start time and end time)
   * @param component the course component to add
   */
  addCourseComponent(component: Readonly<CourseSectionComponent>) {
    const other_schedule_component_id = ScheduleComponent.getScheduleComponentId(component);

    if (
      this.components.length &&
      (this._schedule_component_id !== other_schedule_component_id ||
        this.components[0].course !== component.course ||
        this.components[0].section !== component.section)
    ) {
      throw new Error('Unable to add component to section because it is an invalid alternate');
    }

    this.components.push(component);
    if (!component.is_closed) {
      this._all_are_closed = false;
    }
  }

  /**
   * Determines whether two components overlap in time. If the start of this component is equal to
   * the end of the other (and visa versa) then they are considered to NOT overlap.
   * Note: This only checks the times and not the day.
   * @param other another component to compare against
   * @returns true if the components have a time overlap, false otherwise
   */
  hasTimeOverlap(other: Readonly<ScheduleComponent>) {
    return other.end_timestamp > this.start_timestamp && other.start_timestamp < this.end_timestamp;
  }

  get type() {
    return this.components[0].type;
  }

  get day_of_week() {
    return this.components[0].day;
  }

  get term() {
    return this.components[0].course.term;
  }

  /**
   * Creates the string to use for grouping the component with overlapping components.
   * It will be the same for components with the same type, day of week, start time and end time.
   * @param component the component to generate the id for
   */
  static getScheduleComponentId(component: CourseSectionComponent) {
    return `${component.type}${component.start_time}${component.day}${component.end_time}`;
  }
}
