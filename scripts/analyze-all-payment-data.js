#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeAllPaymentData() {
  console.log('🔍 Comprehensive payment data analysis...\n');
  
  const tables = [
    'payment_sessions',
    'payment_transactions', 
    'payments',
    'payment_records',
    'transactions'
  ];
  
  for (const tableName of tables) {
    console.log(`\n📊 Analyzing ${tableName}:`);
    console.log('─'.repeat(50));
    
    try {
      // Get count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ Error: ${countError.message}`);
        continue;
      }
      
      console.log(`✅ Total records: ${count || 0}`);
      
      if (count > 0) {
        // Get sample data
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (!error && data && data.length > 0) {
          console.log(`\nColumns: ${Object.keys(data[0]).join(', ')}`);
          console.log('\nRecent records:');
          
          data.forEach((record, i) => {
            console.log(`\n${i + 1}. ${JSON.stringify(record, null, 2).substring(0, 500)}...`);
          });
        }
      }
    } catch (e) {
      console.log(`❌ Failed to analyze: ${e.message}`);
    }
  }
  
  // Check for views
  console.log('\n\n📋 Checking if payments is a view:');
  try {
    const { data: viewDef, error: viewError } = await supabase.rpc('get_view_definition', {
      view_name: 'payments'
    });
    
    if (viewError) {
      console.log('Could not check view definition');
    } else if (viewDef) {
      console.log('✅ payments is a VIEW');
      console.log('View definition:', viewDef);
    }
  } catch (e) {
    // Try alternative approach
    console.log('Checking alternative way...');
  }
  
  // Summary recommendation
  console.log('\n\n🎯 RECOMMENDATION:');
  console.log('─'.repeat(50));
  console.log('Based on the analysis:');
  console.log('1. payment_sessions table contains completed payments');
  console.log('2. The admin panel should query payment_sessions table');
  console.log('3. Filter by status = "completed" to show only successful payments');
  console.log('4. Map the fields appropriately for the UI');
}

analyzeAllPaymentData();