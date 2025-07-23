#!/usr/bin/env node

// Manual script to upgrade users who paid but didn't get their tier upgraded
// Usage: node manual-upgrade-paid-users.js <payment_id>

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.production') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findUserByEmail(email) {
  const { data: users } = await supabase.auth.admin.listUsers();
  return users.users.find(u => u.email === email);
}

async function findUserByPartialId(partialId) {
  const { data: users } = await supabase.auth.admin.listUsers();
  return users.users.find(u => u.id.startsWith(partialId));
}

async function upgradeUser(userId, paymentInfo) {
  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error || !user) {
    console.error('❌ Error fetching user:', error);
    return false;
  }
  
  if (user.user_metadata?.tier === 'paid') {
    console.log('⚠️  User already has paid tier');
    return true;
  }
  
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...user.user_metadata,
      tier: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: paymentInfo.method || 'click',
      paymentId: paymentInfo.id,
      manualUpgrade: true,
      upgradeReason: paymentInfo.reason || 'Manual upgrade after payment'
    }
  });
  
  if (updateError) {
    console.error('❌ Error updating user:', updateError);
    return false;
  }
  
  console.log('✅ Successfully upgraded user to paid tier');
  return true;
}

async function main() {
  console.log('🔧 Manual User Upgrade Tool\n');
  
  // Known payments that need manual upgrade
  const paymentsToProcess = [
    {
      email: 'suhrobgirgitton@gmail.com',
      paymentIds: ['4262072430', '4262075619'],
      method: 'click',
      reason: 'Payment completed but user not found in database'
    }
  ];
  
  for (const payment of paymentsToProcess) {
    console.log(`\n📋 Processing: ${payment.email}`);
    console.log(`   Payment IDs: ${payment.paymentIds.join(', ')}`);
    
    // Try to find user by email
    let user = await findUserByEmail(payment.email);
    
    if (!user) {
      console.log('   ⚠️  User not found by email, checking other methods...');
      
      // Try to find by similar email patterns
      const { data: users } = await supabase.auth.admin.listUsers();
      const similarUsers = users.users.filter(u => 
        u.email && u.email.toLowerCase().includes(payment.email.split('@')[0].toLowerCase())
      );
      
      if (similarUsers.length === 1) {
        user = similarUsers[0];
        console.log(`   ✅ Found similar user: ${user.email}`);
      } else if (similarUsers.length > 1) {
        console.log(`   ⚠️  Found ${similarUsers.length} similar users:`);
        similarUsers.forEach(u => console.log(`      - ${u.email} (${u.id})`));
        console.log('   ❌ Cannot determine which user to upgrade');
        continue;
      }
    }
    
    if (!user) {
      console.log('   ❌ User not found in database');
      console.log('   💡 User might need to create an account first');
      continue;
    }
    
    console.log(`   ✅ Found user: ${user.email} (${user.id})`);
    console.log(`   Current tier: ${user.user_metadata?.tier || 'free'}`);
    
    const upgraded = await upgradeUser(user.id, {
      id: payment.paymentIds[0],
      method: payment.method,
      reason: payment.reason
    });
    
    if (upgraded) {
      console.log(`   🎉 User upgraded successfully!`);
    }
  }
  
  console.log('\n✅ Manual upgrade process completed');
}

// Run the script
main().catch(console.error);