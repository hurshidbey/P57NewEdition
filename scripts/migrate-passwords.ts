#!/usr/bin/env tsx
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function migratePasswords() {
  console.log('🔐 Password Migration Tool');
  console.log('=========================\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const db = drizzle(pool);
  
  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to check\n`);
    
    let migrated = 0;
    
    for (const user of allUsers) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`✓ User ${user.username} already has hashed password`);
        continue;
      }
      
      console.log(`⚠️  User ${user.username} has plain text password, migrating...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Update in database
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      
      console.log(`✅ Migrated password for user ${user.username}`);
      migrated++;
    }
    
    console.log(`\n✨ Migration complete! Migrated ${migrated} passwords.`);
    
    if (migrated === 0) {
      console.log('All passwords were already hashed.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migratePasswords();