import CourseSection from './CourseSection';
import Course from './Course';
import moment from 'moment';
import { CourseSectionComponentData } from '@services/DataAccess';
import { PlainCourseSectionComponent } from '../schemas';

/**
 * This class is a model for a Course Section Component.
 */
export default class CourseSectionComponent {
  /**
   * The format to use when parsing date/time strings with moment
   */
  readonly DATE_TIME_INPUT_FORMAT = 'YYYY-MM-DD hh:mm:ss Z';

  /**
   * A unique identifier for the section
   */
  id: string;

  /**
   * A reference to the grandparent Course object
   */
  course: Course;

  /**
   * A reference to the parent CourseSection object
   */
  section: CourseSection;

  /**
   * The component label used for human identification of the component
   */
  label: string;

  /**
   * The component status, usually OPEN or CLOSED
   */
  status: string;

  /**
   * The component type, usually LEC, DGD, TUT or LAB
   */
  type: string;

  /**
   * The day of the week for this component [ SU, MO, TU, WE, TH, FR, SA ]
   */
  day: string;

  /**
   * The component start time in 24 hour format
   * ex. 14:30
   */
  start_time: string;

  /**
   * The component start time in 12 hour format
   * ex. 2:30 pm
   */
  start_time_12hr: string;

  /**
   * The component end time in 24 hour format
   * ex. 15:50
   */
  end_time: string;

  /**
   * The component end time in 12 hour format
   * ex. 3:50 pm
   */
  end_time_12hr: string;

  /**
   * The component start time in unix timestamp format
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  start_timestamp: number;

  /**
   * The component end time in unix timestamp format
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  end_timestamp: number;

  /**
   * The component start date
   * ex. 2020-01-06
   */
  start_date: string;

  /**
   * The component end date
   * ex. 2020-04-04
   */
  end_date: string;

  /**
   * The building address and room number describing the location of this component
   * ex. 100 Louis Pasteur (CRX) C140
   */
  room: string;

  /**
   * The name of the component instructor (professor)
   * ex. John Smith
   */
  instructor: string;

  /**
   * The session type of the component
   * ex. FullSess
   */
  session_type: string;

  /**
   * Details of the content in the component
   */
  description: string;

  /**
   * Whether the component data passed the validation
   */
  is_valid: boolean | null = null;

  /**
   * Create a new CourseSectionComponent by passing it the plain data acquired from the DataAccess layer.
   * @param section A reference to the parent CourseSection object
   * @param data A plain JavaScript object or JSON string containing the component data
   */
  constructor(section: CourseSection, data: CourseSectionComponentData) {
    // Create moment instances for the start and end times
    const start_dt = moment.utc(
      `1970-01-01 ${data.start_time}:00 +00:00`,
      this.DATE_TIME_INPUT_FORMAT,
    );
    const end_dt = moment.utc(`1970-01-01 ${data.end_time}:00 +00:00`, this.DATE_TIME_INPUT_FORMAT);

    // Import the data
    this.course = section.course;
    this.section = section;
    this.id = data.id.toString();
    this.label = data.label;
    this.status = data.status;
    this.type = data.type;
    this.day = data.day;
    this.start_timestamp = start_dt.unix();
    this.end_timestamp = end_dt.unix();
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.start_time_12hr = start_dt.format('h:mm a');
    this.end_time_12hr = end_dt.format('h:mm a');
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.room = data.room;
    this.instructor = data.instructor || 'Unknown';
    this.session_type = data.session_type;
    this.description = data.description;
  }

  /**
   * Returns the globally unique ID for this component (within the context of all the timetable entries)
   * @returns a string containing the id
   */
  get guid(): string {
    return `${this.course.id}-${this.section.id}-${this.id}`;
  }

  /**
   * Whether or not the status of the component is closed.
   */
  get is_closed(): boolean {
    return this.status.toLowerCase() === 'closed';
  }

  /**
   * Convert the component into a plain JavaScript object to be sent to a client via JSON.
   * This method is automatically used by JSON.stringify() to convert objects to JSON.
   * @returns a plain JavaScript object representing this course section component
   */
  toJSON(): PlainCourseSectionComponent {
    const output = {
      course_id: this.course.id,
      section_id: this.section.id,
      id: this.id,
      guid: this.guid,
      label: this.label,
      status: this.status,
      type: this.type,
      day: this.day,
      start_timestamp: this.start_timestamp,
      start_time: this.start_time,
      start_time_12hr: this.start_time_12hr,
      end_timestamp: this.end_timestamp,
      end_time: this.end_time,
      end_time_12hr: this.end_time_12hr,
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
   * Validates some critical data in the component to reject components with bad data
   * @returns true if the component data is valid, false otherwise
   */
  validate(): boolean {
    if (this.is_valid !== null) {
      return this.is_valid;
    }
    this.is_valid = true;
    const valid_day_formats: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    if (!valid_day_formats.includes(this.day)) {
      this.is_valid = false;
    }
    return this.is_valid;
  }
}
