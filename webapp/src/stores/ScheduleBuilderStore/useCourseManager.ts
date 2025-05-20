import { Course } from '@models/Course';
import { useState } from 'react';
import { CourseMapping, CoursesByTermMapping } from './types';

export function useCourseManager() {
  const [courses, setCourses] = useState<CourseMapping>({});
  const [coursesByTerm, setCoursesByTerm] = useState<CoursesByTermMapping>({});

  const addCourseData = (course: Course, termId: string): void => {
    setCourses((courses) => ({ ...courses, [course.id]: course }));

    setCoursesByTerm((coursesByTerm) => {
      const { [termId]: currentTermData } = coursesByTerm;

      return {
        ...coursesByTerm,
        [termId]: {
          ...(currentTermData ?? { termId }),
          courses: { ...currentTermData?.courses, [course.id]: course },
        },
      };
    });
  };

  const deleteCourse = (courseId: Course['id'], termId: string): void => {
    setCourses((courses) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [courseId]: _, ...remainingCourses } = courses;

      return remainingCourses;
    });

    setCoursesByTerm((coursesByTerm) => {
      const { [termId]: currentTermData, ...remainingTerms } = coursesByTerm;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [courseId]: _, ...remainingTermCourses } = currentTermData.courses;

      const termWillHaveNoCourses = !Object.values(remainingTermCourses).length;

      return {
        ...remainingTerms,
        ...(termWillHaveNoCourses
          ? {}
          : {
              [termId]: { ...currentTermData, courses: remainingTermCourses },
            }),
      };
    });
  };

  return { courses, coursesByTerm, addCourseData, deleteCourse };
}
