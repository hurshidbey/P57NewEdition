import fs from 'fs';

// Read the protocols file
const content = fs.readFileSync('attached_assets/prtocols.txt', 'utf8');

// Extract the array part by finding the first [ and last ]
const start = content.indexOf('[');
const end = content.lastIndexOf(']') + 1;
const arrayStr = content.substring(start, end);

// Parse it as a JavaScript array
let protocols;
try {
  // Create a function that returns the array
  const fn = new Function('return ' + arrayStr);
  protocols = fn();
  
  console.log('Total protocols found:', protocols.length);
  
  // Save to JSON file
  fs.writeFileSync('supabase/seed/protocols.json', JSON.stringify(protocols, null, 2));
  console.log('Protocols saved to supabase/seed/protocols.json');
  
  // Also save just the raw data for the populate script
  const protocolsForSupabase = protocols.map(p => ({
    number: p.number,
    title: p.title,
    description: p.description,
    bad_example: p.badExample,
    good_example: p.goodExample,
    category_id: p.categoryId,
    notes: p.notes || null
  }));
  
  fs.writeFileSync('supabase/seed/protocols-supabase.json', JSON.stringify(protocolsForSupabase, null, 2));
  console.log('Supabase-formatted protocols saved to supabase/seed/protocols-supabase.json');
  
} catch (error) {
  console.error('Error parsing protocols:', error);
}