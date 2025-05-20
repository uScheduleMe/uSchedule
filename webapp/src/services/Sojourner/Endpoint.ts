/**
 * An enum representing all the available endpoints
 */
export enum Endpoint {
  /**
   * Universal search
   */
  SEARCH = '/search',

  /**
   * Get activity by its ID
   */
  ACTIVITY = '/activities/{id}',

  /**
   * Get a list of activities
   */
  ACTIVITIES = '/activities',

  /**
   * Get accreditation by its ID
   */
  ACCREDITATION = '/accreditations/{id}',

  /**
   * Get a list of accreditations
   */
  ACCREDITATIONS = '/accreditations',
}
