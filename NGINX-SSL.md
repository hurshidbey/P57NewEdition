# NGINX & SSL Configuration Guide

## Domain Structure

This project uses **two separate domains** for different purposes:

| Domain | Purpose | Container | Port |
|--------|---------|-----------|------|
| `p57.uz` | Landing page (static) | nginx (host) | 443/80 |
| `p57.birfoiz.uz` | Main platform (React app) | protokol57 Docker | 5001 → 443/80 |
| `srv852801.hstgr.cloud` | Backup domain for main platform | protokol57 Docker | 5001 → 443/80 |

**Server IP**: `69.62.126.73`

## Current SSL Certificate Status

Both domains have Let's Encrypt SSL certificates:

- **p57.uz**: `/etc/letsencrypt/live/p57.uz/`
  - Expires: October 4, 2025
  - Auto-renewal: Enabled
  
- **p57.birfoiz.uz**: `/etc/letsencrypt/live/p57.birfoiz.uz/`
  - Expires: October 4, 2025
  - Auto-renewal: Enabled

## NGINX Configuration

The nginx configuration is located at:
- **File**: `/etc/nginx/sites-available/landing`
- **Symlink**: `/etc/nginx/sites-enabled/landing`

### Current Configuration Structure

```nginx
# Landing page (p57.uz)
server {
    listen 80;
    server_name p57.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name p57.uz;
    
    ssl_certificate /etc/letsencrypt/live/p57.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/p57.uz/privkey.pem;
    
    root /opt/protokol57/landing_page;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Main platform (p57.birfoiz.uz & srv852801.hstgr.cloud)
server {
    listen 80;
    server_name p57.birfoiz.uz srv852801.hstgr.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name p57.birfoiz.uz srv852801.hstgr.cloud;
    
    ssl_certificate /etc/letsencrypt/live/p57.birfoiz.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/p57.birfoiz.uz/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Prevent 504 Gateway Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
```

## SSL Certificate Management

### Check Certificate Status

```bash
# Check certificate expiry dates
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot certificates"

# Test SSL configuration
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "nginx -t"
```

### Manual Certificate Renewal

```bash
# Renew all certificates
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot renew"

# Force renewal (if needed)
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot renew --force-renewal"
```

### Add New Domain

```bash
# Add certificate for new domain
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot --nginx -d new-domain.com --agree-tos --email admin@p57.uz --non-interactive"
```

## Common SSL Issues & Solutions

### 1. SSL Certificate Self-Signed Error

**Symptom**: Browser shows "SSL certificate problem: self-signed certificate"

**Solution**:
```bash
# Generate proper Let's Encrypt certificate
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot --nginx -d p57.birfoiz.uz -d srv852801.hstgr.cloud --agree-tos --email admin@p57.uz --non-interactive"
```

### 2. Domain Not Found (NXDOMAIN)

**Symptom**: Certbot fails with "DNS problem: NXDOMAIN"

**Solution**:
1. Verify DNS records point to server IP:
   ```bash
   nslookup p57.birfoiz.uz
   # Should return: 69.62.126.73
   ```
2. Wait for DNS propagation (can take up to 48 hours)
3. Use correct domain in certbot command

### 3. Certificate Not Auto-Renewing

**Symptom**: Certificate expires without renewal

**Solution**:
```bash
# Check cron job
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "systemctl status certbot.timer"

# Enable if disabled
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "systemctl enable --now certbot.timer"
```

### 4. Mixed HTTP/HTTPS After SSL Setup

**Symptom**: Some resources load over HTTP instead of HTTPS

**Solution**:
1. Ensure nginx redirects all HTTP to HTTPS (already configured)
2. Check Docker container environment variables include proper protocol
3. Verify proxy headers are set correctly (X-Forwarded-Proto)

## Testing SSL Configuration

### Quick Health Check

```bash
# Test landing page
curl -I https://p57.uz

# Test main platform
curl -I https://p57.birfoiz.uz

# Test API endpoint
curl -s "https://p57.birfoiz.uz/api/protocols?page=1&limit=1"
```

### Full SSL Test

```bash
# Check SSL certificate details
openssl s_client -connect p57.birfoiz.uz:443 -servername p57.birfoiz.uz < /dev/null

# Test with SSL Labs (external service)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=p57.birfoiz.uz
```

## Important Notes

1. **Never mix domains**: 
   - Landing page MUST use `p57.uz`
   - Main platform MUST use `p57.birfoiz.uz`
   
2. **Certificate renewal**: Happens automatically via certbot timer
   
3. **After nginx changes**: Always run `nginx -t` before `systemctl reload nginx`

4. **Docker labels**: Traefik labels in docker-compose files are for future use (Traefik not currently active)

5. **Backup certificates**: Located in `/etc/letsencrypt/` - backed up with system backups