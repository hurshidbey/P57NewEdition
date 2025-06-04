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

// Categories to insert
const categories = [
  { id: 1, name: "Audience", description: "Targeting and audience specification" },
  { id: 2, name: "Creative", description: "Creative and innovative approaches" },
  { id: 3, name: "Technical", description: "Technical implementation" },
  { id: 4, name: "Structure", description: "Content structure and formatting" },
  { id: 5, name: "Evidence", description: "Evidence and validation" },
  { id: 6, name: "Analysis", description: "Analysis and evaluation" },
];

// Load all 57 protocols from the parsed JSON file
const protocols = JSON.parse(fs.readFileSync('supabase/seed/protocols-supabase.json', 'utf8'));

async function clearExistingData() {
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
      console.log('Existing protocols cleared');
    }
    
    // Delete existing categories
    const categoryResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=gte.0`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (categoryResponse.ok) {
      console.log('Existing categories cleared');
    }
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

async function createCategories() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify(categories)
    });

    if (response.ok) {
      console.log('Categories created successfully');
    } else {
      const error = await response.text();
      console.error('Error creating categories:', error);
    }
  } catch (error) {
    console.error('Error creating categories:', error);
  }
}

async function createProtocols() {
  try {
    // Split into batches of 20 to avoid potential request size limits
    const batchSize = 20;
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
        console.log(`Protocols batch ${Math.floor(i/batchSize) + 1} created successfully (${batch.length} protocols)`);
      } else {
        const error = await response.text();
        console.error(`Error creating protocols batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`Total protocols created: ${protocols.length}`);
  } catch (error) {
    console.error('Error creating protocols:', error);
  }
}

async function main() {
  console.log('Populating Supabase database with all 57 protocols...');
  
  // Clear existing data first
  await clearExistingData();
  
  // Create categories
  await createCategories();
  
  // Create all protocols
  await createProtocols();
  
  console.log('Database population complete!');
}

main();