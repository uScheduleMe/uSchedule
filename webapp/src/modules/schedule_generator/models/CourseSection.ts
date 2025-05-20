import ScheduleComponent from './ScheduleComponent';
import Course from './Course';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseSectionData } from './types';

export default class CourseSection implements CourseSectionData {
  readonly id: CourseSectionData['id'];

  /**
   * A reference to the parent Course object
   */
  readonly course: Readonly<Course>;

  /**
   * A map of the components in this section.
   * The map key is the component id, the value is a CourseSectionComponent object.
   */
  readonly components = new Map<string, Readonly<CourseSectionComponent>>();

  /**
   * The pre-grouping of course components with alternative components
   * (ones with the same type, day of week, start time and end time)
   */
  private _schedule_components_by_type: Map<
    CourseSectionComponent['type'],
    ScheduleComponent[]
  > | null = null;

  /**
   * Create a new CourseSection
   * @param course A reference to the parent course object
   * @param data The particular section data
   * @param components A list of child child components
   */
  constructor(
    course: Readonly<Course>,
    data: Readonly<CourseSectionData>,
    components: CourseSectionComponent[] = [],
  ) {
    this.course = course;
    this.id = data.id;

    for (const component of components) {
      this.addComponent(component);
    }
  }

  /**
   * Adds a component to the section
   * @param component the component object to be added
   */
  addComponent(component: Readonly<CourseSectionComponent>): void {
    this.components.set(component.id, component);
  }

  /**
   * Removes a component from the section
   * @param component the component object to be removed
   */
  removeComponent(component: Readonly<CourseSectionComponent>): void {
    this.components.delete(component.id);
  }

  /**
   * Removes components from this section where the component id is not in the provided list
   * @param ids The ids of the components
   */
  filterComponents(ids: Readonly<string[]>): void {
    for (const component of this.components.values()) {
      if (!ids.includes(component.id)) {
        this.removeComponent(component);
      }
    }
  }

  /**
   * Group courses with their alternates by type, day of week, start time and end time
   * @returns the the schedule components as a map from component type to list of components
   */
  getScheduleComponents(): Map<CourseSectionComponent['type'], ScheduleComponent[]> {
    if (this._schedule_components_by_type) {
      return this._schedule_components_by_type;
    }
    const schedule_component_by_id = new Map<string, ScheduleComponent>();

    // Group course components into schedule components by their schedule_component_id
    for (const c of this.components.values()) {
      const id = ScheduleComponent.getScheduleComponentId(c);
      const schedule_component = schedule_component_by_id.get(id);

      if (schedule_component) {
        schedule_component.addCourseComponent(c);
      } else {
        schedule_component_by_id.set(id, new ScheduleComponent(c));
      }
    }

    this._schedule_components_by_type = new Map();

    // Group schedule components by their course component type
    for (const c of schedule_component_by_id.values()) {
      const schedule_component_set = this._schedule_components_by_type.get(c.type);
      if (schedule_component_set) {
        schedule_component_set.push(c);
      } else {
        this._schedule_components_by_type.set(c.type, [c]);
      }
    }

    return this._schedule_components_by_type;
  }
}
