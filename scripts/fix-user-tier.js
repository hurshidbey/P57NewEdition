import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixUserTier() {
  const userId = 'd059e0b5-9e4a-4d97-b8ba-c9c3637f1eb0';
  const userEmail = 'sharifovshaxzod808@gmail.com';
  
  try {
    // Get user by ID directly
    console.log('Getting user by ID:', userId);
    const { data: user, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Error getting user:', getUserError);
      return;
    }
    
    if (!user || !user.user) {
      console.error('User not found by ID:', userId);
      return;
    }
    
    console.log('Found user:', user.user.id, user.user.email);
    console.log('Current metadata:', user.user.user_metadata);
    
    // Update user metadata properly through Supabase Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user.user_metadata,
        tier: 'premium'
      }
    });
    
    if (error) {
      console.error('Error updating user:', error);
      return;
    }
    
    console.log('✅ Successfully updated user to premium tier');
    console.log('Updated metadata:', data.user.user_metadata);
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.getUserById(userId);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('✅ Verified - User tier is now:', verifyData.user.user_metadata.tier);
    console.log('\n⚠️  IMPORTANT: User must sign out and sign back in for changes to take effect!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixUserTier();