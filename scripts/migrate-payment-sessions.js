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

async function migratePaymentSessions() {
  console.log('🔄 Migrating completed payment sessions to payments table...\n');
  
  try {
    // Get all completed payment sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    if (sessionsError) {
      console.error('❌ Error fetching payment sessions:', sessionsError);
      return;
    }
    
    console.log(`📊 Found ${sessions?.length || 0} completed payment sessions\n`);
    
    if (!sessions || sessions.length === 0) {
      console.log('✅ No completed payment sessions to migrate');
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const session of sessions) {
      console.log(`\n📋 Processing session: ${session.id}`);
      console.log(`   User: ${session.user_email} (${session.user_id})`);
      console.log(`   Amount: ${session.amount} UZS`);
      console.log(`   Transaction ID: ${session.click_trans_id || session.merchant_trans_id}`);
      
      // Check if payment already exists
      const transactionId = session.click_trans_id || session.merchant_trans_id;
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_id', transactionId)
        .single();
      
      if (existingPayment && !checkError) {
        console.log(`   ⏭️  Skipped - Payment already exists`);
        skippedCount++;
        continue;
      }
      
      // Create payment record
      const paymentData = {
        id: `payment_${session.payment_method}_${transactionId}_migrated`,
        user_id: session.user_id,
        user_email: session.user_email,
        amount: session.amount,
        transaction_id: transactionId,
        status: 'completed',
        atmos_data: JSON.stringify({
          paymentMethod: session.payment_method,
          clickTransId: session.click_trans_id,
          merchantTransId: session.merchant_trans_id,
          sessionId: session.id,
          migratedAt: new Date().toISOString(),
          metadata: session.metadata
        }),
        coupon_id: session.coupon_id,
        original_amount: session.original_amount || session.amount,
        discount_amount: session.discount_amount || 0,
        created_at: session.created_at
      };
      
      const { data: payment, error: insertError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();
      
      if (insertError) {
        console.error(`   ❌ Failed to migrate:`, insertError.message);
      } else {
        console.log(`   ✅ Successfully migrated to payments table`);
        migratedCount++;
      }
    }
    
    console.log(`\n\n📊 Migration Summary:`);
    console.log(`   Total sessions: ${sessions.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`\n✅ Migration complete!`);
    
  } catch (error) {
    console.error('❌ Unexpected error during migration:', error);
  }
}

migratePaymentSessions();