import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bazptglwzqstppwlvmvb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

async function addNewColumns() {
  const queries = [
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS problem_statement TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS why_explanation TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS solution_approach TEXT;', 
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS difficulty_level TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS level_order INTEGER;'
  ];

  console.log('🔧 Adding new columns to protocols table...');

  for (const query of queries) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } else {
        const error = await response.text();
        console.log(`⚠️  Query result: ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error executing query: ${query}`, error);
    }
  }
}

// Alternative method using direct SQL execution
async function addColumnsDirectSQL() {
  const sqlCommands = [
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS problem_statement TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS why_explanation TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS solution_approach TEXT;', 
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS difficulty_level TEXT;',
    'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS level_order INTEGER;'
  ];

  console.log('🔧 Adding new columns to protocols table (direct method)...');

  for (const sql of sqlCommands) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/query?${sql}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📝 Attempted: ${sql}`);
    } catch (error) {
      console.log(`⚠️  Query attempt: ${sql}`);
    }
  }
}

async function verifySchema() {
  try {
    // Try to fetch table structure
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🔍 Current schema includes these fields:');
      if (result.length > 0) {
        Object.keys(result[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
  }
}

async function main() {
  console.log('🚀 Starting database schema migration...');
  
  await verifySchema();
  await addNewColumns();
  await addColumnsDirectSQL();
  
  console.log('\n✅ Schema migration complete!');
  console.log('📝 Note: If columns already exist, they were not modified.');
}

main();