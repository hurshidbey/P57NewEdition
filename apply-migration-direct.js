// Direct migration application using Supabase client
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.production' });

async function applyMigration() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔄 Applying payment_sessions migration directly...');
  
  // Read migration file
  const migrationSQL = fs.readFileSync('./migrations/add_payment_sessions_table.sql', 'utf8');
  
  // Split into individual statements (Supabase can't handle multiple statements in one query)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip pure comment lines
    if (statement.trim().startsWith('--')) continue;
    
    console.log(`\n📝 Executing statement ${i + 1}/${statements.length}...`);
    console.log(statement.substring(0, 50) + '...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        // Try direct approach for CREATE TABLE
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
          console.log('⚠️  exec_sql not available, checking if table already exists...');
          
          // Check if table exists
          const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'payment_sessions');
            
          if (tables && tables.length > 0) {
            console.log('✅ Table payment_sessions already exists');
            continue;
          } else {
            console.error('❌ Cannot create table without SQL access');
          }
        } else {
          console.error('❌ Error:', error.message);
        }
      } else {
        console.log('✅ Success');
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }
  
  // Verify table was created
  console.log('\n🔍 Verifying table creation...');
  const { data: testSelect, error: selectError } = await supabase
    .from('payment_sessions')
    .select('id')
    .limit(1);
    
  if (!selectError) {
    console.log('✅ Table payment_sessions verified successfully!');
  } else {
    console.error('❌ Table verification failed:', selectError.message);
  }
}

applyMigration().catch(console.error);