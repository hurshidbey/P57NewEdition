# Credential Rotation Policy and Schedule

Last Updated: 2025-01-20

## Overview

This document defines the credential rotation policy for P57 (Protokol57) to maintain security best practices and compliance requirements.

## Rotation Policy

### Rotation Frequency

| Credential Type | Rotation Interval | Risk Level | Automation |
|----------------|-------------------|------------|------------|
| API Keys (External) | 90 days | High | Semi-automated |
| Session Secrets | 180 days | Medium | Automated |
| Database Passwords | 365 days | High | Manual |
| Admin Passwords | 90 days | Critical | Manual |
| Service Tokens | 180 days | Medium | Semi-automated |

### Risk-Based Rotation

Immediate rotation required if:
- Credential exposure suspected
- Employee with access leaves
- Security breach detected
- Failed security audit
- Unusual API activity detected

## Rotation Schedule

### Current Status (as of 2025-01-20)

| Credential | Type | Last Rotated | Next Rotation | Owner | Status |
|------------|------|--------------|---------------|-------|--------|
| OPENAI_API_KEY | API Key | 2025-01-20 | 2025-04-20 | DevOps | ✅ Active |
| SUPABASE_SERVICE_ROLE_KEY | Service Key | 2025-01-20 | 2025-04-20 | DevOps | ✅ Active |
| SUPABASE_ANON_KEY | Public Key | 2025-01-20 | 2025-07-20 | DevOps | ✅ Active |
| SESSION_SECRET | Secret | 2025-01-20 | 2025-07-20 | DevOps | ✅ Active |
| ATMOS_CONSUMER_KEY | API Key | 2025-01-20 | 2025-04-20 | Finance | ✅ Active |
| ATMOS_CONSUMER_SECRET | API Secret | 2025-01-20 | 2025-04-20 | Finance | ✅ Active |
| TELEGRAM_BOT_TOKEN | Bot Token | 2025-01-20 | 2025-07-20 | DevOps | ✅ Active |
| FALLBACK_ADMIN_PASSWORD | Password | 2025-01-20 | 2025-04-20 | Security | ✅ Active |

## Rotation Procedures

### Pre-Rotation Checklist

- [ ] Notify team of planned rotation
- [ ] Schedule maintenance window (if needed)
- [ ] Backup current credentials
- [ ] Prepare new credentials
- [ ] Test new credentials in staging
- [ ] Update documentation

### Standard Rotation Process

1. **Backup Current Environment**
   ```bash
   ./scripts/rotate-credentials.sh --status
   # Creates automatic backup
   ```

2. **Rotate Specific Credential**
   ```bash
   ./scripts/rotate-credentials.sh --key OPENAI_API_KEY
   ```

3. **Rotate All Due Credentials**
   ```bash
   ./scripts/rotate-credentials.sh --all
   ```

4. **Verify New Credentials**
   ```bash
   ./scripts/verify-credentials.sh
   ```

5. **Deploy to Production**
   ```bash
   ./deploy-production.sh
   ```

6. **Post-Rotation Verification**
   ```bash
   # Check application health
   curl https://p57.birfoiz.uz/health
   
   # Test specific integrations
   ./scripts/test-integrations.sh
   ```

### Emergency Rotation

For immediate rotation due to security concerns:

```bash
# 1. Immediately rotate compromised credential
./scripts/rotate-credentials.sh --key COMPROMISED_KEY

# 2. Deploy immediately
./deploy-production.sh --emergency

# 3. Audit access logs
./scripts/audit-access.sh --key COMPROMISED_KEY --days 30

# 4. Notify security team
```

## Credential Sources

### API Keys

| Service | How to Rotate | Documentation |
|---------|--------------|---------------|
| OpenAI | Platform dashboard | https://platform.openai.com/api-keys |
| Supabase | Project settings | https://app.supabase.com/project/_/settings/api |
| ATMOS | Merchant portal | Contact support |
| Telegram | @BotFather | https://core.telegram.org/bots#6-botfather |
| Mailtrap | Account settings | https://mailtrap.io/api-tokens |

### Generated Secrets

```bash
# Generate secure session secret
./scripts/rotate-credentials.sh --generate-secret

# Generate bcrypt password hash
node scripts/generate-password-hash.js
```

## Automation

### Rotation Reminder Script

Automated reminder system runs via cron:
```bash
# Add to crontab
0 9 * * MON /opt/protokol57/scripts/check-rotation-schedule.sh
```

### Monitoring Integration

Rotation events are logged to:
- Local logs: `/opt/protokol57/logs/credential-rotation.log`
- System metrics: Rotation count, failure rate
- Alerts: Email/Telegram for overdue rotations

## Compliance and Audit

### Audit Trail

All rotations are logged with:
- Timestamp
- User performing rotation
- Credential rotated
- Success/failure status
- Rollback information

### Compliance Requirements

- PCI DSS: 90-day rotation for payment-related credentials
- SOC 2: Documented rotation procedures and audit trail
- GDPR: Encryption keys rotated annually

### Quarterly Review

Every quarter:
1. Review rotation schedule
2. Audit access logs
3. Update rotation intervals based on risk
4. Test emergency procedures
5. Update this documentation

## Best Practices

### DO:
- ✅ Use strong, randomly generated credentials
- ✅ Test new credentials before production deployment
- ✅ Keep multiple backups of previous credentials
- ✅ Document all rotations in team chat
- ✅ Use different credentials for each environment
- ✅ Enable MFA on all service accounts

### DON'T:
- ❌ Share credentials via insecure channels
- ❌ Reuse old credentials
- ❌ Rotate during peak traffic hours
- ❌ Skip testing after rotation
- ❌ Store credentials in code or version control
- ❌ Use predictable patterns in credentials

## Rollback Procedures

If issues occur after rotation:

1. **Immediate Rollback**
   ```bash
   # List available backups
   ./scripts/rotate-credentials.sh --rollback
   
   # Restore specific backup
   ./scripts/rotate-credentials.sh --rollback /path/to/backup
   ```

2. **Deploy Previous Version**
   ```bash
   ./deploy-production.sh --rollback
   ```

3. **Verify Services**
   ```bash
   ./scripts/verify-credentials.sh
   ```

## Team Responsibilities

| Role | Responsibilities |
|------|-----------------|
| DevOps Lead | Maintain rotation schedule, perform rotations |
| Security Officer | Audit rotation compliance, emergency response |
| Development Team | Update code for new credential formats |
| Finance Team | Manage payment gateway credentials |

## Contact Information

### Escalation Path
1. DevOps On-Call: +1-XXX-XXX-XXXX
2. Security Team: security@p57.uz
3. CTO: cto@p57.uz

### Service Contacts
- OpenAI Support: support@openai.com
- Supabase Support: support@supabase.com
- ATMOS Support: +998-XX-XXX-XXXX

## Related Documents

- [Security Policy](./SECURITY_POLICY.md)
- [Incident Response Plan](./INCIDENT_RESPONSE.md)
- [Access Control Policy](./ACCESS_CONTROL.md)
- [Deployment Guide](./DEVOPS-DEPLOYMENT-GUIDE.md)

---

**Note**: This is a living document. Update after each rotation and review quarterly.