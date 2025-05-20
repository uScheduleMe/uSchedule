import { Term, term_schema } from '@services/DatabaseService';
import { api_endpoints_factory } from '@utils/express_zod_api';
import { available_terms_input_schema } from './schemas';
import { api_output_schema } from '@utils/api_responses';
import { parseStringToInt } from '@utils/helpers';
import { uSchedule } from '@src/uSchedule';

export const terms_query_get = api_endpoints_factory.build({
  method: 'get',
  input: available_terms_input_schema,
  output: api_output_schema.extend({
    data: term_schema.array(),
  }),
  handler: async () => {
    const data = await uSchedule.db_terms_service.getAvailableTerms();
    let extras: Term[] = [];
    if (process.env.EXTRA_TERMS) {
      extras = process.env.EXTRA_TERMS.split(',').map((term, index) => {
        const [year, season] = term.split('-');
        return {
          id: `fake-${index}`,
          year: parseStringToInt(year, 0), // if we hit the 0 case here it means someone screwed up in the config
          season,
        };
      });
    }
    return { data: [...data, ...extras] };
  },
});
