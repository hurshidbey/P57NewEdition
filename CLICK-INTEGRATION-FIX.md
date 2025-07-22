# Click.uz Integration Fix Guide

## Issue Identified

The "Network connection errors during Prepare (Create)" error occurs because Click.uz cannot reach your callback endpoint. This is likely due to one or more of the following issues:

## Root Causes

1. **Callback URL Configuration**: The callback URL must be configured in the Click.uz merchant cabinet
2. **Domain Mismatch**: Using `app.p57.uz` vs `p57.birfoiz.uz`
3. **Test vs Production Environment**: Currently set to `CLICK_ENV=test`

## Required Actions

### 1. Configure Click.uz Merchant Cabinet

**CRITICAL**: You must log into your Click.uz merchant cabinet and configure the following:

1. **Callback URL (Prepare/Complete endpoint)**: 
   - Set to: `https://app.p57.uz/api/click/pay`
   - This is where Click.uz will send Prepare and Complete requests

2. **Return URL**: 
   - Already set correctly in environment: `https://app.p57.uz/api/click/return`
   - This is where users are redirected after payment

3. **Allowed IPs** (if applicable):
   - Add your server IP: `69.62.126.73`
   - Or disable IP restriction for testing

### 2. Environment Configuration Issues

Current environment has mixed domains:
- `CLICK_RETURN_URL=https://app.p57.uz/api/click/return`
- `APP_DOMAIN=https://app.p57.uz`
- But the main app runs on `https://p57.birfoiz.uz`

### 3. Click.uz Test Mode

**IMPORTANT**: `CLICK_ENV=test` means you're using Click.uz test environment. This requires:
- Test credentials (which you have)
- Test payment cards
- The callback URL in test merchant cabinet

## Immediate Fix Steps

### Step 1: Update Merchant Cabinet

1. Log into Click.uz merchant cabinet:
   - Test: https://my.click.uz/services/merchant/
   - Production: https://my.click.uz/services/merchant/

2. Navigate to your service settings (Service ID: 75582)

3. Configure:
   - **Prepare/Complete URL**: `https://app.p57.uz/api/click/pay`
   - **Method**: POST
   - **Format**: JSON

### Step 2: Test the Integration

1. First, verify your endpoint is accessible:
```bash
curl -X POST https://app.p57.uz/api/click/pay \
  -H "Content-Type: application/json" \
  -d '{"action": 0}'
```

Expected response: `{"error": -9, "error_note": "Invalid request"}`

2. Use Click.uz test cards:
   - Card: 8600 0000 0000 0001
   - Expiry: Any future date
   - SMS code: 666666

### Step 3: Monitor Logs

Watch server logs during payment:
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  "docker logs -f protokol57-protokol57-1 | grep -i click"
```

## Code Improvements Needed

### 1. Add Request Logging

The Click routes need better logging to debug callback issues.

### 2. Response Format

Ensure responses match Click.uz expected format exactly:
```json
{
  "click_trans_id": "string",
  "merchant_trans_id": "string",
  "merchant_prepare_id": "string",
  "error": 0,
  "error_note": "Success"
}
```

### 3. Signature Verification

The signature verification might be failing due to incorrect parameter ordering or encoding.

## Testing Checklist

- [ ] Callback URL configured in Click.uz merchant cabinet
- [ ] Server endpoint accessible from internet
- [ ] Logs show incoming requests from Click.uz
- [ ] Signature verification passes
- [ ] Response format matches Click.uz requirements
- [ ] Test payment completes successfully

## Common Click.uz IP Addresses

Click.uz may send requests from these IPs (add to firewall whitelist if needed):
- Production: Contact Click.uz support for current IP list
- Test: Usually same subnet as production

## Support Contact

If issues persist after following this guide:
- Click.uz Technical Support: +998 71 200 00 09
- Email: support@click.uz