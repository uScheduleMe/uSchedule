import { CourseData } from '../DataAccess';

export interface DataProvider {
  getCourse: (id: number) => Promise<CourseData>;
}

export interface Logger {
  error: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
}
