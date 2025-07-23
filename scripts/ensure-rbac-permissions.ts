import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import { 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles,
  DEFAULT_ROLES,
  RESOURCES,
  ACTIONS
} from '../shared/rbac-schema';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Use connection pooler for better reliability
const connectionString = process.env.DATABASE_URL?.replace(
  'db.bazptglwzqstppwlvmvb.supabase.co',
  'aws-0-us-west-1.pooler.supabase.com'
);

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function ensureRBACPermissions() {
  console.log('🚀 Starting RBAC permissions setup...');

  try {
    // Step 1: Create default roles
    console.log('\n📋 Creating default roles...');
    const roleRecords: Record<string, number> = {};
    
    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      const existingRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);
      
      if (existingRole.length === 0) {
        const [newRole] = await db
          .insert(roles)
          .values({
            name: roleData.name,
            description: roleData.description,
            priority: roleData.priority
          })
          .returning();
        
        roleRecords[roleData.name] = newRole.id;
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        roleRecords[roleData.name] = existingRole[0].id;
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }

    // Step 2: Create permissions
    console.log('\n🔑 Creating permissions...');
    const permissionRecords: Record<string, number> = {};
    
    // Define all permissions needed
    const allPermissions = [
      // Protocols
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.READ },
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.CREATE },
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.UPDATE },
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.DELETE },
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.TOGGLE_FREE },
      
      // Prompts
      { resource: RESOURCES.PROMPTS, action: ACTIONS.READ },
      { resource: RESOURCES.PROMPTS, action: ACTIONS.CREATE },
      { resource: RESOURCES.PROMPTS, action: ACTIONS.UPDATE },
      { resource: RESOURCES.PROMPTS, action: ACTIONS.DELETE },
      
      // Users
      { resource: RESOURCES.USERS, action: ACTIONS.READ },
      { resource: RESOURCES.USERS, action: ACTIONS.UPDATE },
      { resource: RESOURCES.USERS, action: ACTIONS.UPDATE_TIER },
      
      // Payments
      { resource: RESOURCES.PAYMENTS, action: ACTIONS.READ },
      { resource: RESOURCES.PAYMENTS, action: ACTIONS.REFUND },
      
      // Coupons
      { resource: RESOURCES.COUPONS, action: ACTIONS.READ },
      { resource: RESOURCES.COUPONS, action: ACTIONS.CREATE },
      { resource: RESOURCES.COUPONS, action: ACTIONS.UPDATE },
      { resource: RESOURCES.COUPONS, action: ACTIONS.DELETE },
      { resource: RESOURCES.COUPONS, action: ACTIONS.TOGGLE },
      
      // Audit Logs
      { resource: RESOURCES.AUDIT_LOGS, action: ACTIONS.READ },
      
      // Roles
      { resource: RESOURCES.ROLES, action: ACTIONS.READ },
      { resource: RESOURCES.ROLES, action: ACTIONS.CREATE },
      { resource: RESOURCES.ROLES, action: ACTIONS.UPDATE },
      { resource: RESOURCES.ROLES, action: ACTIONS.DELETE },
      { resource: RESOURCES.ROLES, action: ACTIONS.ASSIGN },
    ];

    for (const perm of allPermissions) {
      const existingPerm = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.resource, perm.resource),
            eq(permissions.action, perm.action)
          )
        )
        .limit(1);
      
      if (existingPerm.length === 0) {
        const [newPerm] = await db
          .insert(permissions)
          .values({
            resource: perm.resource,
            action: perm.action,
            description: `${perm.action} ${perm.resource}`
          })
          .returning();
        
        permissionRecords[`${perm.resource}:${perm.action}`] = newPerm.id;
        console.log(`✅ Created permission: ${perm.resource}:${perm.action}`);
      } else {
        permissionRecords[`${perm.resource}:${perm.action}`] = existingPerm[0].id;
        console.log(`ℹ️  Permission already exists: ${perm.resource}:${perm.action}`);
      }
    }

    // Step 3: Assign permissions to roles
    console.log('\n🔗 Assigning permissions to roles...');
    
    // Super Admin gets all permissions
    console.log('\n👑 Assigning all permissions to super_admin...');
    for (const [permKey, permId] of Object.entries(permissionRecords)) {
      const existingAssignment = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleRecords['super_admin']),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);
      
      if (existingAssignment.length === 0) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: roleRecords['super_admin'],
            permissionId: permId,
            grantedBy: 'system'
          });
        console.log(`  ✅ Assigned ${permKey} to super_admin`);
      }
    }

    // Admin gets most permissions (except role management)
    console.log('\n👨‍💼 Assigning permissions to admin...');
    const adminPermissions = Object.entries(permissionRecords).filter(
      ([key]) => !key.startsWith(RESOURCES.ROLES + ':')
    );
    
    for (const [permKey, permId] of adminPermissions) {
      const existingAssignment = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleRecords['admin']),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);
      
      if (existingAssignment.length === 0) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: roleRecords['admin'],
            permissionId: permId,
            grantedBy: 'system'
          });
        console.log(`  ✅ Assigned ${permKey} to admin`);
      }
    }

    // Content Manager gets content-related permissions
    console.log('\n📝 Assigning permissions to content_manager...');
    const contentPermissions = Object.entries(permissionRecords).filter(
      ([key]) => 
        key.startsWith(RESOURCES.PROTOCOLS + ':') ||
        key.startsWith(RESOURCES.PROMPTS + ':') ||
        key === `${RESOURCES.COUPONS}:${ACTIONS.READ}`
    );
    
    for (const [permKey, permId] of contentPermissions) {
      const existingAssignment = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleRecords['content_manager']),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);
      
      if (existingAssignment.length === 0) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: roleRecords['content_manager'],
            permissionId: permId,
            grantedBy: 'system'
          });
        console.log(`  ✅ Assigned ${permKey} to content_manager`);
      }
    }

    // Support gets read-only permissions
    console.log('\n🎧 Assigning permissions to support...');
    const supportPermissions = Object.entries(permissionRecords).filter(
      ([key]) => key.endsWith(':' + ACTIONS.READ)
    );
    
    for (const [permKey, permId] of supportPermissions) {
      const existingAssignment = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleRecords['support']),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);
      
      if (existingAssignment.length === 0) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: roleRecords['support'],
            permissionId: permId,
            grantedBy: 'system'
          });
        console.log(`  ✅ Assigned ${permKey} to support`);
      }
    }

    // Step 4: Assign admin role to admin emails
    console.log('\n👥 Assigning admin role to configured admin users...');
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    if (adminEmails.length > 0) {
      // Get Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      for (const email of adminEmails) {
        // Find user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === email);
        
        if (user) {
          // Check if user already has admin role
          const existingRole = await db
            .select()
            .from(userRoles)
            .where(
              and(
                eq(userRoles.userId, user.id),
                eq(userRoles.roleId, roleRecords['admin'])
              )
            )
            .limit(1);
          
          if (existingRole.length === 0) {
            await db
              .insert(userRoles)
              .values({
                userId: user.id,
                roleId: roleRecords['admin'],
                grantedBy: 'system'
              });
            console.log(`  ✅ Assigned admin role to ${email}`);
          } else {
            console.log(`  ℹ️  ${email} already has admin role`);
          }
        } else {
          console.log(`  ⚠️  User not found: ${email}`);
        }
      }
    }

    console.log('\n✅ RBAC permissions setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Roles created: ${Object.keys(roleRecords).length}`);
    console.log(`  - Permissions created: ${Object.keys(permissionRecords).length}`);
    console.log(`  - Admin emails configured: ${adminEmails.length}`);

  } catch (error) {
    console.error('\n❌ Error during RBAC setup:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
ensureRBACPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));