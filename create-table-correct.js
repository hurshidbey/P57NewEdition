import 'dotenv/config';

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'bazptglwzqstppwlvmvb';

console.log('🔨 Creating user_progress table in correct project:', projectRef);

async function createTableInCorrectProject() {
  try {
    // Method 1: Use Supabase Management API directly
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
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
          
          -- Grant RLS permissions
          ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
          
          -- Allow authenticated users to manage their own progress
          CREATE POLICY IF NOT EXISTS "Users can manage own progress" ON user_progress
          FOR ALL USING (user_id = auth.uid()::text OR user_id = current_user);
          
          -- Allow service role to access all data
          CREATE POLICY IF NOT EXISTS "Service role full access" ON user_progress
          FOR ALL TO service_role USING (true);
          
          -- Insert test data
          INSERT INTO user_progress (user_id, protocol_id, last_score, practice_count) 
          VALUES ('test-final-user', 1, 85, 1)
          ON CONFLICT (user_id, protocol_id) DO UPDATE SET
              last_score = EXCLUDED.last_score,
              practice_count = user_progress.practice_count + 1,
              completed_at = NOW();
        `
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Table created successfully!', result);
      
      // Test the table
      await testTableDirectly();
      
    } else {
      const errorText = await response.text();
      console.log('❌ Management API failed:', response.status, errorText);
      
      // Fallback to direct Supabase client method
      await useSupabaseClient();
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    await useSupabaseClient();
  }
}

async function useSupabaseClient() {
  console.log('🔄 Fallback: Using Supabase client directly...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First check if table exists by trying to select from it
    const { data: existingData, error: existingError } = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);

    if (existingError && existingError.message.includes('does not exist')) {
      console.log('❌ Table does not exist. Manual creation required.');
      printDashboardInstructions();
    } else if (existingError) {
      console.log('❌ Unknown error checking table:', existingError.message);
      printDashboardInstructions();
    } else {
      console.log('✅ Table already exists! Data:', existingData);
      await testTableDirectly();
    }

  } catch (error) {
    console.error('❌ Supabase client error:', error.message);
    printDashboardInstructions();
  }
}

async function testTableDirectly() {
  console.log('🧪 Testing table with direct insert...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Test insert
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: 'test-system-user',
        protocol_id: 5,
        last_score: 90
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Insert test failed:', error.message);
    } else {
      console.log('✅ INSERT TEST SUCCESSFUL! Data:', data);
      
      // Test our API
      console.log('🔗 Testing our API endpoint...');
      const apiResponse = await fetch('http://localhost:8080/api/progress/test-system-user');
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('✅ API WORKING! Progress data:', apiData);
        console.log('🎉 EVERYTHING IS WORKING! Progress system is ready!');
      } else {
        console.log('❌ API test failed:', apiResponse.status);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

function printDashboardInstructions() {
  console.log(`
🚨 MANUAL CREATION REQUIRED:

1. Go to: https://supabase.com/dashboard/project/${projectRef}/editor
2. Paste and run this SQL:

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    protocol_id INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    practice_count INTEGER DEFAULT 1,
    last_score INTEGER,
    UNIQUE(user_id, protocol_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_protocol_id ON user_progress(protocol_id);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own progress  
CREATE POLICY "Users can manage own progress" ON user_progress
FOR ALL USING (user_id = auth.uid()::text OR user_id = current_user);

-- Allow service role full access
CREATE POLICY "Service role full access" ON user_progress
FOR ALL TO service_role USING (true);

3. Click "RUN"
4. Restart your application

After running this SQL, your progress system will work perfectly!
  `);
}

createTableInCorrectProject();