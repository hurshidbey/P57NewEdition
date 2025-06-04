#!/bin/bash

# Protokol 57 Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on error

# Configuration
APP_NAME="protokol57"
APP_DIR="/home/$APP_NAME/$APP_NAME"
REPO_URL="https://github.com/yourusername/protokol57.git"  # Update this
BRANCH="main"

echo "🚀 Starting deployment of Protokol 57..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root. Please run as the protokol57 user."
   exit 1
fi

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git fetch origin
git reset --hard origin/$BRANCH

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations if needed
echo "🗄️  Checking database..."
# Uncomment if you have migrations
# npm run db:push

# Restart the application
echo "🔄 Restarting application..."

# If using PM2
if command_exists pm2; then
    pm2 restart $APP_NAME
    pm2 save
    echo "✅ Application restarted with PM2"

# If using systemd
elif systemctl is-active --quiet $APP_NAME; then
    sudo systemctl restart $APP_NAME
    echo "✅ Application restarted with systemd"
else
    echo "❌ No process manager found. Please start the application manually."
    exit 1
fi

# Clear any cache
echo "🧹 Clearing cache..."
# Add any cache clearing commands here

# Test if the application is running
echo "🧪 Testing application..."
sleep 5  # Give the app time to start

if curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application failed to start. Check logs for details."
    
    # Show recent logs
    if command_exists pm2; then
        pm2 logs $APP_NAME --lines 50
    else
        sudo journalctl -u $APP_NAME -n 50
    fi
    
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Application status:"

if command_exists pm2; then
    pm2 status $APP_NAME
else
    sudo systemctl status $APP_NAME --no-pager
fi