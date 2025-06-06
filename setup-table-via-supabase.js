import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTable() {
  try {
    // Use the SQL editor feature via the REST API
    console.log('🔨 Creating user_progress table via SQL...');
    
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

    // Try using rpc with a custom function, or direct table operations
    // First, let's see what functions are available
    const { data: functions, error: funcError } = await supabase.rpc('version');
    
    if (funcError) {
      console.log('⚠️  RPC not available, trying manual table creation...');
      
      // Try to directly access the table to see if it exists
      const { error: testError } = await supabase
        .from('user_progress')
        .select('id')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('❌ Table does not exist. You need to create it manually in Supabase Dashboard.');
        console.log('📋 Go to: https://supabase.com/dashboard/project/bazptglwzqstppwlvmvb/editor');
        console.log('📝 Run this SQL:');
        console.log(createTableSQL);
        return;
      }
    }

    console.log('✅ Supabase connection working');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupTable();