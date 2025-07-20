#!/usr/bin/env node

/**
 * Test authentication changes
 * Usage: node scripts/test-auth.js
 */

const http = require('http');

// Test configuration
const tests = [
  {
    name: 'Test old hardcoded credentials (should fail)',
    data: { username: 'admin', password: 'admin123' },
    expectedStatus: 401,
    expectedSuccess: false
  },
  {
    name: 'Test old email credentials (should fail)',
    data: { username: 'hurshidbey@gmail.com', password: '20031000a' },
    expectedStatus: 401,
    expectedSuccess: false
  },
  {
    name: 'Test fallback admin (configure in .env)',
    data: { 
      username: process.env.FALLBACK_ADMIN_EMAIL || 'admin@example.com', 
      password: 'test-password' // Replace with your test password
    },
    expectedStatus: 200,
    expectedSuccess: true,
    skipIfNoEnv: true
  },
  {
    name: 'Test invalid credentials',
    data: { username: 'invalid@example.com', password: 'wrongpassword' },
    expectedStatus: 401,
    expectedSuccess: false
  }
];

function runTest(test) {
  return new Promise((resolve) => {
    if (test.skipIfNoEnv && !process.env.FALLBACK_ADMIN_EMAIL) {
      console.log(`⏭️  Skipping: ${test.name} (FALLBACK_ADMIN_EMAIL not configured)`);
      resolve({ skipped: true });
      return;
    }

    const postData = JSON.stringify(test.data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;
        let response;
        
        try {
          response = JSON.parse(data);
        } catch (e) {
          response = { error: 'Failed to parse response' };
        }

        console.log(`\n${success ? '✅' : '❌'} ${test.name}`);
        console.log(`   Status: ${res.statusCode} (expected ${test.expectedStatus})`);
        console.log(`   Response: ${JSON.stringify(response)}`);
        
        if (!success) {
          console.log(`   ⚠️  Test failed!`);
        }

        resolve({ success, statusCode: res.statusCode, response });
      });
    });

    req.on('error', (e) => {
      console.log(`\n❌ ${test.name}`);
      console.log(`   Error: ${e.message}`);
      console.log(`   ⚠️  Is the server running on port 5000?`);
      resolve({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🔐 Testing Authentication Changes\n');
  console.log('Make sure the server is running locally on port 5000\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    const result = await runTest(test);
    if (result.skipped) {
      skipped++;
    } else if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   Total: ${tests.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the implementation.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Check if server is running
console.log('Checking if server is accessible...');
http.get('http://localhost:5000/health', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is running\n');
    runAllTests();
  } else {
    console.log('⚠️  Server returned unexpected status:', res.statusCode);
    runAllTests();
  }
}).on('error', (err) => {
  console.error('❌ Server is not running on port 5000');
  console.error('   Please start the server with: docker-compose up');
  console.error('   Error:', err.message);
  process.exit(1);
});