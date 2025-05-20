import { TimetableSections } from '@services/DatabaseService';
import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp as pgTimestamp,
  serial,
  smallint,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const auth_group = pgTable(
  'auth_group',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 150 }).notNull(),
  },
  (table) => {
    return {
      name_a6ea08ec_like: index('auth_group_name_a6ea08ec_like').on(table.name),
      name_key: uniqueIndex('auth_group_name_key').on(table.name),
    };
  },
);

export const accreditation_unit = pgTable('data_access_accreditationunit', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const timestamp = pgTable(
  'data_access_timestamp',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    reason: varchar('reason', { length: 255 }).notNull(),
    timestamp: integer('timestamp').notNull(),
  },
  (table) => {
    return {
      reason_ddb8233e_uniq: uniqueIndex('data_access_timestamp_reason_ddb8233e_uniq').on(
        table.reason,
      ),
    };
  },
);

export const timetable = pgTable(
  'data_access_timetable',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
    sections: jsonb('sections').notNull().$type<TimetableSections>(),
    year: integer('year').notNull(),
    season: varchar('term', { length: 6 }).notNull(),
    subject_code: varchar('subject_code', { length: 5 }).notNull(),
    course_code: varchar('course_code', { length: 10 }).notNull(),
    course_name: varchar('course_name', { length: 255 }).notNull(),
    school: varchar('school', { length: 20 }).notNull(),
    date_created: integer('date_created').notNull(),
    date_updated: integer('date_updated').notNull(),
  },
  (table) => {
    return {
      school_year_term_subject_b2910901_uniq: uniqueIndex(
        'data_access_timetable_school_year_term_subject_b2910901_uniq',
      ).on(table.year, table.season, table.subject_code, table.course_code, table.school),
    };
  },
);

export const activity_accreditation_assignment = pgTable(
  'data_access_activityaccreditationassignment',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    quantity: integer('quantity').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    activity_id: bigint('activity_id', { mode: 'number' })
      .notNull()
      .references(() => activity.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    aus_id: bigint('aus_id', { mode: 'number' })
      .notNull()
      .references(() => accreditation_unit.id),
  },
  (table) => {
    return {
      data_access_activityaccred_activity_id_0492a07b: index(
        'data_access_activityaccred_activity_id_0492a07b',
      ).on(table.activity_id),
      aus_id_9469fd11: index('data_access_activityaccreditationassignment_aus_id_9469fd11').on(
        table.aus_id,
      ),
    };
  },
);

export const user = pgTable(
  'data_access_user',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    given_name: varchar('given_name', { length: 255 }).notNull(),
    family_name: varchar('family_name', { length: 255 }).notNull(),
    disp_name: varchar('disp_name', { length: 255 }),
    uuid: uuid('uuid').notNull(),
  },
  (table) => {
    return {
      uuid_d0e51d4b_uniq: uniqueIndex('data_access_user_uuid_d0e51d4b_uniq').on(table.uuid),
    };
  },
);

export const auth_user_user_permissions = pgTable(
  'auth_user_user_permissions',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: integer('user_id')
      .notNull()
      .references(() => auth_user.id),
    permission_id: integer('permission_id')
      .notNull()
      .references(() => auth_permission.id),
  },
  (table) => {
    return {
      permission_id_1fbb5f2c: index('auth_user_user_permissions_permission_id_1fbb5f2c').on(
        table.permission_id,
      ),
      user_id_a95ead1b: index('auth_user_user_permissions_user_id_a95ead1b').on(table.user_id),
      user_id_permission_id_14a6b632_uniq: uniqueIndex(
        'auth_user_user_permissions_user_id_permission_id_14a6b632_uniq',
      ).on(table.user_id, table.permission_id),
    };
  },
);

