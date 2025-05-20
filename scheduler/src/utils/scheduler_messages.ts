import { ResponseMessage } from './api_responses';

/*
 * Schedule: 2xxx
 */

export const SCHED_2000: ResponseMessage = {
  code: 'sched.2000',
  type: 'error',
  title: 'Schedule Error',
  message: 'An unexpected error occurred while processing a schedule.',
};

export const SCHED_2001: ResponseMessage = {
  code: 'sched.2001',
  type: 'error',
  title: 'No Possible Combinations',
  message:
    'There are no possible schedules for the requested courses during the requested term. Please adjust the filters and/or course list and try again.',
};

export const SCHED_2002: ResponseMessage = {
  code: 'sched.2002',
  type: 'warning',
  title: 'Limit Reached',
  message: 'Some schedules are not displayed because the limit was reached.',
};

export const SCHED_2003: ResponseMessage = {
  code: 'sched.2003',
  type: 'warning',
  title: 'Course Data Missing',
  message: 'None of the course data for the requested schedule was able to be retrieved.',
};

export const SCHED_2004: ResponseMessage = {
  code: 'sched.2004',
  type: 'error',
  title: 'Request Timeout',
  message:
    'The schedule generation ran out of time. Use filters to reduce the possible schedules or try again when the server is less busy.',
};

/*
 * Course: 3xxx
 */

export const SCHED_3000: ResponseMessage = {
  code: 'sched.3000',
  type: 'warning',
  title: 'Course Data Missing',
  message: 'The data for a course was not able to be retrieved.',
};

export const SCHED_3001: ResponseMessage = {
  code: 'sched.3001',
  type: 'error',
  title: 'Course Not Available',
  message: 'The course is not offered in the requested term.',
};
