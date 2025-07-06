# SSL/HTTPS Troubleshooting Guide

## Quick Diagnostics

### Check Current SSL Status
```bash
# From local machine
curl -I https://p57.uz                  # Landing page
curl -I https://p57.birfoiz.uz         # Main platform

# From server (more detailed)
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot certificates"
```

## Common SSL Issues & Solutions

### 1. 🔴 "SSL certificate problem: self-signed certificate"

**Symptoms**: 
- Browser shows security warning
- `curl` returns SSL error
- Site accessible with `curl -k` (insecure mode)

**Root Cause**: nginx using self-signed certificate instead of Let's Encrypt

**Solution**:
```bash
# 1. Check which certificate nginx is using
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "grep ssl_certificate /etc/nginx/sites-available/landing"

# 2. Generate proper Let's Encrypt certificate
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot --nginx -d p57.uz -d p57.birfoiz.uz -d srv852801.hstgr.cloud --agree-tos --email admin@p57.uz --non-interactive"

# 3. Reload nginx
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "nginx -t && systemctl reload nginx"
```

### 2. 🔴 DNS Problem: NXDOMAIN

**Symptoms**: 
- Certbot fails with "DNS problem: NXDOMAIN looking up A for domain"
- Domain doesn't resolve

**Root Cause**: DNS records not pointing to server or not propagated

**Solution**:
```bash
# 1. Check DNS resolution
nslookup p57.uz
nslookup p57.birfoiz.uz

# 2. Verify DNS points to correct IP (69.62.126.73)
# If not, update DNS records at your domain registrar

# 3. Wait for DNS propagation (can take up to 48 hours)
# Use online tools to check: https://www.whatsmydns.net/
```

### 3. 🔴 Certificate Expired

**Symptoms**: 
- Browser shows "Certificate expired" error
- Site was working before but suddenly stopped

**Root Cause**: Let's Encrypt certificate expired (90-day validity)

**Solution**:
```bash
# 1. Check certificate expiry
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot certificates"

# 2. Manually renew
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot renew --force-renewal"

# 3. Check auto-renewal is enabled
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "systemctl status certbot.timer"

# 4. Enable if disabled
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "systemctl enable --now certbot.timer"
```

### 4. 🔴 Mixed Content Warnings

**Symptoms**: 
- HTTPS works but browser shows "Not Secure" in address bar
- Console shows mixed content warnings
- Some resources load over HTTP

**Root Cause**: Application loading resources over HTTP instead of HTTPS

**Solution**:
```bash
# 1. Check nginx is forwarding protocol header
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "grep X-Forwarded-Proto /etc/nginx/sites-available/landing"

# 2. Ensure Docker container respects forwarded headers
# Check that proxy headers are set in nginx config:
proxy_set_header X-Forwarded-Proto $scheme;

# 3. Force HTTPS redirect in nginx
# Ensure port 80 redirects to HTTPS:
server {
    listen 80;
    server_name p57.uz p57.birfoiz.uz;
    return 301 https://$server_name$request_uri;
}
```

### 5. 🔴 Wrong Domain in Certificate

**Symptoms**: 
- Certificate valid but for wrong domain
- Browser shows "Certificate name mismatch"

**Root Cause**: Certificate issued for different domain than being accessed

**Solution**:
```bash
# 1. Check certificate domains
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot certificates | grep Domains"

# 2. Get new certificate with correct domains
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "certbot --nginx -d p57.uz -d p57.birfoiz.uz -d srv852801.hstgr.cloud --expand"
```

### 6. 🔴 502/504 Gateway Timeout with HTTPS

**Symptoms**: 
- HTTP works but HTTPS times out
- nginx returns 502 or 504 error

**Root Cause**: nginx can't reach backend application

**Solution**:
```bash
# 1. Check Docker container is running
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker ps | grep protokol57"

# 2. Check nginx upstream configuration
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "grep proxy_pass /etc/nginx/sites-available/landing"

# 3. Test backend directly
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "curl http://localhost:5001/health"

# 4. Check nginx error logs
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "tail -50 /var/log/nginx/error.log"
```

## SSL Testing Tools

### Local Testing
```bash
# Basic connection test
openssl s_client -connect p57.birfoiz.uz:443 -servername p57.birfoiz.uz < /dev/null

# Certificate details
openssl s_client -connect p57.birfoiz.uz:443 -servername p57.birfoiz.uz < /dev/null 2>/dev/null | openssl x509 -text -noout | grep -E "(Subject:|DNS:)"

# Check certificate expiry
echo | openssl s_client -connect p57.birfoiz.uz:443 -servername p57.birfoiz.uz 2>/dev/null | openssl x509 -noout -dates
```

### Online Testing
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslchecker.com/sslchecker

## Emergency SSL Fix

If everything is broken and you need the site up immediately:

```bash
# 1. SSH to server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

# 2. Backup current nginx config
cp /etc/nginx/sites-available/landing /etc/nginx/sites-available/landing.backup

# 3. Remove ALL certificates and start fresh
certbot delete --cert-name p57.uz
certbot delete --cert-name p57.birfoiz.uz

# 4. Get new certificates
certbot --nginx -d p57.uz -d p57.birfoiz.uz -d srv852801.hstgr.cloud --agree-tos --email admin@p57.uz

# 5. Test configuration
nginx -t

# 6. Reload nginx
systemctl reload nginx
```

## Prevention Tips

1. **Monitor certificate expiry**: Set up monitoring to alert 30 days before expiry
2. **Test auto-renewal**: Run `certbot renew --dry-run` monthly
3. **Keep nginx config backed up**: Before any changes, backup working config
4. **Document all domains**: Keep list of all domains that need certificates
5. **Check logs regularly**: Review `/var/log/letsencrypt/letsencrypt.log` for issues

## Related Documentation
- [NGINX-SSL.md](./NGINX-SSL.md) - Complete SSL configuration guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures including SSL
- [deploy-production.sh](./deploy-production.sh) - Automated deployment with SSL checks