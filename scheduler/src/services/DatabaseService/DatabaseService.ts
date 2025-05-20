import { Logger, getLogger } from '@utils/logger';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export abstract class DatabaseService {
  constructor(
    protected readonly db: PostgresJsDatabase,
    protected readonly logger: Logger = getLogger(__filename),
  ) {}

  protected logQuery(data_type: string, params: number | string, results: unknown) {
    const num_results = Array.isArray(results) ? results.length : results ? 1 : 0;

    this.logger.debug(
      `Running query for '${data_type}'. Params: '${params}'. Num results: '${num_results}'`,
    );
  }
}
