const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

async function addColumn() {
  console.log('🔧 Adding is_free_access column to protocols table...');
  
  try {
    // Use direct postgres connection
    const pool = new Pool({
      connectionString: 'postgresql://postgres:20031000a@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres',
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('Connected to database...');
    
    const result = await pool.query(`
      ALTER TABLE protocols 
      ADD COLUMN IF NOT EXISTS is_free_access BOOLEAN NOT NULL DEFAULT false;
    `);
    
    console.log('✅ ALTER TABLE executed successfully');
    console.log('Result:', result);
    
    // Verify the column was added
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'protocols' AND column_name = 'is_free_access';
    `);
    
    console.log('✅ Column verification:', verifyResult.rows);
    
    await pool.end();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addColumn();