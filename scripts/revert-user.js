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
  const email = 'tojimatovabdukarimjon@gmail.com';
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log('User not found:', email);
    return;
  }
  
  console.log('REVERTING', email, 'back to FREE tier...');
  
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      tier: 'free',
      paidAt: undefined,
      paymentMethod: undefined,
      paymentNote: undefined,
      originalPaymentEmail: undefined,
      clickTransIds: undefined
    }
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ REVERTED back to FREE tier!');
    console.log('User:', email, 'is now FREE tier again');
  }
}

main().catch(console.error);