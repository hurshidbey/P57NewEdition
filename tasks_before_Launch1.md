# Pre-Launch Tasks for P57 Platform

## Overview
This document outlines all tasks that must be completed before launching the P57 platform to production. Each task includes detailed steps and explanations to help you understand not just what to do, but why it's important.

## Priority Levels
- 🔴 **Critical**: Must be done before launch (security/stability issues)
- 🟡 **Important**: Should be done before launch (performance/reliability)
- 🟢 **Nice-to-have**: Can be done after launch if needed

---

## 🔴 Critical Security Issues

### 1. Fix Rate Limiting Configuration
**Why**: Current rate limit (1000 requests/15min) is too high and could allow abuse or DDoS attacks.

**Tasks**:
- [ ] Open `server/middleware/rateLimiter.ts`
- [ ] Change the rate limit configuration:
  ```typescript
  // Current (TOO HIGH):
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // 1000 requests per window

  // Change to:
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window per IP
  ```
- [ ] Add different limits for different endpoints:
  ```typescript
  // Create separate limiters:
  export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5 // Only 5 login attempts per 15 minutes
  });

  export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100 // General API limit
  });

  export const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10 // 10 payment requests per minute
  });
  ```
- [ ] Apply specific limiters to routes in `server/index.ts`
- [ ] Test rate limiting works by making multiple requests

### 2. Remove Sensitive Data from Logs
**Why**: Currently logging full request bodies which may contain passwords, payment info, etc.

**Tasks**:
- [ ] Search for all `console.log` statements in the codebase:
  ```bash
  grep -r "console.log" server/ client/src/
  ```
- [ ] Remove or replace with proper logging:
  ```typescript
  // Bad (current):
  console.log('Click request:', req.body);
  
  // Good (replace with):
  logger.info('Click payment callback received', {
    transactionId: req.body.transaction_id,
    // Don't log sensitive fields like card numbers
  });
  ```
- [ ] Create a logging utility in `server/utils/logger.ts`:
  ```typescript
  import winston from 'winston';
  
  export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });
  ```
- [ ] Replace all console.log with logger calls
- [ ] Add request ID tracking for debugging

### 3. Implement Proper Session Security
**Why**: Session configuration needs strengthening for production.

**Tasks**:
- [ ] Update session configuration in `server/index.ts`:
  ```typescript
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // No JS access
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'strict' // CSRF protection
    },
    name: 'p57_session', // Don't use default name
  }));
  ```
- [ ] Add session secret rotation mechanism
- [ ] Document session secret requirements in .env.example

### 4. Secure Payment Callbacks
**Why**: Payment providers need to verify callbacks are authentic.

**Tasks**:
- [ ] Add signature verification for Click.uz callbacks:
  ```typescript
  // In click-routes-v2.ts
  function verifyClickSignature(data: any, signature: string): boolean {
    const secretKey = process.env.CLICK_SECRET_KEY;
    const calculatedHash = crypto
      .createHash('md5')
      .update(`${data.click_trans_id}${data.service_id}${secretKey}`)
      .digest('hex');
    return calculatedHash === signature;
  }
  ```
- [ ] Add IP whitelist for payment providers
- [ ] Log all payment attempts (success and failure)
- [ ] Add webhook retry handling

---

## 🔴 Testing & Quality Assurance

### 5. Add Basic Integration Tests
**Why**: Zero test coverage means we can't verify the app works before deploying.

**Tasks**:
- [ ] Create test structure:
  ```bash
  mkdir -p server/__tests__/api
  mkdir -p server/__tests__/routes
  mkdir -p client/src/__tests__/components
  ```
- [ ] Install testing dependencies:
  ```bash
  npm install --save-dev jest @types/jest supertest @testing-library/react
  ```
- [ ] Create basic API tests in `server/__tests__/api/health.test.ts`:
  ```typescript
  import request from 'supertest';
  import app from '../../index';
  
  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
  ```
