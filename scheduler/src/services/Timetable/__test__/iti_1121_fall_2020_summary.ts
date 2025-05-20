import { TimetableSummary } from '../schemas';
import { SourceTimetableSummary } from '../types';

export const iti_1121_fall_2020_summary_source = {
  id: '7035',
  year: 2020,
  season: 'fall',
  subject_code: 'ITI',
  course_code: '1120',
  course_name: 'Introduction to Computing I',
  school: 'uottawa',
} satisfies SourceTimetableSummary;

export const iti_1121_fall_2020_summary_transformed = {
  id: '7035',
  term: { season: 'fall', year: 2020 },
  subject_code: 'ITI',
  course_code: '1120',
  course_name: 'Introduction to Computing I',
  school: 'uottawa',
} satisfies TimetableSummary;
