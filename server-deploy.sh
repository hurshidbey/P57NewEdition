#!/bin/bash

# Protokol57 Server Deployment Script
# This script runs on the VPS server to handle deployments

set -e  # Exit on error

echo "🚀 Starting deployment from GitHub..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Load production environment variables
echo "🔐 Loading environment variables..."
if [ -f .env ]; then
    # Export all variables from .env file
    export $(cat .env | grep -E '^(VITE_|NODE_ENV|PORT)' | xargs)
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Build application with environment variables
echo "🔨 Building application..."
npm run build

# Restart application
echo "🔄 Restarting application..."
pm2 restart protokol57 --update-env

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"