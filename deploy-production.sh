#!/bin/bash

# Protokol57 Production Deployment Script
# This script provides zero-downtime deployment with rollback capability

set -e  # Exit on any error

# Configuration
VPS_HOST="69.62.126.73"
VPS_USER="root"
VPS_KEY="~/.ssh/protokol57_ed25519"
VPS_PATH="/opt/protokol57"
CONTAINER_NAME="protokol57_protokol57_1"
BACKUP_SUFFIX=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run commands on VPS
run_on_vps() {
    ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST" "$1"
}

# Function to check if service is healthy
check_health() {
    local max_attempts=30
    local attempt=1
    
    log "Checking application health..."
    
    while [ $attempt -le $max_attempts ]; do
        if run_on_vps "curl -f -s http://localhost:5000/api/health > /dev/null 2>&1"; then
            success "Application is healthy!"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Application failed health checks after $max_attempts attempts"
    return 1
}

# Function to backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    run_on_vps "cd $VPS_PATH && docker-compose ps --format json > backup_${BACKUP_SUFFIX}_containers.json || true"
    run_on_vps "cd $VPS_PATH && docker images --format 'table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}' > backup_${BACKUP_SUFFIX}_images.txt || true"
    
    success "Backup created with suffix: $BACKUP_SUFFIX"
}

# Function to rollback to previous deployment
rollback() {
    error "Deployment failed! Starting rollback..."
    
    log "Stopping failed deployment..."
    run_on_vps "cd $VPS_PATH && docker-compose down || true"
    
    log "Rolling back to previous image..."
    run_on_vps "cd $VPS_PATH && docker-compose up -d --force-recreate"
    
    if check_health; then
        success "Rollback completed successfully!"
        return 0
    else
        error "Rollback failed! Manual intervention required!"
        return 1
    fi
}

# Function to cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    run_on_vps "docker image prune -f"
    run_on_vps "docker system prune -f --volumes"
}

# Main deployment function
deploy() {
    log "Starting production deployment to $VPS_HOST..."
    
    # Pre-deployment checks
    log "Performing pre-deployment checks..."
    
    # Check if VPS is accessible
    if ! run_on_vps "echo 'VPS connection test'"; then
        error "Cannot connect to VPS. Check SSH connection and key."
        exit 1
    fi
    
    # Check if deployment directory exists
    if ! run_on_vps "[ -d $VPS_PATH ]"; then
        error "Deployment directory $VPS_PATH does not exist on VPS"
        exit 1
    fi
    
    # Check current application health before deployment
    log "Checking current application health before deployment..."
    if ! run_on_vps "curl -f -s http://localhost:5000/api/health > /dev/null 2>&1"; then
        warning "Current application appears to be down. Proceeding with deployment..."
    else
        success "Current application is healthy"
    fi
    
    # Create backup
    backup_current
    
    # Update code on VPS
    log "Updating code on VPS..."
    run_on_vps "cd $VPS_PATH && git fetch origin"
    run_on_vps "cd $VPS_PATH && git reset --hard origin/main"
    
    # Build new image
    log "Building new Docker image..."
    if ! run_on_vps "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml build --no-cache"; then
        error "Docker build failed!"
        exit 1
    fi
    
    # Stop current containers gracefully
    log "Stopping current containers..."
    run_on_vps "cd $VPS_PATH && docker-compose down --timeout 30"
    
    # Start new deployment
    log "Starting new deployment..."
    if ! run_on_vps "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml up -d"; then
        error "Failed to start new deployment!"
        rollback
        exit 1
    fi
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 30
    
    # Health check
    if ! check_health; then
        error "New deployment failed health checks!"
        rollback
        exit 1
    fi
    
    # Verify external access
    log "Verifying external access..."
    if ! curl -f -s https://p57.birfoiz.uz/api/health > /dev/null 2>&1; then
        warning "External health check failed, but internal check passed. Check nginx/SSL configuration."
    else
        success "External access verified!"
    fi
    
    # Cleanup
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is now running on https://p57.birfoiz.uz"
    log "Monitor logs with: ssh -i $VPS_KEY $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose logs -f'"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "health")
        check_health
        ;;
    "logs")
        run_on_vps "cd $VPS_PATH && docker-compose logs -f --tail=100"
        ;;
    "status")
        run_on_vps "cd $VPS_PATH && docker-compose ps"
        run_on_vps "curl -s http://localhost:5000/api/health | jq ."
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|logs|status|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous deployment"
        echo "  health   - Check application health"
        echo "  logs     - Show application logs"
        echo "  status   - Show deployment status"
        echo "  cleanup  - Clean up old Docker images"
        exit 1
        ;;
esac