import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncPromptsToSupabase() {
  try {
    console.log('Reading prompts from JSON file...');
    
    // Read prompts from JSON file
    const promptsPath = path.resolve(__dirname, '../server/data/prompts.json');
    const promptsData = await fs.readFile(promptsPath, 'utf-8');
    const prompts = JSON.parse(promptsData);
    
    console.log(`Found ${prompts.length} prompts in JSON file`);
    
    // Transform field names to match Supabase schema
    const transformedPrompts = prompts.map((prompt: any) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      category: prompt.category,
      is_premium: prompt.isPremium || false,
      is_public: prompt.isPublic !== false, // default to true
      created_at: prompt.createdAt || new Date().toISOString(),
      updated_at: prompt.updatedAt || new Date().toISOString()
    }));
    
    console.log('Syncing prompts to Supabase...');
    
    // Upsert prompts in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < transformedPrompts.length; i += batchSize) {
      const batch = transformedPrompts.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('prompts')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`Error upserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✓ Synced batch ${i / batchSize + 1} (${batch.length} prompts)`);
      }
    }
    
    console.log('\n✅ Successfully synced all prompts to Supabase!');
    
    // Verify the sync
    const { count, error: countError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`Total prompts in Supabase: ${count}`);
    }
    
  } catch (error) {
    console.error('Error syncing prompts:', error);
    process.exit(1);
  }
}

syncPromptsToSupabase();