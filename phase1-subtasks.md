# Phase 1: Critical Security & DNS Issues - Detailed Sub-Tasks

**Timeline**: Week 1 (Immediate Priority)
**Total Effort**: ~30 hours

---

## 🔴 Task 1: Remove Hardcoded Credentials from Code

### Current Issues:
- File: `server/routes.ts` (lines 1076-1077)
- Hardcoded: `admin/admin123`, `hurshidbey@gmail.com/20031000a`

### Sub-tasks:

#### 1.1 Update Environment Variables (30 min)
```bash
# Add to .env.production
FALLBACK_ADMIN_EMAIL=admin@example.com
FALLBACK_ADMIN_PASSWORD_HASH=$2b$12$... # Generate with bcrypt
```

#### 1.2 Generate Secure Password Hash (15 min)
```bash
# Create a quick script to generate bcrypt hash
node -e "
const bcrypt = require('bcryptjs');
const password = 'your-secure-password';
bcrypt.hash(password, 12).then(hash => console.log(hash));
"
```

#### 1.3 Update server/routes.ts (45 min)
```typescript
// Replace lines 1076-1077
const fallbackUsers = process.env.FALLBACK_ADMIN_EMAIL ? [{
  email: process.env.FALLBACK_ADMIN_EMAIL,
  password: process.env.FALLBACK_ADMIN_PASSWORD_HASH || '',
  role: 'admin'
}] : [];
```

#### 1.4 Update Authentication Logic (30 min)
- Remove plain text password comparison
- Ensure bcrypt is used for all password checks
- Add logging for fallback auth usage

#### 1.5 Testing (30 min)
```bash
# Test locally
docker-compose up
# Try login with new credentials
# Verify old hardcoded credentials don't work
```

#### 1.6 Documentation (15 min)
- Update README with new env variables
- Document in deployment guide
- Add to .env.example

---

## 🔴 Task 2: Implement Credential Rotation Process

### Sub-tasks:

#### 2.1 Create Rotation Script (2 hours)
Create `scripts/rotate-credentials.sh`:
```bash
#!/bin/bash
# Credential Rotation Script for P57

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "P57 Credential Rotation Tool"
echo "============================"

# Function to rotate API keys
rotate_api_key() {
    local KEY_NAME=$1
    echo -e "${GREEN}Rotating ${KEY_NAME}...${NC}"
    
    # Backup current .env.production
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
    
    # Prompt for new key
    read -p "Enter new ${KEY_NAME}: " NEW_KEY
    
    # Update .env.production
    sed -i.bak "s/${KEY_NAME}=.*/${KEY_NAME}=${NEW_KEY}/" .env.production
    
    echo -e "${GREEN}✓ ${KEY_NAME} updated${NC}"
}

# Rotate each credential
rotate_api_key "OPENAI_API_KEY"
rotate_api_key "SUPABASE_SERVICE_ROLE_KEY"
rotate_api_key "SESSION_SECRET"
rotate_api_key "ATMOS_CONSUMER_KEY"
rotate_api_key "ATMOS_CONSUMER_SECRET"

echo -e "${GREEN}Credential rotation complete!${NC}"
echo "Next steps:"
echo "1. Deploy to production: ./deploy-production.sh"
echo "2. Verify all services are working"
echo "3. Delete backup files after confirmation"
```

#### 2.2 Create Rotation Schedule (1 hour)
Create `docs/CREDENTIAL_ROTATION.md`:
```markdown
# Credential Rotation Schedule

## Rotation Frequency
- **API Keys**: Every 90 days
- **Session Secrets**: Every 180 days
- **Database Passwords**: Every 365 days

## Rotation Calendar
| Credential | Last Rotated | Next Rotation | Owner |
|------------|--------------|---------------|-------|
| OPENAI_API_KEY | 2024-01-20 | 2024-04-20 | DevOps |
| SUPABASE_SERVICE_ROLE_KEY | 2024-01-20 | 2024-04-20 | DevOps |
| SESSION_SECRET | 2024-01-20 | 2024-07-20 | DevOps |

## Rotation Procedure
1. Run `./scripts/rotate-credentials.sh`
2. Test in staging (if available)
3. Deploy to production
4. Verify all services
5. Update this document
```

#### 2.3 Add Automated Reminders (30 min)
```bash
# Add to crontab (run monthly to check)
0 9 1 * * /opt/protokol57/scripts/check-credential-expiry.sh
```

