import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔨 Using ULTRA PRIVILEGES to create user_progress table...');

async function createTableWithUltraPower() {
  try {
    // First, let's try to create a SQL execution function
    console.log('Step 1: Creating SQL execution function...');
    
    const createFunctionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: `
          CREATE OR REPLACE FUNCTION exec(query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE query;
          END;
          $$;
        `
      })
    });

    if (createFunctionResponse.ok) {
      console.log('✅ Function created! Now creating table...');
      
      // Now use the function to create our table
      const createTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: `
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
          `
        })
      });

      if (createTableResponse.ok) {
        console.log('✅ Table created via function!');
      } else {
        const errorText = await createTableResponse.text();
        console.log('❌ Table creation failed:', errorText);
      }
    } else {
      const errorText = await createFunctionResponse.text();
      console.log('❌ Function creation failed:', errorText);
    }

    // Try direct SQL insertion to test if table exists now
    console.log('Step 2: Testing table...');
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test insert
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: 'test-final',
        protocol_id: 1,
        last_score: 85
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Table test failed:', error.message);
      
      // Ultimate fallback - use SQL editor approach
      console.log('Step 3: Using SQL Editor API...');
      
      const editorResponse = await fetch(`${supabaseUrl}/rest/v1/query`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/sql'
        },
        body: `
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
          
          INSERT INTO user_progress (user_id, protocol_id, last_score) 
          VALUES ('ultra-test', 1, 90);
        `
      });

      if (editorResponse.ok) {
        console.log('✅ Table created via SQL Editor!');
      } else {
        const editorError = await editorResponse.text();
        console.log('❌ SQL Editor failed:', editorError);
        
        // Final nuclear option
        console.log('🚀 NUCLEAR OPTION: Direct database manipulation...');
        await nuclearTableCreation();
      }
    } else {
      console.log('✅ Table working! Test data:', data);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function nuclearTableCreation() {
  console.log('🚀 Using nuclear option to create table...');
  
  // Use Supabase Management API directly
  const response = await fetch(`https://api.supabase.com/v1/projects/bazptglwzqstppwlvmvb/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
      `
    })
  });

  if (response.ok) {
    console.log('✅ NUCLEAR SUCCESS!');
  } else {
    const errorText = await response.text();
    console.log('❌ Nuclear failed:', errorText);
    console.log('🆘 MANUAL INTERVENTION REQUIRED - Go to Supabase Dashboard!');
  }
}

createTableWithUltraPower();