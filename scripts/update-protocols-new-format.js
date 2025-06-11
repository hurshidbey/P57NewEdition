import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bazptglwzqstppwlvmvb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

// Load the new protocols from the migrated JSON file
const protocols = JSON.parse(fs.readFileSync('supabase/seed/new-protocols.json', 'utf8'));

async function clearExistingProtocols() {
  try {
    // Delete existing protocols
    const protocolResponse = await fetch(`${SUPABASE_URL}/rest/v1/protocols?id=gte.0`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (protocolResponse.ok) {
      console.log('✅ Existing protocols cleared');
    } else {
      const error = await protocolResponse.text();
      console.error('❌ Error clearing protocols:', error);
    }
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

async function createNewProtocols() {
  try {
    // Split into batches of 15 to avoid potential request size limits
    const batchSize = 15;
    let totalCreated = 0;
    
    for (let i = 0; i < protocols.length; i += batchSize) {
      const batch = protocols.slice(i, i + batchSize);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify(batch)
      });

      if (response.ok) {
        totalCreated += batch.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} created: ${batch.length} protocols`);
        console.log(`   Sample: "${batch[0].title}" (${batch[0].difficultyLevel})`);
      } else {
        const error = await response.text();
        console.error(`❌ Error creating batch ${Math.floor(i/batchSize) + 1}:`, error);
        break;
      }
    }
    
    console.log(`\n🎯 Total protocols created: ${totalCreated}/${protocols.length}`);
    
    // Show distribution by difficulty
    const byDifficulty = protocols.reduce((acc, p) => {
      acc[p.difficultyLevel] = (acc[p.difficultyLevel] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Distribution by difficulty:');
    Object.entries(byDifficulty).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} protocols`);
    });
    
  } catch (error) {
    console.error('❌ Error creating protocols:', error);
  }
}

async function verifyProtocols() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols?select=id,number,title,difficultyLevel,problemStatement&order=number.asc&limit=5`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const protocols = await response.json();
      console.log('\n🔍 Verification - First 5 protocols:');
      protocols.forEach(p => {
        console.log(`   ${p.number}. ${p.title} (${p.difficultyLevel})`);
        console.log(`      Problem: ${p.problemStatement?.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying protocols:', error);
  }
}

async function main() {
  console.log('🚀 Updating database with new protocol format...');
  console.log(`📊 Loading ${protocols.length} protocols from new-protocols.json`);
  
  // Clear existing protocols
  await clearExistingProtocols();
  
  // Create new format protocols
  await createNewProtocols();
  
  // Verify the update
  await verifyProtocols();
  
  console.log('\n✅ Database update complete! New problem-solution format protocols are now live.');
}

main();