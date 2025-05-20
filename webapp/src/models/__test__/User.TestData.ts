import { User } from '@models/User';

export const testUser = new User({
  uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  given_name: 'Johnny',
  family_name: 'uSchedule',
  emails: [{ email_address: 'test@uschedule.me' }],
  providers: [{ provider: 'facebook' }, { provider: 'microsoft' }, { provider: 'google' }],
});
