-- Diagnostic Script for Protocol Visibility Issues
-- Run this to understand why paid users might not see all protocols

-- 1. Check total number of protocols in database
SELECT 'Total Protocols in DB' as check_name, COUNT(*) as count
FROM protocols;

-- 2. Check protocol access configuration
SELECT 
  'Protocol Access Config' as check_name,
  is_free_access,
  COUNT(*) as count
FROM protocols
GROUP BY is_free_access;

-- 3. Check if all 57 protocols exist
SELECT 'Missing Protocol Numbers' as check_name, 
  number
FROM generate_series(1, 57) as number
WHERE number NOT IN (SELECT number FROM protocols);

-- 4. Check user tiers
SELECT 
  'User Tiers' as check_name,
  tier,
  COUNT(*) as count
FROM users
GROUP BY tier;

-- 5. Check recent payments and tier updates
SELECT 
  'Recent Payments' as check_name,
  p.user_email,
  p.status as payment_status,
  p.created_at as payment_date,
  u.tier as user_tier,
  u.paid_at as tier_updated_at
FROM payments p
LEFT JOIN users u ON u.username = p.user_email
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Check if there are duplicate protocols
SELECT 
  'Duplicate Protocol Numbers' as check_name,
  number,
  COUNT(*) as count
FROM protocols
GROUP BY number
HAVING COUNT(*) > 1;

-- 7. Check protocol visibility by tier (simulating frontend logic)
WITH user_tiers AS (
  SELECT DISTINCT tier FROM users
)
SELECT 
  ut.tier,
  COUNT(p.id) as visible_protocols,
  CASE 
    WHEN ut.tier = 'paid' THEN 'Should see all 57 protocols'
    WHEN ut.tier = 'free' THEN 'Should see only protocols where is_free_access = true'
    ELSE 'Unknown tier'
  END as expected_behavior
FROM user_tiers ut
CROSS JOIN protocols p
WHERE 
  ut.tier = 'paid' -- Paid users see all
  OR (ut.tier = 'free' AND p.is_free_access = true) -- Free users see only free protocols
GROUP BY ut.tier;

-- 8. Debug specific user access (replace 'user@email.com' with actual user email)
-- SELECT 
--   u.username,
--   u.tier,
--   u.paid_at,
--   COUNT(DISTINCT p.id) as accessible_protocols
-- FROM users u
-- CROSS JOIN protocols p
-- WHERE u.username = 'user@email.com'
--   AND (u.tier = 'paid' OR p.is_free_access = true)
-- GROUP BY u.username, u.tier, u.paid_at;