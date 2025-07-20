# Authentication Migration Guide

## Overview

We've removed hardcoded credentials from the codebase and implemented a secure fallback authentication system using environment variables and bcrypt hashing.

## Changes Made

### 1. Removed Hardcoded Credentials
- **Previously**: Authentication checked for hardcoded credentials:
  - `admin/admin123`
  - `hurshidbey@gmail.com/20031000a`
- **Now**: Uses environment variables with bcrypt-hashed passwords

### 2. New Authentication Flow
1. First checks database users (supports both bcrypt and legacy plain text)
2. Falls back to environment-configured admin if database user not found
3. All password comparisons use bcrypt when possible

## Migration Steps

### Step 1: Generate Secure Password Hash
```bash
# Run the password hash generator
node scripts/generate-password-hash.js

# Enter your desired fallback admin password when prompted
# Copy the generated hash
```

### Step 2: Update Environment Variables
Add these to your `.env.production`:
```bash
# Fallback admin credentials
FALLBACK_ADMIN_EMAIL=admin@yourdomain.com
FALLBACK_ADMIN_PASSWORD_HASH=$2b$12$[your-generated-hash]
```

### Step 3: Update Existing Users (Optional)
If you have existing users with plain text passwords, consider migrating them:

```sql
-- Example: Update a user's password to bcrypt hash
UPDATE users 
SET password = '$2b$12$[generated-hash]' 
WHERE username = 'existing-user@example.com';
```

### Step 4: Deploy Changes
```bash
# Copy updated .env.production to server
scp -i ~/.ssh/protokol57_ed25519 .env.production root@69.62.126.73:/opt/protokol57/.env.production

# Deploy the application
./deploy-production.sh
```

## Security Improvements

1. **No More Hardcoded Credentials**: All credentials now in environment variables
2. **Bcrypt Hashing**: Passwords are properly hashed with salt rounds of 12
3. **Graceful Fallback**: System works even if database is unavailable
4. **Audit Logging**: Fallback authentication usage is logged

## Testing

### Test Fallback Admin Login
```bash
# With database available
curl -X POST https://p57.birfoiz.uz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@yourdomain.com","password":"your-password"}'

# Response should be:
# {"user":{"id":"...","username":"admin@yourdomain.com","role":"admin"},"success":true}
```

### Test Database User Login
Database users continue to work as before, with support for both bcrypt and legacy passwords.

## Backward Compatibility

- Existing database users with plain text passwords will continue to work
- A warning is logged when plain text passwords are used
- Consider migrating all users to bcrypt hashes

## Security Best Practices

1. **Use Strong Passwords**: At least 16 characters with mixed case, numbers, and symbols
2. **Rotate Regularly**: Change fallback admin password every 90 days
3. **Limit Access**: Only share fallback credentials with authorized personnel
4. **Monitor Usage**: Check logs for fallback authentication usage
5. **Prefer Database Users**: Use fallback only for emergency access

## Troubleshooting

### "Invalid credentials" Error
1. Check environment variables are set correctly
2. Verify password hash was generated with correct password
3. Check logs for authentication errors

### Environment Variables Not Loading
1. Ensure `.env.production` file exists
2. Check file permissions (should be 600)
3. Restart the application after changes

### Password Hash Generation Issues
1. Ensure bcrypt is installed: `npm install bcrypt`
2. Use Node.js version 14 or higher
3. Try the alternative method: `htpasswd -bnBC 12 "" password | tr -d ':\n' | sed 's/$2y/$2b/'`

## Rollback Plan

If issues occur, you can temporarily restore the old authentication:
1. Revert the changes in `server/routes.ts`
2. Redeploy the previous version
3. Fix issues and retry migration

**Note**: This is a critical security improvement. Do not leave hardcoded credentials in production code.