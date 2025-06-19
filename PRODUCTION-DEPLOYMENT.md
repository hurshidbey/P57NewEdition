# 🚀 Protokol57 Production Deployment Guide

This guide provides comprehensive instructions for deploying and maintaining the Protokol57 application in production with enterprise-grade reliability and monitoring.

## 🎯 Quick Start

### Initial Setup
```bash
# 1. Setup VPS infrastructure
./setup-vps.sh setup

# 2. Deploy application
./deploy-production.sh deploy

# 3. Verify deployment
./monitor.sh check
```

## 📋 Prerequisites

### Required Tools
- SSH access to VPS (69.62.126.73)
- SSH key: `~/.ssh/protokol57_ed25519`
- `curl`, `jq`, `bc` (for monitoring)
- Docker and Docker Compose on VPS

### Environment Variables
Ensure these are set in `.env.production`:
```bash
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
SESSION_SECRET=protokol57-production-secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NODE_ENV=production
```

## 🏗️ Infrastructure Architecture

### Application Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: Supabase PostgreSQL (with fallback to in-memory)
- **Proxy**: Nginx with SSL/HTTPS
- **Container**: Docker with resource limits
- **Domains**: p57.birfoiz.uz (primary), srv852801.hstgr.cloud (backup)

### Security Features
- SSL/TLS encryption with Let's Encrypt
- Rate limiting (10 req/s for API, 30 req/s general)
- Security headers (HSTS, XSS protection, CSP)
- Fail2ban for intrusion prevention
- Firewall with minimal open ports
- Automatic security updates

## 🛠️ Deployment Scripts

### 1. VPS Setup Script (`setup-vps.sh`)

Configures the entire VPS infrastructure:

```bash
# Complete setup
./setup-vps.sh setup

# Individual components
./setup-vps.sh ssl        # SSL certificates only
./setup-vps.sh firewall   # Firewall configuration
./setup-vps.sh monitoring # Monitoring setup
./setup-vps.sh security   # Security hardening
./setup-vps.sh status     # Check VPS status
```

**What it does:**
- Installs and configures Nginx with SSL
- Sets up Let's Encrypt certificates with auto-renewal
- Configures UFW firewall
- Implements fail2ban for security
- Sets up automated monitoring and log rotation
- Applies security hardening

### 2. Deployment Script (`deploy-production.sh`)

Handles zero-downtime application deployment:

```bash
# Deploy latest version
./deploy-production.sh deploy

# Check deployment status
./deploy-production.sh status

# Rollback to previous version
./deploy-production.sh rollback [backup_name]
```

**Features:**
- Zero-downtime deployment
- Automatic backup before deployment
- Health checks with automatic rollback
- Docker cache clearing for clean builds
- Automatic cleanup of old images/backups

### 3. Monitoring Script (`monitor.sh`)

Provides comprehensive health monitoring:

```bash
# One-time health check
./monitor.sh check

# Continuous monitoring (5-minute intervals)
./monitor.sh monitor

# View recent alerts
./monitor.sh alerts
```

**Monitors:**
- Application health (both domains)
- VPS resources (CPU, memory, disk)
- Docker container status
- Error logs and warnings
- Response times and performance

## 📊 Health Check Endpoint

Enhanced health check at `/api/health` provides:

```json
{
  "status": "ok",
  "timestamp": "2024-06-19T10:30:00.000Z",
  "environment": "production",
  "uptime": {
    "seconds": 86400,
    "formatted": "1d 0h 0m 0s"
  },
  "memory": {
    "used": 128,
    "total": 256,
    "percentage": 50
  },
  "database": {
    "connected": true,
    "supabase": true,
    "responseTime": 45
  },
  "performance": {
    "responseTime": 23,
    "platform": "linux",
    "nodeVersion": "v18.17.0"
  },
  "services": {
    "api": "ok",
    "storage": "supabase"
  }
}
```

## 🔧 Configuration Files

### Docker Configurations

#### Production (`docker-compose.prod.yml`)
- Resource limits (512MB memory, 1 CPU)
- Security optimizations
- Health checks every 30 seconds
- No volume mounts (prevents asset override)

#### Development (`docker-compose.dev.yml`)
- Volume mounts for hot reload
- Relaxed timeouts
- Development environment variables

### Nginx Configuration

Located at `/etc/nginx/sites-available/protokol57`:
- SSL/TLS with modern ciphers
- Rate limiting and security headers
- Gzip compression
- Static file caching
- Proxy configuration with timeouts

## 🚨 Monitoring & Alerting

### Automated Monitoring
- **VPS monitoring**: Every 5 minutes via cron
- **Docker health checks**: Every 30 seconds
- **Application monitoring**: Continuous via scripts

### Alert Thresholds
- **Memory usage**: >85%
- **CPU usage**: >80%
- **Disk usage**: >85%
- **Response time**: >5 seconds

