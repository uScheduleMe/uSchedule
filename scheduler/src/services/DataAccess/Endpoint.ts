/**
 * An enum representing all the available endpoints on the DataAccess layer
 */

// eslint-disable-next-line typescript-enum/no-enum
export enum Endpoint {
  /**
   * Retrieve timetable information for the requested course
   */
  TIMETABLES = '/timetables',

  /**
   * Retrieve timetable information for the requested course
   */
  TIMETABLE = '/timetables/{id}',
  /**
   * Retrieve timetable information for the requested course
   */
  TIMETABLES_SUMMARIES = '/timetables/summaries',

  /**
   * Retrieve a schedule skeleton
   */
  SCHEDULES = '/schedules',

  /**
   * Retrieve a schedule skeleton
   */
  SCHEDULE = '/schedules/{id}',

  /**
   * Retrieve a list of schedule components in the download format using the schedule ID
   */
  SCHEDULE_DOWNLOAD = '/schedules/{id}/download',

  /**
   * Retrieve a list of schedule components in the download format using the schedule skeleton
   */
  SCHEDULES_DOWNLOAD = '/schedules/download',

  /**
   * Used to get users
   */
  USERS = '/users',

  /**
   * Used to get a user by the user ID
   */
  USER = '/users/{uuid}',
}
