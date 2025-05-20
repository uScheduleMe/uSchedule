/**
 * Create a new web worker with a filepath relative to this file.
 * This is required to isolate the worker creation so that it can be mocked for tests to run.
 * Mocking is required because `import.meta.url` is not supported in the jest test environment.
 * @returns a web worker for the worker.ts file in the same directory as this file
 */
export function createWorker() {
  // This is straight from the docs on web workers in webpack https://webpack.js.org/guides/web-workers
  return new Worker(new URL('worker.ts', import.meta.url));
}
