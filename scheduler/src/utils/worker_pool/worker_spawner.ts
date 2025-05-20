import { Worker } from 'worker_threads';
import path from 'path';
import { WorkerConfig } from './types';

function resolveWorkerPath(worker: string): string {
  return process.env.RUN_SRC === 'true'
    ? '../../workers/run_ts_worker.js'
    : `../../workers/${worker}.js`;
}

/**
 * Spawns a worker in new thread
 * @param config see type field comments for more details
 */
export function spawnWorker(config: WorkerConfig): Worker {
  const worker: Worker = new Worker(path.join(__dirname, resolveWorkerPath(config.worker)), {
    workerData: {
      data: config.data,
      worker: config.worker,
    },
  });

  // Attached messaging functions, if they exist
  if (config.onMessage) {
    worker.on('message', config.onMessage);
  }

  if (config.onMessageError) {
    worker.on('messageerror', config.onMessageError);
  }

  if (config.onOnline) {
    worker.on('online', config.onOnline);
  }

  if (config.onError) {
    worker.on('error', config.onError);
  }

  if (config.onExit) {
    worker.on('exit', config.onExit);
  }

  return worker;
}

/**
 * Starts and returns a new pool worker
 * @param worker name of the worker file (without file extension)
 * @returns a new Worker instance
 */
export function spawnPoolWorker(worker: string): Worker {
  return new Worker(path.join(__dirname, resolveWorkerPath(worker)), {
    workerData: { worker },
  });
}
