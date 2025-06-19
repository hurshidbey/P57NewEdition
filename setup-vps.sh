#!/bin/bash

# VPS Setup Script for Protokol57
# Configures SSL/HTTPS, security hardening, and infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="69.62.126.73"
VPS_USER="root"
SSH_KEY="~/.ssh/protokol57_ed25519"
APP_DIR="/opt/protokol57"
DOMAIN1="p57.birfoiz.uz"
DOMAIN2="srv852801.hstgr.cloud"
EMAIL="hurshidbey@gmail.com"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Function to execute remote commands
execute_remote() {
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "$1"
}

# Function to upload file to VPS
upload_file() {
    local local_file="$1"
    local remote_path="$2"
    scp -i "$SSH_KEY" "$local_file" "$VPS_USER@$VPS_HOST:$remote_path"
}

# Function to setup Nginx with SSL
setup_nginx_ssl() {
    print_status "Setting up Nginx with SSL/HTTPS..."
    
    # Install Nginx and Certbot
    execute_remote "apt update && apt install -y nginx certbot python3-certbot-nginx"
    
    # Create Nginx configuration
    print_status "Creating Nginx configuration..."
    
    local nginx_config="/tmp/protokol57_nginx.conf"
    cat > "$nginx_config" << 'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

server {
    listen 80;
    server_name p57.birfoiz.uz srv852801.hstgr.cloud;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name p57.birfoiz.uz srv852801.hstgr.cloud;

    # SSL Configuration (will be managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/p57.birfoiz.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/p57.birfoiz.uz/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # General rate limiting for other requests
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Static file caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (no rate limiting)
    location = /api/health {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Quick timeout for health checks
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(\.git|\.env|package\.json|docker-compose) {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # Logging
    access_log /var/log/nginx/protokol57_access.log;
    error_log /var/log/nginx/protokol57_error.log;
}
EOF
    
    # Upload and install Nginx config
    upload_file "$nginx_config" "/etc/nginx/sites-available/protokol57"
    execute_remote "ln -sf /etc/nginx/sites-available/protokol57 /etc/nginx/sites-enabled/"
    execute_remote "rm -f /etc/nginx/sites-enabled/default"
    execute_remote "nginx -t"
    
    # Start Nginx
    execute_remote "systemctl enable nginx && systemctl restart nginx"
    
    print_success "Nginx configured successfully"
    rm -f "$nginx_config"
}

# Function to setup SSL certificates
setup_ssl_certificates() {
    print_status "Setting up SSL certificates with Let's Encrypt..."
    
    # Stop Nginx temporarily for certificate generation
    execute_remote "systemctl stop nginx"
    
    # Generate certificates for both domains
    execute_remote "certbot certonly --standalone --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN1 -d $DOMAIN2"
    
    # Start Nginx with SSL
    execute_remote "systemctl start nginx"
    
    # Setup automatic renewal
    execute_remote "echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -"
    
    print_success "SSL certificates configured successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Install and configure UFW
    execute_remote "apt install -y ufw"
    execute_remote "ufw --force reset"
    execute_remote "ufw default deny incoming"
    execute_remote "ufw default allow outgoing"
    
    # Allow SSH (ensure we don't lock ourselves out)
    execute_remote "ufw allow 22"
    
    # Allow HTTP and HTTPS
    execute_remote "ufw allow 80"
    execute_remote "ufw allow 443"
    
    # Allow application port (for direct access if needed)
    execute_remote "ufw allow 5001"
    
    # Enable firewall
    execute_remote "ufw --force enable"
    
    print_success "Firewall configured successfully"
}

# Function to setup monitoring cron jobs
setup_monitoring() {
    print_status "Setting up automated monitoring..."
    
    # Create monitoring script on VPS
    local monitoring_script="/tmp/vps_monitor.sh"
    cat > "$monitoring_script" << 'EOF'
#!/bin/bash
# Simple monitoring script for VPS

LOG_FILE="/var/log/protokol57_monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$DATE] WARNING: Disk usage at ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEM_USAGE" -gt 85 ]; then
    echo "[$DATE] WARNING: Memory usage at ${MEM_USAGE}%" >> "$LOG_FILE"
fi

# Check if Docker containers are running
CONTAINER_COUNT=$(docker ps --filter "name=protokol57" | grep -c "Up" || echo "0")
if [ "$CONTAINER_COUNT" -eq 0 ]; then
    echo "[$DATE] ERROR: No running containers found" >> "$LOG_FILE"
    # Try to restart containers
    cd /opt/protokol57
    docker compose -f docker-compose.prod.yml up -d
fi

# Check if application responds
if ! curl -f -s --max-time 10 http://localhost:5001/api/health > /dev/null; then
    echo "[$DATE] ERROR: Application health check failed" >> "$LOG_FILE"
fi

# Rotate log file if it gets too large (>10MB)
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    touch "$LOG_FILE"
fi
EOF
    
    upload_file "$monitoring_script" "/opt/vps_monitor.sh"
    execute_remote "chmod +x /opt/vps_monitor.sh"
    
    # Setup cron job for monitoring (every 5 minutes)
    execute_remote "(crontab -l 2>/dev/null; echo '*/5 * * * * /opt/vps_monitor.sh') | crontab -"
    
    # Setup log rotation for application logs
    local logrotate_config="/tmp/protokol57_logrotate"
    cat > "$logrotate_config" << 'EOF'
/var/log/nginx/protokol57_*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}

/var/log/protokol57_monitor.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
}
EOF
    
    upload_file "$logrotate_config" "/etc/logrotate.d/protokol57"
    
    print_success "Monitoring configured successfully"
    rm -f "$monitoring_script" "$logrotate_config"
}

