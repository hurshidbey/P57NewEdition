#!/usr/bin/env node

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

async function main() {
  console.log('🔍 Searching for suhrobgirgitton@gmail.com...\n');
  
  const { data: users } = await supabase.auth.admin.listUsers();
  
  // Search for suhrobgirgitton
  const suhrobUser = users.users.find(u => 
    u.email && u.email.toLowerCase() === 'suhrobgirgitton@gmail.com'
  );
  
  if (suhrobUser) {
    console.log('✅ FOUND suhrobgirgitton@gmail.com!');
    console.log('- ID:', suhrobUser.id);
    console.log('- Created:', new Date(suhrobUser.created_at).toLocaleString());
    console.log('- Provider:', suhrobUser.app_metadata?.provider || 'email');
    console.log('- Current tier:', suhrobUser.user_metadata?.tier || 'free');
    console.log('- Email confirmed:', suhrobUser.email_confirmed_at ? 'YES' : 'NO');
    
    if (suhrobUser.user_metadata?.tier === 'paid') {
      console.log('\n⚠️  User already has PAID tier!');
      return;
    }
    
    console.log('\nUpgrading to paid tier...');
    
    // Upgrade to paid tier
    const { error } = await supabase.auth.admin.updateUserById(suhrobUser.id, {
      user_metadata: {
        ...suhrobUser.user_metadata,
        tier: 'paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'click',
        paymentNote: 'Manual upgrade - user paid before creating account',
        clickTransIds: ['3195550118', '3195552052'],
        manuallyUpgraded: true,
        upgradedBy: 'admin'
      }
    });
    
    if (!error) {
      console.log('✅ Successfully upgraded to PAID tier!');
      
      // Verify
      const { data: { user: updated } } = await supabase.auth.admin.getUserById(suhrobUser.id);
      console.log('\nVerification:');
      console.log('- New tier:', updated.user_metadata?.tier);
      console.log('- Paid at:', updated.user_metadata?.paidAt);
      console.log('\n🎉 User now has full premium access!');
    } else {
      console.error('❌ Upgrade failed:', error);
    }
  } else {
    console.log('❌ User suhrobgirgitton@gmail.com NOT FOUND in database');
    
    // List recent signups to help debug
    const recent = users.users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
    
    console.log('\nMost recent signups:');
    recent.forEach(u => {
      const time = new Date(u.created_at).toLocaleString();
      console.log(`- ${u.email} | ${time} | ${u.user_metadata?.tier || 'free'}`);
    });
  }
}

main().catch(console.error);