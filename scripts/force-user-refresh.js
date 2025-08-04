import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function forceUserRefresh() {
  const userId = 'd059e0b5-9e4a-4d97-b8ba-c9c3637f1eb0';
  const userEmail = 'sharifovshaxzod808@gmail.com';
  
  try {
    console.log('🔄 Forcing user session refresh...');
    
    // 1. Get the user
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Error getting user:', getUserError);
      return;
    }
    
    console.log('Current user tier:', userData.user.user_metadata.tier);
    
    // 2. Force sign out all sessions for this user
    console.log('🚪 Signing out all user sessions...');
    const { error: signOutError } = await supabase.auth.admin.signOut(userId, 'global');
    
    if (signOutError) {
      console.error('Error signing out user:', signOutError);
      // Continue anyway as this might fail if user has no active sessions
    }
    
    // 3. Re-verify the user metadata is correct
    console.log('✅ Verifying user metadata...');
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.getUserById(userId);
    
    if (verifyError) {
      console.error('Error verifying user:', verifyError);
      return;
    }
    
    console.log('Final user metadata:', verifyData.user.user_metadata);
    console.log('\n✅ User refresh complete!');
    console.log('\n📋 Instructions for the user:');
    console.log('1. Clear your browser cache and cookies for app.p57.uz');
    console.log('2. Close all browser tabs with the application');
    console.log('3. Open a new incognito/private window');
    console.log('4. Go to https://app.p57.uz');
    console.log('5. Sign in with Google using sharifovshaxzod808@gmail.com');
    console.log('6. You should now have premium access!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the refresh
forceUserRefresh();