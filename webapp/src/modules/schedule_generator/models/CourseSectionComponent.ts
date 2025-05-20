import CourseSection from './CourseSection';
import { CourseSectionComponentData } from './types';

export default class CourseSectionComponent implements CourseSectionComponentData {
  readonly id: CourseSectionComponentData['id'];

  readonly is_closed: CourseSectionComponentData['is_closed'];

  readonly type: CourseSectionComponentData['type'];

  readonly day: CourseSectionComponentData['day'];

  readonly start_date: CourseSectionComponentData['start_date'];

  readonly end_date: CourseSectionComponentData['end_date'];

  readonly start_time: CourseSectionComponentData['start_time'];

  readonly end_time: CourseSectionComponentData['end_time'];

  /**
   * A reference to the parent CourseSection object
   */
  readonly section: Readonly<CourseSection>;

  /**
   * Create a new CourseSectionComponent by passing it the plain data acquired from the DataAccess layer.
   * @param section A reference to the parent CourseSection object
   * @param data A plain JavaScript object or JSON string containing the component data
   */
  constructor(section: Readonly<CourseSection>, data: Readonly<CourseSectionComponentData>) {
    this.section = section;

    this.id = data.id;
    this.is_closed = data.is_closed;
    this.type = data.type;
    this.day = data.day;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
  }

  /**
   * A reference to the grandparent Course object
   */
  get course() {
    return this.section.course;
  }

  /**
   * Returns the globally unique ID for this component (within the context of all the timetable entries)
   */
  get guid(): string {
    return `${this.course.id}-${this.section.id}-${this.id}`;
  }
}
