#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { format } from 'date-fns';

// Load environment variables
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPrivilegeEscalationAttempts() {
  console.log('🔍 Checking for privilege escalation attempts...\n');

  try {
    // Get users who might have attempted to access premium content
    const { data: suspiciousActivity, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .or('action.eq.unauthorized_access,action.eq.tier_manipulation')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    if (!suspiciousActivity || suspiciousActivity.length === 0) {
      console.log('✅ No privilege escalation attempts detected');
      return;
    }

    console.log(`⚠️  Found ${suspiciousActivity.length} suspicious activities:\n`);

    suspiciousActivity.forEach((activity, index) => {
      console.log(`${index + 1}. User: ${activity.user_email || activity.user_id}`);
      console.log(`   Action: ${activity.action}`);
      console.log(`   Details: ${JSON.stringify(activity.details)}`);
      console.log(`   Time: ${format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss')}`);
      console.log(`   IP: ${activity.ip_address || 'Unknown'}`);
      console.log('---');
    });

    // Also check for users who have free tier but accessed paid content
    const { data: freeUsers } = await supabase
      .from('users')
      .select('email, user_metadata')
      .eq('user_metadata->tier', 'free');

    if (freeUsers && freeUsers.length > 0) {
      console.log('\n📊 Checking free tier users for unauthorized access...');
      
      for (const user of freeUsers) {
        // Check if they accessed premium prompts
        const { data: accessLogs } = await supabase
          .from('prompt_access_logs')
          .select('*')
          .eq('user_email', user.email)
          .in('prompt_id', [1, 2, 3, 4, 5]) // Premium prompt IDs
          .order('accessed_at', { ascending: false })
          .limit(10);

        if (accessLogs && accessLogs.length > 0) {
          console.log(`\n⚠️  Free user ${user.email} accessed premium content:`);
          accessLogs.forEach(log => {
            console.log(`   - Prompt ${log.prompt_id} at ${format(new Date(log.accessed_at), 'yyyy-MM-dd HH:mm:ss')}`);
          });
        }
      }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Run the check
checkPrivilegeEscalationAttempts()
  .then(() => {
    console.log('\n✅ Security log check completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });