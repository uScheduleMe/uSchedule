import { ScheduleEntry, Term } from '../types';

export interface ScheduleFormatter {
  format: (entries: readonly Readonly<ScheduleEntry>[], term?: Readonly<Term>) => string;
}
