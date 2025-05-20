import { Course, CourseData } from '../models';

/*
 * Create Course 3
 */

export const course_3_data: CourseData = {
  id: 3,
  school: 'uottawa',
  term: {
    year: 2020,
    season: 'winter',
  },
};

/**
 * A course with no sections
 */
export const course_3 = new Course(course_3_data);
