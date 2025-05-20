import { test_echo_executors } from '@workers/test_echo';
import { test_run_forever_executors } from '@workers/test_run-forever';
import { expect } from 'chai';
import WorkerPool from './WorkerPool';

describe('Worker Pool Testing', () => {
  // Give these guys lots of time to run just in case
  const pool_timeout = 15000;

  describe('Echo Pool Testing', () => {
    const data_test_template = {
      data: {
        string_test: 'string',
        number_test: 1,
        is_bool_test: true,
        null_test: null,
        list_test: [-1, 0, 1],
      },
    };

    let data_test: typeof data_test_template;
    let pool: WorkerPool<typeof test_echo_executors>;
    const pool_size = 2;

    before(() => {
      data_test = { ...data_test_template };

      // Set up the pool
      process.env.RUN_SRC = 'true';
      pool = new WorkerPool('test_echo', pool_size);
    });

    it('Should start with 2 workers and 0 active workers', () => {
      expect(pool.workers.size).to.equal(pool_size);

      for (const is_active of pool.active_workers.values()) {
        expect(is_active).to.be.false;
      }
    }).timeout(pool_timeout);

    it('Should use a worker to send back data, then be cleaned up', async () => {
      // Start with no active workers
      for (const is_active of pool.active_workers.values()) {
        expect(is_active).to.be.false;
      }

      // Run code
      const result = await pool.run('echo', data_test);

      // Correct data
      expect(result).to.deep.equal(data_test);

      // No active workers
      for (const is_active of pool.active_workers.values()) {
        expect(is_active).to.be.false;
      }

      // Worker cleaned up
      for (const worker of pool.workers.values()) {
        expect(worker.listenerCount('message')).to.equal(0);
        expect(worker.listenerCount('messageerror')).to.equal(0);
        expect(worker.listenerCount('error')).to.equal(0);
      }
    }).timeout(pool_timeout);

    after(() => {
      pool.closePool();
    });
  });

  describe('Run Forever Pool Testing', () => {
    let pool: WorkerPool<typeof test_run_forever_executors>;

    before(() => {
      // Set up the pool
      process.env.RUN_SRC = 'true';
      pool = new WorkerPool('test_run-forever', 1);
    });

    it('Should start 2 jobs and have 1 in queue', async () => {
      // Start with 1 worker
      expect(pool.workers.size).to.equal(1);

      // Start with no active workers
      for (const is_active of pool.active_workers.values()) {
        expect(is_active).to.be.false;
      }

      // Start jobs
      void pool.run('runForever', 'test1');
      void pool.run('runForever', 'test2');

      // Should have one active worker
      for (const is_active of pool.active_workers.values()) {
        expect(is_active).to.be.true;
      }

      const num_active = Array.from(pool.active_workers.values()).filter(
        (is_active) => is_active,
      ).length;
      expect(num_active).to.equal(1);

      // Should have a job in the queue
      expect(pool.job_queue.length).to.equal(1);
      expect(pool.job_queue[0].input).to.equal('test2');

      // Worker should not be cleaned up
      for (const worker of pool.workers.values()) {
        expect(worker.listenerCount('message')).to.equal(1);
        expect(worker.listenerCount('messageerror')).to.equal(1);
        expect(worker.listenerCount('error')).to.equal(1);
      }

      pool.closePool();
    }).timeout(pool_timeout);

    after(() => {
      pool.closePool();
    });
  });
});
