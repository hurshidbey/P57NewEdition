# Production Deployment Guide for Protokol57

This guide provides comprehensive instructions for deploying and maintaining Protokol57 in production with 99.9%+ uptime.

## Overview

The production setup includes:
- 🐳 **Docker-based deployment** with zero-downtime updates
- 🔄 **Automatic reconnection** and error recovery
- 📊 **Health monitoring** and alerting
- 🔒 **SSL/HTTPS** with auto-renewal
- 🚀 **Zero-downtime deployment** with rollback capability
- 📈 **Resource monitoring** and optimization

## Quick Start

### 1. Initial VPS Setup
```bash
# Setup VPS (first time only)
./setup-vps.sh setup

# Check VPS status
./setup-vps.sh status
```

### 2. Deploy Application
```bash
# Deploy to production
./deploy-production.sh deploy

# Check deployment status
./deploy-production.sh status
```

### 3. Monitor Application
```bash
# Run health check
./monitor.sh check

# Continuous monitoring
./monitor.sh monitor

# View recent alerts
./monitor.sh alerts
```

## Architecture

### Docker Configuration

**Production**: `docker-compose.prod.yml`
- No volume mounts (everything built into container)
- Resource limits and health checks
- Proper restart policies
- Security optimizations

**Development**: `docker-compose.dev.yml`
- Volume mounts for hot reload
- Development environment variables

### Database Connection Strategy

The application uses a **hybrid storage system** with automatic fallback:

1. **Primary**: Supabase REST API (with retry logic)
2. **Fallback**: Direct PostgreSQL connection (with connection pooling)
3. **Emergency**: In-memory storage (with seeded data)

### Error Recovery

- **Automatic reconnection** after database failures
- **Circuit breaker pattern** for external services
- **Graceful degradation** to in-memory storage
- **Health checks** with recovery triggers

## Deployment Process

### Zero-Downtime Deployment

The deployment script (`deploy-production.sh`) follows these steps:

1. **Pre-deployment checks**
   - Verify VPS connectivity
   - Check current application health
   - Validate deployment environment

2. **Backup current state**
   - Container configurations
   - Image information
   - Current health status

3. **Deploy new version**
   - Update code from git
   - Build new Docker image
   - Gracefully stop old containers
   - Start new containers

4. **Health verification**
   - Internal health checks
   - External connectivity tests
   - Performance validation

5. **Rollback on failure**
   - Automatic rollback if health checks fail
   - Restore previous working state
   - Alert administrators

### Deployment Commands

```bash
# Standard deployment
./deploy-production.sh deploy

# Rollback to previous version
./deploy-production.sh rollback

# Check application health
./deploy-production.sh health

# View live logs
./deploy-production.sh logs

# Check deployment status
./deploy-production.sh status

# Clean up old images
./deploy-production.sh cleanup
```

## Monitoring

### Health Check Endpoint

The application exposes a comprehensive health check at `/api/health`:

```json
{
  "status": "ok",
  "timestamp": "2025-06-19T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "used": 128,
    "total": 256
  },
  "database": {
    "connected": true,
    "supabase": true,
    "memory": true
  }
}
```

### Monitoring Script

The monitoring script (`monitor.sh`) provides:

```bash
# Full monitoring check
./monitor.sh check

# Application health only
./monitor.sh health

# VPS resources only
./monitor.sh resources

# Docker container status
./monitor.sh docker

# Continuous monitoring (every 60s)
./monitor.sh monitor

# View recent alerts
./monitor.sh alerts

# View monitoring logs
./monitor.sh logs
```

### Automated Monitoring

The VPS is configured with:
- **Cron job**: Health checks every 5 minutes
- **Log rotation**: Automatic log cleanup
- **SSL renewal**: Automatic certificate renewal
- **Docker cleanup**: Weekly cleanup of unused images

### Alerting Thresholds

- **Response time**: > 10 seconds
- **Memory usage**: > 400MB
- **CPU usage**: > 80%
- **Disk usage**: > 85%
- **Uptime**: < 60 seconds (indicates restart)

## Nginx Configuration

### Features

- **SSL termination** with automatic renewal
- **HTTP to HTTPS redirect**
- **Gzip compression** for static assets
- **Rate limiting** for API endpoints
- **Health check bypassing** (no caching)
- **Security headers** (HSTS, XSS protection, etc.)
- **Static asset caching** with proper headers

### SSL Setup

SSL certificates are automatically managed:

```bash
# Initial setup (done by setup-vps.sh)
certbot --nginx -d p57.birfoiz.uz

# Auto-renewal (configured in cron)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Management

### Connection Strategy

The application implements robust database connectivity:

1. **Connection Pooling**: Maximum 20 connections
2. **Retry Logic**: 3 attempts with 5-second delays
3. **Health Checks**: Continuous monitoring
4. **Automatic Reconnection**: On connection failures
5. **Graceful Fallback**: To in-memory storage

### Supabase Configuration

Environment variables for Supabase:
```bash
SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

## Security

### Network Security

- **Firewall**: UFW enabled with minimal ports
- **SSH**: Key-based authentication only
- **SSL**: TLS 1.2+ with modern ciphers
- **Headers**: Security headers via Nginx

