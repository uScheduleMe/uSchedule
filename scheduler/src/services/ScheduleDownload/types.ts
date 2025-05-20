import { FileFormat, ScheduleEntry, ScheduleFileMeta } from '@modules/schedule_file_formatter';
import { CourseTimetable } from '@services/Timetable';

export interface DataProvider {
  getTimetableById: (id: string) => Promise<CourseTimetable | null>;
  getTimetablesById: (ids: string[]) => Promise<CourseTimetable[]>;
}

export interface Formatter {
  generateFile: (
    entries: readonly Readonly<ScheduleEntry>[],
    format: FileFormat,
  ) => ScheduleFileMeta;
}

export interface ComponentMeta {
  timetable_id: string;
  section_id: string;
  component_id: string;
}
