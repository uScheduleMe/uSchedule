import { DbTimetableService } from '@services/DatabaseService';

export interface Term {
  season: string;
  year: number;
}

export type DataProvider = Pick<
  DbTimetableService,
  | 'getTimetableById'
  | 'getTimetableByUniqueProperties'
  | 'getTimetablesById'
  | 'getTimetableSummaries'
>;

export type DbTimetableRow = Awaited<ReturnType<DataProvider['getTimetableByUniqueProperties']>>;

export type SourceTimetableSummary = Awaited<
  ReturnType<DataProvider['getTimetableSummaries']>
>[number];
