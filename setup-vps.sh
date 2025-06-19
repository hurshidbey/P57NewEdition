#!/bin/bash

# VPS Setup Script for Protokol57
# This script sets up the production environment on the VPS

set -e

# Configuration
VPS_HOST="69.62.126.73"
VPS_USER="root"
VPS_KEY="~/.ssh/protokol57_ed25519"
VPS_PATH="/opt/protokol57"
DOMAIN="p57.birfoiz.uz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run commands on VPS
run_on_vps() {
    ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST" "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp -i "$VPS_KEY" "$1" "$VPS_USER@$VPS_HOST:$2"
}

setup_vps() {
    log "Setting up VPS for Protokol57 production deployment..."
    
    # Update system
    log "Updating system packages..."
    run_on_vps "apt update && apt upgrade -y"
    
    # Install required packages
    log "Installing required packages..."
    run_on_vps "apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl jq bc htop"
    
    # Start and enable Docker
    log "Starting Docker service..."
    run_on_vps "systemctl start docker && systemctl enable docker"
    
    # Create protokol57 directory
    log "Creating application directory..."
    run_on_vps "mkdir -p $VPS_PATH"
    
    # Clone repository (if not exists)
    log "Setting up git repository..."
    if run_on_vps "[ ! -d $VPS_PATH/.git ]"; then
        run_on_vps "cd /opt && git clone https://github.com/yourusername/protokol57.git" || true
    fi
    
    # Copy nginx configuration
    log "Setting up nginx configuration..."
    copy_to_vps "./deploy/nginx.conf" "/etc/nginx/sites-available/protokol57"
    run_on_vps "ln -sf /etc/nginx/sites-available/protokol57 /etc/nginx/sites-enabled/"
    run_on_vps "rm -f /etc/nginx/sites-enabled/default"
    
    # Test nginx configuration
    run_on_vps "nginx -t"
    
    # Setup SSL certificates
    log "Setting up SSL certificates..."
    run_on_vps "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN" || {
        error "SSL setup failed. You may need to run this manually:"
        error "ssh -i $VPS_KEY $VPS_USER@$VPS_HOST 'certbot --nginx -d $DOMAIN'"
    }
    
    # Start nginx
    run_on_vps "systemctl start nginx && systemctl enable nginx"
    
    # Setup firewall
    log "Configuring firewall..."
    run_on_vps "ufw --force enable"
    run_on_vps "ufw allow ssh"
    run_on_vps "ufw allow 'Nginx Full'"
    run_on_vps "ufw allow 5000/tcp"
    
    # Setup log rotation
    log "Setting up log rotation..."
    run_on_vps "cat > /etc/logrotate.d/protokol57 << 'EOF'
/opt/protokol57/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF"
    
    # Setup cron job for SSL renewal
    log "Setting up SSL certificate auto-renewal..."
    run_on_vps "crontab -l | grep -v certbot; echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -"
    
    # Setup Docker cleanup cron job
    log "Setting up Docker cleanup..."
    run_on_vps "crontab -l | grep -v 'docker system prune'; echo '0 2 * * 0 /usr/bin/docker system prune -f' | crontab -"
    
    # Create systemd service for monitoring
    log "Setting up systemd service..."
    run_on_vps "cat > /etc/systemd/system/protokol57.service << 'EOF'
[Unit]
Description=Protokol57 Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/protokol57
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF"
    
    run_on_vps "systemctl daemon-reload"
    run_on_vps "systemctl enable protokol57"
    
    # Setup monitoring script on VPS
    log "Setting up monitoring on VPS..."
    copy_to_vps "./monitor.sh" "$VPS_PATH/monitor.sh"
    run_on_vps "chmod +x $VPS_PATH/monitor.sh"
    
    # Setup cron job for monitoring
    run_on_vps "crontab -l | grep -v 'monitor.sh'; echo '*/5 * * * * cd $VPS_PATH && ./monitor.sh check >> /var/log/protokol57-monitor.log 2>&1' | crontab -"
    
    success "VPS setup completed!"
    log "Next steps:"
    log "1. Run: ./deploy-production.sh deploy"
    log "2. Test: curl https://$DOMAIN/api/health"
    log "3. Monitor: ./monitor.sh check"
}

# Function to show VPS status
show_status() {
    log "Checking VPS status..."
    
    log "System information:"
    run_on_vps "uname -a"
    run_on_vps "uptime"
    run_on_vps "df -h /"
    run_on_vps "free -m"
    
    log "Docker status:"
    run_on_vps "docker --version"
    run_on_vps "docker-compose --version"
    run_on_vps "systemctl is-active docker"
    
    log "Nginx status:"
    run_on_vps "nginx -v"
    run_on_vps "systemctl is-active nginx"
    
    log "SSL certificates:"
    run_on_vps "certbot certificates" || echo "No certificates found"
    
    log "Application status:"
    run_on_vps "cd $VPS_PATH && docker-compose ps" || echo "No containers running"
}

# Parse command line arguments
case "${1:-setup}" in
    "setup")
        setup_vps
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {setup|status}"
        echo ""
        echo "Commands:"
        echo "  setup  - Setup VPS for production (default)"
        echo "  status - Show VPS status"
        exit 1
        ;;
esac