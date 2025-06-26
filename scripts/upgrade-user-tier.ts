#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.production') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

async function upgradeUserTier(email: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Find user by email
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    if (searchError) throw searchError;

    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`📧 Found user: ${user.email} (${user.id})`);
    console.log(`📊 Current tier: ${user.user_metadata?.tier || 'free'}`);

    // Upgrade to paid tier
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        tier: 'paid',
        paidAt: new Date().toISOString(),
        upgradedManually: true,
        upgradeReason: 'Payment completed but tier upgrade failed'
      }
    });

    if (updateError) throw updateError;

    console.log(`✅ Successfully upgraded ${email} to PAID tier!`);
    console.log(`🎉 User can now access all 57 protocols`);

  } catch (error) {
    console.error('❌ Failed to upgrade user:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Usage: tsx upgrade-user-tier.ts <user-email>');
  process.exit(1);
}

console.log(`🚀 Upgrading user: ${email}`);
upgradeUserTier(email);