#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminPaymentsData() {
  console.log('🔍 Analyzing payment data structure...\n');
  
  try {
    // Check payment_transactions table
    console.log('📊 Checking payment_transactions table:');
    const { data: transactions, error: transError, count: transCount } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transError) {
      console.error('❌ Error fetching payment_transactions:', transError);
    } else {
      console.log(`✅ Found ${transCount} records in payment_transactions`);
      
      if (transactions && transactions.length > 0) {
        console.log('\nSample transaction structure:');
        const sample = transactions[0];
        console.log('Columns:', Object.keys(sample).join(', '));
        console.log('\nRecent transactions:');
        transactions.forEach((trans, i) => {
          console.log(`\n${i + 1}. ID: ${trans.id}`);
          console.log(`   User: ${trans.user_email}`);
          console.log(`   Amount: ${trans.final_amount || trans.amount} UZS`);
          console.log(`   Status: ${trans.status}`);
          console.log(`   Payment Method: ${trans.payment_method}`);
          console.log(`   Created: ${new Date(trans.created_at).toLocaleString()}`);
        });
      }
    }
    
    // Check if we should use payment_transactions instead of payments
    console.log('\n\n📋 Recommendation:');
    if (transCount > 0) {
      console.log('✅ Use payment_transactions table for the admin panel');
      console.log('   This table contains actual payment data');
      console.log('   The payments view/table appears to be empty or not properly configured');
      
      // Show the correct query structure
      console.log('\n📝 Suggested query for admin panel:');
      console.log(`
const { data, error } = await supabase
  .from('payment_transactions')
  .select('*')
  .eq('status', 'completed')  // Only show completed payments
  .order('created_at', { ascending: false });
      `);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAdminPaymentsData();