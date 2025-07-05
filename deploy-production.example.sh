#!/bin/bash

# Production Deployment Script for Protokol57
# Copy this file to deploy-production.sh and update the configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
SSH_KEY="$HOME/.ssh/your-ssh-key"
SERVER_USER="your-server-user"
SERVER_HOST="your.server.ip.address"
PROJECT_DIR="/opt/protokol57"
LOCAL_PROJECT_DIR="$(pwd)"

# Function to print colored output
print_step() {
    echo -e "${BLUE}===> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to execute commands on server
ssh_exec() {
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "$1"
}

# Start deployment
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Protokol57 Production Deployment${NC}"
echo -e "${BLUE}==================================================${NC}"

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

# Check if .env.production exists
if [ ! -f "$LOCAL_PROJECT_DIR/.env.production" ]; then
    print_error ".env.production not found! Copy .env.production.example and configure it."
    exit 1
fi

# Step 2: Copy .env.production to server
print_step "Copying .env.production to server..."
scp -i "$SSH_KEY" "$LOCAL_PROJECT_DIR/.env.production" "$SERVER_USER@$SERVER_HOST:$PROJECT_DIR/.env.production"
print_success "Environment file copied"

# Step 3: Pull latest code on server
print_step "Pulling latest code on server..."
ssh_exec "cd $PROJECT_DIR && git pull"
print_success "Code updated"

# Step 4: Clear Docker caches
print_step "Clearing Docker caches..."
ssh_exec "docker system prune -f"
print_success "Docker caches cleared"

# Step 5: Rebuild and restart containers
print_step "Rebuilding and restarting containers..."
ssh_exec "cd $PROJECT_DIR && docker compose down && docker compose build --no-cache && docker compose up -d"
print_success "Containers rebuilt and started"

# Step 6: Verify deployment
print_step "Verifying deployment..."
sleep 10  # Wait for containers to start

# Check if containers are running
CONTAINERS=$(ssh_exec "docker ps --format '{{.Names}}' | grep protokol57 || true")
if [ -z "$CONTAINERS" ]; then
    print_error "No protokol57 containers running!"
    exit 1
fi

print_success "Deployment completed successfully!"
echo -e "${GREEN}Site should be live at: https://p57.birfoiz.uz${NC}"