#!/bin/bash

# Protokol57 Configuration Validator
# This script checks for common configuration issues that break production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

echo "🔍 Protokol57 Configuration Validator"
echo "===================================="
echo ""

# Function to print errors
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to print warnings
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check 1: Volume mounts in production compose files
echo "Checking for volume mounts in production files..."
if [ -f "docker-compose.yml" ]; then
    if grep -q "volumes:" docker-compose.yml 2>/dev/null && grep -A5 "volumes:" docker-compose.yml | grep -q ":/app" 2>/dev/null; then
        error "docker-compose.yml contains volume mounts! This will break production."
        echo "    Found: $(grep -A5 'volumes:' docker-compose.yml | grep ':/app' | head -1)"
    else
        success "docker-compose.yml has no dangerous volume mounts"
    fi
fi

if [ -f "docker-compose.prod.yml" ]; then
    if grep -q "volumes:" docker-compose.prod.yml 2>/dev/null && grep -A5 "volumes:" docker-compose.prod.yml | grep -q ":/app" 2>/dev/null; then
        error "docker-compose.prod.yml contains volume mounts! This MUST be fixed."
        echo "    Found: $(grep -A5 'volumes:' docker-compose.prod.yml | grep ':/app' | head -1)"
    else
        success "docker-compose.prod.yml has no volume mounts (correct)"
    fi
fi

# Check 2: Log function in server/vite.ts
echo ""
echo "Checking log function implementation..."
if [ -f "server/vite.ts" ]; then
    if grep -q "console.log" server/vite.ts; then
        success "server/vite.ts has console.log in log function"
    else
        error "server/vite.ts log function is missing console.log! Server won't start."
    fi
fi

# Check 3: ESM configuration consistency
echo ""
echo "Checking ESM configuration..."
if [ -f "package.json" ]; then
    if grep -q '"type": "module"' package.json; then
        success "package.json has ESM module type"
        
        # Check build script
        if grep -q "format=esm" package.json; then
            success "Build script uses ESM format"
        else
            warning "Build script might not be using ESM format"
        fi
    else
        warning "package.json missing type: module"
    fi
fi

# Check 4: Health endpoint configuration
echo ""
echo "Checking health endpoint configuration..."
if [ -f "server/routes.ts" ]; then
    if grep -q '"/health"' server/routes.ts; then
        success "Health endpoint found at /health"
    else
        warning "Health endpoint might be misconfigured"
    fi
fi

# Check for docker-compose healthcheck using wrong endpoint
if grep -q "/api/health" docker-compose*.yml 2>/dev/null; then
    error "Docker healthcheck using /api/health instead of /health"
fi

# Check 5: Multiple docker-compose files confusion
echo ""
echo "Checking for multiple docker-compose files..."
COMPOSE_COUNT=$(ls docker-compose*.yml 2>/dev/null | wc -l)
if [ "$COMPOSE_COUNT" -gt 3 ]; then
    warning "Found $COMPOSE_COUNT docker-compose files. This might cause confusion."
    echo "    Files: $(ls docker-compose*.yml | tr '\n' ' ')"
fi

# Check 6: Environment files
echo ""
echo "Checking environment files..."
if [ -f ".env.production" ]; then
    success "Found .env.production"
    
    # Check for critical variables
    if grep -q "OPENAI_API_KEY=sk-proj-" .env.production; then
        success "OpenAI API key is configured"
    else
        warning "OpenAI API key might not be configured correctly"
    fi
else
    error ".env.production is missing!"
fi

# Check 7: Dockerfile issues
echo ""
echo "Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
    if grep -q "COPY package.json dist/" Dockerfile; then
        success "Dockerfile copies package.json to dist"
    else
        warning "Dockerfile might not copy package.json to dist directory"
    fi
fi

# Summary
echo ""
echo "===================================="
echo "Validation Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        success "All checks passed! Configuration looks good."
    else
        warning "Configuration has warnings but should work."
    fi
    exit 0
else
    error "Configuration has errors that MUST be fixed before deployment!"
    echo ""
    echo "Most common fixes:"
    echo "1. Remove volume mounts from production docker-compose files"
    echo "2. Ensure console.log exists in server/vite.ts log function"
    echo "3. Use docker-compose.prod.yml for production deployments"
    exit 1
fi