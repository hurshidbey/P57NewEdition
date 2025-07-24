# Google OAuth User Registration Fix

## Problem Summary

Users were able to login with Google OAuth but were not properly registered in Supabase with the required metadata fields (`tier`, `name`). This caused issues with:
- Payment tracking - users could make payments but weren't upgraded to premium
- User identification - missing metadata caused errors in the application
- Inconsistent user state between OAuth and email/password users

## Root Cause

When users sign in with Google OAuth, Supabase automatically creates the user in the `auth.users` table but doesn't set custom metadata fields that our application expects. Email/password signups set these fields during registration, but OAuth users bypass this process.

## Solution Overview

We implemented a three-layer solution to ensure all users have proper metadata:

1. **Database Trigger** - Automatically initializes metadata for new users
2. **Server API Endpoint** - Allows metadata initialization after OAuth login
3. **Client-side Checks** - Ensures metadata is initialized during auth flow

## Implementation Details

### 1. Database Trigger (`server/migrations/001_user_metadata_trigger.sql`)

Creates a PostgreSQL trigger that fires before any new user is inserted into `auth.users`:
- Checks if metadata fields are missing
- Sets default values: `tier='free'`, `name=<extracted from email>`
- Also includes a function to fix existing users with missing metadata

### 2. Server API Endpoints (`server/auth-routes.ts`)

Two new endpoints for metadata management:
- `POST /api/auth/initialize-metadata` - Initializes missing metadata for authenticated users
- `GET /api/auth/check-metadata` - Checks if user has complete metadata

### 3. Client Updates

**Auth Callback (`client/src/pages/auth-callback.tsx`)**:
- After successful OAuth login, calls the metadata initialization endpoint
- Ensures metadata is set before redirecting user

**Auth Service (`client/src/lib/auth.ts`)**:
- `getCurrentUser()` - Checks and initializes metadata if missing
- `onAuthStateChange()` - Initializes metadata on SIGNED_IN event

## Deployment Instructions

### Step 1: Deploy Database Migration

1. Connect to your Supabase database:
   ```bash
   psql $DATABASE_URL
   ```

2. Run the migration:
   ```bash
   \i server/migrations/001_user_metadata_trigger.sql
   ```

   Or use Supabase Dashboard:
   - Go to SQL Editor
   - Paste contents of `server/migrations/001_user_metadata_trigger.sql`
   - Run the query

3. Verify the trigger was created:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

4. Fix existing users (the migration does this automatically):
   ```sql
   SELECT public.fix_existing_user_metadata();
   ```

### Step 2: Deploy Server Code

1. Test locally first:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

2. Deploy to production:
   ```bash
   ./deploy-production.sh
   ```

   Or manually:
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && \
     git pull && \
     docker compose down && \
     docker compose build --no-cache && \
     docker compose up -d"
   ```

### Step 3: Verify the Fix

1. **Check existing users are fixed**:
   ```bash
   # SSH to server
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

   # Check user metadata
   docker exec protokol57-protokol57-1 curl -X GET \
     http://localhost:5000/api/admin/users \
     -H "Authorization: Bearer <admin-token>"
   ```

2. **Test new Google OAuth flow**:
   - Go to https://app.p57.uz/auth
   - Click "Google bilan kirish"
   - Sign in with a new Google account
   - Check browser console for metadata initialization logs
   - Verify user can access all features

3. **Test payment flow**:
   - Login with Google OAuth account
   - Go to payment page
   - Complete payment
   - Verify user is upgraded to premium

## Monitoring

### Check for users with missing metadata:

```sql
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data IS NULL 
   OR raw_user_meta_data->>'tier' IS NULL 
   OR raw_user_meta_data->>'name' IS NULL;
```

### Monitor metadata initialization:

Check server logs for initialization attempts:
```bash
docker logs protokol57-protokol57-1 | grep -E "(Initializing metadata|Metadata initialized)"
```

### Payment tracking:

Verify payments are properly tracked for OAuth users:
```bash
docker logs protokol57-protokol57-1 | grep -E "(Payment completed|upgraded user tier)"
```

## Rollback Plan

If issues arise, you can disable the trigger:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

The API endpoints and client code will gracefully handle missing metadata with default values.

## Security Considerations

1. **Service Role Key**: The metadata initialization endpoint uses the service role key to update user data. This is secure because:
   - The endpoint requires a valid user token
   - It only updates the authenticated user's own metadata
   - No sensitive data is exposed

2. **Default Values**: Users start with `tier='free'` to prevent unauthorized premium access

3. **Validation**: All metadata updates are validated server-side

## Future Improvements

1. **Move admin emails to database**: Currently hardcoded in auth service
2. **Add more OAuth providers**: Same fix will work for GitHub, Twitter, etc.
3. **Webhook integration**: Use Supabase webhooks to initialize metadata immediately after user creation
4. **Better error handling**: Add retry logic for metadata initialization

## Testing Checklist

- [ ] Database trigger created successfully
- [ ] Existing users have metadata initialized
- [ ] New email/password signups work correctly
- [ ] New Google OAuth signups get proper metadata
- [ ] Payment flow works for OAuth users
- [ ] Admin panel shows correct user information
- [ ] No errors in browser console during auth flow
- [ ] Server logs show successful metadata initialization