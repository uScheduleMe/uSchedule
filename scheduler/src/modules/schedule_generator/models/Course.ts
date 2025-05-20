import CourseSection from './CourseSection';
import { product } from 'cartesian-product-generator';
import { CourseSkeleton } from '../schemas';
import { CourseData, CourseMeta } from './types';
import ScheduleComponent from './ScheduleComponent';

export default class Course implements CourseData {
  readonly id: CourseData['id'];

  readonly school: CourseData['school'];

  readonly term: CourseData['term'];

  /**
   * Whether this course is mandatory within the context of a requested schedule
   */
  readonly is_mandatory: boolean;

  /**
   * The sections offered for this course, stored by the section key
   */
  readonly sections = new Map<CourseSection['id'], CourseSection>();

  /**
   * the cartesian-product of all the schedule component combinations (LEC, TUT, DGD, LAB)
   * A configuration is a set of schedule components, each of which may contain one or more course components.
   */
  private configurations: ReadonlyArray<ReadonlyArray<ScheduleComponent>> | null = null;

  /**
   * Create a new course
   * @param data a plain JavaScript object containing the course data
   * @param sections a list of course sections to add to this course
   * @param meta some extra parameters used when generating schedules
   */
  constructor(
    data: Readonly<CourseData>,
    sections: Readonly<CourseSection[]> = [],
    meta?: Readonly<CourseMeta>,
  ) {
    // Import the data
    this.id = data.id;
    this.school = data.school;
    this.term = data.term;
    this.is_mandatory = meta?.is_mandatory ?? true;

    const sections_to_include = meta?.sections_to_include
      ? new Set(meta.sections_to_include)
      : null;

    // Convert and import the sections
    for (const section of sections) {
      const should_include_section = !sections_to_include || sections_to_include.has(section.id);
      if (should_include_section) {
        this.addSection(section);
      }
    }
  }

  /**
   * Compares courses by the number of configurations they have.
   * Used to sort courses by configuration count.
   * @param a the first course to compare
   * @param b the second course to compare
   * @returns negative if a < b, positive if a > b, else 0
   */
  static compareByConfigurationCount(a: Readonly<Course>, b: Readonly<Course>): number {
    return a.getConfigurationCount() - b.getConfigurationCount();
  }

  /**
   * Add a section to this course
   * @param section The section to add
   */
  addSection(section: CourseSection): void {
    this.sections.set(section.id, section);
  }

  /**
   * Removed a CourseSection from this course
   * @param section The section to remove
   */
  removeSection(section: Readonly<CourseSection>): void {
    this.sections.delete(section.id);
  }

  /**
   * Removes sections from this course where the section id is not in the provided list
   * @param ids The ids of the sections
   */
  filterSections(ids: Readonly<string[]>): void {
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
  filterContent(skeleton: Readonly<CourseSkeleton>): Course {
    // Filter out unwanted sections
    this.filterSections(Object.keys(skeleton.sections));

    // Filter out unwanted components in the remaining sections
    for (const section of this.sections.values()) {
      section.filterComponents(skeleton.sections[section.id]);
    }
    return this;
  }

  /**
   * Generates and returns the cartesian-product of all the combinations of the various schedule
   * components for the course
   * @returns a set of configurations, which are each a set of schedule components
   */
  getConfigurations(): ReadonlyArray<ReadonlyArray<ScheduleComponent>> {
    if (this.configurations) {
      return this.configurations;
    }
    const configurations: ScheduleComponent[][] = [];

    for (const section of this.sections.values()) {
      const components_by_type = section.getScheduleComponents();
      const num_types = components_by_type.size;
      if (!num_types) {
        break;
      }

      // Isolate the lecture components so they can be added to the resulting product
      const lec_components = components_by_type.get('LEC');
      const num_types_non_lecture = lec_components ? num_types - 1 : num_types;

      const has_only_lecture_components = lec_components && !num_types_non_lecture;
      if (has_only_lecture_components) {
        configurations.push(lec_components);
        continue;
      }

      // Store a list of groups (containing component sets by type) to perform a cartesian product
      // Use one group per component type so that we get combinations with one member of each group
      const groups: ScheduleComponent[][] = [];
      for (const [type, schedule_components] of components_by_type.entries()) {
        if (type !== 'LEC') {
          groups.push(schedule_components);
        }
      }

      for (const non_lec_components of product(...groups)) {
        const configuration = lec_components
          ? [...non_lec_components, ...lec_components]
          : non_lec_components;
        configurations.push(configuration);
      }
    }

    this.configurations = configurations;
    return configurations;
  }

  /**
   * Returns the count of the possible schedule configurations for the course.
   * @returns the number of configurations
   */
  getConfigurationCount(): number {
    return this.getConfigurations().length;
  }
}
