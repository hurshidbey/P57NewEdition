#!/usr/bin/env node

// Simple script to add the is_free_access column to the protocols table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.MjJjvQDyYX6zqcvXH3j9_jMpqJQYHdFa9XJN0Yz9I0A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFreeAccessColumn() {
  console.log('🔧 Adding is_free_access column to protocols table...');
  
  try {
    // Add the column with default value false
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'protocols' 
            AND column_name = 'is_free_access'
          ) THEN
            ALTER TABLE protocols 
            ADD COLUMN is_free_access BOOLEAN NOT NULL DEFAULT false;
            
            RAISE NOTICE 'Column is_free_access added successfully';
          ELSE
            RAISE NOTICE 'Column is_free_access already exists';
          END IF;
        END
        $$;
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Column added successfully!');
    
    // Verify the column exists
    const { data: protocols, error: selectError } = await supabase
      .from('protocols')
      .select('id, title, is_free_access')
      .limit(1);

    if (selectError) {
      console.error('❌ Verification error:', selectError);
    } else {
      console.log('✅ Verification successful - protocols table now has is_free_access column');
      if (protocols && protocols.length > 0) {
        console.log('Sample protocol:', protocols[0]);
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

addFreeAccessColumn();