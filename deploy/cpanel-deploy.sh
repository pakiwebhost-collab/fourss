#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/home/websitemake4u/repositories/fourss"
APP="/home/websitemake4u/apps/fourss"
DATA="/home/websitemake4u/4ss-data"

export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"

echo "=== 4S Security Deployment ==="

# Stop safely if persistent settings or database are missing
test -f "$APP/.env.production" || {
  echo "ERROR: Production environment missing"
  exit 1
}

test -s "$DATA/site.db" || {
  echo "ERROR: SQLite database missing"
  exit 1
}

mkdir -p "$APP/tmp" "$DATA/uploads"

# Sync project code without touching private/persistent data
rsync -a \
  --exclude='.git/' \
  --exclude='.env*' \
  --exclude='data/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='tmp/' \
  --exclude='logs/' \
  --exclude='uploads/' \
  --exclude='public/uploads/' \
  "$REPO/" "$APP/"

cd "$APP"

echo "Installing dependencies..."
npm ci --include=dev

echo "Building production website..."
NODE_OPTIONS="--max-old-space-size=2048" \
  npm run build -- --webpack

test -f "$APP/.next/BUILD_ID" || {
  echo "ERROR: Production build missing"
  exit 1
}

echo "Signaling Passenger restart..."
touch "$APP/tmp/restart.txt"

echo "Deployment completed."