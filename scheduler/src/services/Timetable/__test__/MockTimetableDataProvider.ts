import { TimetableUniqueProperties } from '@services/DatabaseService';
import { DataProvider } from '../types';

export class MockTimetableDataProvider implements DataProvider {
  timetable_summaries: Awaited<ReturnType<DataProvider['getTimetableSummaries']>> = [];
  timetable: Awaited<ReturnType<DataProvider['getTimetableById']>> | undefined;
  timetables: Awaited<ReturnType<DataProvider['getTimetablesById']>> = [];

  async getTimetableById(_id: string) {
    return Promise.resolve(this.timetable);
  }

  async getTimetablesById(_id: string[]) {
    return Promise.resolve(this.timetables);
  }

  async getTimetableByUniqueProperties(_properties: TimetableUniqueProperties) {
    return Promise.resolve(this.timetable);
  }

  async getTimetableSummaries(
    _params: Readonly<Partial<TimetableUniqueProperties & { search: string }>>,
    _limit?: number,
  ) {
    return Promise.resolve(this.timetable_summaries);
  }
}
