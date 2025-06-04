import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bazptglwzqstppwlvmvb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ";

const supabase = createClient(supabaseUrl, supabaseKey);

// English to Uzbek category translations
const categoryTranslations = [
  { id: 1, name: "Auditoriya", description: "Maqsadli auditoriya va yo'naltirish" },
  { id: 2, name: "Ijodiy", description: "Ijodiy va innovatsion yondashuvlar" },
  { id: 3, name: "Texnik", description: "Texnik amalga oshirish" },
  { id: 4, name: "Tuzilish", description: "Kontent tuzilishi va formatlash" },
  { id: 5, name: "Dalil", description: "Dalil va tekshirish" },
  { id: 6, name: "Tahlil", description: "Tahlil va baholash" },
];

async function updateCategoriesToUzbek() {
  console.log('Updating categories to Uzbek...');
  
  for (const category of categoryTranslations) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description
        })
        .eq('id', category.id);
        
      if (error) {
        console.error(`Error updating category ${category.id}:`, error);
      } else {
        console.log(`✓ Updated category ${category.id}: ${category.name}`);
      }
    } catch (err) {
      console.error(`Exception updating category ${category.id}:`, err);
    }
  }
  
  console.log('Category translations completed!');
}

updateCategoriesToUzbek();