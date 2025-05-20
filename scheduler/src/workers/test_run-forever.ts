import { isMainThread, parentPort } from 'worker_threads';

/**
 * Define a map of jobs that can be run on a test worker pool
 */
export const test_run_forever_executors = {
  runForever: async (_input: unknown) => Promise.resolve(),
} as const;

if (!isMainThread) {
  /**
   * Listen for jobs, generate the results and return them via a response message.
   */
  parentPort?.on('message', () => undefined);
}
