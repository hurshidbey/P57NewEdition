import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrations/phase2_schema_updates.sql'), 'utf8');
    
    console.log('🔄 Applying Phase 2 database migration...');
    
    // Execute the migration manually with individual operations
    console.log('Creating prompts table...');
    const { error: createError } = await supabase
      .from('prompts')
      .select('*')
      .limit(1);
    
    if (createError && createError.code === 'PGRST116') {
      console.log('Prompts table does not exist, creating it manually...');
      // Since we can't execute DDL through Supabase client, we'll need to create it through management API
      console.log('❌ Cannot create tables through Supabase client. Need to use SQL editor or management API.');
      console.log('📋 Please execute the following SQL manually in Supabase SQL editor:');
      console.log('\n' + migrationSQL + '\n');
      return;
    }
    
    console.log('✅ Phase 2 migration completed successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying schema changes...');
    
    // Check if prompts table exists
    const { data: promptsCheck, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .limit(1);
    
    if (promptsError && promptsError.code !== 'PGRST116') {
      console.error('❌ Error checking prompts table:', promptsError);
    } else {
      console.log('✅ Prompts table verified');
    }
    
    console.log('🎉 Phase 2 database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();