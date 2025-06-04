import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Read and parse the protocols file manually
const content = fs.readFileSync('attached_assets/prtocols.txt', 'utf8');

// The file contains a JavaScript array, let's extract and parse it
const protocols = [];

// Split by objects
const objectMatches = content.match(/\{[^}]+\}/g);

if (objectMatches) {
  objectMatches.forEach((objStr, index) => {
    try {
      // Extract individual properties
      const idMatch = objStr.match(/id:\s*(\d+)/);
      const numberMatch = objStr.match(/number:\s*(\d+)/);
      const titleMatch = objStr.match(/title:\s*"([^"]+)"/);
      const descriptionMatch = objStr.match(/description:\s*"([^"]+)"/);
      const badExampleMatch = objStr.match(/badExample:\s*"([^"]+)"/);
      const goodExampleMatch = objStr.match(/goodExample:\s*"([^"]+)"/);
      const categoryIdMatch = objStr.match(/categoryId:\s*(\d+)/);
      const notesMatch = objStr.match(/notes:\s*("([^"]+)"|null)/);
      
      if (idMatch && numberMatch && titleMatch && descriptionMatch && badExampleMatch && goodExampleMatch && categoryIdMatch) {
        protocols.push({
          id: parseInt(idMatch[1]),
          number: parseInt(numberMatch[1]),
          title: titleMatch[1],
          description: descriptionMatch[1],
          badExample: badExampleMatch[1],
          goodExample: goodExampleMatch[1],
          categoryId: parseInt(categoryIdMatch[1]),
          notes: notesMatch && notesMatch[2] ? notesMatch[2] : null
        });
      }
    } catch (e) {
      console.error(`Error parsing object ${index}:`, e);
    }
  });
}

console.log('Total protocols parsed:', protocols.length);

// Save the original format
fs.writeFileSync('supabase/seed/protocols.json', JSON.stringify(protocols, null, 2));

// Convert to Supabase format (snake_case)
const protocolsForSupabase = protocols.map(p => ({
  number: p.number,
  title: p.title,
  description: p.description,
  bad_example: p.badExample,
  good_example: p.goodExample,
  category_id: p.categoryId,
  notes: p.notes
}));

fs.writeFileSync('supabase/seed/protocols-supabase.json', JSON.stringify(protocolsForSupabase, null, 2));
console.log('Protocols saved successfully!');