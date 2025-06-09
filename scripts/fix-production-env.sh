#!/bin/bash

# Fix production environment variables script
echo "🔧 Fixing production environment variables..."

# Update production .env file with ATMOS credentials
cat >> /opt/protokol57/.env << 'EOF'

# ATMOS Payment Gateway (CRITICAL - DO NOT REMOVE)
ATMOS_STORE_ID=1981
ATMOS_CONSUMER_KEY=UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a
ATMOS_CONSUMER_SECRET=JCuvoGpaV6VHf3migqRy7r6qtiMa
ATMOS_ENV=production
EOF

echo "✅ ATMOS credentials added to production .env"

# Ensure proper environment variable loading for PM2
echo "🔄 Restarting application..."
pm2 restart protokol57 --update-env

echo "✅ Production environment fixed!"