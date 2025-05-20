import { WorkerInput } from '@utils/worker_pool';
import { isMainThread, parentPort } from 'worker_threads';

/**
 * Define a map of jobs that can be run on a test worker pool
 */
export const test_echo_executors = {
  echo: async (input: unknown) => Promise.resolve(input),
} as const;

if (!isMainThread) {
  /**
   * Listen for jobs, generate the results and return them via a response message.
   */
  parentPort?.on('message', async ({ type, input }: WorkerInput<typeof test_echo_executors>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    parentPort?.postMessage(await test_echo_executors[type](input as any));
  });
}
