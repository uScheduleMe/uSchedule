/**
 * An interface to define the fields required for a break filter object
 */
export interface Break {
  /**
   * The string representing the start time of the break
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  start: string;

  /**
   * The string representing the end time of the break
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  end: string;

  /**
   * The string representing the minimum duration of the break
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  size: string;
}

/**
 * This class is used to define a set of filters used to configure the search space
 *   and result set for a schedule generator
 */
export interface ScheduleFilterData {
  /**
   * Stores the value for the 'minimize classes before' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  minimize_before_time: string;

  /**
   * Stores the value for the 'minimize classes after' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  minimize_after_time: string;

  /**
   * Stores the value for the 'lunch break start' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  lunch_start: string;

  /**
   * Stores the value for the 'lunch break end' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  lunch_end: string;

  /**
   * Stores the value for the 'lunch break size' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  lunch_size: string;

  /**
   * Stores the value for the 'lunch break active' filter
   */
  lunch_is_enabled: boolean;

  /**
   * Stores the value for the 'evening break start' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  evening_start: string;

  /**
   * Stores the value for the 'evening break end' filter
   * The value is string representing the hour and minute in 24-hour time format (HH:mm)
   */
  evening_end: string;

  /**
   * Stores the value for the 'evening break size' filter
   */
  evening_size: string;

  /**
   * Stores the value for the 'evening break active' filter
   */
  evening_is_enabled: boolean;

  /**
   * Track which time conflicts to filter out.  Possible values: ALL, NON_LEC, NONE
   */
  allow_time_conflicts: AllowTimeConflicts;

  /**
   * If true, closed components are allowed in the schedule results, if false, they are filtered out
   */
  allow_closed_components: boolean;
}

/**
 * An enum representing the various options for the ScheduleFilterData.allow_time_conflicts field
 */
export enum AllowTimeConflicts {
  /**
   * No time conflicts are allowed in the schedule
   */
  NONE,

  /**
   * Only allow conflicts if they are not including a lecture component
   */
  NON_LEC,

  /**
   * Allow any and all time conflicts in the schedule
   */
  ALL,
}

export const allowTimeConflictsTxKeys = {
  [AllowTimeConflicts.NONE]: 'hide_all',
  [AllowTimeConflicts.NON_LEC]: 'hide_lecture',
  [AllowTimeConflicts.ALL]: 'show_all',
} as const;

/**
 * The payload we pass to the data access service.
 *
 * @export
 * @interface FilterPayload
 */
export interface FilterPayload {
  allow_closed_components: boolean;
  allow_time_conflicts: keyof typeof AllowTimeConflicts;
  breaks: Break[];
  minimize_after_time: string;
  minimize_before_time: string;
}

/**
 * Converts the filter data in the store into the format required for the API requests
 * @param filterData the filter data from the store
 * @return the filter data to submit to the API
 */
export const getFilterPayload = (filterData: ScheduleFilterData): Partial<FilterPayload> => {
  const payload: Partial<FilterPayload> = {
    allow_closed_components: filterData.allow_closed_components,
    allow_time_conflicts: AllowTimeConflicts[
      filterData.allow_time_conflicts
    ] as keyof typeof AllowTimeConflicts,
    minimize_before_time: filterData.minimize_before_time,
    minimize_after_time: filterData.minimize_after_time,
    breaks: [],
  };
  if (filterData.lunch_is_enabled) {
    payload.breaks?.push({
      start: filterData.lunch_start,
      end: filterData.lunch_end,
      size: filterData.lunch_size,
    });
  }
  if (filterData.evening_is_enabled) {
    payload.breaks?.push({
      start: filterData.evening_start,
      end: filterData.evening_end,
      size: filterData.evening_size,
    });
  }
  return payload;
};
