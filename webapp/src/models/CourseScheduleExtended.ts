import { CourseSectionComponent } from './CourseSectionComponent';
import { ScheduleSchemaExtended } from '@services/Scheduler/schemas';
import { Term } from './Term';
import { CourseSchedule } from './CourseSchedule';
import { Course } from './Course';

/**
 * This class is a model for a Schedule with extended attributes that are not used in the schedule generator.
 */
export class CourseScheduleExtended extends CourseSchedule {
  /**
   * The database id of the schedule
   */
  public id: number;

  /**
   * Whether the schedule is in the user calendar or is a draft
   */
  public in_calendar: boolean;

  /**
   * The user-defined name of the schedule
   */
  public name: string;

  /**
   * The term of the courses in this schedule
   */
  public term: Term;

  /**
   * Create a new CourseSchedule by passing it the plain data acquired from the DataAccess layer.
   *
   * @param components a map from component guid to CourseSectionComponent.
   * @param view_ids a map from guid to view_id.
   * @param data A plain JavaScript object or JSON string containing the extended Course Schedule data
   */
  constructor(
    components?: Map<CourseSectionComponent['guid'], CourseSectionComponent>,
    view_ids?: Map<Course['id'], number>,
    data: ScheduleSchemaExtended = {} as ScheduleSchemaExtended,
  ) {
    super(components, view_ids);
    this.id = data.id;
    this.in_calendar = data.in_calendar ?? false;
    this.name = data.name ?? '';
    this.term = new Term(data.term.year, data.term.season);
  }

  /**
   * Used to sort CourseScheduleExtended objects by time of their Terms
   * @param a a CourseScheduleExtended
   * @param b a CourseScheduleExtended
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByTermDate(a: CourseScheduleExtended, b: CourseScheduleExtended): number {
    return Term.compareByDate(a.term, b.term);
  }

  /**
   * Used to sort CourseScheduleExtended objects by time of their Terms in REVERSE order
   * @param a a CourseScheduleExtended
   * @param b a CourseScheduleExtended
   * @return negative if b < a, positive if b > a, else 0
   */
  public static compareByTermDateReverse(
    a: CourseScheduleExtended,
    b: CourseScheduleExtended,
  ): number {
    return Term.compareByDate(b.term, a.term);
  }
}
