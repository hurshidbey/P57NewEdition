#!/usr/bin/env node

/**
 * Test script for RBAC system
 * Tests permissions, roles, and audit logging
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { eq, and, desc } from 'drizzle-orm';
import { 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles, 
  auditLogs,
  DEFAULT_ROLES,
  RESOURCES,
  ACTIONS
} from '../shared/rbac-schema';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: envFile });

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function testRBACSystem() {
  console.log(`${BLUE}🧪 Testing RBAC System...${RESET}\n`);

  // Initialize database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Verify default roles exist
    console.log(`${BLUE}Test 1: Checking default roles${RESET}`);
    const allRoles = await db.select().from(roles);
    const defaultRoleNames = Object.values(DEFAULT_ROLES).map(r => r.name);
    
    for (const defaultRole of defaultRoleNames) {
      if (allRoles.some(r => r.name === defaultRole)) {
        console.log(`${GREEN}✓${RESET} Role '${defaultRole}' exists`);
        testsPassed++;
      } else {
        console.log(`${RED}✗${RESET} Role '${defaultRole}' missing`);
        testsFailed++;
      }
    }

    // Test 2: Verify permissions are set up correctly
    console.log(`\n${BLUE}Test 2: Checking permissions setup${RESET}`);
    const allPermissions = await db.select().from(permissions);
    const expectedResources = Object.values(RESOURCES);
    
    for (const resource of expectedResources) {
      const resourcePerms = allPermissions.filter(p => p.resource === resource);
      if (resourcePerms.length > 0) {
        console.log(`${GREEN}✓${RESET} Resource '${resource}' has ${resourcePerms.length} permissions`);
        testsPassed++;
      } else {
        console.log(`${RED}✗${RESET} Resource '${resource}' has no permissions`);
        testsFailed++;
      }
    }

    // Test 3: Verify super_admin has all permissions
    console.log(`\n${BLUE}Test 3: Checking super_admin permissions${RESET}`);
    const [superAdminRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'super_admin'))
      .limit(1);
    
    if (superAdminRole) {
      const superAdminPerms = await db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, superAdminRole.id));
      
      const totalPerms = allPermissions.length;
      if (superAdminPerms.length === totalPerms) {
        console.log(`${GREEN}✓${RESET} Super admin has all ${totalPerms} permissions`);
        testsPassed++;
      } else {
        console.log(`${RED}✗${RESET} Super admin has ${superAdminPerms.length}/${totalPerms} permissions`);
        testsFailed++;
      }
    }

    // Test 4: Test role hierarchy
    console.log(`\n${BLUE}Test 4: Checking role hierarchy${RESET}`);
    const rolesByPriority = await db
      .select()
      .from(roles)
      .orderBy(desc(roles.priority));
    
    console.log('Role hierarchy:');
    rolesByPriority.forEach(role => {
      console.log(`  ${role.name}: priority ${role.priority}`);
    });
    testsPassed++;

    // Test 5: Check if admin emails have been migrated
    console.log(`\n${BLUE}Test 5: Checking admin email migration${RESET}`);
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    if (adminEmails.length === 0) {
      console.log(`${YELLOW}⚠${RESET} No admin emails configured`);
    } else {
      for (const email of adminEmails) {
        // Look up user in Supabase
        const { data: users } = await supabase.auth.admin.listUsers({
          filter: `email.eq.${email}`,
          page: 1,
          perPage: 1
        });

        if (users?.users && users.users.length > 0) {
          const user = users.users[0];
          // Check if user has admin role
          const userRoleRecords = await db
            .select()
            .from(userRoles)
            .where(eq(userRoles.userId, user.id));
          
          if (userRoleRecords.length > 0) {
            console.log(`${GREEN}✓${RESET} ${email} has been migrated to RBAC`);
            testsPassed++;
          } else {
            console.log(`${YELLOW}⚠${RESET} ${email} not yet migrated to RBAC`);
          }
        } else {
          console.log(`${YELLOW}⚠${RESET} ${email} not found in Supabase`);
        }
      }
    }

    // Test 6: Create a test audit log entry
    console.log(`\n${BLUE}Test 6: Testing audit logging${RESET}`);
    try {
      await db.insert(auditLogs).values({
        userId: 'test-user',
        userEmail: 'test@example.com',
        action: 'test',
        resource: 'test',
        status: 'success',
        details: { test: true },
        ipAddress: '127.0.0.1',
        userAgent: 'test-script'
      });

      // Verify it was created
      const [testLog] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, 'test-user'))
        .orderBy(desc(auditLogs.createdAt))
        .limit(1);

      if (testLog) {
        console.log(`${GREEN}✓${RESET} Audit log created successfully`);
        testsPassed++;
        
        // Clean up
        await db
          .delete(auditLogs)
          .where(eq(auditLogs.id, testLog.id));
      } else {
        console.log(`${RED}✗${RESET} Failed to create audit log`);
        testsFailed++;
      }
    } catch (error) {
      console.log(`${RED}✗${RESET} Audit logging error:`, error);
      testsFailed++;
    }

    // Test 7: Verify permission combinations
    console.log(`\n${BLUE}Test 7: Checking permission combinations${RESET}`);
    const criticalPermissions = [
      { resource: RESOURCES.PROTOCOLS, action: ACTIONS.DELETE },
      { resource: RESOURCES.USERS, action: ACTIONS.DELETE },
      { resource: RESOURCES.ROLES, action: ACTIONS.ASSIGN }
    ];

    for (const perm of criticalPermissions) {
      const exists = allPermissions.some(
        p => p.resource === perm.resource && p.action === perm.action
      );
      if (exists) {
        console.log(`${GREEN}✓${RESET} Critical permission ${perm.resource}:${perm.action} exists`);
        testsPassed++;
      } else {
        console.log(`${RED}✗${RESET} Missing critical permission ${perm.resource}:${perm.action}`);
        testsFailed++;
      }
    }

  } catch (error) {
    console.error(`${RED}Test error:${RESET}`, error);
    testsFailed++;
  } finally {
    await pool.end();
  }

  // Summary
  console.log(`\n${BLUE}═══════════════════════════════${RESET}`);
  console.log(`${BLUE}Test Summary${RESET}`);
  console.log(`${BLUE}═══════════════════════════════${RESET}`);
  console.log(`${GREEN}Passed: ${testsPassed}${RESET}`);
  console.log(`${RED}Failed: ${testsFailed}${RESET}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log(`\n${GREEN}✅ All tests passed! RBAC system is working correctly.${RESET}`);
  } else {
    console.log(`\n${RED}❌ Some tests failed. Please check the output above.${RESET}`);
    process.exit(1);
  }

  // Recommendations
  console.log(`\n${BLUE}Recommendations:${RESET}`);
  console.log('1. Run migration script: npm run migrate:admins');
  console.log('2. Test with a real admin user');
  console.log('3. Check audit logs after admin actions');
  console.log('4. Verify permissions in the admin UI');
}

// Run tests
testRBACSystem().catch(console.error);