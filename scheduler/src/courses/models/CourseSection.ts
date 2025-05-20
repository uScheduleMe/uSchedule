import Course from './Course';
import CourseSectionComponent from './CourseSectionComponent';
import { CourseSectionData } from '@services/DataAccess';
import { PlainCourseSection } from '../schemas';

/**
 * This class is a model for a Course Section.
 * It contains course components.
 */
export default class CourseSection {
  /**
   * A unique identifier for the section
   */
  id: string;

  /**
   * A reference to the parent Course object
   */
  course: Course;

  /**
   * The section label used for human identification of the section
   */
  label: string;

  /**
   * The instructor(s) for the lecture components of the section
   */
  instructor: string;

  /**
   * Details of the content in the section
   */
  description: string;

  /**
   * A map grouping the components by their type.
   * The map key is the component type, the value is a map of CourseSectionComponent objects
   *   with the key being the component id.
   */
  components_by_type = new Map<string, Map<string, CourseSectionComponent>>();

  /**
   * A map of the components in this section.
   * The map key is the component id, the value is a CourseSectionComponent object.
   */
  components = new Map<string, CourseSectionComponent>();

  /**
   * Create a new CourseSection by passing it the plain data acquired from the DataAccess layer.
   * @param course A reference to the parent Course object
   * @param data A plain JavaScript object or JSON string containing the section data
   */
  constructor(course: Course, data: CourseSectionData) {
    // Import the data
    this.course = course;
    this.id = data.id;
    this.label = data.label;
    this.instructor = data.instructor;
    this.description = data.description;

    // Convert and import the sections
    for (const id in data.components) {
      if (!data.components.hasOwnProperty(id)) {
        continue;
      }
      const component = new CourseSectionComponent(this, data.components[id]);
      // Validate the component before adding it
      if (component.validate()) {
        this.components.set(id, component);
        if (!this.components_by_type.has(component.type)) {
          this.components_by_type.set(component.type, new Map<string, CourseSectionComponent>());
        }
        this.components_by_type.get(component.type)?.set(id, component);
      }
    }
  }

  /**
   * Convert the course into a plain JavaScript object to be sent to a client via JSON.
   * This method is automatically used by JSON.stringify() to convert objects to JSON.
   * @returns a plain JavaScript object representing this course section
   */
  toJSON(): PlainCourseSection {
    const output = {
      course_id: this.course.id,
      id: this.id,
      label: this.label,
      instructor: this.instructor,
      description: this.description,
      num_components: this.components.size,
      components: Object.fromEntries(Array.from(this.components, ([id, c]) => [id, c.toJSON()])),
    };
    return output;
  }

  /**
   * Removes a component from the section
   * @param component the component object to be removed
   */
  removeComponent(component: CourseSectionComponent): void {
    this.components.delete(component.id);
    this.components_by_type.get(component.type)?.delete(component.id);
    if (!this.components_by_type.get(component.type)?.size) {
      this.components_by_type.delete(component.type);
    }
  }

  /**
   * Removes components from this section where the component id is not in the provided list
   * @param ids The ids of the components
   */
  filterComponents(ids: string[]): void {
    for (const component of this.components.values()) {
      if (!ids.includes(component.id)) {
        this.removeComponent(component);
      }
    }
  }
}
