#!/bin/bash

echo "🚨 EMERGENCY FIX: Fixing payment_transactions table"
echo "================================================"

# First, let's check what the actual problem is
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'EOF'
cd /opt/protokol57

# Create a Node.js script to fix the database
cat > /tmp/fix-payment-db.js << 'SCRIPT'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabase() {
  console.log('1. Checking if payment_transactions table exists...');
  
  // First, check if the table exists
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'payment_transactions');
    
  if (!tables || tables.length === 0) {
    console.log('❌ Table does not exist! Creating it...');
    
    // Create the table
    const createTableQuery = `
      CREATE TABLE public.payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        merchant_trans_id TEXT UNIQUE NOT NULL,
        external_trans_id TEXT,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('click', 'atmos')),
        original_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        final_amount DECIMAL(10, 2) NOT NULL,
        currency TEXT DEFAULT 'UZS',
        coupon_id INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        metadata JSONB DEFAULT '{}',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `;
    
    // Can't run DDL through Supabase client, so we'll add the column
    console.log('Table needs to be created manually.');
  } else {
    console.log('✅ Table exists. Checking columns...');
    
    // Check if coupon_code column exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'payment_transactions')
      .eq('column_name', 'coupon_code');
      
    if (!columns || columns.length === 0) {
      console.log('❌ coupon_code column missing - this is OK, we handle it in metadata');
    }
  }
  
  // Drop the problematic view
  console.log('2. Dropping problematic view...');
  // Can't run DROP VIEW through Supabase client
  console.log('View needs to be dropped manually.');
  
  console.log(`
MANUAL FIX REQUIRED:
===================

Please run this SQL in Supabase SQL editor:

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.payment_transactions_summary CASCADE;

-- 2. If the payment_transactions table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  merchant_trans_id TEXT UNIQUE NOT NULL,
  external_trans_id TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('click', 'atmos')),
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UZS',
  coupon_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
`);
}

fixDatabase().catch(console.error);
SCRIPT

# Run the script
docker exec protokol57-protokol57-1 node /tmp/fix-payment-db.js
EOF