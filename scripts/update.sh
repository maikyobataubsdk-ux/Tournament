#!/usr/bin/env bash
set -e

echo "🔄 Updating Booyahesports Platform..."

# 1. Take snapshot backup before update
./scripts/backup.sh

# 2. Pull git changes
git pull origin main || git pull

# 3. Rebuild and restart containers with zero prolonged downtime
docker compose build
docker compose up -d

# 4. Verify health
./scripts/healthcheck.sh

echo "✅ Update successfully applied!"
