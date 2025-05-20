export interface CourseMeta {
  sections_to_include?: string[] | undefined;
  is_mandatory?: boolean | undefined;
}

export interface Term {
  /**
   * The year that the term falls within
   */
  year: number;

  /**
   * The season that the term starts in (eg. fall, winter, summer)
   */
  season: 'fall' | 'winter' | 'summer';
}

export interface CourseData {
  /**
   * A unique identifier for the course
   */
  id: number;

  /**
   * The school where the course is offered
   */
  school: string;

  /**
   * The term that the course is scheduled within
   */
  term: Term;
}

export interface CourseSectionData {
  /**
   * A unique identifier for the section. Unique within the course
   */
  id: string;
}

export interface CourseSectionComponentData {
  /**
   * A unique identifier for the component. Unique within the section
   */
  id: string;

  /**
   * The component type
   */
  type: 'LEC' | 'LAB' | 'TUT' | 'DGD' | string;

  /**
   * Whether or not the status of the component is closed
   */
  is_closed: boolean;

  /**
   * The day of the week [ SU, MO, TU, WE, TH, FR, SA ]
   */
  day: 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

  /**
   * The component start date - ex. 2020-01-06
   */
  start_date: string;

  /**
   * The component end date - ex. 2020-04-04
   */
  end_date: string;

  /**
   * The component start time in 24hr time format: `hh:mm`
   */
  start_time: string;

  /**
   * The component end time in 24hr time format: `hh:mm`
   */
  end_time: string;
}
