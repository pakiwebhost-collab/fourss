#!/usr/bin/env bash
# Daily backup of the CMS database and uploads. Add to crontab:
#   0 3 * * * bash /path/to/web/deploy/backup.sh >/dev/null 2>&1
set -euo pipefail
DATA_DIR="${DATA_DIR:-/var/lib/4ss-data}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/4ss-backups}"
STAMP="$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Consistent copy of the live SQLite database (safe while the site is running)
node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(process.argv[1]);d.exec(\"VACUUM INTO '\"+process.argv[2]+\"'\")" \
  "$DATA_DIR/site.db" "$BACKUP_DIR/site-$STAMP.db"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$DATA_DIR" uploads

# Keep 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete
