#!/bin/bash

echo "🔍 Searching for suhrobgirgitton@gmail.com..."

ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker exec protokol57-protokol57-1 node -e \"
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  // Try multiple search methods
  const targetEmail = 'suhrobgirgitton@gmail.com';
  let foundUser = null;
  
  // Method 1: Direct email match
  foundUser = users.find(u => u.email === targetEmail);
  
  if (!foundUser) {
    // Method 2: Case insensitive
    foundUser = users.find(u => u.email && u.email.toLowerCase() === targetEmail.toLowerCase());
  }
  
  if (!foundUser) {
    // Method 3: Check identities
    foundUser = users.find(u => 
      u.identities && u.identities.some(i => i.email === targetEmail)
    );
  }
  
  if (foundUser) {
    console.log('✅ FOUND USER!');
    console.log('- Email:', foundUser.email);
    console.log('- ID:', foundUser.id);
    console.log('- Provider:', foundUser.app_metadata?.provider || 'email');
    console.log('- Current Tier:', foundUser.user_metadata?.tier || 'free');
    console.log('- Created:', new Date(foundUser.created_at).toLocaleString());
    
    if (foundUser.user_metadata?.tier === 'paid') {
      console.log('\\n✅ User already has PAID tier!');
    } else {
      console.log('\\nUpgrading to PAID tier...');
      
      const { error } = await supabase.auth.admin.updateUserById(foundUser.id, {
        user_metadata: {
          ...foundUser.user_metadata,
          tier: 'paid',
          paidAt: new Date().toISOString(),
          paymentMethod: 'click',
          paymentNote: 'Manual upgrade after payment issue',
          clickTransIds: ['3195550118', '3195552052']
        }
      });
      
      if (!error) {
        console.log('✅ Successfully upgraded to PAID tier!');
      } else {
        console.error('❌ Upgrade failed:', error);
      }
    }
  } else {
    console.log('❌ User suhrobgirgitton@gmail.com NOT FOUND!');
    
    // Show recent users
    console.log('\\nShowing last 5 users created:');
    users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .forEach(u => {
        console.log('- ', u.email, '| Provider:', u.app_metadata?.provider || 'email', '| Created:', new Date(u.created_at).toLocaleTimeString());
      });
  }
})();
\""