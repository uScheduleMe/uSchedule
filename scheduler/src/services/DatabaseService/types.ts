import { timetable } from '@src/drizzle/schema';

export type IdAsString<T extends { id: number }> = {
  [K in keyof T]: K extends 'id' ? string : T[K];
};

export interface TimetableUniqueProperties {
  course_code: string;
  school: string;
  season: string;
  subject_code: string;
  year: number;
}

export type TimetableRowSelect = IdAsString<
  Omit<typeof timetable.$inferSelect, 'date_created' | 'date_updated'>
>;
