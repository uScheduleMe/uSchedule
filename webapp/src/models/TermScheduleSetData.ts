import { CourseSchedule } from './CourseSchedule';
import { ScheduleFilterData } from './ScheduleFilterData';
import { Term } from './Term';

/**
 * This class is a model for a list of schedules for a particular term.
 */
export class TermScheduleSetData<T extends CourseSchedule = CourseSchedule> {
  /**
   * The version of this class
   */
  readonly VERSION = '1.0.0';

  /**
   * The term that the schedules are within
   */
  public term: Term;

  /**
   * The index of the currently selected schedule
   */
  public current_schedule_index: number;

  /**
   * Filter overrides used to generate this schedule
   */
  public filter_overrides: Partial<ScheduleFilterData>;

  /**
   * Whether the schedule generation limit was reached when generating the schedules
   */
  public limit_was_reached: boolean;

  /**
   * The list of schedules for the term
   */
  public schedules: T[];

  /**
   * Create a new CourseSchedule by passing it the plain data acquired from the DataAccess layer.
   *
   * @param schedules the list of schedules for the term.
   * @param term the term that the schedules are within
   */
  constructor(schedules: T[], term: Term, limit_was_reached: boolean = false) {
    this.schedules = schedules;
    this.term = term;
    this.current_schedule_index = 0;
    this.filter_overrides = {};
    this.limit_was_reached = limit_was_reached;
  }

  /**
   * Used to sort TermScheduleSetData objects by time of their Terms
   * @param a a TermScheduleSetData
   * @param b a TermScheduleSetData
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByTermDate(a: TermScheduleSetData, b: TermScheduleSetData): number {
    return Term.compareByDate(a.term, b.term);
  }

  /**
   * Used to sort TermScheduleSetData objects by time of their Terms in REVERSE order
   * @param a a TermScheduleSetData
   * @param b a TermScheduleSetData
   * @return negative if b < a, positive if b > a, else 0
   */
  public static compareByTermDateReverse(a: TermScheduleSetData, b: TermScheduleSetData): number {
    return Term.compareByDate(b.term, a.term);
  }
}
