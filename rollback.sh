#!/bin/bash

# Rollback Script for Protokol57
# Quickly switches back to the previous deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_status "🔄 Starting Rollback Process"
echo "================================"

# Get current deployment
CURRENT_CONTAINER=$(docker ps --filter 'label=protokol57.deployment' --format '{{.Names}}' | head -1)

if [ -z "$CURRENT_CONTAINER" ]; then
    print_error "No current deployment found!"
    exit 1
fi

# Determine rollback target
if [[ "$CURRENT_CONTAINER" == *"blue"* ]]; then
    ROLLBACK_COLOR="green"
    CURRENT_COLOR="blue"
else
    ROLLBACK_COLOR="blue"
    CURRENT_COLOR="green"
fi

print_info "Current deployment: $CURRENT_COLOR"
print_info "Rolling back to: $ROLLBACK_COLOR"

# Check if rollback compose file exists
if [ ! -f "docker-compose.${ROLLBACK_COLOR}.yml" ]; then
    print_error "No previous deployment found to rollback to!"
    print_info "Available compose files:"
    ls -la docker-compose.*.yml
    exit 1
fi

# Start the old container
print_status "Starting previous container (${ROLLBACK_COLOR})..."
docker compose -f docker-compose.${ROLLBACK_COLOR}.yml up -d

# Wait for health check
print_status "Waiting for container to be healthy..."
sleep 10

ATTEMPTS=0
MAX_ATTEMPTS=6
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if docker exec protokol57-${ROLLBACK_COLOR} curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
        print_status "✓ Container protokol57-${ROLLBACK_COLOR} is healthy"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    print_info "Health check attempt $ATTEMPTS/$MAX_ATTEMPTS..."
    sleep 5
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    print_error "Rollback container failed health checks!"
    docker compose -f docker-compose.${ROLLBACK_COLOR}.yml down
    exit 1
fi

# Update symlink
print_status "Updating deployment symlink..."
ln -sf docker-compose.${ROLLBACK_COLOR}.yml docker-compose.current.yml

# Stop current container
print_status "Stopping current container..."
docker kill --signal=SIGTERM protokol57-${CURRENT_COLOR} || true
timeout 30 docker wait protokol57-${CURRENT_COLOR} || true
docker rm -f protokol57-${CURRENT_COLOR} || true

print_status "✅ Rollback Complete!"
print_info "Active deployment: ${ROLLBACK_COLOR}"
print_info "Container: protokol57-${ROLLBACK_COLOR}"