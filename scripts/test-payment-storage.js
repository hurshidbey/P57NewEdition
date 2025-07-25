#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the SupabaseStorage getPayments method
async function getPayments() {
  // Query payment_sessions table instead of payments view
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('*')
    .eq('status', 'completed')  // Only show completed payments
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`❌ [SUPABASE] Failed to get payments:`, error);
    throw error;
  }
  
  // Map payment_sessions fields to Payment interface
  return (data || []).map((item) => ({
    id: item.id,
    userId: item.user_id,
    userEmail: item.user_email,
    amount: item.amount,  // This is the final amount after discount
    status: item.status,
    transactionId: item.click_trans_id || item.merchant_trans_id,
    atmosData: JSON.stringify({
      paymentMethod: item.payment_method,
      merchantTransId: item.merchant_trans_id,
      clickTransId: item.click_trans_id,
      originalAmount: item.original_amount,
      discountAmount: item.discount_amount,
      couponId: item.coupon_id,
      metadata: item.metadata
    }),
    createdAt: item.created_at,
    // Include coupon info if present
    couponId: item.coupon_id,
    originalAmount: item.original_amount,
    discountAmount: item.discount_amount
  }));
}

async function testPaymentStorage() {
  console.log('🧪 Testing new payment storage implementation...\n');
  
  try {
    const payments = await getPayments();
    
    console.log(`✅ Successfully fetched ${payments.length} payments\n`);
    
    if (payments.length > 0) {
      console.log('💳 Payment records:');
      payments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment.id}`);
        console.log(`   User: ${payment.userEmail} (${payment.userId})`);
        console.log(`   Final Amount: ${payment.amount} UZS`);
        
        if (payment.originalAmount && payment.originalAmount !== payment.amount) {
          console.log(`   Original Amount: ${payment.originalAmount} UZS`);
          console.log(`   Discount: ${payment.discountAmount} UZS`);
        }
        
        console.log(`   Status: ${payment.status}`);
        console.log(`   Transaction ID: ${payment.transactionId}`);
        console.log(`   Created: ${new Date(payment.createdAt).toLocaleString()}`);
        
        // Parse atmosData to show payment method
        try {
          const atmosData = JSON.parse(payment.atmosData);
          console.log(`   Payment Method: ${atmosData.paymentMethod}`);
        } catch (e) {}
      });
      
      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      console.log(`\n📊 Total Revenue: ${totalRevenue.toLocaleString()} UZS`);
    } else {
      console.log('⚠️  No completed payments found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentStorage();