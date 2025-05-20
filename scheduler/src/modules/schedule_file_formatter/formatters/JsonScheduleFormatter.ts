import {
  ExportCourse,
  ExportCourseSection,
  ExportCourseSectionComponent,
  ScheduleEntry,
} from '../types';
import { ScheduleFormatter } from '../interfaces/ScheduleFormatter';

export class JsonScheduleFormatter implements ScheduleFormatter {
  format(entries: readonly Readonly<ScheduleEntry>[]) {
    const courses = new Map<string, ExportCourse>();
    const sections = new Map<string, ExportCourseSection>();

    for (const entry of entries) {
      const { course_key, section_key } = this.getKeys(entry);

      let course = courses.get(course_key);

      if (!course) {
        course = this.toExportCourse(entry);
        courses.set(course_key, course);
      }

      let section = sections.get(section_key);

      if (!section) {
        section = this.toExportSection(entry);
        course.sections.push(section);
        sections.set(section_key, section);
      }

      section.components.push(this.toExportComponent(entry));
    }

    return `${JSON.stringify({ courses: [...courses.values()] })}\n`;
  }

  private getKeys(data: ScheduleEntry) {
    const course_key = `${data.school}${data.subject_code}${data.course_code}`;
    const section_key = `${course_key}${data.term.year}${data.term.season}${data.section_label}`;
    return { course_key, section_key };
  }

  private toExportCourse(entry: ScheduleEntry): ExportCourse {
    return {
      school: entry.school,
      subject_code: entry.subject_code,
      course_code: entry.course_code,
      course_name: entry.course_name,
      sections: [],
    };
  }

  private toExportSection(entry: ScheduleEntry): ExportCourseSection {
    return {
      label: entry.section_label,
      year: entry.term.year,
      season: entry.term.season,
      components: [],
    };
  }

  private toExportComponent(entry: ScheduleEntry): ExportCourseSectionComponent {
    return {
      label: entry.label,
      type: entry.type,
      day: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      start_date: entry.start_date,
      end_date: entry.end_date,
      room: entry.room,
      instructor: entry.instructor,
      session_type: entry.session_type,
      status: entry.status,
    };
  }
}
