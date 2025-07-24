# Protocol Visibility Issue - Analysis and Solution

## Issue Summary
Paid users are not seeing all 57 protocols as expected. The system shows them as having access but protocols might appear locked or not appear at all.

## Root Cause Analysis

### 1. Database Seeding Issue
The main issue is in the database seeding process:
- The `seedProtocols()` function in `/server/storage.ts` only seeds 25 protocols instead of 57
- The `isFreeAccess` field is not set during seeding, defaulting to `false` for all protocols
- Only protocols 1, 2, and 3 were manually updated to have `isFreeAccess = true` via SQL

### 2. Access Control Logic (Working Correctly)
The access control logic in `/client/src/hooks/use-user-tier.ts` is correct:
```typescript
// For paid users (line 61-63)
if (tier === 'paid') {
  return true; // Paid users can access all protocols
}

// For free users (line 65-74)
if (tier === 'free') {
  if (!isFreeAccess) return false; // Must be a free protocol
  // Additional logic for 3-protocol limit
}
```

### 3. Key Findings
1. **Missing Protocols**: Only 25 out of 57 protocols are being seeded in the database
2. **isFreeAccess Default**: Schema defaults to `false`, but seed data doesn't include this field
3. **Frontend Logic**: Correctly allows paid users to see all protocols regardless of `isFreeAccess`
4. **No Client-Side Filtering**: The home page doesn't filter protocols based on access

## Solution

### Immediate Fix (SQL)
Run the following SQL in Supabase to ensure proper configuration:

```sql
-- 1. First check how many protocols exist
SELECT COUNT(*) FROM protocols;

-- 2. Ensure all protocols have correct isFreeAccess values
UPDATE protocols SET is_free_access = false;
UPDATE protocols SET is_free_access = true WHERE number IN (1, 2, 3);

-- 3. If protocols are missing, they need to be added via the seeding process
```

### Long-term Fix (Code)
1. Update the `seedProtocols()` function to include all 57 protocols
2. Add `isFreeAccess` field to each protocol in the seed data:
   - Protocols 1-3: `isFreeAccess: true`
   - Protocols 4-57: `isFreeAccess: false`

### Verification Steps
1. Run the diagnostic SQL script: `/diagnose-protocol-visibility.sql`
2. Check if all 57 protocols exist in the database
3. Verify user tier is correctly set to 'paid' after payment
4. Test protocol visibility for both free and paid users

## Important Notes
- The issue is NOT with the access control logic
- Paid users should see ALL protocols regardless of `isFreeAccess` value
- Free users should only see protocols where `isFreeAccess = true` (max 3)
- If protocols are missing from the database, they need to be added first

## Action Items
1. ✅ Run the fix SQL script to correct `isFreeAccess` values
2. ⚠️ Verify all 57 protocols exist in the database
3. ⚠️ Update seed function to include all protocols with correct access flags
4. ✅ Test with both free and paid user accounts