export const calendar_components = pgTable(
  'data_access_calendarcomponents',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    section_id: varchar('section_id', { length: 10 }).notNull(),
    component_id: varchar('component_id', { length: 10 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    calendar_id: bigint('calendar_id', { mode: 'number' })
      .notNull()
      .references(() => calendar.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    timetable_id: bigint('timetable_id', { mode: 'number' })
      .notNull()
      .references(() => timetable.id),
  },
  (table) => {
    return {
      calendar_id_6ff919b5: index('data_access_calendarcomponents_calendar_id_6ff919b5').on(
        table.calendar_id,
      ),
      timetable_id_ffb6c4dd: index('data_access_calendarcomponents_timetable_id_ffb6c4dd').on(
        table.timetable_id,
      ),
    };
  },
);

export const available_terms = pgTable(
  'data_access_availableterms',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    year: integer('year').notNull(),
    term: varchar('term', { length: 6 }).notNull(),
  },
  (table) => {
    return {
      year_term_5106bbbb_uniq: uniqueIndex('data_access_availableterms_year_term_5106bbbb_uniq').on(
        table.year,
        table.term,
      ),
    };
  },
);

export const course = pgTable(
  'data_access_course',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    school: varchar('school', { length: 20 }).notNull(),
    subject_code: varchar('subject_code', { length: 5 }).notNull(),
    course_code: varchar('course_code', { length: 10 }).notNull(),
    course_name: varchar('course_name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    date_created: integer('date_created').notNull(),
    date_updated: integer('date_updated').notNull(),
  },
  (table) => {
    return {
      school_subject_code_cour_95e6b147_uniq: uniqueIndex(
        'data_access_course_school_subject_code_cour_95e6b147_uniq',
      ).on(table.school, table.subject_code, table.course_code),
    };
  },
);

export const django_session = pgTable(
  'django_session',
  {
    session_key: varchar('session_key', { length: 40 }).primaryKey().notNull(),
    session_data: text('session_data').notNull(),
    expire_date: pgTimestamp('expire_date', { withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => {
    return {
      expire_date_a5c62663: index('django_session_expire_date_a5c62663').on(table.expire_date),
      session_key_c0390e0f_like: index('django_session_session_key_c0390e0f_like').on(
        table.session_key,
      ),
    };
  },
);

export const subject = pgTable('data_access_subject', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
  subject: varchar('subject', { length: 72 }).notNull(),
  subject_code: varchar('subject_code', { length: 5 }).notNull(),
  link: varchar('link', { length: 66 }).notNull(),
});

export const schedule = pgTable(
  'data_access_schedule',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    season: varchar('term', { length: 6 }).notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    year: integer('year').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    calendar_id: bigint('calendar_id', { mode: 'number' })
      .notNull()
      .references(() => calendar.id),
  },
  (table) => {
    return {
      calendar_id_1b90eb66: index('data_access_schedule_calendar_id_1b90eb66').on(
        table.calendar_id,
      ),
      calendar_id_term_423d8aae_uniq: uniqueIndex(
        'data_access_schedule_calendar_id_term_423d8aae_uniq',
      ).on(table.season, table.calendar_id),
    };
  },
);

export const django_migrations = pgTable('django_migrations', {
  id: serial('id').primaryKey().notNull(),
  app: varchar('app', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  applied: pgTimestamp('applied', { withTimezone: true, mode: 'string' }).notNull(),
});

export const email = pgTable(
  'data_access_email',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    email_address: varchar('email_address', { length: 254 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      email_address_2ae6341c_like: index('data_access_email_email_address_2ae6341c_like').on(
        table.email_address,
      ),
      email_address_key: uniqueIndex('data_access_email_email_address_key').on(table.email_address),
      user_id_c1ad3f84: index('data_access_email_user_id_c1ad3f84').on(table.user_id),
    };
  },
);

export const calendar = pgTable(
  'data_access_calendar',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    is_primary: boolean('is_primary').notNull(),
    notifications_enabled: boolean('notifications_enabled').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      user_id_6af63a8b: index('data_access_calendar_user_id_6af63a8b').on(table.user_id),
      single_primary_calendar_per_user: uniqueIndex('single_primary_calendar_per_user').on(
        table.is_primary,
        table.user_id,
      ),
    };
  },
);

export const calendar_share = pgTable(
  'data_access_calendarshare',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    calendar_id: bigint('calendar_id', { mode: 'number' })
      .notNull()
      .references(() => calendar.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      calendar_id_c73e1734: index('data_access_calendarshare_calendar_id_c73e1734').on(
        table.calendar_id,
      ),
      user_id_2943f69a: index('data_access_calendarshare_user_id_2943f69a').on(table.user_id),
      user_id_calendar_id_c52abf63_uniq: uniqueIndex(
        'data_access_calendarshare_user_id_calendar_id_c52abf63_uniq',
      ).on(table.calendar_id, table.user_id),
    };
  },
);

export const accreditation = pgTable('data_access_accreditation', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  required_aus: jsonb('required_aus').notNull(),
});

