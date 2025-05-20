/* eslint-disable mocha/no-setup-in-describe */
import * as responseMessages from './scheduler_messages';
import { responseMessageSetTests } from './api_responses/__test__/response_message_set_tests';

describe('responseMessages', responseMessageSetTests('sched', Object.entries(responseMessages)));
