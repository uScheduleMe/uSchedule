/* istanbul ignore file // Ignore this file in the code coverage reports */
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
const path = require('path');
const { workerData } = require('worker_threads');

require('ts-node').register();
require('tsconfig-paths').register();

require(path.resolve(__dirname, workerData.worker));
