# DNS Emergency Fix Instructions

## For Users Experiencing "Server Can't Be Found" Errors:

### Option 1: Change DNS Settings (Recommended)
1. Change your device's DNS to:
   - Primary: 8.8.8.8 (Google DNS)
   - Secondary: 8.8.4.4
   OR
   - Primary: 1.1.1.1 (Cloudflare DNS)
   - Secondary: 1.0.0.1

### Option 2: Use Direct IP Access
While we fix the DNS issue, you can access the site directly:
- https://69.62.126.73 (Note: You'll get a certificate warning, but it's safe to proceed)

### Option 3: Clear DNS Cache
- Windows: `ipconfig /flushdns`
- Mac: `sudo dscacheutil -flushcache`
- Chrome: Visit `chrome://net-internals/#dns` and click "Clear host cache"

## For Site Administrator:

### Immediate Mitigation:
1. Contact your DNS provider (webspace.uz) immediately
2. Consider adding a secondary DNS provider for redundancy
3. Lower TTL to 300 seconds for faster propagation

### Long-term Solutions:
1. Use Cloudflare DNS (free, reliable, global)
2. Set up DNS monitoring to detect these issues faster
3. Have a backup domain ready for emergencies