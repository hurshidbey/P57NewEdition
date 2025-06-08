// Database connection for Payme controller
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: any = null;

export async function getDatabase() {
  if (db) return db;
  
  // Try to get connection string from environment
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    if (!dbPassword) {
      throw new Error("No database credentials available");
    }
    connectionString = `postgresql://postgres:${dbPassword}@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres`;
  }

  try {
    const client = postgres(connectionString, {
      ssl: 'require'
    });
    db = drizzle(client);
    return db;
  } catch (error) {
    throw new Error(`Database connection failed: ${(error as Error).message}`);
  }
}

export { db };