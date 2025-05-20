import { CourseSectionComponent } from './CourseSectionComponent';
import { CourseSkeleton } from '@services/Scheduler/types';
import { Course } from './Course';

// Define default start and end times for a schedule with no components
const SECONDS_FOR_1000_HRS = 36000;
const SECONDS_FOR_1400_HRS = 50400;

/**
 * This class is a model for a Schedule.
 * It contains meta data about the schedule and a list of course components which comprise the schedule.
 */
export class CourseSchedule {
  /**
   * The version of this class
   */
  readonly VERSION = '1.0.0';

  /**
   * The start time in unix timestamp format of the earliest starting component in the schedule
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  public start_timestamp: number;

  /**
   * The end time in unix timestamp format of the latest ending component in the schedule
   * It is an absolute timestamp on the first day of the Unix Epoch in UTC (1970-01-01)
   */
  public end_timestamp: number;

  /**
   * A map linking a course id to it's view id
   */
  public view_ids: Map<Course['id'], number>;

  /**
   * The components that make up this schedule.
   * The map key is the component guid, the value is a CourseSectionComponent object.
   */
  public components: Map<CourseSectionComponent['guid'], CourseSectionComponent>;

  /**
   * A two dimensional array of the days of the week and their components
   */
  public components_per_day: [
    su: CourseSectionComponent[],
    mo: CourseSectionComponent[],
    tu: CourseSectionComponent[],
    we: CourseSectionComponent[],
    th: CourseSectionComponent[],
    fr: CourseSectionComponent[],
    sa: CourseSectionComponent[],
  ];

  /**
   * Create a new CourseSchedule by passing it the plain data acquired from the DataAccess layer.
   *
   * @param components a map from component guid to CourseSectionComponent.
   * @param view_ids a map from guid to view_id.
   * @param meta A plain JavaScript object or JSON string containing the schedule meta data
   */
  constructor(
    components: Readonly<Map<CourseSectionComponent['guid'], CourseSectionComponent>> = new Map(),
    view_ids: Map<Course['id'], number> = new Map(),
  ) {
    this.components = components;
    this.view_ids = view_ids;
    this.components_per_day = [[], [], [], [], [], [], []];
    components.forEach((c) => this.components_per_day[c.day_idx].push(c));

    // Set defaults
    this.start_timestamp = SECONDS_FOR_1000_HRS;
    this.end_timestamp = SECONDS_FOR_1400_HRS;

    if (components.size) {
      this.setStartAndEndTimesUsingComponents();
    }
  }

  /**
   * Gets a component from the schedule by its guid
   * @param guid the guid of the component
   * @return the component object or undefined if the guid is not in the schedule
   */
  public getComponent(guid: CourseSectionComponent['guid']): CourseSectionComponent | undefined {
    return this.components.get(guid);
  }

  /**
   * Removes a component from the schedule and replaces it with a new one
   * @param remove the component to be removed from the schedule
   * @param add the component to be added in place of the remove component
   * @return true if the component exists and was replaced, false if it did not exist in the schedule
   */
  public swapComponents(remove: CourseSectionComponent, add: CourseSectionComponent): boolean {
    if (remove.guid === add.guid) {
      return false;
    }
    const existed: boolean = this.components.delete(remove.guid);
    if (existed) {
      this.components.set(add.guid, add);
    }
    return existed;
  }

  /**
   * Returns a list of components that have time conflicts with the provided component,
   *     if any (including the provided component).
   * @returns a list of components with time conflicts
   */
  public getConflicts(component: CourseSectionComponent): CourseSectionComponent[] {
    return this.components_per_day[component.day_idx]
      .filter((other) => component.isOverlapping(other))
      .sort(CourseSectionComponent.compareByCourseAndLabel);
  }

  /**
   * Get the payload to submit when downloading this schedule as a file
   * @return a list of DownloadCoursesPayloadItem which can be submitted to the api vie the service helper
   */
  public getCourseSkeletons(): CourseSkeleton[] {
    const courses = new Map<Course['id'], CourseSkeleton>();

    for (const c of Array.from(this.components.values())) {
      let course = courses.get(c.course.id);
      // If the course has not been added yet, create and add it
      if (!course) {
        course = {
          id: c.course.id,
          sections: {},
        };
        courses.set(c.course.id, course);
      }
      // If the section has not been added yet, create and add it
      if (!course.sections[c.section.id]) {
        course.sections[c.section.id] = [];
      }
      // Add the component id to the list within its course and section
      course.sections[c.section.id].push(c.id);
    }

    return Array.from(courses.values());
  }

  /**
   * Gets the view id for a given component within the context of this schedule
   * @param c the CourseSectionComponent to find the view id for
   * @return the view id
   */
  public getViewId(c: CourseSectionComponent): number {
    return this.view_ids.get(c.course.id) ?? 0;
  }

  /**
   * Set the start and end timestamps by finding the earliest start time and latest end time amongst
   * all the components.
   */
  private setStartAndEndTimesUsingComponents() {
    this.start_timestamp = Number.POSITIVE_INFINITY;
    this.end_timestamp = Number.NEGATIVE_INFINITY;

    this.components.forEach((c) => {
      if (c.start_timestamp < this.start_timestamp) {
        this.start_timestamp = c.start_timestamp;
      }
      if (c.end_timestamp > this.end_timestamp) {
        this.end_timestamp = c.end_timestamp;
      }
    });
  }
}
