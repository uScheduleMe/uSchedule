import { ResponseData } from '@utils/api_responses';
import WorkerPool from '@utils/worker_pool';
import { main_pool_executors } from '@workers/main_pool';
import { parseStringToInt } from '@utils/helpers';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

const NUM_WORKERS_FALLBACK = 0;
const NUM_WORKERS = parseStringToInt(process.env.NUM_WORKERS, NUM_WORKERS_FALLBACK, 0);

export let main_pool: WorkerPool<typeof main_pool_executors, ResponseData<null>> | null = null;

export function initWorkerPool() {
  const name = 'main_pool';

  if (!NUM_WORKERS) {
    logger.info(`Skipping worker pool initialization for '${name}'. 0 workers requested.`);
    return;
  }

  if (main_pool) {
    logger.warn(`Worker pool '${name}' is already initialized.`);
    return;
  }

  logger.info(`Initializing worker pool '${name}' with ${NUM_WORKERS} workers`);

  main_pool = new WorkerPool<typeof main_pool_executors, ResponseData<null>>(name, NUM_WORKERS);
}
