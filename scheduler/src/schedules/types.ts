export interface ScheduleFileMeta {
  body: string;
  headers: Record<string, string>;
}

export interface ExportCourseSectionComponent {
  label: string;
  type: string;
  day: string;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  room: string;
  instructor: string;
  session_type: string;
  status: string;
}

export interface ExportCourseSection {
  label: string;
  year: number;
  season: string;
  components: Array<ExportCourseSectionComponent>;
}

export interface ExportCourse {
  school: string;
  subject_code: string;
  course_code: string;
  course_name: string;
  sections: Array<ExportCourseSection>;
}
