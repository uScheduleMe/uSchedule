import { getLogger } from '@utils/logger';
import { Worker } from 'worker_threads';
import { ThenArg, WorkerExecutors, WorkerInput, WorkerJob } from './types';
import { spawnPoolWorker } from './worker_spawner';

const logger = getLogger(__filename);

/**
 * Resource: https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
 * @template JobList the map of jobs that this worker pool is capable of running
 * @template ErrorOut the type that is returned when the worker catches an error
 */
export default class WorkerPool<JobList extends WorkerExecutors, ErrorOut = never> {
  // Queue of jobs
  readonly job_queue: Array<WorkerJob<unknown, unknown, keyof JobList>> = [];

  // Map of workers by their ids
  readonly workers = new Map<number, Worker>();

  // Map of worker ids and active status
  readonly active_workers = new Map<number, boolean>();

  /**
   * Create a new worker pool
   * @param worker_file_name the file name of the worker
   * @param number_of_workers the number of workers to run in this pool
   */
  constructor(
    public worker_file_name: string,
    public number_of_workers: number,
  ) {
    for (let i = 0; i < this.number_of_workers; i++) {
      this.addWorker();
    }
  }

  /**
   * If there is an available worker, the job is run immediately,
   * otherwise the job is added to the queue to be run when a worker becomes available.
   * @param type the type of job to run
   * @param input the input data for the job
   */
  async run<T extends keyof JobList>(type: T, input: Parameters<JobList[T]>[0]): typeof promise {
    const promise = new Promise<ErrorOut | ThenArg<ReturnType<JobList[T]>>>((resolve, reject) => {
      const worker = this.getAvailableWorker();

      const new_job: WorkerJob<unknown, ErrorOut | ThenArg<ReturnType<JobList[T]>>, T> = {
        type,
        input,
        resolve,
        reject,
      };

      // Cast the jobs to a more generic type to be passed around in this class,
      //   since we don't care about the data types, other than in the method.
      type Job = this['job_queue'][never];

      if (!worker) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.job_queue.push(new_job as Job);
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      void this.runWorker(worker, new_job as Job);
    });
    return promise;
  }

  /**
   * Terminates all the workers
   */
  closePool(): void {
    for (const worker of this.workers.values()) {
      void worker.terminate();
    }
  }

  /**
   * Runs a job on the given worker
   * @param worker the worker to use for this job
   * @param job the job to run
   */
  private async runWorker(worker: Worker, job: this['job_queue'][never]): Promise<void> {
    // Sets worker to active
    this.active_workers.set(worker.threadId, true);

    // Sets up message and error listeners
    worker
      .once('message', (result: unknown) => {
        // Settle the promise with the result
        job.resolve(result);
        // Reset the worker and goto the next job
        this.runNextJob(this.cleanupWorker(worker));
      })
      .once('messageerror', (error: Error) => {
        // Settle the promise with the error
        job.reject(error);
        logger.error(`Worker ${worker.threadId} threw a messageerror`);
        // Reset the worker and goto the next job
        this.runNextJob(this.cleanupWorker(worker));
      })
      .once('error', (error: Error) => {
        // Settle the promise with the error
        job.reject(error);
        logger.error(
          `Worker ${worker.threadId} caught an error... exiting and spawning a new worker`,
        );
        this.removeWorker(worker);
        // Create a new worker since the error will cause the old one to exit
        const new_worker = this.addWorker();
        // Goto the next job
        this.runNextJob(new_worker);
      });

    const message: WorkerInput<JobList> = { type: job.type, input: job.input };

    // Starts the job on the worker
    worker.postMessage(message);
  }

  /**
   * Runs the next job (if there is one) on a selected worker
   * @param worker the worker to use for the job
   */
  private runNextJob(worker: Worker): void {
    const next_job = this.job_queue.shift();
    if (next_job) {
      void this.runWorker(worker, next_job);
    }
  }

  /**
   * Creates a new worker and adds it to the pool
   * @returns the newly created worker
   */
  private addWorker(): Worker {
    const worker = spawnPoolWorker(this.worker_file_name);
    const id = worker.threadId;

    // Can't use worker.threadId in exit listener because it is always -1 after exit
    worker.on('exit', () => logger.info(`Worker ${id} exited`));
    worker.on('online', () => logger.info(`Worker ${id} is online`));

    this.workers.set(id, worker);
    this.active_workers.set(id, false);

    return worker;
  }

  /**
   * Cleans up after a worker so it is ready for the next job
   * @param worker the worker to clean up after
   * @returns the worker
   */
  private cleanupWorker(worker: Worker): Worker {
    // Remove the listeners for the current job
    worker.removeAllListeners('message');
    worker.removeAllListeners('messageerror');
    worker.removeAllListeners('error');
    // Set the worker to inactive
    this.active_workers.set(worker.threadId, false);
    return worker;
  }

  /**
   * Removes a worker from this pool after it has been terminated due to an error
   * @param worker the worker to remove
   */
  private removeWorker(worker: Worker): void {
    this.workers.delete(worker.threadId);
    this.active_workers.delete(worker.threadId);
  }

  /**
   * Gets an available worker and marks it as unavailable,
   * or returns null if none are available
   * @returns a worker or void if one is not available
   */
  private getAvailableWorker(): Worker | undefined {
    for (const [id, worker] of this.workers) {
      if (!this.active_workers.get(id)) {
        return worker;
      }
    }
  }
}
