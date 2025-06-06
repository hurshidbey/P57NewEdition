import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check if user_progress table exists
    console.log('\n📋 Testing user_progress table...');
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ user_progress table error:', error.message);
      
      // Try to create the table
      console.log('\n🔨 Attempting to create user_progress table...');
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_progress (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            protocol_id INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT NOW(),
            practice_count INTEGER DEFAULT 1,
            last_score INTEGER,
            UNIQUE(user_id, protocol_id)
          );
        `
      });
      
      if (createError) {
        console.error('❌ Failed to create table:', createError.message);
      } else {
        console.log('✅ Table created successfully');
      }
    } else {
      console.log('✅ user_progress table exists, rows:', data?.length);
    }
    
    // Test 2: Try to insert a test record
    console.log('\n💾 Testing insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: 'test-user-123',
        protocol_id: 1,
        last_score: 75
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Insert successful:', insertData);
    }
    
    // Test 3: Try to read it back
    console.log('\n📖 Testing read...');
    const { data: readData, error: readError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', 'test-user-123');
    
    if (readError) {
      console.error('❌ Read error:', readError.message);
    } else {
      console.log('✅ Read successful:', readData);
    }
    
  } catch (error) {
    console.error('💥 Connection failed:', error.message);
  }
}

testConnection();