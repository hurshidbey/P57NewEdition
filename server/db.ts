import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create the connection
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the drizzle instance
export const db = drizzle(sql);