import { DatabaseService } from './DatabaseService';
import { eq } from 'drizzle-orm';
import { User, UsersFilterParams } from './schemas';
import { calendar, calendar_share, email, sso_provider, user } from '@src/drizzle/schema';
import { jsonAggBuildObject } from './drizzle-helpers/json-agg';
import { alias } from 'drizzle-orm/pg-core';

export class DbUserService extends DatabaseService {
  async getUsers(user_filters: UsersFilterParams): Promise<User[]> {
    const shared_to = alias(user, 'shared_to');
    const emails_by_user = this.db
      .select({
        user_id: email.user_id,
        emails: jsonAggBuildObject({
          email_address: email.email_address,
        }).as('emails'),
      })
      .from(email)
      .groupBy(email.user_id)
      .as('email_by_user');

    const providers_by_user = this.db
      .select({
        user_id: sso_provider.user_id,
        providers: jsonAggBuildObject({
          provider: sso_provider.provider,
        }).as('providers'),
      })
      .from(sso_provider)
      .groupBy(sso_provider.user_id)
      .as('providers_by_user');

    const query = this.db
      .selectDistinctOn([user.uuid], {
        uuid: user.uuid,
        given_name: user.given_name,
        family_name: user.family_name,
        emails: emails_by_user.emails,
        providers: providers_by_user.providers,
      })
      .from(user)
      .innerJoin(emails_by_user, eq(user.id, emails_by_user.user_id))
      .innerJoin(providers_by_user, eq(user.id, providers_by_user.user_id))
      .leftJoin(calendar, eq(user.id, calendar.user_id))
      .leftJoin(calendar_share, eq(calendar.id, calendar_share.calendar_id))
      .leftJoin(shared_to, eq(shared_to.id, calendar_share.user_id))
      .where(user_filters.shared_with ? eq(shared_to.uuid, user_filters.shared_with) : undefined);

    const result = await query;
    this.logQuery('user', JSON.stringify(user_filters), result);
    return result;
  }
}
