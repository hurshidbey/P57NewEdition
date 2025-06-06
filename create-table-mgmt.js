import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Creating user_progress table via Supabase Management API...');

async function createTableViaSQL() {
  try {
    // Use the direct SQL endpoint
    const sqlQuery = `
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
      
      -- Insert a test record
      INSERT INTO user_progress (user_id, protocol_id, last_score) 
      VALUES ('test-user-123', 1, 75)
      ON CONFLICT (user_id, protocol_id) DO NOTHING;
    `;

    // Try using the query endpoint directly
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sqlQuery
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Management API failed:', errorText);
      
      // Try PostgREST SQL execution
      console.log('🔄 Trying PostgREST execution...');
      
      const postgrestResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sql: sqlQuery
        })
      });
      
      if (!postgrestResponse.ok) {
        const postgrestError = await postgrestResponse.text();
        console.log('❌ PostgREST failed:', postgrestError);
        
        // Manual table creation approach
        console.log('🔄 Using manual SQL execution approach...');
        await manualTableCreation();
      } else {
        console.log('✅ Table created via PostgREST!');
      }
    } else {
      console.log('✅ Table created via Management API!');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    await manualTableCreation();
  }
}

async function manualTableCreation() {
  console.log('🔨 Manual table creation using direct PostgreSQL connection...');
  
  // Import pg dynamically
  const { Client } = await import('pg');
  
  // Parse the Supabase URL to get connection details
  const dbUrl = process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    const createTableSQL = `
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
    `;

    await client.query(createTableSQL);
    console.log('✅ Table created successfully!');

    // Test insert
    const result = await client.query(`
      INSERT INTO user_progress (user_id, protocol_id, last_score) 
      VALUES ('test-user-123', 1, 75)
      ON CONFLICT (user_id, protocol_id) DO UPDATE SET
          last_score = EXCLUDED.last_score,
          completed_at = NOW()
      RETURNING *;
    `);
    
    console.log('✅ Test insert successful:', result.rows[0]);

  } catch (error) {
    console.error('❌ PostgreSQL error:', error.message);
  } finally {
    await client.end();
  }
}

createTableViaSQL();