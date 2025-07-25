#!/usr/bin/env tsx
/**
 * Script to assign admin role to users
 * Usage: npm run assign-admin -- user@email.com [another@email.com ...]
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import { roles, userRoles } from '../shared/rbac-schema';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.production' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function assignAdminRole(userEmails: string[]) {
  try {
    // Get the admin role
    const [adminRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .limit(1);

    if (!adminRole) {
      console.error('❌ Admin role not found in database');
      console.log('Run database migrations first: npm run db:push');
      return;
    }

    console.log(`✅ Found admin role with ID: ${adminRole.id}`);

    for (const email of userEmails) {
      try {
        // Find user in Supabase
        const { data: users, error: searchError } = await supabase.auth.admin.listUsers({
          filter: {
            email: email
          }
        });

        if (searchError || !users || users.users.length === 0) {
          console.error(`❌ User not found: ${email}`);
          continue;
        }

        const user = users.users[0];
        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

        // Check if user already has admin role
        const [existingRole] = await db
          .select()
          .from(userRoles)
          .where(
            and(
              eq(userRoles.userId, user.id),
              eq(userRoles.roleId, adminRole.id)
            )
          )
          .limit(1);

        if (existingRole) {
          console.log(`ℹ️  User ${email} already has admin role`);
          continue;
        }

        // Assign admin role
        await db.insert(userRoles).values({
          userId: user.id,
          roleId: adminRole.id,
          grantedBy: 'system-script',
          grantedAt: new Date()
        });

        console.log(`✅ Assigned admin role to ${email}`);

      } catch (error) {
        console.error(`❌ Error processing ${email}:`, error);
      }
    }

    console.log('\n🎯 Summary:');
    console.log('- Admin role assignments completed');
    console.log('- Users should now be able to access admin endpoints');
    console.log('- Test by visiting: https://app.p57.uz/admin');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Get email addresses from command line arguments
const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.log('Usage: npm run assign-admin -- user@email.com [another@email.com ...]');
  console.log('\nExample admin emails from CLAUDE.md:');
  console.log('  - hurshidbey@gmail.com');
  console.log('  - mustafaabdurahmonov7777@gmail.com');
  console.log('\nRun: npm run assign-admin -- hurshidbey@gmail.com mustafaabdurahmonov7777@gmail.com');
  process.exit(1);
}

console.log('🚀 Assigning admin roles to:', emails.join(', '));
assignAdminRole(emails);