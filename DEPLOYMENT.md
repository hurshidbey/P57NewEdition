# Protokol57 Deployment Guide

This document outlines the proper deployment workflow for the Protokol57 application using GitHub and VPS.

## 🏗️ Architecture Overview

- **Repository**: GitHub (https://github.com/hurshidbey/P57NewEdition.git)
- **Production Server**: VPS at `srv852801.hstgr.cloud` (IP: 69.62.126.73)
- **Tech Stack**: React + Node.js + PM2 + Traefik + SSL
- **Database**: Supabase PostgreSQL

## 📋 Prerequisites

- SSH access to VPS with key: `~/.ssh/protokol57_ed25519`
- Git repository access
- Node.js 20.x installed on VPS
- PM2 process manager configured

## 🚀 Deployment Methods

### Method 1: One-Command Deployment (Recommended)

```bash
./deploy-to-vps.sh
```

This script automatically:
1. Commits any local changes
2. Pushes to GitHub
3. Deploys to VPS
4. Shows deployment status

### Method 2: Manual Deployment

#### Step 1: Commit and Push to GitHub
```bash
git add .
git commit -m "Description of your changes"
git push origin main
```

#### Step 2: Deploy to VPS
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'cd /opt/protokol57 && ./deploy.sh'
```

## 🔧 VPS Deployment Script

Location: `/opt/protokol57/deploy.sh`

The deployment script performs:
1. **Git Pull**: Fetches latest code from GitHub
2. **Dependencies**: Installs/updates npm packages
3. **Build**: Compiles frontend with production environment variables
4. **Restart**: Restarts PM2 application
5. **Save**: Saves PM2 configuration

## 🌐 Production URLs

- **Main Website**: https://srv852801.hstgr.cloud/
- **API Base**: https://srv852801.hstgr.cloud/api/
- **Payme Endpoint**: https://srv852801.hstgr.cloud/api/payme
- **N8N (existing)**: https://n8n.srv852801.hstgr.cloud/

## 🔑 Authentication

**Admin Login:**
- Email: `hurshidbey@gmail.com`
- Password: `20031000a`

## 💳 Payme Integration

**Configuration:**
- Merchant ID: `682c005253a2e309cf048d70`
- Endpoint: `https://srv852801.hstgr.cloud/api/payme`
- Amount: 149,000 UZS (14,900,000 tiyins)

## 📊 Monitoring Commands

### Check Application Status
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'pm2 status'
```

### View Logs
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'pm2 logs protokol57'
```

### Check Services
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'docker compose ps'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Blank Page (Frontend Not Loading)
**Cause**: Missing environment variables in frontend build
**Solution**: 
```bash
# Rebuild with environment variables
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 '
cd /opt/protokol57
rm -rf dist
NODE_ENV=production VITE_SUPABASE_URL=https://bazptglwzqstppwlvmvb.supabase.co VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc1OTAsImV4cCI6MjA2NDU5MzU5MH0.xRh0LCDWP6YD3F4mDGrIK3krwwZw-DRx0iXy7MmIPY8 npm run build
pm2 restart protokol57
'
```

#### 2. Application Not Starting
**Check**: PM2 status and logs
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'pm2 status && pm2 logs protokol57 --lines 20'
```

#### 3. SSL Certificate Issues
**Check**: Traefik logs
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'docker logs root-traefik-1 --tail 20'
```

#### 4. Database Connection Issues
**Test**: Supabase connection
```bash
curl -s https://srv852801.hstgr.cloud/api/test-supabase
```

### Manual Recovery

#### Restart All Services
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 '
pm2 restart protokol57
docker compose restart
'
```

#### Reset to Latest GitHub Version
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 '
cd /opt/protokol57
git fetch origin
git reset --hard origin/main
./deploy.sh
'
```

## 📁 Important Files

### Local (Development)
- `deploy-to-vps.sh` - One-command deployment script
- `.env` - Local environment variables
- `vite.config.ts` - Frontend build configuration

### VPS (Production)
- `/opt/protokol57/deploy.sh` - VPS deployment script
- `/opt/protokol57/.env` - Production environment variables
- `/root/docker-compose.yml` - Traefik and N8N configuration
- `/root/.pm2/dump.pm2` - PM2 saved processes

## 🔒 Security Notes

- SSH key authentication enabled
- SSL certificates managed by Traefik + Let's Encrypt
- Firewall configured (ports 80, 443, 22)
- Database credentials stored in environment variables
- Session-based authentication for admin panel

## 🎯 Future Improvements

### Recommended Enhancements
1. **CI/CD Pipeline**: GitHub Actions for automatic deployment
2. **Health Checks**: Automated monitoring and alerts
3. **Backup System**: Regular database and file backups
4. **Staging Environment**: Separate environment for testing
5. **Error Tracking**: Sentry or similar service integration

### Monitoring Setup
```bash
# Add to crontab for health monitoring
*/5 * * * * curl -f https://srv852801.hstgr.cloud/api/protocols > /dev/null || echo "Site down at $(date)" >> /var/log/site-monitor.log
```

## 📞 Support

For deployment issues or questions:
1. Check this documentation first
2. Review application logs on VPS
3. Verify GitHub repository status
4. Test API endpoints manually

---

**Last Updated**: June 7, 2025  
**Version**: 1.0  
**Environment**: Production