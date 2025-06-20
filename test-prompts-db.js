import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPrompts() {
  console.log('🧪 Testing prompts database connection...');
  
  try {
    // Test 1: Get all prompts directly
    console.log('\n1. Testing direct Supabase query...');
    const { data: allPrompts, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log(`✅ Found ${allPrompts.length} prompts in database`);
      allPrompts.forEach(prompt => {
        console.log(`- ID ${prompt.id}: ${prompt.title} (Premium: ${prompt.is_premium}, Public: ${prompt.is_public})`);
      });
    }
    
    // Test 2: Filter for free users
    console.log('\n2. Testing free user filter...');
    const { data: freePrompts, error: freeError } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .eq('is_premium', false)
      .order('created_at', { ascending: false });
    
    if (freeError) {
      console.error('❌ Free filter error:', freeError);
    } else {
      console.log(`✅ Free users can see ${freePrompts.length} prompts`);
      freePrompts.forEach(prompt => {
        console.log(`- ${prompt.title}`);
      });
    }
    
    // Test 3: Filter for paid users  
    console.log('\n3. Testing paid user filter...');
    const { data: paidPrompts, error: paidError } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (paidError) {
      console.error('❌ Paid filter error:', paidError);
    } else {
      console.log(`✅ Paid users can see ${paidPrompts.length} prompts`);
      paidPrompts.forEach(prompt => {
        console.log(`- ${prompt.title} (Premium: ${prompt.is_premium})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPrompts();