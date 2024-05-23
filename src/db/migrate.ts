import { sql } from '@vercel/postgres';
import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { Client } from 'pg';

export const client = new Client({
  connectionString: process.env.DB_CONNECTION_STRING,
});

export const database = drizzle(sql);

const fn = async () => {
  await client.connect();
  await migrate(database, { migrationsFolder: 'src/db' });
  await client.end();
};

fn();
