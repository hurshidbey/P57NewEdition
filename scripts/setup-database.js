import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = fs.readFileSync('scripts/create-tables.sql', 'utf8');

async function executeSql() {
  try {
    // Execute SQL using Supabase's REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error executing SQL:', error);
    } else {
      console.log('Tables created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Try alternative approach using pg directly
import pg from 'pg';
const { Client } = pg;

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Execute the SQL
    await client.query(sql);
    console.log('Tables created successfully!');
    
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await client.end();
  }
}

// Try the direct database connection
setupDatabase();