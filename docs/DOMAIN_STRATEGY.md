# Domain Consolidation Strategy for P57

## Current Domain Architecture

### Existing Domains
1. **p57.uz**
   - Type: Landing page
   - Content: Static HTML marketing site
   - SSL: Let's Encrypt
   - Status: ✅ Working

2. **p57.birfoiz.uz**
   - Type: Primary application domain
   - Content: React SPA + API
   - SSL: Let's Encrypt
   - Status: ⚠️ DNS issues for some users

3. **protokol.1foiz.com**
   - Type: Backup application domain
   - Content: Same as p57.birfoiz.uz
   - SSL: Let's Encrypt (needs setup)
   - Status: ✅ Working as backup

4. **srv852801.hstgr.cloud**
   - Type: Server hostname
   - Content: Same as p57.birfoiz.uz
   - SSL: Let's Encrypt
   - Status: ✅ Working but not user-friendly

## Proposed Domain Strategy

### 1. Primary Domain Structure
```
p57.uz (Root Domain)
├── Landing Page (www.p57.uz or p57.uz)
├── app.p57.uz → Main Application
├── api.p57.uz → API Endpoints
├── cdn.p57.uz → Static Assets (future)
└── status.p57.uz → Status Page (future)
```

### 2. Domain Roles and Purposes

#### Primary Domains
- **p57.uz**: Marketing/Landing page
- **app.p57.uz**: Main application (NEW - replaces p57.birfoiz.uz)
- **api.p57.uz**: API endpoints (NEW - cleaner separation)

#### Backup Domains
- **protokol.1foiz.com**: Full application backup
- **p57.birfoiz.uz**: Legacy support (redirect to app.p57.uz)

#### Technical Domains
- **srv852801.hstgr.cloud**: Server access only (not for users)

### 3. Migration Plan

#### Phase 1: Setup New Subdomains (Week 1)
1. Create DNS records for app.p57.uz and api.p57.uz
2. Obtain SSL certificates
3. Configure NGINX for new domains
4. Test thoroughly

#### Phase 2: Gradual Migration (Week 2-3)
1. Update application to support new domains
2. Implement smart redirects
3. Update all hardcoded references
4. Monitor DNS propagation

#### Phase 3: Legacy Support (Ongoing)
1. Keep old domains active for 6 months
2. Implement 301 redirects
3. Update all documentation
4. Notify users of changes

## Technical Implementation

### DNS Configuration
```
; Primary domain setup
p57.uz.          A     69.62.126.73
www.p57.uz.      CNAME p57.uz.
app.p57.uz.      A     69.62.126.73
api.p57.uz.      A     69.62.126.73

; Backup domains
protokol.1foiz.com.    A     69.62.126.73
p57.birfoiz.uz.        A     69.62.126.73
```

### NGINX Configuration Structure
```nginx
# Landing page
server {
    server_name p57.uz www.p57.uz;
    root /opt/protokol57/landing_page;
}

# Main application
server {
    server_name app.p57.uz;
    proxy_pass http://protokol57_backend;
}

# API endpoint
server {
    server_name api.p57.uz;
    location / {
        proxy_pass http://protokol57_backend/api;
    }
}

# Legacy redirects
server {
    server_name p57.birfoiz.uz;
    return 301 https://app.p57.uz$request_uri;
}
```

### Environment Variables
```bash
# Primary domains
APP_DOMAIN=https://app.p57.uz
API_DOMAIN=https://api.p57.uz
LANDING_DOMAIN=https://p57.uz

# Backup domains
BACKUP_DOMAINS=https://protokol.1foiz.com,https://p57.birfoiz.uz

# CORS allowed origins
CORS_ALLOWED_ORIGINS=https://p57.uz,https://app.p57.uz,https://api.p57.uz,https://protokol.1foiz.com
```

## Benefits of New Structure

### 1. Improved Organization
- Clear separation of concerns (landing vs app vs api)
- Easier to understand domain purposes
- Better for SEO and branding

### 2. Enhanced Reliability
- Multiple backup options
- Easier DNS management
- Reduced single point of failure

### 3. Better Performance
- Potential for CDN integration
- API-specific optimizations
- Cookie-less domain for static assets

### 4. Simplified Maintenance
- Cleaner NGINX configuration
- Easier SSL certificate management
- Better monitoring capabilities

## Implementation Checklist

### Immediate Actions
- [ ] Audit all hardcoded domain references
- [ ] Create domain configuration module
- [ ] Plan DNS record changes

### DNS Setup
- [ ] Create A records for app.p57.uz
- [ ] Create A records for api.p57.uz
- [ ] Lower TTL to 300s before changes
- [ ] Verify DNS propagation

### NGINX Configuration
- [ ] Create new server blocks
- [ ] Setup SSL certificates
- [ ] Implement redirect rules
- [ ] Test all configurations

### Application Updates
- [ ] Replace hardcoded domains with environment variables
- [ ] Update CORS configuration
- [ ] Update authentication callbacks
- [ ] Update payment integration URLs

### Testing
- [ ] Test all domain combinations
- [ ] Verify SSL certificates
- [ ] Check redirect chains
- [ ] Monitor DNS resolution

### Documentation
- [ ] Update user documentation
- [ ] Update deployment guides
- [ ] Create migration guide
- [ ] Update support materials

## Monitoring Strategy

### DNS Monitoring
- Monitor all domains from multiple regions
- Alert on resolution failures
- Track propagation times

### SSL Monitoring
- Certificate expiration alerts
- SSL grade monitoring
- HSTS header verification

### Uptime Monitoring
- Monitor each domain separately
- Check specific endpoints
- Track response times

## Rollback Plan

If issues arise during migration:
1. DNS changes can be reverted (low TTL)
2. NGINX configs backed up before changes
3. Old domains remain active
4. Database of redirects maintained

## Success Criteria

1. **Zero Downtime**: No service interruption during migration
2. **DNS Resolution**: >99% success rate globally
3. **User Experience**: Seamless transition for users
4. **Performance**: No degradation in response times
5. **SEO Impact**: Minimal impact with proper redirects

## Long-term Vision

### Year 1
- Consolidate under p57.uz brand
- Establish subdomain structure
- Build user recognition

### Year 2
- Implement CDN for global performance
- Add geographic load balancing
- Enhanced monitoring and analytics

### Year 3
- Multi-region deployment
- Automatic failover
- Full redundancy

## Communication Plan

### User Notification
1. In-app banner 2 weeks before
2. Email notification to registered users
3. Social media announcements
4. Support documentation updates

### Sample Message
```
We're improving our infrastructure! 

Starting [date], our main application will be available at:
https://app.p57.uz

Your existing bookmarks will automatically redirect.
No action needed from your side.
```

## Risk Mitigation

### Identified Risks
1. **DNS Propagation Delays**
   - Mitigation: Keep old domains active
   - Use low TTL values

2. **SSL Certificate Issues**
   - Mitigation: Obtain certificates early
   - Test thoroughly before switch

3. **User Confusion**
   - Mitigation: Clear communication
   - Automatic redirects

4. **SEO Impact**
   - Mitigation: Proper 301 redirects
   - Update sitemap
   - Notify search engines

## Conclusion

This domain consolidation strategy provides a clear path to a more organized, reliable, and maintainable domain structure. The phased approach ensures minimal disruption while improving the overall architecture.