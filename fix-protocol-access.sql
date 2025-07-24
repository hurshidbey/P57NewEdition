-- Fix Protocol Access Issue
-- This script ensures all protocols are properly configured for the tier system

-- First, let's check the current state of protocols
SELECT 
  COUNT(*) as total_protocols,
  COUNT(CASE WHEN is_free_access = true THEN 1 END) as free_protocols,
  COUNT(CASE WHEN is_free_access = false THEN 1 END) as premium_protocols
FROM protocols;

-- Show which protocols are currently marked as free
SELECT id, number, title, is_free_access 
FROM protocols 
ORDER BY number
LIMIT 10;

-- IMPORTANT: The tier system works as follows:
-- 1. Free users can only access protocols where is_free_access = true (max 3 protocols)
-- 2. Paid users can access ALL protocols regardless of is_free_access value
-- 3. Only protocols 1, 2, and 3 should have is_free_access = true

-- First, set all protocols to is_free_access = false (premium)
UPDATE protocols 
SET is_free_access = false;

-- Then set only the first 3 protocols as free access
UPDATE protocols 
SET is_free_access = true 
WHERE number IN (1, 2, 3);

-- Verify the changes
SELECT 
  'After Update' as status,
  COUNT(*) as total_protocols,
  COUNT(CASE WHEN is_free_access = true THEN 1 END) as free_protocols,
  COUNT(CASE WHEN is_free_access = false THEN 1 END) as premium_protocols
FROM protocols;

-- Show the final state of all protocols
SELECT id, number, title, is_free_access 
FROM protocols 
ORDER BY number;

-- IMPORTANT NOTE:
-- If paid users are not seeing all protocols, the issue is NOT with is_free_access
-- The frontend logic (useUserTier hook) correctly allows paid users to access ALL protocols
-- Check these potential issues instead:
-- 1. User tier is not set to 'paid' in the database after payment
-- 2. Frontend is not fetching user data correctly after login
-- 3. API pagination is limiting results