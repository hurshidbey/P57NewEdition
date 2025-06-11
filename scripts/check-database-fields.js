import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bazptglwzqstppwlvmvb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

async function checkFields() {
  try {
    // Get one protocol to see current field structure
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🔍 Current database fields:');
      if (result.length > 0) {
        Object.keys(result[0]).forEach(key => {
          console.log(`   ✓ ${key}`);
        });
      } else {
        console.log('   📭 No protocols found in database');
      }
    } else {
      const error = await response.text();
      console.error('❌ Error fetching protocols:', error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testNewFieldsInsert() {
  try {
    // Try to insert a single test protocol with new fields
    const testProtocol = {
      id: 999,
      number: 999,
      title: "Test Protocol",
      description: "Test description",
      badExample: "Test bad example",
      goodExample: "Test good example", 
      categoryId: 1,
      problemStatement: "Test problem",
      whyExplanation: "Test explanation",
      solutionApproach: "Test solution",
      difficultyLevel: "BEGINNER",
      levelOrder: 1
    };

    console.log('🧪 Testing insert with new fields...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify(testProtocol)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test insert successful! New fields are supported.');
      
      // Clean up test record
      await fetch(`${SUPABASE_URL}/rest/v1/protocols?id=eq.999`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      });
      console.log('🧹 Test record cleaned up');
      
    } else {
      const error = await response.text();
      console.error('❌ Test insert failed:', error);
    }
  } catch (error) {
    console.error('❌ Error testing insert:', error);
  }
}

async function main() {
  console.log('🔍 Checking database field structure...\n');
  
  await checkFields();
  console.log('');
  await testNewFieldsInsert();
}

main();