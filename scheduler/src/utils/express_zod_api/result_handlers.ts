import StatusCodes from '@utils/StatusCodes';
import {
  api_output_schema,
  file_output_schema,
  getErrorResponseData,
  sendResponse,
} from '@utils/api_responses';
import { IOSchema, createResultHandler } from 'express-zod-api';
import { z } from 'zod';

/**
 * The standard api endpoint result handler
 */
export const api_result_handler = createResultHandler({
  getPositiveResponse: (output: IOSchema) => output,
  getNegativeResponse: () => api_output_schema,
  handler: ({ error, output, request, response }) => {
    if (error) {
      sendResponse(response, getErrorResponseData(error, request));
    } else {
      sendResponse(response, output);
    }
  },
});

/**
 * The endpoint result handler for unspecified 'any' data schemas
 */
export const any_data_result_handler = createResultHandler({
  getPositiveResponse: (output: IOSchema) => output,
  getNegativeResponse: () => api_output_schema,
  handler: ({ error, output, request, response }) => {
    if (error) {
      sendResponse(response, getErrorResponseData(error, request));
    } else if (!output) {
      response.status(StatusCodes.NO_CONTENT).send();
    } else {
      response.status(StatusCodes.OK).json(output);
    }
  },
});

/**
 * The api endpoint result handler for endpoints used to download schedules
 */
export const schedule_download_result_handler = createResultHandler({
  getPositiveResponse: () => ({
    schema: z.string(),
    mimeTypes: ['text/calendar', 'application/json', 'text/csv'],
    statusCode: 200,
  }),
  getNegativeResponse: () => api_output_schema,
  handler: ({ error, output, request, response }) => {
    if (error) {
      sendResponse(response, getErrorResponseData(error, request));
      return;
    }

    const output_parsed = file_output_schema.safeParse(output);

    if (!output_parsed.success) {
      sendResponse(response, getErrorResponseData(new Error('Invalid endpoint output.'), request));
    } else {
      const { headers, body } = output_parsed.data;
      if (headers) {
        response.set(headers);
      }
      response.send(body);
    }
  },
});
