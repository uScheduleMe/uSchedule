import { z } from 'zod';
import axios from 'axios';
export const baseUrl = window.location.origin;
export const apiBaseUrl = process.env.REACT_APP_API_BASE_URL ?? `${baseUrl}/api`;

/*
 * Create Axios instance for using the base url without authentication
 */
export const axiosBaseConfig = {
  baseURL: baseUrl,
  withCredentials: false, // can leave this false since requests are not cross-site
};

export const axiosBase = axios.create(axiosBaseConfig);

/*
 * Create Axios instance for using the uSchedule API without authentication
 */
export const axiosApiConfig = {
  baseURL: apiBaseUrl,
  withCredentials: false, // can leave this false since requests are not cross-site
  xsrfCookieName: 'csrf',
  xsrfHeaderName: 'X-CSRF-TOKEN',
};

export const axiosApi = axios.create(axiosApiConfig);

/*
 * Zod parsing for API Response Messages
 */
export const responseMessagesSchema = z
  .array(
    z.object({
      type: z.enum(['error', 'info', 'warning']),
      title: z.string(),
      message: z.string(),
      // TODO: Change this back to string once the scheduler error management is fully implemented
      code: z.union([z.string(), z.number()]).optional(),
      vars: z.record(z.any()).optional(),
    }),
  )
  .optional();

/*
 * Zod parsing for API Responses with Messages, which can be extended to add the data component
 */
export const responseSchema = z.object({
  messages: responseMessagesSchema,
});
