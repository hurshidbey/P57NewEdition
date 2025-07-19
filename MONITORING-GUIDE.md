# 🏃 Protokol57 Live Monitoring Guide

## Critical Metrics to Watch

### 🔴 IMMEDIATE ACTION NEEDED IF:
- CPU > 80% for more than 5 minutes
- Memory > 900MB (near 1GB limit)
- Error rate > 10 per minute
- API response time > 5 seconds
- Container status shows "unhealthy"

### 🟡 WARNING SIGNS:
- New user registrations = 0 for 30+ minutes
- Payment attempts with 0 success rate
- Rate limiting hitting frequently (>50/hour)
- Disk usage > 85%

### 🟢 HEALTHY METRICS:
- CPU < 50%
- Memory < 700MB
- API response < 1 second
- Error rate < 5 per hour
- Steady user registrations

## Monitoring Commands

### Real-time monitoring (updates every 30s):
```bash
./monitor-live.sh
```

### Quick stats check:
```bash
./quick-stats.sh
```

### Check specific errors:
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --since 30m 2>&1 | grep -i error"
```

### Watch payment flow:
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker logs protokol57-protokol57-1 --tail 100 -f 2>&1 | grep -E '(payment|atmos)'"
```

### Emergency restart:
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose -f docker-compose.prod.yml restart"
```

## First 24 Hours Checklist

Hour 1-2:
- [ ] Monitor every 15 minutes
- [ ] Check for JavaScript errors
- [ ] Verify payments working
- [ ] Watch memory usage

Hour 3-6:
- [ ] Check every 30 minutes
- [ ] Review error patterns
- [ ] Monitor user flow
- [ ] Check database performance

Hour 6-24:
- [ ] Check hourly
- [ ] Review daily stats
- [ ] Plan optimizations
- [ ] Gather user feedback

## Alert Responses

### High CPU/Memory:
1. Check for infinite loops in logs
2. Restart container if needed
3. Scale up server if sustained

### Payment Failures:
1. Check Atmos API status
2. Review payment logs
3. Contact Atmos support if needed

### Database Errors:
1. Check Supabase dashboard
2. Verify connection string
3. Check rate limits

### 500 Errors:
1. Check recent deployments
2. Review error stack traces
3. Rollback if critical