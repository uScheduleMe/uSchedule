import type { Config } from 'drizzle-kit';

export default {
  schema: './schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://pguser:NmeyWCCJnG2j5cTM@localhost:5430/uschedule?schema=public',
  },
  introspect: {
    casing: 'preserve',
  },
} satisfies Config;
