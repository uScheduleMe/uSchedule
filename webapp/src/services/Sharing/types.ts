/**
 * Enum listing relevant api endpoints consumed by this module
 *
 * @export
 * @enum {string}
 */
export enum SharingEndpoints {
  /**
   * POST create a new share for a calendar
   */
  Calendar = '/calendar-shares',

  /**
   * DELETE remove a share for a calendar
   */
  CalendarUser = '/calendar-shares/{uuid}',
}
