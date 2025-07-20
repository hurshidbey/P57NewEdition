#!/bin/bash
set -e

echo "🔧 Setting up NGINX configuration for new domains..."

SERVER="root@69.62.126.73"
SSH_KEY="~/.ssh/protokol57_ed25519"

ssh -i $SSH_KEY $SERVER << 'ENDSSH'
# Create NGINX config for new domains
cat > /etc/nginx/sites-available/app-p57 << 'EOF'
# app.p57.uz - Main Application
server {
    listen 80;
    server_name app.p57.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.p57.uz;
    
    ssl_certificate /etc/letsencrypt/live/app.p57.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.p57.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# api.p57.uz - API Endpoint
server {
    listen 80;
    server_name api.p57.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.p57.uz;
    
    ssl_certificate /etc/letsencrypt/live/api.p57.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.p57.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# Update existing p57.birfoiz.uz to redirect
cat > /etc/nginx/sites-available/p57-birfoiz-redirect << 'EOF'
server {
    listen 80;
    server_name p57.birfoiz.uz;
    return 301 https://app.p57.uz$request_uri;
}

server {
    listen 443 ssl http2;
    server_name p57.birfoiz.uz;
    
    ssl_certificate /etc/letsencrypt/live/p57.birfoiz.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/p57.birfoiz.uz/privkey.pem;
    
    return 301 https://app.p57.uz$request_uri;
}
EOF

# Enable new configs
ln -sf /etc/nginx/sites-available/app-p57 /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/p57-birfoiz-redirect /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx

echo "✅ NGINX configuration updated!"
ENDSSH