import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Get database connection from environment
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres`;

if (!connectionString && !process.env.SUPABASE_URL) {
  throw new Error('Database connection not configured');
}

// Create database connection
let db: any = null;

try {
  // Try to use the existing Supabase client if available
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // For now, use direct postgres connection for Drizzle operations
    // The notification service needs direct database access for transactions
    if (connectionString && connectionString !== 'undefined') {
      const client = postgres(connectionString, {
        ssl: 'require',
        max: 10,
        idle_timeout: 30,
        connect_timeout: 30,
      });
      db = drizzle(client);
    }
  }
} catch (error) {
  console.error('[DB] Failed to initialize database connection:', error);
  // Will use Supabase REST API as fallback in notification service
}

export { db };