- [ ] Add critical path tests:
  - [ ] User can view protocols list
  - [ ] User can view single protocol
  - [ ] Payment flow initiates correctly
  - [ ] Health check passes
- [ ] Add test script to package.json:
  ```json
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
  ```
- [ ] Run tests before each deployment

### 6. Add Pre-deployment Validation
**Why**: Catch issues before they reach production.

**Tasks**:
- [ ] Create `scripts/pre-deploy-check.js`:
  ```javascript
  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SESSION_SECRET',
    'ATMOS_STORE_ID'
  ];
  
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }
  
  // Check database connection
  // Check external services
  // Run tests
  ```
- [ ] Add to deployment script
- [ ] Document all checks

---

## 🟡 Performance Optimizations

### 7. Remove Unused Dependencies
**Why**: 142 Radix UI packages but probably using only 10-20.

**Tasks**:
- [ ] Analyze actual component usage:
  ```bash
  # Find which Radix components are actually imported
  grep -r "@radix-ui" client/src/ | grep "from" | sort | uniq
  ```
- [ ] Remove unused packages:
  ```bash
  npm uninstall @radix-ui/react-[unused-component]
  ```
- [ ] Check bundle size before/after:
  ```bash
  npm run build
  ls -lh dist/assets/*.js
  ```
- [ ] Document which components are actually needed

### 8. Optimize Build Process
**Why**: Build could be faster and smaller.

**Tasks**:
- [ ] Update `vite.config.ts` for better chunking:
  ```typescript
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', /* only used ones */],
          'utils': ['date-fns', 'clsx']
        }
      }
    }
  }
  ```
- [ ] Enable compression:
  ```bash
  npm install --save-dev vite-plugin-compression
  ```
- [ ] Add to vite config:
  ```typescript
  import compression from 'vite-plugin-compression';
  plugins: [
    compression({
      algorithm: 'gzip',
      threshold: 10240 // 10KB
    })
  ]
  ```
- [ ] Measure build time improvements

### 9. Implement Caching Strategy
**Why**: No caching means unnecessary database hits.

**Tasks**:
- [ ] Add in-memory cache for protocols:
  ```typescript
  // server/utils/cache.ts
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  export function getCached(key: string) {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
      return item.data;
    }
    return null;
  }
  
  export function setCached(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
  }
  ```
- [ ] Apply to protocol routes
- [ ] Add cache headers for static assets
- [ ] Monitor cache hit rates

---

## 🟡 Deployment & DevOps

### 10. Add Staging Environment
**Why**: Test changes before production deployment.

**Tasks**:
- [ ] Create staging subdomain: `staging.app.p57.uz`
- [ ] Duplicate production setup with staging database
- [ ] Create `.env.staging` file
- [ ] Update deployment script to support staging:
  ```bash
  ./deploy.sh --staging
  ```
- [ ] Test deployment to staging first
- [ ] Document staging vs production differences

### 11. Implement Zero-Downtime Deployment
**Why**: Current deployment has 10-30 second downtime.

**Tasks**:
- [ ] Implement blue-green deployment:
  ```yaml
  # docker-compose.prod.yml
  services:
    app-blue:
      image: protokol57:blue
      ports:
        - "5001:5000"
    
    app-green:
      image: protokol57:green
      ports:
        - "5002:5000"
  ```
- [ ] Update NGINX to switch between blue/green
- [ ] Create deployment script that:
  1. Builds new version
  2. Starts on alternate port
  3. Runs health checks
  4. Switches NGINX
  5. Stops old version
- [ ] Test with fake deployments

### 12. Add Automated Backups
**Why**: No backup strategy for database or files.

