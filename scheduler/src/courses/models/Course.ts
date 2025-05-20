import CourseSection from './CourseSection';
import CourseSectionComponent from './CourseSectionComponent';
import { product } from 'cartesian-product-generator';
import { CourseData, CourseSkeleton } from '@services/DataAccess';
import { ScheduleGenerateCourseMeta } from '@route_handlers/schemas';
import { PlainCourse } from '../schemas';

export type CourseMeta = Omit<ScheduleGenerateCourseMeta, 'id'>;

/**
 * This class is a model for a Course.
 * It contains sections, which contain course components.
 */
export default class Course {
  /**
   * A unique identifier for the course
   */
  id: number;

  /**
   * The school where the course is offered
   */
  school: string;

  /**
   * The year that the course is being offered
   */
  year: number;

  /**
   * The term that the course is being offered (eg. fall, winter, summer)
   */
  season: string;

  /**
   * The subject code for the course (eg. CSI, SEG, etc...)
   */
  subject_code: string;

  /**
   * The code for the course (eg. 1101)
   */
  course_code: string;

  /**
   * The name of the course (eg. Design and Analysis of Algorithms)
   */
  course_name: string;

  /**
   * The sections offered for this course, stored by the section key
   */
  sections = new Map<string, CourseSection>();

  /**
   * Whether this course is mandatory within the context of a requested schedule
   */
  is_mandatory: boolean;

  /**
   * The cartesian-product of all the lecture component combinations (LEC, TUT, DGD, LAB)
   */
  private combinations: CourseSectionComponent[][] | null = null;

  /**
   * Create a new course by passing it the plain data acquired from the DataAccess layer.
   * @param data A plain JavaScript object or JSON string containing the course data
   * @param meta some extra parameters used when generating schedules
   */
  constructor(data: CourseData, meta?: CourseMeta) {
    // Import the data
    this.id = data.id;
    this.school = data.school;
    this.year = data.year;
    this.season = data.season ?? data.term;
    this.subject_code = data.subject_code.toUpperCase();
    this.course_code = data.course_code;
    this.course_name = data.course_name;
    this.is_mandatory = meta?.is_mandatory ?? true;

    const sections_to_include = meta?.sections ? new Set(meta.sections) : null;

    // Convert and import the sections
    for (const section of Object.values(data.sections)) {
      const should_include_section = !sections_to_include || sections_to_include.has(section.id);
      if (should_include_section) {
        this.sections.set(section.id, new CourseSection(this, section));
      }
    }
  }

  /**
   * Compares courses by the number of combinations they have.
   * Used to sort courses by combination size.
   * @param a the first course to compare
   * @param b the second course to compare
   * @returns negative if a < b, positive if a > b, else 0
   */
  static compareByCombinationCount(a: Course, b: Course): number {
    return a.getCombinationCount() - b.getCombinationCount();
  }

  /**
   * Convert the course into a plain JavaScript object to be sent to a client via JSON.
   * This method is automatically used by JSON.stringify() to convert objects to JSON.
   * @returns a plain JavaScript object representing this course
   */
  toJSON(): PlainCourse {
    const output = {
      id: this.id,
      school: this.school,
      year: this.year,
      season: this.season,
      /**
       * @deprecated use season instead
       */
      term: this.season,
      subject_code: this.subject_code,
      course_code: this.course_code,
      course_name: this.course_name,
      sections: Object.fromEntries(Array.from(this.sections, ([id, s]) => [id, s.toJSON()])),
    };
    return output;
  }

  /**
   * Removed a CourseSection from this course by the CourseSection key
   * @param section The key of the section
   */
  removeSection(section: CourseSection): void {
    this.sections.delete(section.id);
  }

  /**
   * Removes sections from this course where the section id is not in the provided list
   * @param ids The ids of the sections
   */
  filterSections(ids: string[]): void {
    const id_set = new Set(ids);
    for (const section of this.sections.values()) {
      if (!id_set.has(section.id)) {
        this.removeSection(section);
      }
    }
  }

  /**
   * Removes sections and components from this course that are not in the skeleton
   * @param skeleton the course skeleton containing the section and component keys to keep
   */
  filterContent(skeleton: CourseSkeleton): Course {
    // Filter out unwanted sections
    this.filterSections(Object.keys(skeleton.sections));

    // Filter out unwanted components in the remaining sections
    for (const section of this.sections.values()) {
      section.filterComponents(skeleton.sections[section.id]);
    }
    return this;
  }

  /**
   * Returns the count of the cartesian-product of all the combinations of the various
   *   course components (LEC, LAB, TUT, DGD)
   * @returns the number of combinations
   */
  getCombinationCount(): number {
    if (!this.combinations) {
      this.getCombinations();
    }
    return this.combinations?.length ?? 0;
  }

  /**
   * Generates and returns the cartesian-product of all the combinations of the various
   *   course components (LEC, LAB, TUT, DGD)
   * @returns a 2D array of sets of course components
   */
  getCombinations(): CourseSectionComponent[][] {
    if (this.combinations) {
      return this.combinations;
    }

    // Create a 2D array to store a list of component sets
    const combinations: CourseSectionComponent[][] = [];

    // Figure out the component sets on a section level but add to the overall set
    this.sections.forEach((section: CourseSection) => {
      const num_types: number = section.components_by_type.size;

      if (num_types) {
        const has_lectures: boolean = section.components_by_type.has('LEC');
        const num_types_non_lecture: number = has_lectures ? num_types - 1 : num_types;
        let lecture_components: CourseSectionComponent[] = [];

        if (has_lectures) {
          // Isolate the lecture components so they can be added to the resulting product
          lecture_components = Array.from(section.components_by_type.get('LEC')?.values() ?? []);
          if (num_types_non_lecture === 0) {
            combinations.push(lecture_components);
            return; // Continue
          }
        }

        // Store a list of groups (containing component sets by component type) to perform a cartesian product on
        // Use one group per component type so that we get combinations with one member of each group
        const product_groups: CourseSectionComponent[][] = [];
        for (const type of section.components_by_type.keys()) {
          if (type !== 'LEC') {
            product_groups.push(Array.from(section.components_by_type.get(type)?.values() ?? []));
          }
        }

        if (num_types_non_lecture === 1) {
          for (const component of product_groups[0]) {
            combinations.push([component].concat(lecture_components));
          }
        } else if (num_types_non_lecture > 1) {
          // Use the spread operator to pass each group as a separate input parameter
          const iterator = product(...product_groups);
          // Add the lecture to each set and add the set to the final results
          for (const component_set of iterator) {
            combinations.push(component_set.concat(lecture_components));
          }
        }
      }
    });

    this.combinations = combinations;
    return combinations;
  }
}
