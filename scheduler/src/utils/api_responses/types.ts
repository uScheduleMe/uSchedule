import { z } from 'zod';

/*
 * Zod parsing for an API Response Message
 */
export const response_message_schema = z.object({
  code: z.string(),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error']),
  title: z.string(),
  vars: z.record(z.unknown()).optional(),
});

export type ResponseMessage = z.infer<typeof response_message_schema>;

/*
 * Zod parsing for API Responses with Messages, which can be extended to override the data component with a specific type
 */
export const api_output_schema = z
  .object({
    messages: z.array(response_message_schema).default([]),
    data: z.unknown().default(z.null()),
  })
  // The passthrough allows `ResponseData` to be sent to a response handler without the meta being included
  // in the actual output type since the extra meta won't be included in the actual response body
  .passthrough();

/*
 * Zod parsing for API Responses with a string body and optional headers
 */
export const file_output_schema = z.object({
  headers: z.record(z.string()).optional(),
  body: z.string(),
});

export interface StdBody<D = unknown> {
  messages: ResponseMessage[];
  data: D;
  // Required to support type synchronization with the passthrough() on the api_output_schema
  [k: string]: unknown;
}

/**
 * Used to pass along response data with more than just the body (i.e. also the status code)
 */
export interface ResponseData<D = unknown> extends StdBody<D> {
  is_meta: true;
  status?: number;
}

/**
 * Used to return data and messages from functions that may return partial results.
 * Essentially only the body part of an api response.
 */
export interface MetaResult<D = unknown> extends StdBody<D> {
  is_meta?: undefined;
}
