// Seed example coupons via Supabase
import { createClient } from '@supabase/supabase-js';
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

async function seedCoupons() {
  console.log('🌱 Seeding example coupons...');
  
  // Check if coupons table exists
  const { data: existingCoupons, error: checkError } = await supabase
    .from('coupons')
    .select('code')
    .limit(1);
  
  if (checkError) {
    console.error('❌ Error accessing coupons table:', checkError.message);
    console.log('\n📝 Please run the migration first:');
    console.log('1. Go to Supabase SQL editor');
    console.log('2. Run the SQL from migrations/add_coupon_system.sql');
    return;
  }
  
  // Example coupons to insert
  const exampleCoupons = [
    {
      code: 'LAUNCH60',
      description: 'Launch special - 60% off',
      discount_type: 'percentage',
      discount_value: 60,
      original_price: 1425000,
      max_uses: null,
      is_active: true,
      created_by: 'system'
    },
    {
      code: 'STUDENT50',
      description: 'Student discount - 50% off',
      discount_type: 'percentage',
      discount_value: 50,
      original_price: 1425000,
      max_uses: null,
      is_active: true,
      created_by: 'system'
    },
    {
      code: 'EARLY500K',
      description: 'Early bird - 500,000 UZS off',
      discount_type: 'fixed',
      discount_value: 500000,
      original_price: 1425000,
      max_uses: 100,
      is_active: true,
      created_by: 'system'
    },
    {
      code: 'TEAM20',
      description: 'Team purchases - 20% off',
      discount_type: 'percentage',
      discount_value: 20,
      original_price: 1425000,
      max_uses: null,
      is_active: true,
      created_by: 'system'
    }
  ];
  
  // Insert each coupon
  for (const coupon of exampleCoupons) {
    const { data, error } = await supabase
      .from('coupons')
      .insert(coupon)
      .select();
    
    if (error) {
      if (error.message.includes('duplicate')) {
        console.log(`⏭️  ${coupon.code} already exists, skipping...`);
      } else {
        console.error(`❌ Error inserting ${coupon.code}:`, error.message);
      }
    } else {
      console.log(`✅ Inserted ${coupon.code}`);
    }
  }
  
  // List all coupons
  const { data: allCoupons, error: listError } = await supabase
    .from('coupons')
    .select('code, discount_type, discount_value, is_active');
  
  if (!listError && allCoupons) {
    console.log(`\n📊 Current coupons in database:`);
    allCoupons.forEach(c => {
      const discount = c.discount_type === 'percentage' 
        ? `${c.discount_value}%` 
        : `${c.discount_value.toLocaleString()} UZS`;
      const status = c.is_active ? '✅' : '❌';
      console.log(`   ${status} ${c.code}: ${discount} off`);
    });
  }
  
  console.log('\n✨ Done!');
}

seedCoupons();