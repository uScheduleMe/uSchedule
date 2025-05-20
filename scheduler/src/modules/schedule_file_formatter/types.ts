export interface Term {
  season: string;
  year: number;
}

export interface ScheduleEntry {
  course_code: string;
  course_name: string;
  day_of_week: string;
  description: string;
  end_date: string;
  end_time: string;
  id: string;
  instructor: string;
  label: string;
  room: string;
  school: string;
  section_id: string;
  section_label: string;
  session_type: string;
  start_date: string;
  start_time: string;
  status: string;
  subject_code: string;
  term: Term;
  type: string;
}

export interface ExportCourseSectionComponent {
  day: string;
  end_date: string;
  end_time: string;
  instructor: string;
  label: string;
  room: string;
  session_type: string;
  start_date: string;
  start_time: string;
  status: string;
  type: string;
}

export interface ExportCourseSection {
  components: Array<ExportCourseSectionComponent>;
  label: string;
  season: string;
  year: number;
}

export interface ExportCourse {
  course_code: string;
  course_name: string;
  school: string;
  sections: Array<ExportCourseSection>;
  subject_code: string;
}

export const FILE_FORMAT = {
  CSV: 'csv',
  ICAL: 'ical',
  JSON: 'json',
} as const;

export type FileFormat = (typeof FILE_FORMAT)[keyof typeof FILE_FORMAT];

export interface FileGeneratorMeta {
  format: FileFormat;
  term?: Term;
}

export interface ScheduleFileMeta {
  body: string;
  headers: Record<string, string>;
}
