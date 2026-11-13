#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

REPO="/home/websitemake4u/repositories/fourss"
APP="/home/websitemake4u/apps/fourss"
DATA="/home/websitemake4u/4ss-data"
NODE_BIN="/opt/cpanel/ea-nodejs22/bin"
export PATH="$NODE_BIN:$PATH"

test -x "$NODE_BIN/node" && test -x "$NODE_BIN/npm" || { echo "cPanel Node.js 22 and npm are required"; exit 1; }
test -r "$APP/.env.production" || { echo "Production environment is missing or unreadable"; exit 1; }
test -s "$DATA/site.db" && test -r "$DATA/site.db" && test -w "$DATA/site.db" && test -w "$DATA" ||
  { echo "Existing SQLite database and its directory must be writable"; exit 1; }
if [[ -e "$DATA/uploads" && ! ( -d "$DATA/uploads" && -w "$DATA/uploads" && -x "$DATA/uploads" ) ]]; then
  echo "Existing uploads directory must be writable and searchable"
  exit 1
fi

mkdir -p "$APP/releases" "$APP/tmp"
exec 9>"$APP/tmp/deploy.lock"
flock -n 9 || { echo "Another deployment is running"; exit 1; }

commit=$(git -C "$REPO" rev-parse HEAD)
release=$(mktemp -d "$APP/releases/${commit:0:12}.XXXXXXXX")
pending="$APP/tmp/current.new"
launcher="$APP/tmp/app.js.new"
cleanup() {
  rm -f -- "$pending" "$launcher"
  if [[ "$(readlink -f -- "$APP/current")" != "$release" ]]; then
    rm -rf -- "$release"
  fi
}
trap cleanup EXIT
rm -f -- "$pending" "$launcher"

echo "Building $commit in $release"
git -C "$REPO" archive "$commit" | tar -x -C "$release"
cd "$release"

# Build without loading production secrets or pointing Next at live CMS files.
npm ci --include=dev --include=optional
DATA_DIR="$release/.build-data" SITE_URL="https://4ss.spydermesh.com" REQUIRE_EXISTING_DB=1 \
  NODE_OPTIONS="--max-old-space-size=2048" npm run build -- --webpack
test -s .next/BUILD_ID
test ! -e .build-data

ln -s "$APP/.env.production" .env.production
node app.js --check-env
install -m 600 app.js "$launcher"
ln -s "$release" "$pending"
mv -Tf -- "$pending" "$APP/current"
mv -Tf -- "$launcher" "$APP/app.js"
touch "$APP/tmp/restart.txt"
echo "Activated $commit and requested Passenger restart."
