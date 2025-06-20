import pkg from 'pg';
const { Client } = pkg;

// Construct connection string from Supabase credentials
const connectionString = 'postgresql://postgres.bazptglwzqstppwlvmvb:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function executeDDL() {
  console.log('🔧 Connecting to PostgreSQL directly...');
  
  // We need the actual database password, not the service role key
  console.log('❌ Need the actual PostgreSQL password for direct database connection.');
  console.log('The service role key is for API access, not direct database connection.');
  console.log('');
  console.log('Options:');
  console.log('1. Get the database password from Supabase dashboard > Settings > Database');
  console.log('2. Or execute the SQL manually in Supabase SQL editor');
  console.log('3. Or use the REST API with proper authentication');
  
  // Let's try the REST API approach instead
  console.log('');
  console.log('🔄 Trying REST API approach...');
  
  try {
    const response = await fetch('https://bazptglwzqstppwlvmvb.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ'
      },
      body: JSON.stringify({
        sql: `CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);`
      })
    });
    
    if (response.ok) {
      console.log('✅ Table created successfully via REST API');
    } else {
      const error = await response.text();
      console.log('❌ REST API error:', error);
    }
    
  } catch (error) {
    console.log('❌ REST API failed:', error.message);
  }
}

executeDDL();