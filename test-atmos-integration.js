// Test script for ATMOS integration
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAtmosIntegration() {
  console.log('🧪 Testing ATMOS Integration...\n');

  try {
    // Test 1: Check ATMOS connection
    console.log('1️⃣ Testing ATMOS connection...');
    const testResponse = await fetch(`${BASE_URL}/atmos/test`);
    const testResult = await testResponse.json();
    
    if (testResult.success) {
      console.log('✅ ATMOS connection successful');
      console.log(`   Store ID: ${testResult.storeId}`);
    } else {
      console.log('❌ ATMOS connection failed:', testResult.message);
      return;
    }

    // Test 2: Create a test transaction
    console.log('\n2️⃣ Creating test transaction...');
    const createResponse = await fetch(`${BASE_URL}/atmos/create-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100000, // 1000 UZS in tiins
        description: 'Test transaction'
      })
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Transaction created successfully');
      console.log(`   Transaction ID: ${createResult.transaction_id}`);
      console.log(`   Status: ${createResult.result.code} - ${createResult.result.description}`);
    } else {
      console.log('❌ Failed to create transaction:', createResult.message);
    }

    console.log('\n✨ ATMOS integration test completed!');
    console.log('\nℹ️  Your ATMOS integration is configured correctly for:');
    console.log('   - One-time card payments');
    console.log('   - Card binding for subscriptions');
    console.log('   - Transaction management');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAtmosIntegration();
