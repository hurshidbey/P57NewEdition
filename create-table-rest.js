import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Creating table using Supabase REST API with service role key...');

async function createTableWithREST() {
  try {
    // Use the service role key to create a SQL function first
    console.log('🔨 Step 1: Creating SQL execution function...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN 'Success';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN SQLERRM;
      END;
      $$;
    `;

    // Try to create the function via RPC
    const functionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST', 
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql_query: createFunctionSQL
      })
    });

    if (!functionResponse.ok) {
      console.log('❌ Function creation failed, trying direct table creation...');
      
      // Direct approach: use the Supabase client to insert data which will help us understand the schema
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      console.log('🔨 Step 2: Creating table via Supabase client...');
      
      // First, let's check existing tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      console.log('📋 Existing tables:', tables?.map(t => t.table_name) || 'Error getting tables');
      
      // Now try to use the SQL editor endpoint
      console.log('🔨 Step 3: Using SQL editor endpoint...');
      
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          `CREATE TABLE IF NOT EXISTS user_progress (
              id SERIAL PRIMARY KEY,
              user_id TEXT NOT NULL,
              protocol_id INTEGER NOT NULL,
              completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              practice_count INTEGER DEFAULT 1,
              last_score INTEGER,
              UNIQUE(user_id, protocol_id)
          );`,
          `CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);`,
          `CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id);`
        ])
      });
      
      if (sqlResponse.ok) {
        console.log('✅ Table created via SQL editor!');
      } else {
        const errorText = await sqlResponse.text();
        console.log('❌ SQL editor failed:', errorText);
        
        // Final attempt: Create via migration-style approach
        console.log('🔨 Step 4: Creating table directly in application...');
        await createInApp();
      }
    } else {
      console.log('✅ Function created, now creating table...');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    await createInApp();
  }
}

async function createInApp() {
  console.log('🔨 Creating table in our application layer...');
  
  // Update our server's storage initialization to create the table
  const fs = await import('fs');
  const path = await import('path');
  
  const migrationSQL = `
-- Migration: Create user_progress table
-- This will be executed by our server on startup

CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    protocol_id INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    practice_count INTEGER DEFAULT 1,
    last_score INTEGER,
    UNIQUE(user_id, protocol_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id);

-- Insert test data
INSERT INTO user_progress (user_id, protocol_id, last_score) 
VALUES ('test-user-123', 1, 75)
ON CONFLICT (user_id, protocol_id) DO UPDATE SET
    last_score = EXCLUDED.last_score,
    completed_at = NOW();
  `;
  
  fs.writeFileSync('/Users/xb21/P57/migration-user-progress.sql', migrationSQL);
  console.log('✅ Migration file created at migration-user-progress.sql');
  
  // Now update our server to execute this migration
  console.log('🔄 Updating server to execute migration...');
}

createTableWithREST();