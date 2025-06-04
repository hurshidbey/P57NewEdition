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

// Read SQL file
const sql = fs.readFileSync('scripts/create-tables.sql', 'utf8');

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

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // First, let's check if tables exist
    const { data: existingCategories, error: catCheckError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (catCheckError && catCheckError.code === '42P01') {
      // Table doesn't exist, we need to create it
      console.log('Tables do not exist. Please create them using Supabase dashboard SQL editor with the following SQL:');
      console.log('\n--- SQL to execute in Supabase Dashboard ---\n');
      console.log(sql);
      console.log('\n--- End of SQL ---\n');
      console.log('After creating tables, run: node scripts/supabase-populate.js');
      return;
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('protocols').delete().gte('id', 0);
    await supabase.from('categories').delete().gte('id', 0);
    
    // Insert categories
    console.log('Inserting categories...');
    const { error: catError } = await supabase
      .from('categories')
      .insert(categories);
    
    if (catError) {
      console.error('Error inserting categories:', catError);
      return;
    }
    
    // Insert protocols in batches
    console.log('Inserting protocols...');
    const batchSize = 20;
    for (let i = 0; i < protocols.length; i += batchSize) {
      const batch = protocols.slice(i, i + batchSize);
      const { error } = await supabase
        .from('protocols')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`Batch ${Math.floor(i/batchSize) + 1} inserted (${batch.length} protocols)`);
      }
    }
    
    console.log('Database setup complete!');
    console.log(`Total protocols: ${protocols.length}`);
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();