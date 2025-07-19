import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCouponsTable() {
  console.log('🔍 Testing coupons table...\n');
  
  // Get all coupons to see structure
  const { data: allCoupons, error } = await supabase
    .from('coupons')
    .select('*');
  
  if (error) {
    console.error('❌ Error accessing coupons table:', error);
  } else {
    console.log('✅ Can access coupons table');
    console.log('📊 Found', allCoupons.length, 'coupons');
    if (allCoupons && allCoupons.length > 0) {
      console.log('📋 Column names:', Object.keys(allCoupons[0]));
      console.log('📝 Sample coupon:', allCoupons[0]);
    }
  }
  
  // Try to insert a test coupon with snake_case fields
  console.log('\n🧪 Testing insert with snake_case fields...');
  const testCoupon = {
    code: 'TEST_' + Date.now(),
    description: 'Test coupon',
    discount_type: 'percentage',
    discount_value: 10,
    original_price: 1425000,
    is_active: true,
    created_by: 'test@example.com'
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('coupons')
    .insert(testCoupon)
    .select();
  
  if (insertError) {
    console.error('❌ Insert error:', insertError);
    console.error('Details:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✅ Insert successful:', insertData);
    
    // Clean up test coupon
    if (insertData && insertData[0]) {
      await supabase
        .from('coupons')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Cleaned up test coupon');
    }
  }
}

testCouponsTable();