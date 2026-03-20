#!/bin/bash
# ============================================
# Travel Tracker - Server Setup Script
# Run this ONCE on a fresh Ubuntu server
# ============================================

set -e

echo "=========================================="
echo "  Travel Tracker - Server Setup"
echo "=========================================="

# Update system
echo "[1/5] Updating system..."
apt-get update && apt-get upgrade -y

# Install Docker
echo "[2/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "[3/5] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Install git
echo "[4/5] Installing git..."
apt-get install -y git

# Create app directory
echo "[5/5] Setting up app directory..."
mkdir -p /opt/travel-tracker
cd /opt/travel-tracker

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Clone the repo:"
echo "     cd /opt/travel-tracker"
echo "     git clone git@github.com:m0stafa7med/travel-tracker.git ."
echo ""
echo "  2. Create .env file:"
echo "     cp deploy/.env.example .env"
echo "     nano .env  # Set your passwords and Mapbox token"
echo ""
echo "  3. Run deploy script:"
echo "     bash deploy/deploy.sh"
echo ""
