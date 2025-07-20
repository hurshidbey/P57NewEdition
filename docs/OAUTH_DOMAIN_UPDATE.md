# OAuth and Supabase Domain Update Guide

## Google OAuth Console

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID

### Step 2: Add New Authorized Redirect URIs
**IMPORTANT: Keep ALL existing URIs and ADD the new ones**

Add these new URIs:
```
https://app.p57.uz/auth/callback
https://api.p57.uz/auth/callback
https://app.p57.uz/auth/google/callback
https://api.p57.uz/auth/google/callback
```

Keep these existing URIs (for fallback):
```
https://p57.birfoiz.uz/auth/callback
https://p57.birfoiz.uz/auth/google/callback
https://protokol.1foiz.com/auth/callback
https://srv852801.hstgr.cloud/auth/callback
```

### Step 3: Update Authorized JavaScript Origins
Add:
```
https://app.p57.uz
https://api.p57.uz
```

Keep existing:
```
https://p57.uz
https://p57.birfoiz.uz
https://protokol.1foiz.com
https://srv852801.hstgr.cloud
```

## Supabase Configuration

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** > **URL Configuration**

### Step 2: Update Site URL
Change from: `https://p57.birfoiz.uz`
To: `https://app.p57.uz`

### Step 3: Add Redirect URLs
Add ALL these URLs to the "Redirect URLs" list:
```
https://app.p57.uz/**
https://api.p57.uz/**
https://p57.birfoiz.uz/**
https://protokol.1foiz.com/**
https://srv852801.hstgr.cloud/**
https://app.p57.uz/auth/callback
https://api.p57.uz/auth/callback
https://p57.birfoiz.uz/auth/callback
https://protokol.1foiz.com/auth/callback
```

### Step 4: Update Email Templates (if using custom domains)
Go to **Authentication** > **Email Templates**
Update any hardcoded URLs in templates to use: `{{ .SiteURL }}`

## ATMOS Payment Gateway

### Update ATMOS Allowed Origins
Contact ATMOS support to add:
- `https://app.p57.uz`
- `https://api.p57.uz`

Keep existing origins for compatibility.

## Environment Variable Updates

### Update .env.production:
```bash
# Add these if not already present
NEXT_PUBLIC_SITE_URL=https://app.p57.uz
PUBLIC_SITE_URL=https://app.p57.uz
ATMOS_ALLOWED_ORIGIN=https://app.p57.uz
```

## Testing Checklist

### OAuth Flow Testing:
- [ ] Test login from app.p57.uz
- [ ] Test login from p57.birfoiz.uz (should still work)
- [ ] Test login from backup domains
- [ ] Verify callback redirects work correctly

### Payment Flow Testing:
- [ ] Test ATMOS payment from app.p57.uz
- [ ] Verify domain restrictions don't block payments

## Rollback Plan

If issues occur:
1. All old domains remain active
2. Old OAuth callbacks still work
3. Users on old domains won't be affected
4. Can revert Site URL in Supabase if needed

## Important Notes

1. **DO NOT REMOVE** old redirect URIs - keep them for backward compatibility
2. **GRADUAL MIGRATION** - Both old and new domains will work simultaneously
3. **TEST THOROUGHLY** - Especially OAuth flows from different domains
4. **MONITOR** - Watch for authentication errors in logs

## Timeline

1. **Immediate**: Update Google OAuth and Supabase
2. **24-48 hours**: Monitor for any auth issues
3. **1 week**: Start updating external references
4. **1 month**: Consider removing oldest unused redirect URIs
5. **6 months**: Full migration complete, can remove legacy URLs