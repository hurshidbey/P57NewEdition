# DevOps Deployment Guide for Protokol57

## Overview

This guide provides comprehensive documentation for deploying and maintaining Protokol57 with zero downtime and optimal performance. The deployment architecture has been completely redesigned to eliminate gateway timeouts and ensure smooth operations.

## Architecture Changes

### Previous Issues
- **Traefik Misconfiguration**: Application had Traefik labels but server used NGINX
- **Network Confusion**: Trying to connect to non-existent Traefik network
- **Health Check Issues**: Inconsistent health endpoints
- **Resource Constraints**: Insufficient memory allocation
- **No Graceful Shutdown**: Connections dropped during deployments

### Current Architecture
- **NGINX Reverse Proxy**: Optimized upstream configuration with connection pooling
- **Simplified Networking**: Single internal Docker network
- **Unified Health Checks**: Consistent `/health` endpoint across all components
- **Increased Resources**: 1GB memory limit with proper CPU allocation
- **Graceful Shutdown**: Proper SIGTERM handling with 30-second grace period
- **Application Timeouts**: Hierarchical timeout system preventing cascading failures

## Deployment Options

### 1. Standard Deployment (Quick)
```bash
./deploy-production.sh
```
This script handles:
- Configuration validation
- Environment file copying
- Docker image building
- Container replacement
- Health verification

### 2. Zero-Downtime Deployment (Recommended)
```bash
./deploy-zero-downtime.sh
```
Features:
- Blue-green deployment strategy
- No service interruption
- Automatic rollback on failure
- Health checks before switching
- Graceful old container shutdown

### 3. Manual Deployment
```bash
# SSH to server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

# Navigate to project
cd /opt/protokol57

# Deploy
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## Monitoring Endpoints

### Health Checks
- **Basic Health**: `GET /health`
  - Returns: status, uptime, memory usage, environment
  - Used by: Docker healthcheck, NGINX upstream checks

- **Detailed Metrics**: `GET /metrics`
  - Returns: system info, memory details, CPU usage, request rates, database status
  - Use for: Monitoring dashboards, alerting

- **Readiness Probe**: `GET /ready`
  - Returns: application readiness status
  - Checks: server status, database connection
  - HTTP 200 if ready, 503 if not ready

### Example Monitoring Commands
```bash
# Check health from server
curl http://localhost:5000/health

# Check metrics
curl http://localhost:5000/metrics

# Check readiness
curl http://localhost:5000/ready

# Monitor from outside
curl https://p57.birfoiz.uz/health
```

## NGINX Configuration

### Deploy NGINX Updates
```bash
./deploy-nginx-config.sh
```

### Key NGINX Features
- **Upstream Connection Pooling**: Maintains persistent connections
- **Optimized Timeouts**: 60s read/write, 10s connect
- **Compression**: Gzip enabled for text content
- **Caching**: Static assets cached for 1 year
- **Security Headers**: HSTS, X-Frame-Options, etc.

### Manual NGINX Update
```bash
# Copy config to server
scp nginx-production.conf root@69.62.126.73:/tmp/

# Apply on server
ssh root@69.62.126.73
mv /tmp/nginx-production.conf /etc/nginx/sites-available/protokol57
ln -sf /etc/nginx/sites-available/protokol57 /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Timeout Configuration

### Timeout Hierarchy
```
Client Browser    → 65 seconds
     ↓
NGINX Proxy      → 60 seconds
     ↓
Application      → 55 seconds (default)
                 → 90 seconds (payments)
                 → 180 seconds (AI evaluation)
     ↓
Health Checks    → 30 seconds
```

### Route-Specific Timeouts
- `/api`: 55 seconds
- `/api/payments`: 90 seconds
- `/api/evaluate`: 180 seconds
- `/assets`: 10 seconds
- `/health`: 5 seconds

## Rollback Procedures

### Quick Rollback
```bash
# On server
cd /opt/protokol57
./rollback.sh
```

### Manual Rollback
```bash
# Find previous deployment
docker ps -a | grep protokol57

# Start previous container
docker start protokol57-[previous-color]

# Update NGINX if needed
sed -i 's/5001/5002/' /etc/nginx/sites-available/protokol57
systemctl reload nginx
```

## Troubleshooting

### Gateway Timeouts
1. Check application logs:
   ```bash
   docker logs protokol57-blue --tail 100
   ```

2. Check NGINX logs:
   ```bash
   tail -f /var/log/nginx/protokol57_error.log
   ```

3. Verify timeouts:
   ```bash
   docker exec protokol57-blue grep -i timeout dist/index.js
   ```

### Health Check Failures
1. Test health endpoint:
   ```bash
   docker exec protokol57-blue curl http://localhost:5000/health
   ```

2. Check container resources:
   ```bash
   docker stats protokol57-blue
   ```

3. Verify database connection:
   ```bash
   docker exec protokol57-blue curl http://localhost:5000/ready
   ```

### Memory Issues
1. Check current usage:
   ```bash
   docker stats --no-stream
   ```

2. Increase limits if needed:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2048M  # Increase from 1024M
   ```

### Connection Refused
1. Verify container is running:
   ```bash
   docker ps | grep protokol57
   ```

2. Check port binding:
   ```bash
   docker port protokol57-blue
   ```

3. Test locally:
   ```bash
   curl http://localhost:5001
   ```

## Performance Optimization

### Docker Build Cache
```bash
# Clear build cache
docker builder prune -f

# Build with cache
docker compose build

# Build without cache
docker compose build --no-cache
```

### Resource Monitoring
```bash
# Real-time stats
docker stats

# Check logs for memory warnings
docker logs protokol57-blue | grep -i memory

# System resources
free -h
df -h
```

### Database Optimization
- Connection pooling enabled (20 connections max)
- 30-second idle timeout
- Automatic reconnection on failure

## Security Considerations

### Environment Variables
- Never commit `.env.production` to Git
- Use `scp` to copy to server
- Verify permissions: `chmod 600 .env.production`

### SSL/TLS
- Certificates managed by Let's Encrypt
- Auto-renewal enabled via certbot
- HSTS header enforced

### Container Security
- Non-root user in container
- Read-only root filesystem possible
- No unnecessary packages installed

## Maintenance Tasks

### Weekly
- Check SSL certificate expiry
- Review error logs
- Monitor disk usage

### Monthly
- Update dependencies
- Clean Docker images
- Review metrics trends

### Quarterly
- Security audit
- Performance review
- Capacity planning

## Emergency Procedures

### Complete System Down
1. SSH to server
2. Check Docker status: `systemctl status docker`
3. Restart if needed: `systemctl restart docker`
4. Start containers: `docker compose -f docker-compose.prod.yml up -d`

### Database Connection Lost
1. Check Supabase status
2. Verify environment variables
3. Test connection manually
4. Application will use in-memory fallback

### High Load
1. Check metrics: `/metrics` endpoint
2. Identify bottleneck
3. Scale resources if needed
4. Consider load balancing

## Contact Information

- **Server**: 69.62.126.73
- **Domains**: p57.uz (landing), p57.birfoiz.uz (app)
- **SSH Key**: `~/.ssh/protokol57_ed25519`

## Quick Reference

```bash
# Deploy
./deploy-zero-downtime.sh

# Rollback
ssh root@69.62.126.73 'cd /opt/protokol57 && ./rollback.sh'

# Logs
ssh root@69.62.126.73 'docker logs protokol57-blue --tail 100'

# Health
curl https://p57.birfoiz.uz/health

# Metrics
curl https://p57.birfoiz.uz/metrics
```