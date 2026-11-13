#!/usr/bin/env bash
# One-time server setup for Ubuntu 22.04/24.04 (run as a sudo user from the project folder).
#   bash deploy/setup-ubuntu.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${DATA_DIR:-/var/lib/4ss-data}"

echo "==> Installing Node.js 24, Nginx, Certbot"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(`.`)[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo npm install -g pm2

echo "==> Preparing data folder at $DATA_DIR"
sudo mkdir -p "$DATA_DIR"
sudo chown -R "$USER":"$USER" "$DATA_DIR"
if [ -d "$APP_DIR/data" ] && [ ! -f "$DATA_DIR/site.db" ]; then
  cp -r "$APP_DIR/data/." "$DATA_DIR/"
  echo "    Copied bundled database into $DATA_DIR"
fi

if [ ! -f "$APP_DIR/.env.production" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env.production"
  SECRET="$(node -e 'console.log(require(`crypto`).randomBytes(48).toString(`hex`))')"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$SECRET|" "$APP_DIR/.env.production"
  sed -i "s|^# DATA_DIR=.*|DATA_DIR=$DATA_DIR|" "$APP_DIR/.env.production"
  echo "    Created .env.production. Edit it now to add SMTP details, then re-run this script."
  exit 0
fi

echo "==> Installing dependencies and building"
cd "$APP_DIR"
npm ci
npm run build

echo "==> Starting with PM2"
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null

echo "==> Configuring Nginx"
sudo cp deploy/nginx-4ssecurity.conf /etc/nginx/sites-available/4ssecurity
sudo ln -sf /etc/nginx/sites-available/4ssecurity /etc/nginx/sites-enabled/4ssecurity
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo
echo "Done. Point the domain's DNS A record to this server, then run:"
echo "  sudo certbot --nginx -d 4ssecurity.pk -d www.4ssecurity.pk"
