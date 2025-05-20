-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "auth_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_accreditationunit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_timestamp" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reason" varchar(255) NOT NULL,
	"timestamp" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_timetable" (
	"id" bigint PRIMARY KEY DEFAULT nextval('data_access_timetable_id_seq'::regclass) NOT NULL,
	"sections" jsonb NOT NULL,
	"year" integer NOT NULL,
	"term" varchar(6) NOT NULL,
	"subject_code" varchar(5) NOT NULL,
	"course_code" varchar(10) NOT NULL,
	"course_name" varchar(255) NOT NULL,
	"school" varchar(20) NOT NULL,
	"date_created" integer NOT NULL,
	"date_updated" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_activityaccreditationassignment" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"activity_id" bigint NOT NULL,
	"aus_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"given_name" varchar(255) NOT NULL,
	"family_name" varchar(255) NOT NULL,
	"disp_name" varchar(255),
	"uuid" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_user_user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_calendarcomponents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"section_id" varchar(10) NOT NULL,
	"component_id" varchar(10) NOT NULL,
	"calendar_id" bigint NOT NULL,
	"timetable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_availableterms" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"term" varchar(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_course" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"school" varchar(20) NOT NULL,
	"subject_code" varchar(5) NOT NULL,
	"course_code" varchar(10) NOT NULL,
	"course_name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"date_created" integer NOT NULL,
	"date_updated" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "django_session" (
	"session_key" varchar(40) PRIMARY KEY NOT NULL,
	"session_data" text NOT NULL,
	"expire_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_subject" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"subject" varchar(72) NOT NULL,
	"subject_code" varchar(5) NOT NULL,
	"link" varchar(66) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_schedule" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"term" varchar(6) NOT NULL,
	"name" varchar(128) NOT NULL,
	"year" integer NOT NULL,
	"calendar_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "django_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"app" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"applied" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_email" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email_address" varchar(254) NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_calendar" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"is_primary" boolean NOT NULL,
	"notifications_enabled" boolean NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_calendarshare" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"calendar_id" bigint NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_accreditation" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"required_aus" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"password" varchar(128) NOT NULL,
	"last_login" timestamp with time zone,
	"is_superuser" boolean NOT NULL,
	"username" varchar(150) NOT NULL,
	"first_name" varchar(150) NOT NULL,
	"last_name" varchar(150) NOT NULL,
	"email" varchar(254) NOT NULL,
	"is_staff" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"date_joined" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_user_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_group_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "django_content_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_label" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_ssoprovider" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"provider" varchar(128) NOT NULL,
	"provider_uid" varchar(255) NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content_type_id" integer NOT NULL,
	"codename" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "django_admin_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"action_time" timestamp with time zone NOT NULL,
	"object_id" text,
	"object_repr" varchar(200) NOT NULL,
	"action_flag" smallint NOT NULL,
	"change_message" text NOT NULL,
	"content_type_id" integer,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_access_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"course_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_group_name_a6ea08ec_like" ON "auth_group" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_group_name_key" ON "auth_group" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_timestamp_reason_ddb8233e_uniq" ON "data_access_timestamp" ("reason");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_timetable_school_year_term_subject_b2910901_uniq" ON "data_access_timetable" ("year","term","subject_code","course_code","school");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_activityaccred_activity_id_0492a07b" ON "data_access_activityaccreditationassignment" ("activity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_activityaccreditationassignment_aus_id_9469fd11" ON "data_access_activityaccreditationassignment" ("aus_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_user_uuid_d0e51d4b_uniq" ON "data_access_user" ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_user_permissions_permission_id_1fbb5f2c" ON "auth_user_user_permissions" ("permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_user_permissions_user_id_a95ead1b" ON "auth_user_user_permissions" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_user_permissions_user_id_permission_id_14a6b632_uniq" ON "auth_user_user_permissions" ("user_id","permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_calendarcomponents_calendar_id_6ff919b5" ON "data_access_calendarcomponents" ("calendar_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_calendarcomponents_timetable_id_ffb6c4dd" ON "data_access_calendarcomponents" ("timetable_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_availableterms_year_term_5106bbbb_uniq" ON "data_access_availableterms" ("year","term");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_course_school_subject_code_cour_95e6b147_uniq" ON "data_access_course" ("school","subject_code","course_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "django_session_expire_date_a5c62663" ON "django_session" ("expire_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "django_session_session_key_c0390e0f_like" ON "django_session" ("session_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_schedule_calendar_id_1b90eb66" ON "data_access_schedule" ("calendar_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_schedule_calendar_id_term_423d8aae_uniq" ON "data_access_schedule" ("term","calendar_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_email_email_address_2ae6341c_like" ON "data_access_email" ("email_address");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_email_email_address_key" ON "data_access_email" ("email_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_email_user_id_c1ad3f84" ON "data_access_email" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_calendar_user_id_6af63a8b" ON "data_access_calendar" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "single_primary_calendar_per_user" ON "data_access_calendar" ("is_primary","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_calendarshare_calendar_id_c73e1734" ON "data_access_calendarshare" ("calendar_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_calendarshare_user_id_2943f69a" ON "data_access_calendarshare" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_calendarshare_user_id_calendar_id_c52abf63_uniq" ON "data_access_calendarshare" ("calendar_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_username_6821ab7c_like" ON "auth_user" ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_username_key" ON "auth_user" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_groups_group_id_97559544" ON "auth_user_groups" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_groups_user_id_6a12ed8b" ON "auth_user_groups" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_groups_user_id_group_id_94350c0c_uniq" ON "auth_user_groups" ("user_id","group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions" ("group_id","permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type" ("app_label","model");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_ssoprovider_provider_provider_uid_645da6de_uniq" ON "data_access_ssoprovider" ("provider","provider_uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_access_ssoprovider_user_id_4b01c055" ON "data_access_ssoprovider" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_permission_content_type_id_2f476e4b" ON "auth_permission" ("content_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission" ("content_type_id","codename");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" ("content_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "django_admin_log_user_id_c564eba6" ON "django_admin_log" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_access_activity_course_id_key" ON "data_access_activity" ("course_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_activityaccreditationassignment" ADD CONSTRAINT "data_access_activity_activity_id_0492a07b_fk_data_acce" FOREIGN KEY ("activity_id") REFERENCES "data_access_activity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_activityaccreditationassignment" ADD CONSTRAINT "data_access_activity_aus_id_9469fd11_fk_data_acce" FOREIGN KEY ("aus_id") REFERENCES "data_access_accreditationunit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_calendarcomponents" ADD CONSTRAINT "data_access_calendarcomponents_calendar_id_6ff919b5_fk" FOREIGN KEY ("calendar_id") REFERENCES "data_access_calendar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_calendarcomponents" ADD CONSTRAINT "data_access_calendarcomponents_timetable_id_ffb6c4dd_fk" FOREIGN KEY ("timetable_id") REFERENCES "data_access_timetable"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_schedule" ADD CONSTRAINT "data_access_schedule_calendar_id_1b90eb66_fk" FOREIGN KEY ("calendar_id") REFERENCES "data_access_calendar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_email" ADD CONSTRAINT "data_access_email_user_id_c1ad3f84_fk" FOREIGN KEY ("user_id") REFERENCES "data_access_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_calendar" ADD CONSTRAINT "data_access_calendar_user_id_6af63a8b_fk" FOREIGN KEY ("user_id") REFERENCES "data_access_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_calendarshare" ADD CONSTRAINT "data_access_calendarshare_calendar_id_c73e1734_fk" FOREIGN KEY ("calendar_id") REFERENCES "data_access_calendar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_calendarshare" ADD CONSTRAINT "data_access_calendarshare_user_id_2943f69a_fk" FOREIGN KEY ("user_id") REFERENCES "data_access_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_group_id_97559544_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_user_id_6a12ed8b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_ssoprovider" ADD CONSTRAINT "data_access_ssoprovider_user_id_4b01c055_fk" FOREIGN KEY ("user_id") REFERENCES "data_access_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_access_activity" ADD CONSTRAINT "data_access_activity_course_id_d9811eb6_fk_data_acce" FOREIGN KEY ("course_id") REFERENCES "data_access_course"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/