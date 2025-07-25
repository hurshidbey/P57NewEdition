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

async function checkPayments() {
  console.log('🔍 Checking payments in database...\n');
  
  try {
    // Check if payments table exists
    const { data: tables, error: tableError } = await supabase
      .from('payments')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Error accessing payments table:', tableError);
      return;
    }
    
    console.log(`✅ Payments table exists`);
    
    // Get all payments
    const { data: payments, error: paymentsError, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
      return;
    }
    
    console.log(`\n📊 Total payments in database: ${count || 0}`);
    
    if (payments && payments.length > 0) {
      console.log('\n💳 Payment records:');
      payments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment.id}`);
        console.log(`   User: ${payment.user_email} (${payment.user_id})`);
        console.log(`   Amount: ${payment.amount} UZS`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Transaction ID: ${payment.transaction_id}`);
        console.log(`   Created: ${new Date(payment.created_at).toLocaleString()}`);
        if (payment.coupon_id) {
          console.log(`   Coupon ID: ${payment.coupon_id}`);
          console.log(`   Original Amount: ${payment.original_amount} UZS`);
          console.log(`   Discount: ${payment.discount_amount} UZS`);
        }
      });
    } else {
      console.log('\n⚠️  No payment records found in the database');
      console.log('   This could mean:');
      console.log('   1. No payments have been made yet');
      console.log('   2. Payments are not being stored correctly');
      console.log('   3. The payments table is empty');
    }
    
    // Check payment_sessions table too
    console.log('\n\n🔍 Checking payment_sessions table...');
    const { data: sessions, error: sessionsError, count: sessionCount } = await supabase
      .from('payment_sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (sessionsError) {
      console.log('❌ Error accessing payment_sessions table:', sessionsError.message);
    } else {
      console.log(`\n📊 Total payment sessions: ${sessionCount || 0}`);
      if (sessions && sessions.length > 0) {
        console.log('\n🔄 Recent payment sessions:');
        sessions.forEach((session, index) => {
          console.log(`\n${index + 1}. Session ID: ${session.id}`);
          console.log(`   User: ${session.user_email}`);
          console.log(`   Amount: ${session.amount} UZS`);
          console.log(`   Status: ${session.status}`);
          console.log(`   Payment Method: ${session.payment_method}`);
          console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPayments();