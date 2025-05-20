/* eslint-disable mocha/no-setup-in-describe */
import * as commonResponseMessages from './common_messages';
import { responseMessageSetTests } from './__test__/response_message_set_tests';

describe(
  'commonResponseMessages',
  responseMessageSetTests('common', Object.entries(commonResponseMessages)),
);