export const auth_user = pgTable(
  'auth_user',
  {
    id: serial('id').primaryKey().notNull(),
    password: varchar('password', { length: 128 }).notNull(),
    last_login: pgTimestamp('last_login', { withTimezone: true, mode: 'string' }),
    is_superuser: boolean('is_superuser').notNull(),
    username: varchar('username', { length: 150 }).notNull(),
    first_name: varchar('first_name', { length: 150 }).notNull(),
    last_name: varchar('last_name', { length: 150 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    is_staff: boolean('is_staff').notNull(),
    is_active: boolean('is_active').notNull(),
    date_joined: pgTimestamp('date_joined', { withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => {
    return {
      username_6821ab7c_like: index('auth_user_username_6821ab7c_like').on(table.username),
      username_key: uniqueIndex('auth_user_username_key').on(table.username),
    };
  },
);

export const auth_user_groups = pgTable(
  'auth_user_groups',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: integer('user_id')
      .notNull()
      .references(() => auth_user.id),
    group_id: integer('group_id')
      .notNull()
      .references(() => auth_group.id),
  },
  (table) => {
    return {
      group_id_97559544: index('auth_user_groups_group_id_97559544').on(table.group_id),
      user_id_6a12ed8b: index('auth_user_groups_user_id_6a12ed8b').on(table.user_id),
      user_id_group_id_94350c0c_uniq: uniqueIndex(
        'auth_user_groups_user_id_group_id_94350c0c_uniq',
      ).on(table.user_id, table.group_id),
    };
  },
);

export const auth_group_permissions = pgTable(
  'auth_group_permissions',
  {
    id: serial('id').primaryKey().notNull(),
    group_id: integer('group_id')
      .notNull()
      .references(() => auth_group.id),
    permission_id: integer('permission_id')
      .notNull()
      .references(() => auth_permission.id),
  },
  (table) => {
    return {
      group_id_b120cbf9: index('auth_group_permissions_group_id_b120cbf9').on(table.group_id),
      group_id_permission_id_0cd325b0_uniq: uniqueIndex(
        'auth_group_permissions_group_id_permission_id_0cd325b0_uniq',
      ).on(table.group_id, table.permission_id),
      permission_id_84c5c92e: index('auth_group_permissions_permission_id_84c5c92e').on(
        table.permission_id,
      ),
    };
  },
);

export const django_content_type = pgTable(
  'django_content_type',
  {
    id: serial('id').primaryKey().notNull(),
    app_label: varchar('app_label', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
  },
  (table) => {
    return {
      app_label_model_76bd3d3b_uniq: uniqueIndex(
        'django_content_type_app_label_model_76bd3d3b_uniq',
      ).on(table.app_label, table.model),
    };
  },
);

export const sso_provider = pgTable(
  'data_access_ssoprovider',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    provider: varchar('provider', { length: 128 }).notNull(),
    provider_uid: varchar('provider_uid', { length: 255 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    user_id: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      provider_provider_uid_645da6de_uniq: uniqueIndex(
        'data_access_ssoprovider_provider_provider_uid_645da6de_uniq',
      ).on(table.provider, table.provider_uid),
      user_id_4b01c055: index('data_access_ssoprovider_user_id_4b01c055').on(table.user_id),
    };
  },
);

export const auth_permission = pgTable(
  'auth_permission',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    content_type_id: integer('content_type_id')
      .notNull()
      .references(() => django_content_type.id),
    codename: varchar('codename', { length: 100 }).notNull(),
  },
  (table) => {
    return {
      content_type_id_2f476e4b: index('auth_permission_content_type_id_2f476e4b').on(
        table.content_type_id,
      ),
      content_type_id_codename_01ab375a_uniq: uniqueIndex(
        'auth_permission_content_type_id_codename_01ab375a_uniq',
      ).on(table.content_type_id, table.codename),
    };
  },
);

export const django_admin_log = pgTable(
  'django_admin_log',
  {
    id: serial('id').primaryKey().notNull(),
    action_time: pgTimestamp('action_time', { withTimezone: true, mode: 'string' }).notNull(),
    object_id: text('object_id'),
    object_repr: varchar('object_repr', { length: 200 }).notNull(),
    action_flag: smallint('action_flag').notNull(),
    change_message: text('change_message').notNull(),
    content_type_id: integer('content_type_id').references(() => django_content_type.id),
    user_id: integer('user_id')
      .notNull()
      .references(() => auth_user.id),
  },
  (table) => {
    return {
      content_type_id_c4bce8eb: index('django_admin_log_content_type_id_c4bce8eb').on(
        table.content_type_id,
      ),
      user_id_c564eba6: index('django_admin_log_user_id_c564eba6').on(table.user_id),
    };
  },
);

export const activity = pgTable(
  'data_access_activity',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    course_id: bigint('course_id', { mode: 'number' })
      .notNull()
      .references(() => course.id),
  },
  (table) => {
    return {
      course_id_key: uniqueIndex('data_access_activity_course_id_key').on(table.course_id),
    };
  },
);
