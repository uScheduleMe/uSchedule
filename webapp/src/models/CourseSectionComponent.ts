/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CourseSection } from './CourseSection';
import { Course } from './Course';
import { CourseSectionComponentSchema } from '@services/Scheduler/schemas';

export type CourseSectionComponentId = string;

/**
 * This class is a model for a Course Section Component.
 */
export class CourseSectionComponent {
  /**
   * The version of this class
   */
  readonly VERSION = '1.0.0';

  /**
   * The format to use when parsing date/time strings with moment
   */
  readonly DATE_TIME_INPUT_FORMAT = 'YYYY-MM-DD hh:mm:ss Z';

  /**
   * A unique identifier for the component
   */
  public id: CourseSectionComponentId;

  /**
   * The globally unique identifier for the section.
   */
  public guid: string;

  /**
   * A reference to the grandparent Course object
   */
  public course: Course;

  /**
   * A reference to the parent CourseSection object
   */
  public section: CourseSection;

  /**
   * The component label used for human identification of the component
   */
  public label: string;

  /**
   * The component status, usually 'open' or 'closed'
   */
  public status: string;

  /**
   * The component type, usually 'LEC', 'DGD', 'TUT' or 'LAB'
   */
  public type: string;

  /**
   * The day of the week for this component [ 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA' ]
   */
  public day: string;

  /**
   * The index of the day of the week for this component [ 0, 1, 2, 3, 4, 5, 6 ]
   */
  public day_idx: number;

  /**
   * The component start time in 24 hour format
   * ex. 14:30
   */
  public start_time: string;

  /**
   * The component start time in 12 hour format
   * ex. 2:30 pm
   */
  public start_time_12hr: string;

  /**
   * The component end time in 24 hour format
   * ex. 15:50
   */
  public end_time: string;

  /**
   * The component end time in 12 hour format
   * ex. 3:50 pm
   */
  public end_time_12hr: string;

  /**
   * The component start time in unix timestamp format
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  public start_timestamp: number;

  /**
   * The component end time in unix timestamp format
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  public end_timestamp: number;

  /**
   * The component start date
   * ex. 2020-01-06
   */
  public start_date: string;

  /**
   * The component end date
   * ex. 2020-04-04
   */
  public end_date: string;

  /**
   * The building address and room number describing the location of this component
   * ex. 100 Louis Pasteur (CRX) C140
   */
  public room: string;

  /**
   * The name of the component instructor (professor)
   * ex. John Smith
   */
  public instructor: string;

  /**
   * The session type of the component
   * ex. FullSess
   */
  public session_type: string;

  /**
   * Details of the content in the component
   */
  public description: string;

  /**
   * Create a new CourseSectionComponent by passing it the plain data acquired from the DataAccess layer.
   * @param section A reference to the parent CourseSection object
   * @param data A plain JavaScript object or JSON string containing the component data
   */
  public constructor(section: CourseSection, data: CourseSectionComponentSchema) {
    // Import the data
    this.course = section.course;
    this.section = section;
    this.id = data.id;
    this.guid = data.guid;
    this.label = data.label;
    this.status = data.status.toLowerCase();
    this.type = data.type;
    this.day = data.day;
    this.day_idx = this.getDayIdx();
    this.start_timestamp = data.start_timestamp;
    this.end_timestamp = data.end_timestamp;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.start_time_12hr = data.start_time_12hr;
    this.end_time_12hr = data.end_time_12hr;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.room = data.room;
    this.instructor = data.instructor;
    this.session_type = data.session_type;
    this.description = data.description;
  }

  toJSON() {
    const output = {
      id: this.id,
      label: this.label,
      status: this.status,
      type: this.type,
      day: this.day,
      start_time: this.start_time,
      end_time: this.end_time,
      start_date: this.start_date,
      end_date: this.end_date,
      room: this.room,
      instructor: this.instructor,
      session_type: this.session_type,
      description: this.description,
    };
    return output;
  }

  /**
   * Convert the day of the week into numerical format
   * @returns the number of the day of the week
   */
  private getDayIdx(): number {
    switch (this.day) {
      case 'SU':
        return 0;
      case 'MO':
        return 1;
      case 'TU':
        return 2;
      case 'WE':
        return 3;
      case 'TH':
        return 4;
      case 'FR':
        return 5;
      case 'SA':
        return 6;
      default:
        return -1;
    }
  }

  /**
   * Returns all components of the same type, in the same section, on the same day, and starting at the same time
   *    as the current component; including the current component.
   * @returns a list of components matching the listed criteria
   */
  public getAlternates(): CourseSectionComponent[] {
    return (
      this.section.components_by_type
        .get(this.type)
        ?.filter(
          (c) =>
            this.start_timestamp === c.start_timestamp &&
            this.end_timestamp === c.end_timestamp &&
            this.day_idx === c.day_idx,
        ) ?? []
    );
  }

  /**
   * Determine is the component has non 'open' status
   * @return true if the component is not open, false otherwise
   */
  public isNotOpen(): boolean {
    return this.status !== 'open';
  }

  /**
   * Determine is the component has a closed status
   * @return true if the component is closed, false otherwise
   */
  public isClosed(): boolean {
    return this.status === 'closed';
  }

  /**
   * Used to sort CourseSectionComponent objects by comparing their labels
   * @param a a CourseSectionComponent
   * @param b a CourseSectionComponent
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByLabel(a: CourseSectionComponent, b: CourseSectionComponent): number {
    return a.label.localeCompare(b.label);
  }

  /**
   * Used to sort CourseSectionComponent objects by comparing their course and label
   * @param a a CourseSectionComponent
   * @param b a CourseSectionComponent
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByCourseAndLabel(
    a: CourseSectionComponent,
    b: CourseSectionComponent,
  ): number {
    const a_sort_key: string = a.course.subject_code + a.course.course_code + a.label;
    const b_sort_key: string = b.course.subject_code + b.course.course_code + b.label;
    return a_sort_key.localeCompare(b_sort_key);
  }

  public isOverlapping(other: CourseSectionComponent): boolean {
    return other.end_timestamp > this.start_timestamp && other.start_timestamp < this.end_timestamp;
  }
}
