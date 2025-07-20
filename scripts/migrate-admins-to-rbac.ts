#!/usr/bin/env node

/**
 * Migration script to convert ADMIN_EMAILS to RBAC system
 * This script:
 * 1. Reads current admin emails from environment
 * 2. Creates user_roles entries for each admin
 * 3. Assigns them the 'admin' role
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { userRoles, roles } from '../shared/rbac-schema';
import { eq } from 'drizzle-orm';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: envFile });

async function migrateAdminsToRBAC() {
  console.log('🔄 Starting admin migration to RBAC system...');

  // Validate environment
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration is required');
  }

  // Initialize database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get admin emails from environment
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
      : [];

    if (adminEmails.length === 0) {
      console.log('⚠️  No admin emails found in ADMIN_EMAILS environment variable');
      return;
    }

    console.log(`📧 Found ${adminEmails.length} admin emails to migrate`);

    // Get the admin role ID
    const adminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .limit(1);

    if (!adminRole[0]) {
      throw new Error('Admin role not found. Please run database migrations first.');
    }

    const adminRoleId = adminRole[0].id;
    console.log(`✅ Found admin role with ID: ${adminRoleId}`);

    // Process each admin email
    let migratedCount = 0;
    let skippedCount = 0;

    for (const email of adminEmails) {
      try {
        // Look up user in Supabase
        const { data: users, error } = await supabase.auth.admin.listUsers({
          filter: `email.eq.${email}`,
          page: 1,
          perPage: 1
        });

        if (error) {
          console.error(`❌ Error looking up user ${email}:`, error);
          continue;
        }

        if (!users?.users || users.users.length === 0) {
          console.log(`⚠️  User not found for email: ${email}`);
          skippedCount++;
          continue;
        }

        const user = users.users[0];
        console.log(`👤 Found user: ${user.email} (${user.id})`);

        // Check if user already has the role
        const existingRole = await db
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, user.id))
          .where(eq(userRoles.roleId, adminRoleId))
          .limit(1);

        if (existingRole.length > 0) {
          console.log(`⏭️  User ${email} already has admin role, skipping`);
          skippedCount++;
          continue;
        }

        // Assign admin role
        await db.insert(userRoles).values({
          userId: user.id,
          roleId: adminRoleId,
          grantedBy: 'migration_script'
        });

        console.log(`✅ Assigned admin role to ${email}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error processing ${email}:`, error);
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  Total emails: ${adminEmails.length}`);
    console.log(`  Migrated: ${migratedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Failed: ${adminEmails.length - migratedCount - skippedCount}`);

    // Verify migration
    const totalAdmins = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.roleId, adminRoleId));

    console.log(`\n✅ Total users with admin role: ${totalAdmins.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('📝 Note: You can now use the RBAC system alongside ADMIN_EMAILS during transition');
}

// Run migration
migrateAdminsToRBAC().catch(console.error);