import { available_terms } from '@src/drizzle/schema';
import { DatabaseService } from './DatabaseService';
import { columnToString } from './drizzle-helpers/utils';

export class DbTermsService extends DatabaseService {
  async getAvailableTerms() {
    const query = this.db
      .select({
        id: columnToString(available_terms.id),
        season: available_terms.term,
        year: available_terms.year,
      })
      .from(available_terms);

    const result = await query;
    this.logQuery('available_terms', '', result);
    return result;
  }
}
