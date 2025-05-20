import { DataProvider } from '../types';

export class MockTimetableDataProvider implements DataProvider {
  timetable: Awaited<ReturnType<DataProvider['getTimetableById']>> = null;
  timetables: Awaited<ReturnType<DataProvider['getTimetablesById']>> = [];
  error: Error | undefined;

  async getTimetableById(_id: string) {
    return this.error ? Promise.reject(this.error) : Promise.resolve(this.timetable);
  }

  async getTimetablesById(_ids: string[]) {
    return this.error ? Promise.reject(this.error) : Promise.resolve(this.timetables);
  }
}
