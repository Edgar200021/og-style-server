import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: 'src/db',
  schema: 'src/db/schema.ts',
  dbCredentials: {
    url: process.env.DB_CONNECTION_STRING,
  },
});
