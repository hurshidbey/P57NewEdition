# P57 Domain Architecture Documentation

## Overview

P57 has transitioned from hardcoded domain references to a centralized, environment-based domain configuration system. This provides flexibility, easier deployment, and better support for multiple environments.

## Domain Structure

### Primary Domains
- **Landing Page**: `p57.uz` - Main marketing and information site
- **Application**: `app.p57.uz` - Main application interface
- **API**: `api.p57.uz` - Backend API services

### Backup Domains
- `protokol.1foiz.com` - Legacy domain, maintained for backward compatibility
- `p57.birfoiz.uz` - Previous primary domain
- `srv852801.hstgr.cloud` - Server direct access fallback

## Configuration

### Environment Variables

All domain configuration is managed through environment variables:

```bash
# Required Variables
LANDING_DOMAIN=https://p57.uz
APP_DOMAIN=https://app.p57.uz
API_DOMAIN=https://api.p57.uz
PRIMARY_DOMAIN=p57.uz

# Optional Variables
BACKUP_DOMAINS=https://protokol.1foiz.com,https://p57.birfoiz.uz,https://srv852801.hstgr.cloud
CORS_ALLOWED_ORIGINS=https://p57.uz,https://www.p57.uz,https://app.p57.uz,https://api.p57.uz,https://protokol.1foiz.com,https://p57.birfoiz.uz,https://srv852801.hstgr.cloud
```

### Centralized Configuration Module

The domain configuration is centralized in `shared/config/domains.ts`:

```typescript
import { DOMAINS, getEmailAddresses, getServiceUrls } from '@shared/config/domains';

// Access domains
const appUrl = DOMAINS.app;
const apiUrl = DOMAINS.api;

// Get email addresses
const emails = getEmailAddresses();
console.log(emails.support); // support@p57.uz

// Get service URLs
const services = getServiceUrls();
console.log(services.auth); // https://api.p57.uz/auth
```

## Email Configuration

Email addresses are automatically generated based on the PRIMARY_DOMAIN:

- `support@p57.uz` - General support
- `legal@p57.uz` - Legal inquiries
- `info@p57.uz` - General information
- `admin@p57.uz` - Administrative
- `devops@p57.uz` - DevOps team
- `security@p57.uz` - Security team
- `finance@p57.uz` - Finance team
- `cto@p57.uz` - Chief Technical Officer

## Domain Failover

The system includes automatic domain failover capabilities:

1. **Health Checking**: Regular checks on all configured domains
2. **Automatic Switching**: If primary domain fails, automatically switch to backup
3. **User Persistence**: Remember user's preferred domain across sessions

### Implementation

```typescript
import { useDomainFailover } from '@/hooks/use-domain-failover';

function MyComponent() {
  const { currentDomain, isChecking } = useDomainFailover();
  
  // Use currentDomain for API calls
}
```

## CORS Configuration

CORS is automatically configured based on environment variables:

- All domains in `CORS_ALLOWED_ORIGINS` are allowed
- Development environments automatically include localhost ports
- The configuration is applied in `server/middleware/security.ts`

## OAuth Integration

When updating domains, ensure OAuth providers are configured:

### Google OAuth
1. Add all app domains to Authorized JavaScript Origins
2. Add callback URLs for each domain:
   - `https://app.p57.uz/auth/callback`
   - `https://app.p57.uz/auth/google/callback`

### Supabase
1. Update Site URL to primary app domain
2. Add all domains to Redirect URLs with wildcards:
   - `https://app.p57.uz/**`
   - `https://api.p57.uz/**`

## SSL/TLS Configuration

All domains must have valid SSL certificates:

1. **Primary domains**: Managed by Let's Encrypt via Traefik
2. **Backup domains**: Should also have valid certificates
3. **Certificate renewal**: Automatic via Traefik

## DNS Configuration

### Required DNS Records

For each domain, configure:

```
# A Records
app.p57.uz    A    69.62.126.73
api.p57.uz    A    69.62.126.73
p57.uz        A    69.62.126.73
```

### DNS Health Monitoring

The system includes DNS health monitoring at `/api/dns-health`:

- Checks DNS resolution
- Verifies propagation across multiple DNS servers
- Tests SSL certificate validity
- Monitors response times

## Migration Guide

### From Hardcoded Domains

1. **Update imports**:
```typescript
// Before
const API_URL = 'https://p57.birfoiz.uz/api';

// After
import { getApiUrl } from '@shared/config/domains';
const API_URL = getApiUrl();
```

2. **Update email references**:
```typescript
// Before
const supportEmail = 'support@p57.uz';

// After
import { getEmailAddresses } from '@shared/config/domains';
const { support } = getEmailAddresses();
```

3. **Run migration check**:
```bash
./scripts/migrate-domains.sh
```

## Testing

### Local Development
```bash
# Set test domains
export APP_DOMAIN=http://localhost:5173
export API_DOMAIN=http://localhost:5000

# Run application
npm run dev
```

### Production Verification
1. Check all domains resolve correctly
2. Verify OAuth flows work on all domains
3. Test domain failover mechanism
4. Monitor CORS for any blocked requests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure domain is in `CORS_ALLOWED_ORIGINS`
2. **OAuth Failures**: Verify redirect URLs in provider settings
3. **SSL Warnings**: Check certificate validity and renewal
4. **DNS Resolution**: Use DNS health endpoint to diagnose

### Debug Tools

- DNS Health Check: `GET /api/dns-health`
- Connectivity Checker: Available in UI for users
- Domain Migration Script: `./scripts/migrate-domains.sh`

## Security Considerations

1. **Never hardcode domains** in application code
2. **Always use HTTPS** for production domains
3. **Validate redirect domains** to prevent open redirects
4. **Monitor domain expiration** to prevent service interruption
5. **Use environment variables** for all domain configuration

## Future Enhancements

1. **Automatic DNS Failover**: Integrate with DNS provider APIs
2. **Geographic Routing**: Route users to nearest domain
3. **Domain Analytics**: Track usage across different domains
4. **A/B Testing**: Test new domains with subset of users