#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore.sh <backup_filename_or_path>"
    echo "Example: ./scripts/restore.sh database_cli_20250501_120000.json"
    exit 1
fi

TARGET="$1"
DB_FILE="${DATA_DIR:-./data}/database.json"

if [ ! -f "$TARGET" ]; then
    TARGET="./data/backups/$1"
fi

if [ -f "$TARGET" ]; then
    # Verify valid JSON before restoring
    python3 -c "import json; json.load(open('$TARGET'))"
    cp "$TARGET" "$DB_FILE"
    chmod 600 "$DB_FILE"
    echo "✅ Database successfully restored from $TARGET"
else
    echo "❌ Error: Backup file not found at $TARGET"
    exit 1
fi
