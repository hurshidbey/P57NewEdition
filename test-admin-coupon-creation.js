import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

async function testCouponCreation() {
  try {
    console.log('🧪 Testing admin coupon creation on production...');
    
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
    
    console.log('✅ Signed in as admin:', adminEmail);
    const token = signInData.session.access_token;
    
    // Test data
    const testCoupon = {
      code: `TEST_${Date.now()}`,
      description: 'Test coupon created via API',
      discountType: 'percentage',
      discountValue: 25,
      originalPrice: 1425000,
      maxUses: 5,
      isActive: true
    };
    
    console.log('📝 Creating test coupon:', testCoupon);
    
    // Make API request to create coupon
    const response = await fetch('https://p57.birfoiz.uz/api/admin/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCoupon)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Coupon created successfully!');
      console.log('📊 Coupon details:', result);
      console.log('\n🎉 SUCCESS: The "createdBy column not found" error has been resolved!');
      
      // Clean up - delete the test coupon
      if (result.id) {
        const deleteResponse = await fetch(`https://p57.birfoiz.uz/api/admin/coupons/${result.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (deleteResponse.ok) {
          console.log('🧹 Test coupon cleaned up');
        }
      }
    } else {
      console.error('❌ Failed to create coupon:', result);
      console.error('Response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCouponCreation();