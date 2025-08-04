import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixTierValue() {
  const userId = 'd059e0b5-9e4a-4d97-b8ba-c9c3637f1eb0';
  const userEmail = 'sharifovshaxzod808@gmail.com';
  
  try {
    console.log('🔍 Getting user by ID:', userId);
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Error getting user:', getUserError);
      return;
    }
    
    console.log('Found user:', userData.user.email);
    console.log('Current tier value:', userData.user.user_metadata.tier);
    console.log('❌ PROBLEM IDENTIFIED: tier is set to "premium" but should be "paid"');
    
    // Update user metadata with the CORRECT tier value
    console.log('\n🔧 Fixing tier value from "premium" to "paid"...');
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        tier: 'paid' // CORRECT VALUE!
      }
    });
    
    if (error) {
      console.error('Error updating user:', error);
      return;
    }
    
    console.log('✅ Successfully updated user tier to "paid"');
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.getUserById(userId);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('✅ Verified - User tier is now:', verifyData.user.user_metadata.tier);
    console.log('\n🎉 FIX COMPLETE!');
    console.log('\n📋 Final instructions for the user:');
    console.log('1. Sign out from the application');
    console.log('2. Sign back in with Google (sharifovshaxzod808@gmail.com)');
    console.log('3. You should now see PREMIUM access!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixTierValue();