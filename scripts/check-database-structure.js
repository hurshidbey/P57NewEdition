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

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...\n');
  
  try {
    // Query to get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_list');
    
    if (tablesError) {
      console.log('Could not get tables list via RPC, trying alternative method...');
      
      // Try to query information_schema
      const query = `
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%payment%'
        ORDER BY table_name;
      `;
      
      // Since we can't run raw SQL directly, let's check known tables
      console.log('\n📋 Checking known payment-related tables:\n');
      
      const tablesToCheck = [
        'payments',
        'payment_sessions',
        'payment_transactions',
        'payment_records',
        'transactions'
      ];
      
      for (const tableName of tablesToCheck) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ ${tableName} - exists (${count || 0} records)`);
          } else {
            console.log(`❌ ${tableName} - ${error.message}`);
          }
        } catch (e) {
          console.log(`❌ ${tableName} - error checking`);
        }
      }
    } else {
      console.log('Tables in database:', tables);
    }
    
    // Check if payments is a view
    console.log('\n\n📋 Checking if payments is a view or table...');
    const { data: viewCheck, error: viewError } = await supabase
      .from('payments')
      .select('count', { count: 'exact', head: true });
    
    if (!viewError) {
      console.log('✅ Can read from payments');
      
      // Try to check column info
      const { data: sample, error: sampleError } = await supabase
        .from('payments')
        .select('*')
        .limit(1);
      
      if (sample && sample.length > 0) {
        console.log('\n📊 Payments structure (columns):');
        console.log(Object.keys(sample[0]).join(', '));
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabaseStructure();