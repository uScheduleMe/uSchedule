import { Course, CourseConfigurationSignature } from '@models/Course';
import { ScheduleFilterData } from '@models/ScheduleFilterData';
import { SettingsData } from '@models/SettingsData';
import { Term } from '@models/Term';

export interface ScheduleBuilderStoreProps {
  children: React.ReactNode;
}

/**
 * Map a courseId to a Course object
 */
export type CourseMapping = Record<Course['id'], Course>;

/**
 * Data used to display a list of terms and courses for the Schedule Builder
 */
export interface TermData {
  termId: Term['id'];
  courses: CourseMapping;
}

/**
 * Map the termId to the TermData object
 */
export type CoursesByTermMapping = Record<Term['id'], TermData>;

/**
 * Map the termId to the Term object
 */
export type TermListMapping = Record<Term['id'], Term>;

/**
 * Map the termId to objects containing the courseId mapped to the course configuration signature
 */
export type TermMetaMapping = Record<
  Term['id'],
  Record<Course['id'], CourseConfigurationSignature>
>;

export type GenerationImpactingSettings = Omit<SettingsData, 'format_time_as_military'>;

export interface PreviousState {
  filters: ScheduleFilterData;
  termMeta: TermMetaMapping;
  settings: GenerationImpactingSettings;
}
