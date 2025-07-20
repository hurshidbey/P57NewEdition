#!/bin/bash

# Domain Migration Script for P57
# This script helps migrate from hardcoded domains to environment-based configuration

set -e

echo "==========================================="
echo "P57 Domain Migration Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Function to check if environment variable exists
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}Warning: $var_name is not set${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $var_name = $var_value${NC}"
        return 0
    fi
}

# Function to update .env file
update_env_file() {
    local file=$1
    local key=$2
    local value=$3
    
    if [ -f "$file" ]; then
        # Check if key exists
        if grep -q "^$key=" "$file"; then
            # Update existing
            sed -i.bak "s|^$key=.*|$key=$value|" "$file"
            echo -e "${GREEN}✓ Updated $key in $file${NC}"
        else
            # Add new
            echo "$key=$value" >> "$file"
            echo -e "${GREEN}✓ Added $key to $file${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: $file not found${NC}"
    fi
}

echo "1. Checking current domain configuration..."
echo "==========================================="

# Required domain environment variables
REQUIRED_VARS=(
    "LANDING_DOMAIN"
    "APP_DOMAIN"
    "API_DOMAIN"
    "PRIMARY_DOMAIN"
)

# Check each required variable
missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env_var "$var"; then
        ((missing_vars++))
    fi
done

# Optional variables
echo ""
echo "Optional variables:"
check_env_var "BACKUP_DOMAINS"
check_env_var "CORS_ALLOWED_ORIGINS"

echo ""
echo "2. Setting up default domain configuration..."
echo "==========================================="

if [ $missing_vars -gt 0 ]; then
    echo -e "${YELLOW}Setting default values for missing variables...${NC}"
    
    # Default values
    DEFAULT_LANDING="https://p57.uz"
    DEFAULT_APP="https://app.p57.uz"
    DEFAULT_API="https://api.p57.uz"
    DEFAULT_PRIMARY="p57.uz"
    DEFAULT_BACKUP="https://protokol.1foiz.com,https://p57.birfoiz.uz,https://srv852801.hstgr.cloud"
    DEFAULT_CORS="https://p57.uz,https://www.p57.uz,https://app.p57.uz,https://api.p57.uz,https://protokol.1foiz.com,https://p57.birfoiz.uz,https://srv852801.hstgr.cloud"
    
    # Update .env.production
    if [ -f ".env.production" ]; then
        echo "Updating .env.production..."
        
        [ -z "$LANDING_DOMAIN" ] && update_env_file ".env.production" "LANDING_DOMAIN" "$DEFAULT_LANDING"
        [ -z "$APP_DOMAIN" ] && update_env_file ".env.production" "APP_DOMAIN" "$DEFAULT_APP"
        [ -z "$API_DOMAIN" ] && update_env_file ".env.production" "API_DOMAIN" "$DEFAULT_API"
        [ -z "$PRIMARY_DOMAIN" ] && update_env_file ".env.production" "PRIMARY_DOMAIN" "$DEFAULT_PRIMARY"
        [ -z "$BACKUP_DOMAINS" ] && update_env_file ".env.production" "BACKUP_DOMAINS" "$DEFAULT_BACKUP"
        [ -z "$CORS_ALLOWED_ORIGINS" ] && update_env_file ".env.production" "CORS_ALLOWED_ORIGINS" "$DEFAULT_CORS"
    fi
fi

echo ""
echo "3. Checking code for hardcoded domains..."
echo "==========================================="

# Search for hardcoded domains
HARDCODED_PATTERNS=(
    "p57\.uz"
    "app\.p57\.uz"
    "api\.p57\.uz"
    "p57\.birfoiz\.uz"
    "protokol\.1foiz\.com"
    "srv852801\.hstgr\.cloud"
)

echo "Searching for hardcoded domain references..."
found_hardcoded=0

for pattern in "${HARDCODED_PATTERNS[@]}"; do
    # Search in TypeScript/JavaScript files, excluding node_modules and dist
    results=$(grep -r "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
              --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
              --exclude="*domains.ts" --exclude="*.test.*" --exclude="*.spec.*" . 2>/dev/null || true)
    
    if [ ! -z "$results" ]; then
        echo -e "${YELLOW}Found hardcoded references to $pattern:${NC}"
        echo "$results" | head -5
        echo "..."
        ((found_hardcoded++))
    fi
done

if [ $found_hardcoded -eq 0 ]; then
    echo -e "${GREEN}✓ No hardcoded domain references found in code!${NC}"
else
    echo -e "${YELLOW}Warning: Found $found_hardcoded patterns with hardcoded domains${NC}"
    echo "These should be replaced with imports from shared/config/domains.ts"
fi

echo ""
echo "4. Verifying domain configuration module..."
echo "==========================================="

if [ -f "shared/config/domains.ts" ]; then
    echo -e "${GREEN}✓ Domain configuration module exists${NC}"
    
    # Check if it exports required functions
    if grep -q "export const DOMAINS" shared/config/domains.ts && \
       grep -q "export const getEmailAddresses" shared/config/domains.ts && \
       grep -q "export const getServiceUrls" shared/config/domains.ts; then
        echo -e "${GREEN}✓ All required exports found${NC}"
    else
        echo -e "${YELLOW}Warning: Some exports may be missing from domains.ts${NC}"
    fi
else
    echo -e "${RED}Error: shared/config/domains.ts not found${NC}"
fi

echo ""
echo "5. Next Steps:"
echo "==========================================="
echo "1. Ensure all environment variables are set in production"
echo "2. Update external services (OAuth, payment gateways) with new domains"
echo "3. Test domain failover mechanism"
echo "4. Update DNS records if needed"
echo "5. Deploy with confidence!"

echo ""
echo -e "${GREEN}Domain migration check complete!${NC}"