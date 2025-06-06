import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Creating user_progress table in Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTable() {
  try {
    // Create the table using SQL
    const { data, error } = await supabase.rpc('sql', {
      query: `
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
      `
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      
      // Try alternative approach - direct HTTP call
      console.log('🔄 Trying alternative approach...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: `
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
          `
        })
      });
      
      if (response.ok) {
        console.log('✅ Table created via HTTP!');
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP error:', errorText);
        
        // Final fallback - try to insert directly to force table creation
        console.log('🔄 Trying to create via insert...');
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: 'test-setup',
            protocol_id: 999,
            last_score: 100
          });
        
        if (insertError) {
          console.error('❌ Insert error (expected):', insertError.message);
        }
      }
    } else {
      console.log('✅ Table created successfully:', data);
    }

    // Test the table
    console.log('\n📋 Testing table...');
    const { data: testData, error: testError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Table test failed:', testError.message);
    } else {
      console.log('✅ Table exists and accessible:', testData?.length || 0, 'rows');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

createTable();