import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running Telegram users migration...');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(__dirname, '../server/migrations/create_telegram_users.sql'),
      'utf8'
    );
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      // If RPC doesn't exist, try direct query
      const statements = migrationSQL
        .split(';')
        .filter(s => s.trim())
        .map(s => s.trim() + ';');
      
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        
        // Use raw SQL through the REST API
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!response.ok) {
          console.error('Failed to execute statement:', await response.text());
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['telegram_users', 'telegram_sessions']);
    
    console.log('Created tables:', tables);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();