#### 2.4 Create Verification Script (30 min)
```bash
#!/bin/bash
# scripts/verify-credentials.sh

echo "Verifying credentials..."

# Check OpenAI
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models || echo "OpenAI API key invalid"

# Check Supabase
curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  $SUPABASE_URL/rest/v1/ || echo "Supabase key invalid"

# Add more checks...
```

---

## 🔴 Task 3: Add Startup Validation for Environment Variables

### Sub-tasks:

#### 3.1 Create Validation Module (1.5 hours)
Create `server/utils/env-validator.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Required variables
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  
  // Optional but recommended
  OPENAI_API_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  
  // Payment gateway
  ATMOS_STORE_ID: z.string(),
  ATMOS_CONSUMER_KEY: z.string(),
  ATMOS_CONSUMER_SECRET: z.string(),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Warnings for optional variables
export function checkOptionalEnv() {
  const warnings = [];
  
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set - AI evaluation will be disabled');
  }
  
  if (!process.env.ADMIN_EMAILS) {
    warnings.push('ADMIN_EMAILS not set - using fallback admin list');
  }
  
  warnings.forEach(w => console.warn(`⚠️  ${w}`));
}
```

#### 3.2 Update Server Startup (30 min)
Update `server/index.ts`:
```typescript
import { validateEnv, checkOptionalEnv } from './utils/env-validator';

// At the very start
console.log('🚀 Starting P57 Server...');
validateEnv();
checkOptionalEnv();

// Rest of server initialization...
```

#### 3.3 Create Development Validator (30 min)
Create `scripts/validate-env.js`:
```javascript
// Quick script to validate .env files
const fs = require('fs');
const path = require('path');

function validateEnvFile(filename) {
  const envPath = path.join(__dirname, '..', filename);
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ ${filename} not found`);
    return false;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const required = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SESSION_SECRET'
  ];
  
  const missing = required.filter(key => 
    !content.includes(`${key}=`)
  );
  
  if (missing.length > 0) {
    console.error(`❌ ${filename} missing: ${missing.join(', ')}`);
    return false;
  }
  
  console.log(`✅ ${filename} looks good`);
  return true;
}

// Validate both files
validateEnvFile('.env.production');
validateEnvFile('.env.development');
```

#### 3.4 Add Pre-deployment Check (30 min)
Update `deploy-production.sh`:
```bash
# Add after line 49
echo "Validating environment configuration..."
node scripts/validate-env.js
if [ $? -ne 0 ]; then
    print_error "Environment validation failed!"
    exit 1
fi
```

---

## 🔴 Task 4: Audit and Update Admin Access Control

### Sub-tasks:

#### 4.1 Review Current Implementation (1 hour)
- Analyze `server/middleware/auth.ts`
- Check admin email validation
- Document current permissions

#### 4.2 Implement Role-Based Access Control (2 hours)
Create `server/utils/rbac.ts`:
```typescript
export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  VIEW_PAYMENTS = 'view_payments',
  MANAGE_PROTOCOLS = 'manage_protocols',
  MANAGE_COUPONS = 'manage_coupons',
  VIEW_ANALYTICS = 'view_analytics',
  SYSTEM_CONFIG = 'system_config'
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [],
  [Role.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_ANALYTICS
  ],
  [Role.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PROTOCOLS,
    Permission.MANAGE_COUPONS,
    Permission.VIEW_ANALYTICS
  ],
  [Role.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission)
  ]
};

export function hasPermission(
  userRole: Role, 
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}
```

#### 4.3 Add Audit Logging (2 hours)
Create `server/utils/audit-logger.ts`:
```typescript
import { db } from '../db';

