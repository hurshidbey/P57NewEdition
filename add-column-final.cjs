const { createClient } = require('@supabase/supabase-js');

// Use the exact credentials from .env.production
const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

async function addColumnWithServiceRole() {
  console.log('🔧 Adding is_free_access column with service role key...');
  
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
    
    // Test connection first
    console.log('Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('protocols')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Method 1: Try using raw SQL via RPC if it exists
    console.log('Attempting SQL execution via RPC...');
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('sql', { 
        query: 'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS is_free_access BOOLEAN NOT NULL DEFAULT false;' 
      });
    
    if (!rpcError) {
      console.log('✅ RPC SQL execution successful:', rpcData);
      return;
    }
    
    console.log('RPC failed, trying raw query...');
    
    // Method 2: Try direct query
    const { data: queryData, error: queryError } = await supabase
      .from('protocols')
      .select('*')
      .limit(0); // This should give us schema info
    
    console.log('Schema check error:', queryError);
    
    // Method 3: Since we can't do DDL, let's modify our approach
    console.log('DDL not available via REST API. Implementing fallback...');
    
    // Test if the column already exists by trying to select it
    const { data: columnTest, error: columnError } = await supabase
      .from('protocols')
      .select('is_free_access')
      .limit(1);
    
    if (columnError && columnError.message.includes('is_free_access')) {
      console.log('❌ Column does not exist and cannot be added via REST API');
      console.log('✅ Will use fallback approach in application code');
    } else {
      console.log('✅ Column already exists or query succeeded');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addColumnWithServiceRole();