### Container Security

- **Non-root user**: Application runs as non-root
- **Read-only filesystem**: Where possible
- **No new privileges**: Security flag set
- **Resource limits**: Memory and CPU limits

### Application Security

- **Environment variables**: Secure credential management
- **Session security**: HTTPOnly cookies
- **Input validation**: Zod schema validation
- **Rate limiting**: API endpoint protection

## Performance Optimization

### Caching Strategy

- **Static assets**: 1-year cache with immutable headers
- **API responses**: No caching for dynamic content
- **Gzip compression**: All text-based content

### Resource Management

- **Memory limit**: 512MB container limit
- **CPU limit**: 1 CPU core maximum
- **Connection pooling**: Database connections
- **Image optimization**: Multi-stage Docker builds

## Troubleshooting

### Common Issues

#### 1. Bad Gateway (502) Errors

**Symptoms**: Nginx returns 502 Bad Gateway
**Causes**: 
- Application container not running
- Database connection failures
- Health check failures

**Resolution**:
```bash
# Check container status
./deploy-production.sh status

# Check application health
./monitor.sh health

# View application logs
./deploy-production.sh logs

# Restart if needed
./deploy-production.sh deploy
```

#### 2. Database Connection Issues

**Symptoms**: "Cannot read properties of null" errors
**Causes**:
- Supabase connectivity issues
- Database credentials incorrect
- Network connectivity problems

**Resolution**:
```bash
# Check database health in monitoring
./monitor.sh check

# Check environment variables
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'cd /opt/protokol57 && docker-compose exec protokol57 env | grep SUPABASE'

# Restart with fresh connection
./deploy-production.sh deploy
```

#### 3. SSL Certificate Issues

**Symptoms**: Browser SSL warnings
**Causes**:
- Certificate expired
- Certificate not renewed
- Domain configuration issues

**Resolution**:
```bash
# Check certificate status
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'certbot certificates'

# Renew certificates
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'certbot renew --force-renewal'

# Reload Nginx
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'systemctl reload nginx'
```

#### 4. High Memory Usage

**Symptoms**: Container OOM kills, slow performance
**Causes**:
- Memory leaks
- High traffic
- Inefficient queries

**Resolution**:
```bash
# Check resource usage
./monitor.sh resources

# Restart container
./deploy-production.sh deploy

# Monitor memory usage
./monitor.sh monitor
```

### Emergency Procedures

#### Complete System Recovery

If the entire system is down:

```bash
# 1. Check VPS connectivity
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'uptime'

# 2. Check Docker service
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'systemctl status docker'

# 3. Restart Docker if needed
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'systemctl restart docker'

# 4. Deploy fresh instance
./deploy-production.sh deploy

# 5. Verify health
./monitor.sh check
```

#### Database Recovery

If database is completely unavailable:

1. Application will automatically fall back to in-memory storage
2. Users can still access all 57 protocols
3. New user registrations will be temporary
4. Monitor for database recovery
5. Restart application when database is available

## Maintenance

### Regular Tasks

#### Daily
- Monitor application health
- Check alert logs
- Verify SSL certificate status

#### Weekly
- Review resource usage trends
- Clean up old Docker images
- Check for security updates

#### Monthly
- Update system packages
- Review and rotate logs
- Performance optimization review

### Maintenance Commands

```bash
# Update system packages
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'apt update && apt upgrade -y'

# Clean up Docker resources
./deploy-production.sh cleanup

# Check system status
./setup-vps.sh status

# Review logs
./monitor.sh logs
```

## Performance Metrics

### Target SLAs

- **Uptime**: 99.9% (< 8.77 hours downtime/year)
- **Response Time**: < 2 seconds average
- **Recovery Time**: < 30 seconds from failure
- **Deployment Time**: < 5 minutes zero-downtime

### Monitoring Metrics

- **Application Health**: Every 30 seconds
- **Resource Monitoring**: Every 5 minutes
- **External Monitoring**: Every 1 minute
- **Log Analysis**: Real-time

## Support and Escalation

### Log Locations

- **Application logs**: `docker-compose logs -f`
- **Monitor logs**: `/tmp/protokol57_monitor.log`
- **Alert logs**: `/tmp/protokol57_alerts.log`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`

### Contact Information

For production issues:
1. Check monitoring dashboard
2. Review alert logs
3. Follow troubleshooting guide
4. Escalate to development team if needed

---

## Deployment Checklist

Before deploying to production:

- [ ] VPS setup completed (`./setup-vps.sh setup`)
- [ ] SSL certificates configured
- [ ] Environment variables verified
- [ ] Database connectivity tested
- [ ] Monitoring scripts deployed
- [ ] Backup procedures verified
- [ ] Rollback procedures tested
- [ ] Performance benchmarks established
- [ ] Security scan completed
- [ ] Documentation updated

After deployment:

- [ ] Health check passes (`./monitor.sh check`)
- [ ] External access verified (`curl https://p57.birfoiz.uz/api/health`)
- [ ] SSL certificate valid
- [ ] Performance metrics within SLA
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Documentation updated