interface AuditLog {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export async function logAdminAction(log: AuditLog) {
  try {
    // Save to database
    await db.insert(auditLogs).values(log);
    
    // Also log to file for backup
    const logLine = `[${log.timestamp.toISOString()}] ${log.userEmail} - ${log.action} ${log.resource} ${log.resourceId || ''}`;
    console.log(`AUDIT: ${logLine}`);
    
    // Could also send to external service
    // await sendToLogService(log);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// Middleware to auto-log admin actions
export function auditMiddleware(action: string, resource: string) {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode < 400) {
        logAdminAction({
          userId: req.session?.userId || 'unknown',
          userEmail: req.session?.userEmail || 'unknown',
          action,
          resource,
          resourceId: req.params.id,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date(),
          details: req.method === 'POST' || req.method === 'PUT' 
            ? { body: req.body } 
            : undefined
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}
```

#### 4.4 Update Admin Routes (1 hour)
```typescript
// Update admin routes to use new RBAC
router.get('/admin/users', 
  requireAuth,
  requirePermission(Permission.VIEW_USERS),
  auditMiddleware('VIEW', 'USERS'),
  async (req, res) => {
    // Existing logic
  }
);

router.put('/admin/users/:id',
  requireAuth,
  requirePermission(Permission.EDIT_USERS),
  auditMiddleware('EDIT', 'USER'),
  async (req, res) => {
    // Existing logic
  }
);
```

---

## 🔴 Task 5: Investigate DNS Resolution Failures

### Sub-tasks:

#### 5.1 DNS Diagnostics (2 hours)

Create `scripts/dns-diagnostic.sh`:
```bash
#!/bin/bash

echo "P57 DNS Diagnostic Report"
echo "========================"
echo "Date: $(date)"
echo ""

# Domains to check
DOMAINS=(
  "p57.uz"
  "p57.birfoiz.uz"
  "protokol.1foiz.com"
  "srv852801.hstgr.cloud"
)

# DNS servers to check
DNS_SERVERS=(
  "8.8.8.8"        # Google
  "1.1.1.1"        # Cloudflare
  "208.67.222.222" # OpenDNS
)

for domain in "${DOMAINS[@]}"; do
  echo "Checking $domain"
  echo "----------------"
  
  # A records
  echo "A Records:"
  dig +short $domain A
  
  # Check from different DNS servers
  echo "DNS Server responses:"
  for dns in "${DNS_SERVERS[@]}"; do
    echo -n "  $dns: "
    dig +short @$dns $domain A
  done
  
  # Check propagation
  echo "Propagation check:"
  curl -s "https://dns-api.org/A/$domain" | jq '.[] | "\(.name): \(.value)"'
  
  echo ""
done

# Check DNSSEC
echo "DNSSEC Status:"
for domain in "${DOMAINS[@]}"; do
  echo -n "$domain: "
  dig +dnssec $domain | grep -q "ad;" && echo "Enabled" || echo "Disabled"
done

# Traceroute to identify routing issues
echo ""
echo "Traceroute to main domain:"
traceroute -m 15 p57.birfoiz.uz
```

#### 5.2 Create User Debug Script (1 hour)
Create a script users can run to diagnose their issues:
```html
<!-- Create debug.html for users -->
<!DOCTYPE html>
<html>
<head>
  <title>P57 Connection Debugger</title>
</head>
<body>
  <h1>P57 Connection Debugger</h1>
  <div id="results"></div>
  
  <script>
    const results = document.getElementById('results');
    const domains = [
      'https://p57.uz',
      'https://p57.birfoiz.uz', 
      'https://protokol.1foiz.com',
      'https://srv852801.hstgr.cloud'
    ];
    
    async function checkDomain(url) {
      const start = Date.now();
      try {
        const response = await fetch(url, { mode: 'no-cors' });
        const time = Date.now() - start;
        return { url, status: 'OK', time };
      } catch (error) {
        return { url, status: 'FAILED', error: error.message };
      }
    }
    
    async function runTests() {
      results.innerHTML = '<h2>Testing connections...</h2>';
      
      // Check each domain
      for (const domain of domains) {
        const result = await checkDomain(domain);
        results.innerHTML += `
          <p>
            ${result.url}: 
            <strong>${result.status}</strong>
            ${result.time ? `(${result.time}ms)` : ''}
            ${result.error ? `- ${result.error}` : ''}
          </p>
        `;
      }
      
      // DNS resolution test
      results.innerHTML += '<h2>DNS Information:</h2>';
      results.innerHTML += `
        <p>Your DNS Server: ${await getDNSServer()}</p>
        <p>Your IP: ${await getClientIP()}</p>
        <p>Your Location: ${await getLocation()}</p>
      `;
    }
    
    async function getDNSServer() {
      try {
        const response = await fetch('https://dns.google/resolve?name=p57.uz');
        const data = await response.json();
        return data.Status === 0 ? 'Google DNS reachable' : 'DNS issues detected';
      } catch {
        return 'Unable to check DNS';
      }
    }
    
    async function getClientIP() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch {
        return 'Unknown';
      }
    }
    
    async function getLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city}, ${data.country_name}`;
      } catch {
        return 'Unknown';
      }
    }
    
    runTests();
  </script>
</body>
</html>
```

#### 5.3 Set Up DNS Monitoring (1 hour)
```bash
# Add to monitoring script
#!/bin/bash
# scripts/monitor-dns.sh

# Check DNS resolution from multiple locations
DOMAINS="p57.uz p57.birfoiz.uz"
LOCATIONS=(
  "1.1.1.1"      # Cloudflare
  "8.8.8.8"      # Google
  "77.88.8.8"    # Yandex (Russia)
  "80.80.80.80"  # Freenom (Netherlands)
)

for domain in $DOMAINS; do
  for dns in "${LOCATIONS[@]}"; do
    if ! dig +short @$dns $domain > /dev/null 2>&1; then
      echo "DNS ALERT: $domain failed to resolve via $dns"
      # Send alert via Telegram/email
    fi
  done
done
```

---

## 🔴 Task 6: Consolidate Domain Strategy

### Sub-tasks:

#### 6.1 Document Current Domain Usage (30 min)
Create `docs/DOMAIN_STRATEGY.md`:
```markdown
# P57 Domain Strategy

## Current Domains

| Domain | Purpose | Status | SSL | Notes |
|--------|---------|--------|-----|-------|
| p57.uz | Landing page | Active | ✓ | Primary marketing site |
| p57.birfoiz.uz | Main application | Active | ✓ | Primary app domain |
| protokol.1foiz.com | Legacy redirect | Active | ✓ | Redirect to p57.uz |
| srv852801.hstgr.cloud | Backup/Direct IP | Active | ✓ | Fallback option |

## Proposed Strategy

### Primary Domains
- **Landing**: p57.uz
- **Application**: app.p57.uz (new subdomain)

### Redirects
- p57.birfoiz.uz → app.p57.uz
- protokol.1foiz.com → p57.uz
- srv852801.hstgr.cloud → app.p57.uz

### Benefits
1. Consistent branding
2. Easier to remember
3. Better SEO
4. Simplified SSL management
```

#### 6.2 Implement Redirect Rules (1 hour)
Update NGINX configuration:
```nginx
# Redirect legacy domains
server {
    listen 443 ssl http2;
    server_name protokol.1foiz.com;
    
    ssl_certificate /etc/letsencrypt/live/protokol.1foiz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/protokol.1foiz.com/privkey.pem;
    
    return 301 https://p57.uz$request_uri;
}

# Redirect srv domain to main app
server {
    listen 443 ssl http2;
    server_name srv852801.hstgr.cloud;
    
    ssl_certificate /etc/letsencrypt/live/srv852801.hstgr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/srv852801.hstgr.cloud/privkey.pem;
    
    return 301 https://p57.birfoiz.uz$request_uri;
}
```

#### 6.3 Update DNS Records (1 hour)
```bash
# DNS records to add/update
# p57.uz
A     @       69.62.126.73
A     app     69.62.126.73
A     www     69.62.126.73

# p57.birfoiz.uz  
A     @       69.62.126.73
CNAME www     @

# Add CAA records for security
CAA   @       0 issue "letsencrypt.org"
```

#### 6.4 Update Application Configuration (30 min)
Create domain configuration:
```typescript
// shared/config/domains.ts
export const DOMAINS = {
  landing: process.env.LANDING_DOMAIN || 'https://p57.uz',
  app: process.env.APP_DOMAIN || 'https://p57.birfoiz.uz',
  api: process.env.API_DOMAIN || 'https://p57.birfoiz.uz',
  cdn: process.env.CDN_DOMAIN || 'https://cdn.p57.uz'
};

// Use throughout application
import { DOMAINS } from '@/shared/config/domains';
const loginUrl = `${DOMAINS.app}/login`;
```

---

## 🔴 Task 7: Remove Hardcoded Domains from Codebase

### Sub-tasks:

#### 7.1 Update client/src/utils/domain-validation.ts (30 min)
```typescript
// Before: Hardcoded domains
const ALLOWED_DOMAINS = ['p57.uz', 'p57.birfoiz.uz', ...];

// After: Environment-based
const ALLOWED_DOMAINS = (process.env.VITE_ALLOWED_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

// Add to .env.production
VITE_ALLOWED_DOMAINS=p57.uz,p57.birfoiz.uz,srv852801.hstgr.cloud
```

#### 7.2 Update client/src/pages/terms-of-service.tsx (30 min)
```typescript
// Before: Hardcoded email
<p>Contact: info@p57.uz</p>

// After: Environment-based
<p>Contact: {import.meta.env.VITE_CONTACT_EMAIL}</p>

// Add to .env.production
VITE_CONTACT_EMAIL=info@p57.uz
```

#### 7.3 Update client/src/pages/atmos-payment.tsx (30 min)
```typescript
// Before: Domain-specific logic
if (window.location.hostname === 'p57.birfoiz.uz') { ... }

// After: Environment-based
if (window.location.hostname === import.meta.env.VITE_APP_HOSTNAME) { ... }

// Add to .env.production
VITE_APP_HOSTNAME=p57.birfoiz.uz
```

#### 7.4 Update server/middleware/security.ts (45 min)
```typescript
// Before: Hardcoded CORS origins
const allowedOrigins = [
  'https://p57.uz',
  'https://p57.birfoiz.uz',
  // ...
];

// After: Environment-based
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Add to .env.production
CORS_ALLOWED_ORIGINS=https://p57.uz,https://p57.birfoiz.uz,https://srv852801.hstgr.cloud
```

#### 7.5 Create Migration Script (45 min)
```bash
#!/bin/bash
# scripts/migrate-domains.sh

echo "Migrating hardcoded domains to environment variables..."

# Files to update
FILES=(
  "client/src/utils/domain-validation.ts"
  "client/src/pages/terms-of-service.tsx"
  "client/src/pages/atmos-payment.tsx"
  "server/middleware/security.ts"
)

# Backup files
for file in "${FILES[@]}"; do
  cp "$file" "$file.backup"
done

# Run replacements
echo "Updating files..."
# Add sed commands for each replacement

echo "Migration complete!"
echo "Next steps:"
echo "1. Review changes with git diff"
echo "2. Update .env files with new variables"
echo "3. Test locally"
echo "4. Deploy to production"
```

#### 7.6 Testing Plan (30 min)
```bash
# Test all domain configurations
#!/bin/bash
# scripts/test-domains.sh

echo "Testing domain configuration..."

# Start local server with test env
export VITE_ALLOWED_DOMAINS="localhost,127.0.0.1"
export CORS_ALLOWED_ORIGINS="http://localhost:5173"

npm run dev &
SERVER_PID=$!

sleep 5

# Run tests
echo "Testing CORS..."
curl -H "Origin: http://localhost:5173" \
     -I http://localhost:5000/api/health

echo "Testing domain validation..."
# Add more tests

kill $SERVER_PID
```

---

## Testing & Verification

### After Each Task:
1. Run local tests
2. Deploy to staging (if available)
3. Test specific functionality
4. Document any issues
5. Update task status

### Final Phase 1 Verification:
```bash
# Run comprehensive test suite
./scripts/run-phase1-tests.sh

# Checklist:
- [ ] No hardcoded credentials in code
- [ ] All environment variables validated on startup
- [ ] Credential rotation process documented
- [ ] Admin actions are logged
- [ ] DNS issues identified and documented
- [ ] Domain strategy implemented
- [ ] No hardcoded domains in code
```

---

## Rollback Procedures

### For Each Task:
1. Keep backups of all modified files
2. Document original configuration
3. Test rollback procedure
4. Have quick rollback script ready

### Emergency Rollback:
```bash
#!/bin/bash
# scripts/phase1-rollback.sh

echo "Rolling back Phase 1 changes..."

# Restore from backups
git checkout HEAD -- server/routes.ts
git checkout HEAD -- server/middleware/security.ts
# ... other files

# Restore previous Docker image
docker tag protokol57:previous protokol57:latest

# Deploy
./deploy-production.sh

echo "Rollback complete!"
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Zero hardcoded credentials in codebase
- ✅ Environment validation prevents bad deployments
- ✅ DNS issues documented with user workarounds
- ✅ Domain strategy implemented and tested
- ✅ All admin actions are logged
- ✅ Credential rotation process is documented and tested
- ✅ No customer-facing downtime during implementation

---

## Time Tracking

| Task | Estimated | Actual | Notes |
|------|-----------|---------|-------|
| Remove hardcoded credentials | 2h | ___ | |
| Credential rotation process | 4h | ___ | |
| Environment validation | 3h | ___ | |
| Admin access control | 6h | ___ | |
| DNS investigation | 4h | ___ | |
| Domain consolidation | 3h | ___ | |
| Remove hardcoded domains | 4h | ___ | |
| Testing & documentation | 4h | ___ | |
| **Total** | **30h** | **___** | |