### Log Files
- **Monitoring logs**: `/tmp/protokol57_monitor.log`
- **Alerts**: `/tmp/protokol57_alerts.log`
- **Nginx logs**: `/var/log/nginx/protokol57_*.log`
- **VPS monitoring**: `/var/log/protokol57_monitor.log`

## 🔐 Security Features

### SSL/HTTPS
- Let's Encrypt certificates for both domains
- Automatic renewal via cron job
- HSTS headers for enhanced security
- TLS 1.2+ only

### Security Headers
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Rate Limiting
- API endpoints: 10 requests/second (burst 20)
- General traffic: 30 requests/second (burst 50)
- Health checks: No rate limiting

### Fail2ban Protection
- SSH brute force protection
- Nginx rate limit violations
- Automatic IP banning

## 🗄️ Database Configuration

### Primary: Supabase
- Connection with retry logic (3 attempts, 5-second delays)
- Connection pooling (20 max connections)
- Automatic reconnection on failures

### Fallback: In-Memory Storage
- Activated when database connection fails
- Contains full protocol dataset (57 protocols)
- Maintains service availability during outages

## 📈 Performance Optimization

### Application
- Database connection pooling
- Circuit breaker pattern for external services
- Graceful error handling and recovery
- Memory usage monitoring

### Nginx
- Gzip compression for text content
- Static file caching (1 year)
- Optimized proxy buffers
- Connection reuse

### Docker
- Multi-stage builds for smaller images
- Resource limits prevent memory leaks
- Health checks ensure container stability

## 🔄 Deployment Workflow

### Standard Deployment
1. **Backup**: Create container snapshot
2. **Pull**: Latest code from repository
3. **Build**: Clean Docker build (no cache)
4. **Deploy**: Zero-downtime container restart
5. **Verify**: Health checks and monitoring
6. **Cleanup**: Remove old images/backups

### Rollback Process
1. **Automatic**: Triggered on failed health checks
2. **Manual**: Use backup images from previous deployments
3. **Verification**: Health checks after rollback
4. **Notification**: Alert on rollback completion

## 🚀 Production URLs

- **Primary**: https://p57.birfoiz.uz
- **Backup**: https://srv852801.hstgr.cloud
- **Health Check**: https://p57.birfoiz.uz/api/health

## 📞 Troubleshooting

### Common Issues

#### Bad Gateway (502)
1. Check container status: `./deploy-production.sh status`
2. Check health endpoint: `curl https://p57.birfoiz.uz/api/health`
3. Review logs: `./monitor.sh check`
4. Restart if needed: `./deploy-production.sh deploy`

#### SSL Certificate Issues
1. Check certificate status: `./setup-vps.sh status`
2. Renew certificates: `./setup-vps.sh ssl`
3. Verify Nginx config: Check `/etc/nginx/sites-available/protokol57`

#### Database Connection Issues
- Application automatically falls back to in-memory storage
- Check Supabase status and environment variables
- Monitor reconnection attempts in logs

#### Performance Issues
1. Check resource usage: `./monitor.sh check`
2. Review alerts: `./monitor.sh alerts`
3. Check Docker container resources
4. Monitor database response times

### Emergency Procedures

#### Complete Service Restart
```bash
# On VPS
cd /opt/protokol57
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

#### Manual Rollback
```bash
# Find available backups
./deploy-production.sh status

# Rollback to specific backup
./deploy-production.sh rollback protokol57_backup_YYYYMMDD_HHMMSS
```

#### SSL Certificate Emergency Renewal
```bash
# On VPS
systemctl stop nginx
certbot renew --force-renewal
systemctl start nginx
```

## 📋 Maintenance Schedule

### Daily
- Automated health checks
- Log rotation
- Security updates (automatic)

### Weekly
- Monitor disk space and cleanup
- Review monitoring logs
- Check SSL certificate expiry

### Monthly
- Full system updates
- Backup verification
- Performance review
- Security audit

## 🎯 SLA Targets

- **Uptime**: 99.9% (< 8.77 hours downtime/year)
- **Response Time**: < 2 seconds average
- **Recovery Time**: < 30 seconds from failure
- **Deployment Time**: < 5 minutes zero-downtime

## 📚 Additional Resources

- **Supabase Dashboard**: https://app.supabase.com/project/bazptglwzqstppwlvmvb
- **VPS Provider**: Your hosting provider dashboard
- **SSL Certificate Monitoring**: Let's Encrypt dashboard
- **Docker Hub**: Registry for container images

## 🆘 Support Contacts

- **Primary Developer**: hurshidbey@gmail.com
- **VPS Issues**: Your hosting provider support
- **Domain Issues**: Your domain registrar
- **SSL Issues**: Let's Encrypt community support

---

**Last Updated**: June 19, 2024
**Version**: 1.0.0
**Environment**: Production