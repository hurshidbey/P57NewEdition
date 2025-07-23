import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running RBAC migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'drizzle', '0003_add_rbac_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(`${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      const { error } = await supabase.rpc('execute_sql', { query: statement });
      
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`  - Total statements: ${statements.length}`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Failed: ${errorCount}`);
    
    // Now assign admin role to admin users
    console.log('\n👥 Assigning admin roles...');
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    if (adminEmails.length > 0) {
      // Get admin role ID
      const { data: adminRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();
      
      if (roleError || !adminRole) {
        console.error('❌ Failed to find admin role');
        return;
      }
      
      console.log(`✅ Found admin role with ID: ${adminRole.id}`);
      
      // List users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Failed to list users:', usersError);
        return;
      }
      
      // Find admin users
      const adminUsers = users?.filter(u => adminEmails.includes(u.email || '')) || [];
      console.log(`\n📧 Admin emails configured: ${adminEmails.join(', ')}`);
      console.log(`👤 Found ${adminUsers.length} matching users`);
      
      for (const user of adminUsers) {
        const { error: assignError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role_id: adminRole.id,
            granted_by: 'system'
          }, {
            onConflict: 'user_id,role_id'
          });
        
        if (assignError) {
          console.error(`❌ Failed to assign role to ${user.email}:`, assignError.message);
        } else {
          console.log(`✅ Assigned admin role to ${user.email}`);
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));