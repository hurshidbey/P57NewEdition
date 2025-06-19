#!/bin/bash

# Production Deployment Script for Protokol57
# Provides zero-downtime deployment with automatic rollback capability

set -e  # Exit on any error

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
BACKUP_DIR="/opt/protokol57-backups"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_CHECK_URL="https://p57.birfoiz.uz/api/health"
MAX_ROLLBACK_ATTEMPTS=3
HEALTH_CHECK_TIMEOUT=60

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

# Function to check if service is healthy
check_health() {
    local max_attempts=${1:-30}
    local attempt=1
    
    print_status "Checking application health..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            print_success "Application is healthy (attempt $attempt/$max_attempts)"
            return 0
        fi
        
        print_status "Health check failed, attempt $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Function to create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="protokol57_backup_$timestamp"
    
    print_status "Creating backup: $backup_name"
    
    # Create backup directory if it doesn't exist
    execute_remote "mkdir -p $BACKUP_DIR"
    
    # Stop current container gracefully and create backup
    execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE ps -q | head -1 | xargs -r docker commit - $backup_name"
    
    # Save backup metadata
    execute_remote "cd $APP_DIR && echo '{\"timestamp\":\"$timestamp\",\"commit\":\"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",\"image\":\"$backup_name\"}' > $BACKUP_DIR/$backup_name.json"
    
    print_success "Backup created: $backup_name"
    echo "$backup_name"
}

# Function to rollback to previous version
rollback() {
    local backup_name="$1"
    
    if [ -z "$backup_name" ]; then
        # Find latest backup
        backup_name=$(execute_remote "ls -t $BACKUP_DIR/*.json 2>/dev/null | head -1 | xargs -r basename -s .json" || echo "")
        
        if [ -z "$backup_name" ]; then
            print_error "No backup found for rollback"
            return 1
        fi
    fi
    
    print_warning "Rolling back to: $backup_name"
    
    # Stop current services
    execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE down --timeout 30"
    
    # Start with backup image
    execute_remote "cd $APP_DIR && docker run -d --name protokol57_rollback -p 5001:5000 --restart unless-stopped $backup_name"
    
    # Check if rollback is successful
    sleep 10
    if check_health 12; then
        print_success "Rollback successful"
        
        # Clean up rollback container and restore docker-compose
        execute_remote "docker stop protokol57_rollback && docker rm protokol57_rollback"
        execute_remote "cd $APP_DIR && docker tag $backup_name protokol57_protokol57:latest"
        execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE up -d"
        
        return 0
    else
        print_error "Rollback failed"
        return 1
    fi
}

# Function to deploy application
deploy() {
    print_status "Starting production deployment..."
    
    # Check if SSH connection works
    if ! execute_remote "echo 'SSH connection successful'"; then
        print_error "Cannot connect to VPS"
        return 1
    fi
    
    # Create backup before deployment
    local backup_name=$(create_backup)
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    execute_remote "cd $APP_DIR && git fetch origin && git reset --hard origin/main"
    
    # Clear Docker cache for clean build
    print_status "Clearing Docker build cache..."
    execute_remote "cd $APP_DIR && docker system prune -f"
    
    # Build new image
    print_status "Building new Docker image..."
    if ! execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE build --no-cache"; then
        print_error "Docker build failed"
        print_warning "Attempting rollback..."
        rollback "$backup_name"
        return 1
    fi
    
    # Stop old container gracefully
    print_status "Stopping old container..."
    execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE down --timeout 30"
    
    # Start new container
    print_status "Starting new container..."
    if ! execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE up -d"; then
        print_error "Failed to start new container"
        print_warning "Attempting rollback..."
        rollback "$backup_name"
        return 1
    fi
    
    # Wait for container to start
    sleep 15
    
    # Health check
    if check_health 20; then
        print_success "Deployment successful!"
        
        # Clean up old images (keep last 3)
        execute_remote "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}' | grep protokol57 | tail -n +4 | awk '{print \$1\":\"\$2}' | xargs -r docker rmi" || true
        
        # Clean up old backups (keep last 5)
        execute_remote "ls -t $BACKUP_DIR/*.json 2>/dev/null | tail -n +6 | xargs -r rm" || true
        
        return 0
    else
        print_error "Health check failed after deployment"
        print_warning "Attempting rollback..."
        rollback "$backup_name"
        return 1
    fi
}

# Function to show status
show_status() {
    print_status "Checking production status..."
    
    # Check VPS connection
    if execute_remote "echo 'VPS connection: OK'"; then
        print_success "VPS connection: OK"
    else
        print_error "VPS connection: FAILED"
        return 1
    fi
    
    # Check Docker services
    local container_status=$(execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE ps --format 'table {{.Name}}\t{{.Status}}'" 2>/dev/null || echo "No containers")
    echo "Container Status:"
    echo "$container_status"
    
    # Check application health
    if check_health 3; then
        print_success "Application: HEALTHY"
    else
        print_warning "Application: UNHEALTHY"
    fi
    
    # Show resource usage
    local memory_usage=$(execute_remote "free -h | grep Mem")
    local disk_usage=$(execute_remote "df -h / | tail -1")
    
    echo ""
    echo "Resource Usage:"
    echo "Memory: $memory_usage"
    echo "Disk:   $disk_usage"
    
    # Show recent logs
    echo ""
    echo "Recent logs (last 10 lines):"
    execute_remote "cd $APP_DIR && docker compose -f $DOCKER_COMPOSE_FILE logs --tail=10 --timestamps" 2>/dev/null || echo "No logs available"
}

# Function to show help
show_help() {
    echo "Production Deployment Script for Protokol57"
    echo ""
    echo "Usage: $0 {deploy|status|rollback [backup_name]|help}"
    echo ""
    echo "Commands:"
    echo "  deploy              Deploy latest version to production"
    echo "  status              Show current production status"
    echo "  rollback [backup]   Rollback to previous version (or specified backup)"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                                    # Deploy latest version"
    echo "  $0 status                                    # Check status"
    echo "  $0 rollback                                  # Rollback to latest backup"
    echo "  $0 rollback protokol57_backup_20241219_143052 # Rollback to specific backup"
}

# Main script logic
case "${1:-help}" in
    "deploy")
        deploy
        ;;
    "status")
        show_status
        ;;
    "rollback")
        rollback "$2"
        ;;
    "help"|*)
        show_help
        ;;
esac