#!/usr/bin/env bash
set -e

BACKUP_DIR="${DATA_DIR:-./data}/backups"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
DB_FILE="${DATA_DIR:-./data}/database.json"

mkdir -p "$BACKUP_DIR"

if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/database_cli_$TIMESTAMP.json"
    chmod 600 "$BACKUP_DIR/database_cli_$TIMESTAMP.json"
    echo "✅ Database backup created: $BACKUP_DIR/database_cli_$TIMESTAMP.json"
else
    echo "❌ Error: Database file not found at $DB_FILE"
    exit 1
fi
