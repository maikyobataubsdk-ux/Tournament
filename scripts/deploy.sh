#!/usr/bin/env bash
set -e

echo "🚀 Deploying Booyahesports Platform on VPS..."

# 1. Ensure persistent data directories exist
mkdir -p data/backups releases uploads assets

# 2. Set strict file permissions on database directory
chmod 750 data data/backups

# 3. Create .env if not exists
if [ ! -f .env ]; then
    echo "⚠️ .env not found. Running setup wizard..."
    ./scripts/setup-domain.sh
fi

# 4. Pull and build containers
echo "📦 Building and starting application containers..."
docker compose build
docker compose up -d

# 5. Verify Health
echo "🩺 Verifying system health..."
sleep 5
./scripts/healthcheck.sh

echo "🎉 Deployment Complete! Access Booyahesports at https://${DOMAIN:-Booyahesports.in}"
