import { ScheduleFileFormatter } from '@modules/schedule_file_formatter';
import {
  DbScheduleService,
  DbTermsService,
  DbTimetableService,
  DbUserService,
} from '@services/DatabaseService';
import { getDbInstance } from '@services/DatabaseService/db-initializer';
import { ScheduleDownloadService } from '@services/ScheduleDownload';
import { TimetableService } from '@services/Timetable';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class uSchedule {
  private static _schedule_download_service: ScheduleDownloadService | undefined;
  private static _timetable_service: TimetableService | undefined;
  private static _schedule_file_formatter: ScheduleFileFormatter | undefined;
  private static _pg_db_instance: PostgresJsDatabase | undefined;
  private static _db_schedule_service: DbScheduleService | undefined;
  private static _db_user_service: DbUserService | undefined;
  private static _db_timetable_service: DbTimetableService | undefined;
  private static _db_terms_service: DbTermsService | undefined;

  static get schedule_download_service() {
    if (!uSchedule._schedule_download_service) {
      uSchedule._schedule_download_service = new ScheduleDownloadService(
        uSchedule.timetable_service,
        uSchedule.schedule_file_formatter,
      );
    }
    return uSchedule._schedule_download_service;
  }

  static get timetable_service() {
    if (!uSchedule._timetable_service) {
      uSchedule._timetable_service = new TimetableService(uSchedule.db_timetable_service);
    }
    return uSchedule._timetable_service;
  }

  static get schedule_file_formatter() {
    if (!uSchedule._schedule_file_formatter) {
      uSchedule._schedule_file_formatter = new ScheduleFileFormatter();
    }
    return uSchedule._schedule_file_formatter;
  }

  static get pg_db_instance() {
    if (!uSchedule._pg_db_instance) {
      uSchedule._pg_db_instance = getDbInstance();
    }
    return uSchedule._pg_db_instance;
  }

  static get db_schedule_service() {
    if (!uSchedule._db_schedule_service) {
      uSchedule._db_schedule_service = new DbScheduleService(uSchedule.pg_db_instance);
    }
    return uSchedule._db_schedule_service;
  }

  static get db_user_service() {
    if (!uSchedule._db_user_service) {
      uSchedule._db_user_service = new DbUserService(uSchedule.pg_db_instance);
    }
    return uSchedule._db_user_service;
  }

  static get db_timetable_service() {
    if (!uSchedule._db_timetable_service) {
      uSchedule._db_timetable_service = new DbTimetableService(uSchedule.pg_db_instance);
    }
    return uSchedule._db_timetable_service;
  }

  static get db_terms_service() {
    if (!uSchedule._db_terms_service) {
      uSchedule._db_terms_service = new DbTermsService(uSchedule.pg_db_instance);
    }
    return uSchedule._db_terms_service;
  }
}
