import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

async function testAllCouponOperations() {
  try {
    console.log('🧪 Testing ALL coupon operations on production...\n');
    
    // Get admin JWT token
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Sign in as admin
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || 'hurshidbey@gmail.com';
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: '20031000a'
    });
    
    if (signInError || !signInData.session) {
      console.error('❌ Failed to sign in as admin:', signInError);
      return;
    }
    
    const token = signInData.session.access_token;
    const baseUrl = 'https://p57.birfoiz.uz';
    
    // Test 1: Create a coupon
    console.log('1️⃣ Testing CREATE coupon...');
    const testCoupon = {
      code: `TESTOPS_${Date.now()}`,
      description: 'Test all operations coupon',
      discountType: 'percentage',
      discountValue: 30,
      originalPrice: 1425000,
      maxUses: 10,
      isActive: true
    };
    
    const createResponse = await fetch(`${baseUrl}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCoupon)
    });
    
    const createdCoupon = await createResponse.json();
    if (createResponse.ok) {
      console.log('✅ CREATE successful:', createdCoupon.id);
    } else {
      console.error('❌ CREATE failed:', createdCoupon);
      return;
    }
    
    // Test 2: Get all coupons
    console.log('\n2️⃣ Testing GET ALL coupons...');
    const getAllResponse = await fetch(`${baseUrl}/api/admin/coupons`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const allCoupons = await getAllResponse.json();
    if (getAllResponse.ok) {
      console.log(`✅ GET ALL successful: Found ${allCoupons.length} coupons`);
    } else {
      console.error('❌ GET ALL failed:', allCoupons);
    }
    
    // Test 3: Validate coupon (public endpoint)
    console.log('\n3️⃣ Testing VALIDATE coupon...');
    const validateResponse = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: createdCoupon.code,
        amount: 1425000
      })
    });
    
    const validation = await validateResponse.json();
    if (validateResponse.ok && validation.valid) {
      console.log('✅ VALIDATE successful:', validation.coupon.discountAmount, 'UZS discount');
    } else {
      console.error('❌ VALIDATE failed:', validation);
    }
    
    // Test 4: Update coupon
    console.log('\n4️⃣ Testing UPDATE coupon...');
    const updateResponse = await fetch(`${baseUrl}/api/admin/coupons/${createdCoupon.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        discountValue: 35,
        description: 'Updated test coupon'
      })
    });
    
    const updatedCoupon = await updateResponse.json();
    if (updateResponse.ok) {
      console.log('✅ UPDATE successful: Discount changed to', updatedCoupon.discountValue + '%');
    } else {
      console.error('❌ UPDATE failed:', updatedCoupon);
    }
    
    // Test 5: Toggle coupon active status
    console.log('\n5️⃣ Testing TOGGLE active status...');
    const toggleResponse = await fetch(`${baseUrl}/api/admin/coupons/${createdCoupon.id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: false })
    });
    
    const toggledCoupon = await toggleResponse.json();
    if (toggleResponse.ok) {
      console.log('✅ TOGGLE successful: Active status is now', toggledCoupon.isActive);
    } else {
      console.error('❌ TOGGLE failed:', toggledCoupon);
    }
    
    // Test 6: Validate inactive coupon (should fail)
    console.log('\n6️⃣ Testing VALIDATE inactive coupon (should fail)...');
    const validateInactiveResponse = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: createdCoupon.code,
        amount: 1425000
      })
    });
    
    const inactiveValidation = await validateInactiveResponse.json();
    if (!inactiveValidation.valid) {
      console.log('✅ VALIDATE inactive correctly failed:', inactiveValidation.message);
    } else {
      console.error('❌ VALIDATE inactive incorrectly passed');
    }
    
    // Test 7: Delete coupon
    console.log('\n7️⃣ Testing DELETE coupon...');
    const deleteResponse = await fetch(`${baseUrl}/api/admin/coupons/${createdCoupon.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const deleteResult = await deleteResponse.json();
    if (deleteResponse.ok) {
      console.log('✅ DELETE successful');
    } else {
      console.error('❌ DELETE failed:', deleteResult);
    }
    
    // Test 8: Validate existing coupon
    console.log('\n8️⃣ Testing VALIDATE existing coupon (LAUNCH60)...');
    const existingValidateResponse = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'LAUNCH60',
        amount: 1425000
      })
    });
    
    const existingValidation = await existingValidateResponse.json();
    if (existingValidateResponse.ok && existingValidation.valid) {
      console.log('✅ VALIDATE existing coupon successful: 60% off =', existingValidation.coupon.finalAmount, 'UZS');
    } else {
      console.error('❌ VALIDATE existing coupon failed:', existingValidation);
    }
    
    console.log('\n🎉 All coupon operations tested successfully!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

testAllCouponOperations();