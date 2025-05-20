/**
 * Dimensions which have been registered for use in Google Analytics
 * Note: When adding new dimensions, they have to be registered in GA for all environments
 */
export interface RegisteredDimensions {
  type?: 'custom';
  label?: string;
  term?: string;
  subject_code?: string;
  course_code?: string;
  course_level?: string;
  download_format?: string;
  generator?: 'remote' | 'local';
  limit_reached?: 'true' | 'false';
  course_list?: string;
  load_time_bracket?: string;
}

/**
 * Metrics which have been registered for use in Google Analytics
 * Note: When adding new metrics, they have to be registered in GA for all environments
 */
export interface RegisteredMetrics {
  load_time?: number;
  num_courses?: number;
  num_results?: number;
}

export type EventParams = RegisteredDimensions & RegisteredMetrics;

export type SendEvent = (action: string, params: EventParams) => void;
