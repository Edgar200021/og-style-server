import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

export const client = new Client({
  connectionString: process.env.DB_CONNECTION_STRING,
});

export const database = drizzle(client);

const fn = async () => {
  await client.connect();
  await migrate(database, { migrationsFolder: 'src/db' });
  await client.end();
};

fn();
