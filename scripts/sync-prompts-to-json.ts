import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncPrompts() {
  try {
    console.log('Fetching prompts from database...');
    
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Transform snake_case to camelCase for frontend compatibility
    const transformedPrompts = prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      category: prompt.category,
      isPremium: prompt.is_premium,
      isPublic: prompt.is_public,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at
    }));
    
    const jsonPath = path.resolve(__dirname, '../server/data/prompts.json');
    
    await fs.writeFile(jsonPath, JSON.stringify(transformedPrompts, null, 2));
    
    console.log(`✓ Synced ${transformedPrompts.length} prompts to ${jsonPath}`);
  } catch (error) {
    console.error('Error syncing prompts:', error);
  }
}

syncPrompts();