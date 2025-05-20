import { SECRET_DEF, SecretService } from '@services/Secret';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { db_credential_schema } from './schemas';
import postgres from 'postgres';

let db_cache: PostgresJsDatabase | null = null;

const dbInitializer = () => {
  const db_creds_raw = JSON.parse(SecretService.getSecret(SECRET_DEF.DB_CREDENTIALS) ?? '{}');
  const db_creds = db_credential_schema.parse(db_creds_raw);
  const client = postgres(
    `postgresql://${db_creds.username}:${db_creds.password}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/uschedule`,
  );
  return drizzle(client);
};

export const getDbInstance = () => {
  if (!db_cache) {
    db_cache = dbInitializer();
  }
  return db_cache;
};
