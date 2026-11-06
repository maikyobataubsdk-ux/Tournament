#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"
HOST="${HOST:-localhost}"

echo "Checking Booyahesports API Health on http://$HOST:$PORT/api/v1/app/health..."
HEALTH=$(curl -s "http://$HOST:$PORT/api/v1/app/health" || echo "FAILED")

if [[ "$HEALTH" =~ "healthy" ]]; then
    echo "✅ Booyahesports API is healthy and database is connected!"
    echo "$HEALTH"
else
    echo "❌ Booyahesports API healthcheck failed:"
    echo "$HEALTH"
    exit 1
fi
