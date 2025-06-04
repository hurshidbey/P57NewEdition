# VPS Deployment Guide for Protokol 57

This guide covers deploying the Protokol 57 application on a VPS (Ubuntu/Debian).

## Prerequisites

- Ubuntu 20.04+ or Debian 11+ VPS
- Root or sudo access
- Domain name (optional, but recommended)
- At least 1GB RAM

## Step 1: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Create Application User

```bash
# Create a dedicated user for the app
sudo useradd -m -s /bin/bash protokol57
sudo usermod -aG sudo protokol57

# Switch to the new user
sudo su - protokol57
```

## Step 3: Clone and Setup Application

```bash
# Clone your repository
git clone <your-repo-url> ~/protokol57
cd ~/protokol57

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
nano .env

# Install dependencies
npm install

# Build the application
npm run build
```

## Step 4: Setup Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start dist/index.js --name protokol57 --env production

# Save PM2 process list and setup startup script
pm2 save
pm2 startup systemd -u protokol57 --hp /home/protokol57
```

## Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/protokol57

# Add the configuration (see nginx.conf file)
# Enable the site
sudo ln -s /etc/nginx/sites-available/protokol57 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Setup SSL (if using domain)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 8: Setup Automatic Updates

```bash
# Create update script
nano ~/protokol57/scripts/update.sh

# Add to crontab for automatic updates
crontab -e
# Add: 0 2 * * * /home/protokol57/protokol57/scripts/update.sh
```

## Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs protokol57

# Monitor resources
pm2 monit
```

## Troubleshooting

1. **Port already in use**: Change PORT in .env file
2. **Database connection issues**: Verify Supabase credentials
3. **Memory issues**: Increase swap or upgrade VPS
4. **502 Bad Gateway**: Check if app is running with `pm2 list`

## Security Recommendations

1. Enable automatic security updates
2. Configure fail2ban
3. Use SSH keys instead of passwords
4. Regular backups
5. Monitor server logs