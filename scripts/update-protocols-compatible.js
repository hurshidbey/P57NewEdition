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

// Load the new protocols and transform them to current schema
const newProtocols = JSON.parse(fs.readFileSync('supabase/seed/new-protocols.json', 'utf8'));

// Transform to current database schema (snake_case columns)
function transformForCurrentSchema(protocols) {
  return protocols.map(protocol => ({
    id: protocol.id,
    number: protocol.number,
    title: protocol.title,
    description: protocol.description, // This will contain the combined problem-solution text
    bad_example: protocol.badExample || null,
    good_example: protocol.goodExample || null,
    category_id: protocol.categoryId || 1,
    notes: protocol.notes || null,
    // Store new fields in JSON format in notes for now
    // We'll create proper columns later
  }));
}

const compatibleProtocols = transformForCurrentSchema(newProtocols);

async function clearExistingProtocols() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols?id=gte.0`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Existing protocols cleared');
    } else {
      const error = await response.text();
      console.error('❌ Error clearing protocols:', error);
    }
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

async function createProtocols() {
  try {
    console.log('📊 Creating protocols with compatible schema...');
    
    // Split into batches of 10 to avoid potential request size limits
    const batchSize = 10;
    let totalCreated = 0;
    
    for (let i = 0; i < compatibleProtocols.length; i += batchSize) {
      const batch = compatibleProtocols.slice(i, i + batchSize);
      
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
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} protocols created`);
        console.log(`   Sample: "${batch[0].title}"`);
      } else {
        const error = await response.text();
        console.error(`❌ Error creating batch ${Math.floor(i/batchSize) + 1}:`, error);
        
        // Try individual inserts for this batch
        console.log('🔄 Trying individual inserts for failed batch...');
        for (const protocol of batch) {
          try {
            const singleResponse = await fetch(`${SUPABASE_URL}/rest/v1/protocols`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
                'apikey': SUPABASE_SERVICE_KEY
              },
              body: JSON.stringify(protocol)
            });
            
            if (singleResponse.ok) {
              totalCreated++;
              console.log(`   ✅ Individual: ${protocol.title}`);
            } else {
              const singleError = await singleResponse.text();
              console.error(`   ❌ Failed: ${protocol.title} - ${singleError}`);
            }
          } catch (singleError) {
            console.error(`   ❌ Exception: ${protocol.title}`, singleError);
          }
        }
      }
    }
    
    console.log(`\n🎯 Total protocols created: ${totalCreated}/${compatibleProtocols.length}`);
    
  } catch (error) {
    console.error('❌ Error creating protocols:', error);
  }
}

async function verifyResults() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols?select=id,number,title&order=number.asc&limit=5`, {
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
        console.log(`   ${p.number}. ${p.title}`);
      });
      
      // Get total count
      const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/protocols?select=count`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });
      
      const countText = countResponse.headers.get('Content-Range');
      if (countText) {
        const total = countText.split('/')[1];
        console.log(`\n📊 Total protocols in database: ${total}`);
      }
    }
  } catch (error) {
    console.error('❌ Error verifying protocols:', error);
  }
}

async function main() {
  console.log('🚀 Updating database with compatible protocol format...');
  console.log(`📊 Processing ${newProtocols.length} protocols`);
  
  // Show sample of what we're uploading
  console.log('\n📋 Sample protocol structure:');
  const sample = compatibleProtocols[0];
  Object.keys(sample).forEach(key => {
    console.log(`   ${key}: ${typeof sample[key]}`);
  });
  
  // Clear existing protocols
  await clearExistingProtocols();
  
  // Create new protocols
  await createProtocols();
  
  // Verify the results
  await verifyResults();
  
  console.log('\n✅ Database update complete!');
  console.log('📝 Note: New protocol structure has been loaded with compatible schema.');
  console.log('🔧 Next step: Schema enhancement can be done later to add new fields.');
}

main();