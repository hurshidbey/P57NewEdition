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

async function fixDescriptions() {
  console.log('Fixing corrupted protocol descriptions...');
  
  try {
    // Get all protocols
    const { data: protocols, error } = await supabase
      .from('protocols')
      .select('*')
      .order('number');
      
    if (error) {
      console.error('Error fetching protocols:', error);
      return;
    }
    
    console.log(`Found ${protocols.length} protocols to check...`);
    
    for (const protocol of protocols) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix description - remove escape characters and restore full text
      if (protocol.description && (protocol.description.includes('\\"') || protocol.description.endsWith('\\'))) {
        updates.description = protocol.description
          .replace(/\\"/g, '"')  // Replace \" with "
          .replace(/\\$/, '')   // Remove trailing backslash
          .trim();
        needsUpdate = true;
      }
      
      // Fix title - remove escape characters
      if (protocol.title && protocol.title.includes('\\"')) {
        updates.title = protocol.title.replace(/\\"/g, '"').trim();
        needsUpdate = true;
      }
      
      // Fix bad_example - remove escape characters
      if (protocol.bad_example && protocol.bad_example.includes('\\"')) {
        updates.bad_example = protocol.bad_example.replace(/\\"/g, '"').trim();
        needsUpdate = true;
      }
      
      // Fix good_example - remove escape characters
      if (protocol.good_example && protocol.good_example.includes('\\"')) {
        updates.good_example = protocol.good_example.replace(/\\"/g, '"').trim();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('protocols')
          .update(updates)
          .eq('id', protocol.id);
          
        if (updateError) {
          console.error(`Error updating protocol ${protocol.number}:`, updateError);
        } else {
          console.log(`✓ Fixed protocol ${protocol.number}: ${protocol.title}`);
        }
      }
    }
    
    console.log('Description fixes completed!');
  } catch (err) {
    console.error('Exception during fixing:', err);
  }
}

fixDescriptions();