import { Course, CourseSection, CourseSectionComponent } from '@modules/schedule_generator';
import { CourseJson } from './types';
import { CourseMeta } from '@models/Course';
import { day_of_week_schema } from './schemas';

/**
 * Constructs a Course object for the ScheduleGenerator using the provided course data and metadata
 * @param course_data course data from the DataAccess service
 * @param course_meta course meta data (i.e. is_mandatory and list of sections to include)
 * @returns a Course object for the ScheduleGenerator
 */
export function deserializeCourse(course_data: CourseJson, course_meta?: CourseMeta): Course {
  const course = new Course(
    {
      ...course_data,
      term: {
        year: course_data.year,
        season: course_data.season ?? course_data.term,
      },
    },
    [],
    course_meta,
  );

  let sections = Object.values(course_data.sections);
  if (course_meta?.sections) {
    const ids = new Set(course_meta.sections);
    sections = sections.filter((s) => ids.has(s.id));
  }

  for (const section_data of sections) {
    const section = new CourseSection(course, section_data);

    for (const component_data of Object.values(section_data.components)) {
      try {
        // Throw out this component if parsing the day fails
        const day = day_of_week_schema.parse(component_data.day);

        const component = new CourseSectionComponent(section, {
          ...component_data,
          day,
          is_closed: component_data.status.toLowerCase() === 'closed',
        });
        section.addComponent(component);
      } catch (e) {}
    }

    course.addSection(section);
  }

  return course;
}
