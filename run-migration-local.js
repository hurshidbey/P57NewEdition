// Run coupon system migration locally
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running coupon system migration...');
    
    // Read migration file
    const migrationSql = readFileSync('./migrations/add_coupon_system.sql', 'utf8');
    
    // Split into individual statements (simple split by semicolon)
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n🔹 Executing statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');
      
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement 
      }).single();
      
      if (error) {
        // Try direct execution via Supabase SQL editor API
        console.log('⚠️  Direct RPC failed, trying alternative method...');
        // For now, we'll skip and note which statements need manual execution
        console.log(`❌ Failed: ${error.message}`);
        console.log('📌 This statement may need manual execution in Supabase SQL editor');
      } else {
        console.log('✅ Success');
      }
    }
    
    // Check if tables were created
    console.log('\n🔍 Checking if coupons table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('coupons')
      .select('count')
      .limit(1);
    
    if (!tableError) {
      console.log('✅ Coupons table exists!');
      
      // Check for example coupons
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('code, discount_type, discount_value');
      
      if (!couponError && coupons) {
        console.log(`\n📊 Found ${coupons.length} coupons:`);
        coupons.forEach(c => {
          console.log(`   - ${c.code}: ${c.discount_value}${c.discount_type === 'percentage' ? '%' : ' UZS'} off`);
        });
      }
    } else {
      console.log('❌ Coupons table not found. Migration may have failed.');
      console.log('\n⚠️  Please run the migration manually in Supabase SQL editor:');
      console.log('1. Go to https://supabase.com/dashboard/project/bazptglwzqstppwlvmvb/sql/new');
      console.log('2. Copy the contents of migrations/add_coupon_system.sql');
      console.log('3. Paste and run in the SQL editor');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();