import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Categories data
const categories = [
  { id: 1, name: "Audience", description: "Targeting and audience specification" },
  { id: 2, name: "Creative", description: "Creative and innovative approaches" },
  { id: 3, name: "Technical", description: "Technical implementation" },
  { id: 4, name: "Structure", description: "Content structure and formatting" },
  { id: 5, name: "Evidence", description: "Evidence and validation" },
  { id: 6, name: "Analysis", description: "Analysis and evaluation" },
];

// Load protocols
const protocols = JSON.parse(fs.readFileSync('supabase/seed/protocols-supabase.json', 'utf8'));

async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    const { error: delProtError } = await supabase.from('protocols').delete().gte('id', 0);
    if (delProtError) console.error('Error deleting protocols:', delProtError);
    
    const { error: delCatError } = await supabase.from('categories').delete().gte('id', 0);
    if (delCatError) console.error('Error deleting categories:', delCatError);
    
    // Insert categories
    console.log('Inserting categories...');
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert(categories)
      .select();
    
    if (catError) {
      console.error('Error inserting categories:', catError);
      return;
    }
    console.log(`Inserted ${catData.length} categories`);
    
    // Insert protocols in batches
    console.log('Inserting protocols...');
    let totalInserted = 0;
    const batchSize = 10; // Smaller batch size to avoid issues
    
    for (let i = 0; i < protocols.length; i += batchSize) {
      const batch = protocols.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('protocols')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        totalInserted += data.length;
        console.log(`Batch ${Math.floor(i/batchSize) + 1} inserted (${data.length} protocols)`);
      }
    }
    
    console.log('\n=== Database population complete! ===');
    console.log(`Total categories: ${catData.length}`);
    console.log(`Total protocols: ${totalInserted}`);
    
    // Verify the data
    const { count } = await supabase
      .from('protocols')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nVerified: ${count} protocols in database`);
    
  } catch (error) {
    console.error('Population error:', error);
  }
}

populateDatabase();