import 'dotenv/config';

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'bazptglwzqstppwlvmvb'; // From your DATABASE_URL

console.log('🐳 Using Docker approach with Supabase Management API...');
console.log('🔑 Access token available:', !!accessToken);
console.log('📋 Project ref:', projectRef);

async function createTableWithManagementAPI() {
  try {
    // Use the Supabase Management API to execute SQL
    console.log('🔨 Creating user_progress table via Management API...');
    
    const sqlQuery = `
      -- Create user_progress table
      CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          protocol_id INTEGER NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          practice_count INTEGER DEFAULT 1,
          last_score INTEGER,
          UNIQUE(user_id, protocol_id)
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id);
      
      -- Insert test data
      INSERT INTO user_progress (user_id, protocol_id, last_score, practice_count) 
      VALUES ('test-docker-user', 1, 85, 1)
      ON CONFLICT (user_id, protocol_id) DO UPDATE SET
          last_score = EXCLUDED.last_score,
          practice_count = user_progress.practice_count + 1,
          completed_at = NOW();
      
      -- Grant permissions
      GRANT ALL ON user_progress TO authenticated;
      GRANT ALL ON user_progress TO anon;
      GRANT USAGE, SELECT ON SEQUENCE user_progress_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE user_progress_id_seq TO anon;
    `;

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: sqlQuery
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Management API SUCCESS:', result);
      
      // Test the table by using our existing Supabase client
      await testTable();
      
    } else {
      const errorText = await response.text();
      console.log('❌ Management API failed:', response.status, errorText);
      
      // Try alternative approach with SQL Editor
      await tryAlternativeApproach();
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    await tryAlternativeApproach();
  }
}

async function tryAlternativeApproach() {
  console.log('🔄 Trying alternative: SQL query via REST API...');
  
  try {
    // Use the SQL endpoint
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
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
      const result = await response.json();
      console.log('✅ Alternative approach SUCCESS:', result);
      await testTable();
    } else {
      const errorText = await response.text();
      console.log('❌ Alternative approach failed:', response.status, errorText);
      
      // Final approach: Use the CLI in Docker
      await useDockerCLI();
    }

  } catch (error) {
    console.error('❌ Alternative approach error:', error.message);
    await useDockerCLI();
  }
}

async function useDockerCLI() {
  console.log('🐳 Using Supabase CLI in Docker...');
  
  const { execSync } = await import('child_process');
  
  try {
    // Create a temporary SQL file
    const fs = await import('fs');
    const sqlContent = `
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
      VALUES ('docker-test', 2, 90)
      ON CONFLICT (user_id, protocol_id) DO NOTHING;
    `;
    
    fs.writeFileSync('/tmp/create_user_progress.sql', sqlContent);
    
    // Use Docker to run Supabase CLI
    const command = `docker run --rm -v /tmp:/tmp supabase/cli:latest supabase db push --project-ref ${projectRef} --token ${accessToken} --file /tmp/create_user_progress.sql`;
    
    console.log('🔨 Running Docker command...');
    const result = execSync(command, { encoding: 'utf8' });
    console.log('✅ Docker CLI SUCCESS:', result);
    
    await testTable();
    
  } catch (error) {
    console.error('❌ Docker CLI failed:', error.message);
    console.log('🆘 FINAL FALLBACK: Manual dashboard creation required');
    printManualInstructions();
  }
}

async function testTable() {
  console.log('🧪 Testing user_progress table...');
  
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
        user_id: 'final-test-user',
        protocol_id: 3,
        last_score: 95
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Table test failed:', error.message);
    } else {
      console.log('✅ TABLE IS WORKING! Test data:', data);
      
      // Test our API endpoint
      console.log('🔗 Testing API endpoint...');
      const response = await fetch('http://localhost:8080/api/progress/final-test-user');
      if (response.ok) {
        const progress = await response.json();
        console.log('✅ API ENDPOINT WORKING! Progress:', progress);
      } else {
        console.log('❌ API endpoint failed:', response.status);
      }
    }

  } catch (error) {
    console.error('❌ Table test error:', error.message);
  }
}

function printManualInstructions() {
  console.log(`
🚨 MANUAL INSTRUCTIONS:
1. Go to: https://supabase.com/dashboard/project/${projectRef}/editor
2. Run this SQL:

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

-- Grant permissions
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON user_progress TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_progress_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_progress_id_seq TO anon;

3. Click "RUN" button
4. Restart your application
  `);
}

createTableWithManagementAPI();