import { createClient } from '@supabase/supabase-js';
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

async function ensureRBACPermissions() {
  console.log('🚀 Starting RBAC permissions setup via Supabase...');

  try {
    // Check if RBAC tables exist
    console.log('\n📊 Checking RBAC tables...');
    
    const tables = ['roles', 'permissions', 'role_permissions', 'user_roles', 'audit_logs'];
    const missingTables = [];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') { // Table doesn't exist
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.error(`\n❌ Missing RBAC tables: ${missingTables.join(', ')}`);
      console.log('\n📝 Please run the following migration first:');
      console.log('   npm run db:push');
      console.log('   or apply the migration in /drizzle/0003_add_rbac_tables.sql');
      return;
    }

    // Get admin users
    console.log('\n👥 Finding admin users...');
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    if (adminEmails.length === 0) {
      console.log('⚠️  No admin emails configured in ADMIN_EMAILS');
      return;
    }

    // List all Supabase users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Failed to list users:', usersError);
      return;
    }

    console.log(`\n📊 Found ${users?.length || 0} total users`);
    
    // Find admin users
    const adminUsers = users?.filter(u => adminEmails.includes(u.email || '')) || [];
    console.log(`✅ Found ${adminUsers.length} admin users from ADMIN_EMAILS`);

    // Check existing roles
    const { data: existingRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    
    if (rolesError) {
      console.error('❌ Failed to fetch roles:', rolesError);
      return;
    }

    console.log(`\n📋 Existing roles: ${existingRoles?.map(r => r.name).join(', ') || 'none'}`);

    // Create basic admin role if it doesn't exist
    let adminRoleId: number | null = null;
    const adminRole = existingRoles?.find(r => r.name === 'admin');
    
    if (!adminRole) {
      console.log('\n🔨 Creating admin role...');
      const { data: newRole, error: createError } = await supabase
        .from('roles')
        .insert({
          name: 'admin',
          description: 'General administrative access',
          priority: 50
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create admin role:', createError);
        return;
      }
      
      adminRoleId = newRole.id;
      console.log('✅ Created admin role');
    } else {
      adminRoleId = adminRole.id;
      console.log('ℹ️  Admin role already exists');
    }

    // Assign admin role to admin users
    console.log('\n👑 Assigning admin role to users...');
    
    for (const user of adminUsers) {
      // Check if user already has the role
      const { data: existingUserRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', adminRoleId)
        .single();
      
      if (!existingUserRole) {
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: adminRoleId,
            granted_by: 'system'
          });
        
        if (assignError) {
          console.error(`❌ Failed to assign role to ${user.email}:`, assignError);
        } else {
          console.log(`✅ Assigned admin role to ${user.email}`);
        }
      } else {
        console.log(`ℹ️  ${user.email} already has admin role`);
      }
    }

    console.log('\n✅ RBAC setup completed!');
    console.log('\n📊 Summary:');
    console.log(`  - Admin users configured: ${adminUsers.length}`);
    console.log(`  - Admin role ID: ${adminRoleId}`);
    console.log('\n💡 Note: The admin panel now uses email-based fallback authentication.');
    console.log('   Users in ADMIN_EMAILS will have full admin access.');
    
  } catch (error) {
    console.error('\n❌ Error during RBAC setup:', error);
  }
}

// Run the script
ensureRBACPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));