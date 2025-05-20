import { Course } from '@models/Course';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { CourseSchedule } from '@models/CourseSchedule';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { notNullUndefined } from '@utils/helpers';
import { Term } from '@models/Term';
import { GeneratorResultBundle } from './types';

export function deserializeSchedules(
  results: GeneratorResultBundle,
  term: Term,
  courses: readonly Course[],
): TermScheduleSetData {
  const { data, limit_was_reached } = results;
  const { component_ids, schedules: compressedSchedules } = data;

  const coursesById: Record<string, Course> = {};
  for (const course of courses) {
    coursesById[course.id] = course;
  }

  // Create a map to be able to look up the full CourseSectionComponent object using
  // the index of the component's position in the component_ids array
  const componentsByIndex = component_ids.reduce(
    (map, [courseId, sectionId, componentId], i) =>
      map.set(i, coursesById[courseId]?.getComponent(sectionId, componentId) ?? null),
    new Map<number, CourseSectionComponent | null>(),
  );

  // Sort the courses by the subject_code and course_code combination for consistency in viewing colours
  const view_ids = [...courses]
    .sort(Course.compareBySubjectAndCode)
    .reduce((map, course, i) => map.set(course.id, i + 1), new Map<Course['id'], number>());

  const schedules: CourseSchedule[] = compressedSchedules.map((raw_schedule) => {
    const componentByGuid = raw_schedule
      .map(([i]) => componentsByIndex.get(i))
      .filter(notNullUndefined)
      .reduce(
        (map, component) => map.set(component.guid, component),
        new Map<CourseSectionComponent['guid'], CourseSectionComponent>(),
      );

    return new CourseSchedule(componentByGuid, view_ids);
  });

  return new TermScheduleSetData(schedules, term, limit_was_reached);
}
