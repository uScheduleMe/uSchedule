import { Course } from './Course';
import { CourseSectionComponent } from './CourseSectionComponent';
import { CourseSectionSchema } from '@services/Scheduler/schemas';

export type CourseSectionId = string;

/**
 * This class is a model for a Course Section.
 * It contains course components.
 */
export class CourseSection {
  /**
   * The version of this class
   */
  readonly VERSION = '1.0.0';

  /**
   * A unique identifier for the section
   */
  public id: CourseSectionId;

  /**
   * A reference to the parent Course object
   */
  public course: Course;

  /**
   * The section label used for human identification of the section
   */
  public label: string;

  /**
   * The instructor(s) for the lecture components of the section
   */
  public instructor: string;

  /**
   * Details of the content in the section
   */
  public description: string;

  /**
   * A map of the components in this section.
   * The map key is the component id, the value is a CourseSectionComponent object.
   */
  public components: Map<string, CourseSectionComponent>;

  /**
   * A map of the components in this section.
   * The map key is the component type, the value is a CourseSectionComponent array object.
   */
  public components_by_type: Map<string, CourseSectionComponent[]>;

  /**
   * Indicates if the section is included in the course selection
   */
  public included: boolean;

  /**
   * Create a new CourseSection by passing it the plain data acquired from the DataAccess layer.
   * @param course A reference to the parent Course object
   * @param data A plain JavaScript object or JSON string containing the section data
   */
  constructor(course: Course, data: CourseSectionSchema) {
    // Initialize instance variables
    this.components = new Map<string, CourseSectionComponent>();
    this.components_by_type = new Map<string, CourseSectionComponent[]>();

    // Import the data
    this.course = course;
    this.id = data.id;
    this.label = data.label;
    this.instructor = data.instructor;
    this.description = data.description;
    this.included = true;

    // Convert and import the sections
    for (const id in data.components) {
      if (!data.components.hasOwnProperty(id)) {
        continue;
      }
      const component: CourseSectionComponent = new CourseSectionComponent(
        this,
        data.components[id],
      );
      this.components.set(id, component);
      if (!this.components_by_type.has(component.type)) {
        this.components_by_type.set(component.type, []);
      }
      this.components_by_type.get(component.type)?.push(component);
    }
  }

  toJSON() {
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

  getComponent(key: string): CourseSectionComponent | undefined {
    return this.components.get(key);
  }

  /**
   * Used to sort CourseSection objects by comparing their labels
   * @param a a CourseSection
   * @param b a CourseSection
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareByLabel(a: CourseSection, b: CourseSection): number {
    return a.label.localeCompare(b.label);
  }
}
