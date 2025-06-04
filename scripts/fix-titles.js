import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not found');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct titles for protocols with issues
const correctTitles = {
  17: `"Ma'lumot yetarli emas" triggerini o'rnating`,
  19: `"Eng Yomon vaziyat" (the-worst case-scenario) da nima bo'ladi?`,
  24: `"Vilka" paytida qaror qabul qilishda majburlang!`,
};

async function fixTitles() {
  console.log('Fixing corrupted protocol titles...');
  
  for (const [protocolNumber, correctTitle] of Object.entries(correctTitles)) {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .update({ title: correctTitle })
        .eq('number', parseInt(protocolNumber))
        .select();
        
      if (error) {
        console.error(`Error updating protocol ${protocolNumber}:`, error);
      } else {
        console.log(`✓ Fixed protocol ${protocolNumber}: "${correctTitle}"`);
      }
    } catch (err) {
      console.error(`Exception updating protocol ${protocolNumber}:`, err);
    }
  }
  
  console.log('Title fixes completed!');
}

fixTitles();