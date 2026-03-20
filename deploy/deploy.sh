#!/bin/bash
# ============================================
# Travel Tracker - Deploy Script
# Run this to deploy or update the app
# ============================================

set -e

APP_DIR="/opt/travel-tracker"
DOMAIN="travel.mostafadarwesh.com"

cd "$APP_DIR"

# Load environment variables
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Run: cp deploy/.env.example .env && nano .env"
    exit 1
fi

source .env

echo "=========================================="
echo "  Deploying Travel Tracker"
echo "=========================================="

# Pull latest code
echo "[1/5] Pulling latest code..."
git pull origin main

# Check if SSL certificate exists
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if docker volume ls | grep -q "travel-tracker_certbot_data"; then
    # Check if cert exists inside the volume
    CERT_EXISTS=$(docker run --rm -v travel-tracker_certbot_data:/etc/letsencrypt alpine sh -c "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")
else
    CERT_EXISTS="no"
fi

if [ "$CERT_EXISTS" = "no" ]; then
    echo "[2/5] Obtaining SSL certificate..."

    # Use HTTP-only nginx config first
    cp deploy/nginx-init.conf deploy/nginx-active.conf

    # Create temp docker-compose override to use init config
    docker compose -f docker-compose.prod.yml up -d --build database backend frontend

    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 15

    # Start nginx with HTTP-only config
    docker compose -f docker-compose.prod.yml up -d nginx

    sleep 5

    # Get SSL certificate
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$ADMIN_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    echo "SSL certificate obtained!"

    # Switch to full HTTPS nginx config
    echo "[3/5] Switching to HTTPS..."
    docker compose -f docker-compose.prod.yml down
else
    echo "[2/5] SSL certificate already exists"
    echo "[3/5] Deploying with HTTPS..."
fi

# Build and start all services with HTTPS
echo "[4/5] Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo "[5/5] Waiting for services..."
sleep 10

# Health check
echo ""
echo "=========================================="
echo "  Checking service health..."
echo "=========================================="

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:80" | grep -q "301\|200"; then
    echo "  Frontend: OK"
else
    echo "  Frontend: ISSUE (may still be starting)"
fi

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/stats" | grep -q "200"; then
    echo "  Backend:  OK"
else
    echo "  Backend:  ISSUE (may still be starting)"
fi

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  https://$DOMAIN"
echo "=========================================="
