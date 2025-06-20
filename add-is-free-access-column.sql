-- Add is_free_access column to protocols table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/bazptglwzqstppwlvmvb/sql/new)

-- Step 1: Add the column if it doesn't exist
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS is_free_access BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_protocols_is_free_access ON protocols(is_free_access);

-- Step 3: Set the first 3 protocols as free by default (optional)
UPDATE protocols 
SET is_free_access = true 
WHERE number IN (1, 2, 3);

-- Step 4: Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'protocols' 
  AND column_name = 'is_free_access';

-- Step 5: Show current free protocols
SELECT id, number, title, is_free_access 
FROM protocols 
WHERE is_free_access = true
ORDER BY number;