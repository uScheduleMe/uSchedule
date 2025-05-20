export interface WorkerJob<In = unknown, Out = unknown, T = string> {
  type: T;
  input: In;
  resolve: (value: Out | PromiseLike<Out>) => void;
  reject: (reason?: Error) => void;
}

export type JobExecutor<In, Out> = (input: In) => Promise<Out>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WorkerExecutors<In = any, Out = unknown> = Record<string, JobExecutor<In, Out>>;

export interface WorkerInput<J extends WorkerExecutors, T extends keyof J = keyof J> {
  type: T;
  input: Parameters<J[T]>[0];
}

// Unwrap a type from within a promise
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * WorkerConfig defines the available configuration options when using the WorkerSpawner
 *   to start a worker (thread)
 */
export interface WorkerConfig {
  /**
   * The name of the worker file (without file extension)
   */
  worker: string;

  /**
   * The data to be made available to the worker (thread) module
   */
  data: unknown;

  /**
   * message is emitted whenever a worker sends data to the parent thread.
   * @param data the data passed from the worker to the parent via the message
   */
  onMessage?: (data: unknown) => void;

  /**
   * The 'messageerror' event is emitted when deserializing a message failed.
   */
  onMessageError?: (error: Error) => void;

  /**
   * The error event is emitted whenever there’s an uncaught exception
   *   inside the worker. The worker is then terminated, and the error
   *   is available as the first argument in the provided callback.
   * @param error the error object that was not caught in the child and is being passed to the parent
   */
  onError?: (error: Error) => void;

  /**
   * exit is emitted whenever a worker exits. If process.exit() was called
   *   inside the worker, exitCode would be provided to the callback.
   *   If the worker was terminated with worker.terminate(), the code would be 1.
   * @param exit_code the exit code used when the worker was terminated
   */
  onExit?: (exit_code: number) => void;

  /**
   * online is emitted whenever a worker stops parsing the JavaScript
   *   code and starts the execution.
   */
  onOnline?: () => void;
}
