import { CourseSection } from './CourseSection';
import { CourseSectionComponent } from './CourseSectionComponent';
import { CourseSchema } from '@services/Scheduler/schemas';

/**
 * Course Meta Object representing user selected courses to be passed to the schedule generator
 * Gets passed directly to the backend.
 */
export interface CourseMeta {
  /**
   * The id of the course
   */
  id: Course['id'];

  /**
   * The id's of the sections to include in the schedules (uses all if this is not provided)
   */
  sections?: Array<CourseSection['id']>;

  /**
   * Whether or not the course is mandatory as part of the generated schedules.
   */
  is_mandatory?: boolean;
}

export type CourseConfigurationSignature = string;

/**
 * This class is a model for a Course.
 * It contains sections, which contain course components.
 */
export class Course {
  /**
   * The version of this class
   */
  readonly VERSION = '1.0.0';

  /**
   * A unique identifier for the course
   */
  public id: number;

  /**
   * The school where the course is offered
   */
  public school: string;

  /**
   * The year that the course is being offered
   */
  public year: number;

  /**
   * The term that the course is being offered (eg. fall, winter, summer)
   */
  public term: 'fall' | 'winter' | 'summer';

  /**
   * The subject code for the course (eg. CSI, SEG, etc...)
   */
  public subject_code: string;

  /**
   * The code for the course (eg. 1101)
   */
  public course_code: string;

  /**
   * The name of the course (eg. Design and Analysis of Algorithms)
   */
  public course_name: string;

  /**
   * The sections offered for this course, stored by the section key
   */
  public sections: Map<string, CourseSection>;

  /**
   * Determines if the course must be added to the schedule
   */
  public is_mandatory: boolean;

  /**
   * Create a new course by passing it the plain data acquired from the api.
   * @param data A plain JavaScript object containing the course data
   */
  constructor(data: CourseSchema) {
    this.sections = new Map<string, CourseSection>();

    this.id = data.id;
    this.school = data.school;
    this.year = Number(data.year);
    this.term = data.term;
    this.subject_code = data.subject_code;
    this.course_code = data.course_code;
    this.course_name = data.course_name;
    this.is_mandatory = true;

    // Convert and import the sections
    for (const id in data.sections) {
      if (!data.sections.hasOwnProperty(id)) {
        continue;
      }
      const section: CourseSection = new CourseSection(this, data.sections[id]);
      this.sections.set(id, section);
    }
  }

  /**
   * Convert the course into a plain JavaScript object to be sent to a client via JSON.
   * This method is automatically used by JSON.stringify() to convert objects to JSON.
   * @return a plain JavaScript object representing this course
   */
  toJSON() {
    const output = {
      id: this.id,
      school: this.school,
      year: this.year,
      season: this.term,
      /**
       * @deprecated use season instead
       */
      term: this.term,
      subject_code: this.subject_code,
      course_code: this.course_code,
      course_name: this.course_name,
      sections: Object.fromEntries(Array.from(this.sections, ([id, s]) => [id, s.toJSON()])),
    };
    return output;
  }

  /**
   * Get a section from this course
   * @param id The id of the section
   * @returns a CourseSection object for the requested section, or undefined if it is not found
   */
  getSection(id: string): CourseSection | undefined {
    return this.sections.get(id);
  }

  /**
   * Get a component from this course
   * @param section_id The id of the section
   * @param component_id The id of the component
   * @returns a CourseSectionComponent object for the requested component, or undefined if it is not found
   */
  getComponent(section_id: string, component_id: string): CourseSectionComponent | undefined {
    const s = this.getSection(section_id);
    return s?.getComponent(component_id);
  }

  /**
   * Extract the data from this courses needed to make an API query to generate schedules
   */
  getCourseMeta(): CourseMeta {
    return {
      id: this.id,
      is_mandatory: this.is_mandatory,
      sections: this.getIncludedSectionIds(),
    };
  }

  /**
   * Extracts the list of section ids included in the course selection
   * @returns list of section ids
   */
  getIncludedSectionIds(): CourseSection['id'][] {
    return Array.from(this.sections.values())
      .filter((sec) => sec.included)
      .map((sec) => sec.id);
  }

  /**
   * Returns a unique string based on this course and its query configuration
   * (ie. the course identification and whether it is mandatory, or which sections are selected)
   * @return a string representation of the signature
   */
  public getConfigurationSignature(): CourseConfigurationSignature {
    return `${this.id + (this.is_mandatory ? 'y' : 'n')}${
      this.sections.size ? '-' : ''
    }${this.getIncludedSectionIds().join('-')}`;
  }

  /**
   * Used to sort Course objects by comparing their subject and code
   * @param a a CourseSectionComponent
   * @param b a CourseSectionComponent
   * @return negative if a < b, positive if a > b, else 0
   */
  public static compareBySubjectAndCode(a: Course, b: Course): number {
    const a_sort_key: string = a.subject_code + a.course_code;
    const b_sort_key: string = b.subject_code + b.course_code;
    return a_sort_key.localeCompare(b_sort_key);
  }
}
