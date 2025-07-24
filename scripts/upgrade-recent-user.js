#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  // Find tojimatovabdukarimjon@gmail.com
  const targetEmail = 'tojimatovabdukarimjon@gmail.com';
  const user = users.find(u => u.email === targetEmail);
  
  if (!user) {
    console.log('❌ User not found:', targetEmail);
    return;
  }
  
  console.log('Found user:', targetEmail);
  console.log('- ID:', user.id);
  console.log('- Name:', user.user_metadata?.name);
  console.log('- Current tier:', user.user_metadata?.tier || 'free');
  console.log('- Created:', new Date(user.created_at).toLocaleString());
  
  if (user.user_metadata?.tier === 'paid') {
    console.log('\n✅ User already has PAID tier!');
    return;
  }
  
  console.log('\nUpgrading to PAID tier...');
  console.log('(This user likely is suhrobgirgitton@gmail.com using Google OAuth)');
  
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      tier: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: 'click',
      paymentNote: 'Manual upgrade - likely suhrobgirgitton using different Google email',
      originalPaymentEmail: 'suhrobgirgitton@gmail.com',
      clickTransIds: ['3195550118', '3195552052']
    }
  });
  
  if (error) {
    console.error('❌ Upgrade failed:', error);
  } else {
    console.log('✅ Successfully upgraded to PAID tier!');
  }
}

main().catch(console.error);