**Tasks**:
- [ ] Create backup script:
  ```bash
  #!/bin/bash
  # backup.sh
  BACKUP_DIR="/backups/$(date +%Y%m%d)"
  mkdir -p $BACKUP_DIR
  
  # Backup database
  pg_dump $DATABASE_URL > $BACKUP_DIR/database.sql
  
  # Backup uploads if any
  tar -czf $BACKUP_DIR/uploads.tar.gz /app/uploads
  
  # Keep only last 7 days
  find /backups -mtime +7 -delete
  ```
- [ ] Add to cron:
  ```bash
  0 2 * * * /root/backup.sh
  ```
- [ ] Test restore process
- [ ] Document recovery procedures

---

## 🟡 Monitoring & Observability

### 13. Add Error Tracking
**Why**: Currently no visibility into production errors.

**Tasks**:
- [ ] Sign up for Sentry (free tier)
- [ ] Install Sentry:
  ```bash
  npm install @sentry/node @sentry/react
  ```
- [ ] Configure in server:
  ```typescript
  import * as Sentry from '@sentry/node';
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
  });
  
  app.use(Sentry.Handlers.requestHandler());
  // ... routes ...
  app.use(Sentry.Handlers.errorHandler());
  ```
- [ ] Add to React app similarly
- [ ] Test error reporting works
- [ ] Set up alerts for critical errors

### 14. Add Performance Monitoring
**Why**: No visibility into slow queries or endpoints.

**Tasks**:
- [ ] Add request timing middleware:
  ```typescript
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration
      });
    });
    next();
  });
  ```
- [ ] Add database query logging
- [ ] Set up alerts for slow requests (>3s)
- [ ] Create performance dashboard

### 15. Implement Health Checks
**Why**: Basic health check doesn't verify all services.

**Tasks**:
- [ ] Enhance `/health` endpoint:
  ```typescript
  app.get('/health', async (req, res) => {
    const checks = {
      server: 'ok',
      database: 'checking',
      redis: 'checking',
      supabase: 'checking'
    };
    
    // Check database
    try {
      await db.select().from(protocols).limit(1);
      checks.database = 'ok';
    } catch (e) {
      checks.database = 'error';
    }
    
    // Check Supabase
    try {
      const { data } = await supabase.from('protocols').select('id').limit(1);
      checks.supabase = 'ok';
    } catch (e) {
      checks.supabase = 'error';
    }
    
    const allOk = Object.values(checks).every(v => v === 'ok');
    res.status(allOk ? 200 : 503).json(checks);
  });
  ```
- [ ] Add to monitoring script
- [ ] Set up external monitoring (UptimeRobot)

---

## 🟢 Nice-to-Have Improvements

### 16. Add API Documentation
**Tasks**:
- [ ] Install Swagger:
  ```bash
  npm install swagger-ui-express @types/swagger-ui-express
  ```
- [ ] Document all endpoints
- [ ] Add to `/api-docs` route

### 17. Implement Request ID Tracking
**Tasks**:
- [ ] Add request ID middleware
- [ ] Include in all log entries
- [ ] Return in response headers

### 18. Add Development Seeds
**Tasks**:
- [ ] Create seed data script
- [ ] Add fake users and transactions
- [ ] Make development testing easier

---

## Launch Checklist

Before launching, ensure all 🔴 Critical tasks are complete:

- [ ] Rate limiting properly configured
- [ ] No sensitive data in logs  
- [ ] Session security hardened
- [ ] Payment callbacks secured
- [ ] Basic tests passing
- [ ] Pre-deployment checks in place

Then verify:
- [ ] Staging environment tested
- [ ] Backups configured
- [ ] Error tracking active
- [ ] Health monitoring working
- [ ] Performance acceptable

## Post-Launch Tasks

1. Monitor error rates closely for first 48 hours
2. Check performance metrics
3. Review security logs
4. Gather user feedback
5. Plan next improvements

---

## Questions?

If you're unsure about any task:
1. Check the existing code for patterns
2. Ask for clarification before proceeding
3. Test thoroughly in development
4. Document your changes

Remember: It's better to ask questions than to break production!