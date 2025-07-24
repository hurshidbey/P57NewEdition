# Production Deployment Checklist - OAuth & Payment Fix

## Pre-Deployment Checks

- [ ] **Backup Production Database**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Test Migrations Locally**
  ```bash
  docker-compose up -d db
  psql $LOCAL_DATABASE_URL < server/migrations/002_payment_transactions.sql
  psql $LOCAL_DATABASE_URL < server/migrations/003_monitoring_events.sql
  psql $LOCAL_DATABASE_URL < server/migrations/004_diagnostic_functions.sql
  ```

- [ ] **Run Type Checks**
  ```bash
  npm run check
  ```

- [ ] **Test Payment Flow Locally**
  - Create new Google OAuth account
  - Complete payment
  - Verify tier upgrade

## Database Deployment (Zero Downtime)

1. [ ] **Apply User Metadata Trigger**
   ```bash
   psql $DATABASE_URL < server/migrations/001_user_metadata_trigger.sql
   ```
   - Verify: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`

2. [ ] **Create Payment Transactions Table**
   ```bash
   psql $DATABASE_URL < server/migrations/002_payment_transactions.sql
   ```
   - Verify: `\d payment_transactions`

3. [ ] **Create Monitoring Tables**
   ```bash
   psql $DATABASE_URL < server/migrations/003_monitoring_events.sql
   ```
   - Verify: `\d monitoring_events`

4. [ ] **Add Diagnostic Functions**
   ```bash
   psql $DATABASE_URL < server/migrations/004_diagnostic_functions.sql
   ```
   - Test: `SELECT * FROM get_users_with_missing_metadata() LIMIT 5;`

5. [ ] **Fix Existing OAuth Users**
   ```sql
   SELECT public.fix_existing_user_metadata();
   -- Should return number of users fixed
   ```

## Code Deployment

1. [ ] **Build and Test Docker Image**
   ```bash
   docker build -t protokol57:oauth-fix .
   docker run --rm protokol57:oauth-fix npm test
   ```

2. [ ] **Deploy to Production**
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && \
     git pull && \
     docker compose down && \
     docker compose build --no-cache && \
     docker compose up -d"
   ```

3. [ ] **Monitor Deployment**
   ```bash
   # Watch logs
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
     "docker logs -f protokol57-protokol57-1 | grep -E 'CLICK-V2|AUTH|ERROR'"
   ```

## Post-Deployment Verification

1. [ ] **Check System Health**
   ```bash
   curl https://app.p57.uz/api/diagnostics/health | jq .
   ```
   - All checks should be "pass" or "warning"

2. [ ] **Verify OAuth Users**
   ```bash
   curl https://app.p57.uz/api/diagnostics/monitoring-stats | jq .
   ```
   - Check `oauth_logins_without_metadata` should be decreasing

3. [ ] **Test New OAuth Flow**
   - Create new test Google account
   - Login at https://app.p57.uz/auth
   - Check console for metadata initialization
   - Verify user can access all features

4. [ ] **Test Payment Flow**
   - Use test OAuth account
   - Complete payment via Click.uz
   - Verify in database:
     ```sql
     SELECT * FROM payment_transactions 
     WHERE user_email = 'test@gmail.com' 
     ORDER BY created_at DESC LIMIT 1;
     ```

5. [ ] **Monitor Error Rates**
   ```bash
   # Check for critical errors
   curl -X GET https://app.p57.uz/api/diagnostics/monitoring-stats?hours=1 | \
     jq '.stats.critical_errors'
   ```

## Recovery Procedures (If Needed)

1. [ ] **Fix Stuck OAuth Users**
   ```bash
   curl -X POST https://app.p57.uz/api/diagnostics/recover-oauth-users \
     -H "Authorization: Bearer admin-recovery-token"
   ```

2. [ ] **Cancel Stuck Transactions**
   ```bash
   curl -X POST https://app.p57.uz/api/diagnostics/recover-stuck-transactions \
     -H "Authorization: Bearer admin-recovery-token"
   ```

## Monitoring Dashboard

After deployment, monitor these metrics:

```bash
# Real-time monitoring script
while true; do
  clear
  echo "=== PROTOKOL57 MONITORING ==="
  echo "Time: $(date)"
  echo ""
  
  # Health check
  echo "System Health:"
  curl -s https://app.p57.uz/api/diagnostics/health | jq -r '.status'
  
  # Stats
  echo -e "\nLast Hour Stats:"
  curl -s https://app.p57.uz/api/diagnostics/monitoring-stats?hours=1 | \
    jq -r '.stats | to_entries[] | "\(.key): \(.value)"'
  
  sleep 60
done
```

## Rollback Plan

If critical issues arise:

1. [ ] **Quick Rollback**
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
     "cd /opt/protokol57 && git checkout HEAD~1 && \
      docker compose down && \
      docker compose build --no-cache && \
      docker compose up -d"
   ```

2. [ ] **Keep Database Changes**
   - New tables don't affect old code
   - Triggers continue to work

3. [ ] **Monitor After Rollback**
   - Check error logs
   - Document issues for fix

## Success Criteria

- [ ] Zero OAuth users without metadata
- [ ] All new payments properly tracked
- [ ] No stuck transactions > 2 hours old
- [ ] Error rate < 0.1%
- [ ] Payment success rate > 95%

## Sign-Off

- [ ] Dev Team Lead: _________________
- [ ] QA Lead: _________________
- [ ] DevOps: _________________
- [ ] Product Owner: _________________

---

**Emergency Contacts:**
- DevOps: +998 XX XXX XX XX
- Backend Lead: +998 XX XXX XX XX
- On-call Engineer: +998 XX XXX XX XX