# Function to setup security hardening
setup_security() {
    print_status "Applying security hardening..."
    
    # Update system packages
    execute_remote "apt update && apt upgrade -y"
    
    # Install security tools
    execute_remote "apt install -y fail2ban unattended-upgrades"
    
    # Configure fail2ban for SSH protection
    local fail2ban_config="/tmp/jail.local"
    cat > "$fail2ban_config" << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/protokol57_error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF
    
    upload_file "$fail2ban_config" "/etc/fail2ban/jail.local"
    execute_remote "systemctl enable fail2ban && systemctl restart fail2ban"
    
    # Setup automatic security updates
    execute_remote "echo 'Unattended-Upgrade::Automatic-Reboot \"false\";' >> /etc/apt/apt.conf.d/50unattended-upgrades"
    execute_remote "systemctl enable unattended-upgrades"
    
    # Disable unnecessary services
    execute_remote "systemctl disable apache2 2>/dev/null || true"
    execute_remote "systemctl stop apache2 2>/dev/null || true"
    
    # Set proper file permissions
    execute_remote "chmod 700 ~/.ssh"
    execute_remote "chmod 600 ~/.ssh/authorized_keys"
    
    print_success "Security hardening completed"
    rm -f "$fail2ban_config"
}

# Function to check VPS status
check_status() {
    print_status "Checking VPS status..."
    
    echo ""
    echo "=== VPS CONNECTION ==="
    if execute_remote "echo 'VPS connection successful'"; then
        print_success "VPS connection: OK"
    else
        print_error "VPS connection: FAILED"
        return 1
    fi
    
    echo ""
    echo "=== SYSTEM INFO ==="
    execute_remote "uname -a"
    execute_remote "uptime"
    execute_remote "free -h"
    execute_remote "df -h /"
    
    echo ""
    echo "=== SERVICES STATUS ==="
    local nginx_status=$(execute_remote "systemctl is-active nginx" || echo "inactive")
    local docker_status=$(execute_remote "systemctl is-active docker" || echo "inactive")
    local fail2ban_status=$(execute_remote "systemctl is-active fail2ban" || echo "inactive")
    
    echo "Nginx: $nginx_status"
    echo "Docker: $docker_status"
    echo "Fail2ban: $fail2ban_status"
    
    echo ""
    echo "=== SSL CERTIFICATES ==="
    execute_remote "certbot certificates 2>/dev/null || echo 'No certificates found'"
    
    echo ""
    echo "=== DOCKER CONTAINERS ==="
    execute_remote "cd $APP_DIR && docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo 'No containers'"
    
    echo ""
    echo "=== RECENT LOGS ==="
    execute_remote "tail -5 /var/log/protokol57_monitor.log 2>/dev/null || echo 'No monitoring logs'"
}

# Function to show help
show_help() {
    echo "VPS Setup Script for Protokol57"
    echo ""
    echo "Usage: $0 {setup|ssl|firewall|monitoring|security|status|help}"
    echo ""
    echo "Commands:"
    echo "  setup       Run complete VPS setup (nginx, ssl, firewall, monitoring, security)"
    echo "  ssl         Setup SSL certificates only"
    echo "  firewall    Setup firewall only"
    echo "  monitoring  Setup monitoring only"
    echo "  security    Setup security hardening only"
    echo "  status      Check VPS status"
    echo "  help        Show this help message"
    echo ""
    echo "Configuration:"
    echo "  VPS Host:    $VPS_HOST"
    echo "  Domains:     $DOMAIN1, $DOMAIN2"
    echo "  Email:       $EMAIL"
    echo "  App Dir:     $APP_DIR"
}

# Function to run complete setup
run_complete_setup() {
    print_status "Starting complete VPS setup..."
    
    # Check SSH connection first
    if ! execute_remote "echo 'Testing connection...'"; then
        print_error "Cannot connect to VPS. Please check SSH key and connection."
        return 1
    fi
    
    setup_nginx_ssl
    setup_ssl_certificates
    setup_firewall
    setup_monitoring
    setup_security
    
    print_success "Complete VPS setup finished!"
    print_status "Please test the application at: https://$DOMAIN1"
    print_status "Backup URL: https://$DOMAIN2"
}

# Main script logic
case "${1:-help}" in
    "setup")
        run_complete_setup
        ;;
    "ssl")
        setup_ssl_certificates
        ;;
    "firewall")
        setup_firewall
        ;;
    "monitoring")
        setup_monitoring
        ;;
    "security")
        setup_security
        ;;
    "status")
        check_status
        ;;
    "help"|*)
        show_help
        ;;
esac