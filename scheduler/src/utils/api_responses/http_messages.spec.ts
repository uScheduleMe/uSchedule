/* eslint-disable mocha/no-setup-in-describe */
import * as httpResponseMessages from './http_messages';
import { responseMessageSetTests } from './__test__/response_message_set_tests';

describe(
  'httpResponseMessages',
  responseMessageSetTests('http', Object.entries(httpResponseMessages)),
);
