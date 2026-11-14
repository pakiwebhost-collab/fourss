#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

REPO="/home/websitemake4u/repositories/fourss"
APP="/home/websitemake4u/apps/fourss"
DATA="/home/websitemake4u/4ss-data"
KEY="/home/websitemake4u/.config/fourss/release-signing.pub.pem"
SITE="https://4ss.spydermesh.com"
NODE="/opt/cpanel/ea-nodejs22/bin/node"
VERIFIER="$(dirname -- "${BASH_SOURCE[0]}")/verify-release.py"

die() { echo "4SS deployment: $*" >&2; exit 1; }

head_commit() {
  if [[ "$mode" = ssh-deploy || "$mode" = ssh-verify ]]; then
    local head git_bin
    git_bin=$(command -v git) || return 1
    [[ "$git_bin" = /* && -x "$git_bin" ]] || return 1
    head=$(cd / && env -i PATH="$PATH" HOME=/home/websitemake4u \
      GIT_TERMINAL_PROMPT=0 GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
      timeout 15s "$git_bin" ls-remote --exit-code https://github.com/pakiwebhost-collab/fourss.git refs/heads/main) ||
      return 1
    [[ "$head" =~ ^([a-f0-9]{40})$'\t'refs/heads/main$ ]] || return 1
    printf '%s\n' "${BASH_REMATCH[1]}"
  else
    [[ "$(git -C "$REPO" symbolic-ref --quiet HEAD)" = refs/heads/main ]] || return 1
    git -C "$REPO" rev-parse --verify HEAD^{commit}
  fi
}

download() (
  # Bound writes even with cPanel curl versions that only check Content-Length.
  local cap=$(( ($4 + 1023) / 1024 )) current
  current=$(ulimit -Sf) || return 1
  if [[ "$current" == unlimited ]] || (( current > cap )); then
    ulimit -Sf "$cap" || return 1
  fi
  curl -q --fail --silent --show-error --location --max-redirs 3 \
    --proto '=https' --proto-redir '=https' --connect-timeout 8 --max-time "$3" \
    --max-filesize "$4" --output "$2" "$1"
)

prepare() {
  local commit=$1 work=$2 release=$3
  local base="https://github.com/pakiwebhost-collab/fourss/releases/download/cpanel-$commit"
  local archive=fourss-linux-x64.tar.gz size
  [[ "$commit" =~ ^[a-f0-9]{40}$ ]] || die "Expected full Git commit SHA"
  [[ -f "$KEY" && ! -L "$KEY" && -r "$KEY" ]] || die "Install the trusted release public key at $KEY"
  echo "Downloading signed metadata for $commit"
  download "$base/manifest.json" "$work/manifest.json" 15 4096 ||
    die "Manifest unavailable. Check the Actions run for $commit"
  download "$base/manifest.sig" "$work/manifest.sig" 15 8192 ||
    die "Manifest signature unavailable"
  openssl dgst -sha256 -verify "$KEY" -signature "$work/manifest.sig" "$work/manifest.json" ||
    die "Invalid manifest signature"
  size=$(python3 -I -B "$VERIFIER" size "$work/manifest.json" "$commit") ||
    die "Invalid release metadata"
  download "$base/$archive" "$work/$archive" 90 "$size" || die "Archive download failed"
  timeout 45s python3 -I -B "$VERIFIER" extract \
    "$work/manifest.json" "$commit" "$work/$archive" "$release" || die "Archive verification or extraction failed"
  test "$("$NODE" -v)" = v22.23.4 && test "$(uname -m)" = x86_64 &&
    test "$(getconf GNU_LIBC_VERSION)" = 'glibc 2.28' || die "Unexpected host Node version or Linux ABI"
}

health() {
  local expected=$1 output=$2 deadline=$((SECONDS + 25)) status
  [[ "$expected" =~ ^[a-f0-9]{40}$ ]] || return 1
  while (( SECONDS < deadline )); do
    if status=$(curl -q --silent --show-error --proto '=https' --connect-timeout 2 --max-time 4 \
        -H 'Cache-Control: no-cache, no-store' -D "$output" -o /dev/null \
        -w '%{http_code}' "$SITE/?release_check=$(openssl rand -hex 12)") &&
        [[ "$status" = 200 ]] &&
        awk -v sha="$expected" '
          tolower($1) == "x-4ss-release:" { sub(/\r$/, "", $2); match_count++; found = ($2 == sha) }
          END { exit !(found && match_count == 1) }
        ' "$output"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

legacy_health() {
  local nonce status assets url digest downloaded matched deadline=$((SECONDS + 20))
  while (( SECONDS < deadline )); do
    nonce=$(openssl rand -hex 12) || return 1
    if status=$(curl -q --silent --show-error --proto '=https' --connect-timeout 2 --max-time 4 \
        -H 'Cache-Control: no-cache, no-store' -D "$work/legacy.headers" -o "$work/legacy.html" \
        -w '%{http_code}' "$SITE/?rollback_check=$nonce") &&
        [[ "$status" = 200 ]] &&
        ! grep -qi '^x-4ss-release:' "$work/legacy.headers" &&
        assets=$(python3 -I -B "$VERIFIER" legacy-assets "$work/legacy.html" "$previous"); then
      matched=0
      while read -r url digest; do
        digest=${digest%$'\r'}
        if download "$SITE$url?rollback_check=$nonce" "$work/legacy.asset" 4 8388608 &&
           downloaded=$(sha256sum "$work/legacy.asset") && [[ "${downloaded%% *}" = "$digest" ]]; then
          matched=$((matched + 1))
        fi
      done <<< "$assets"
      if (( matched == 2 )); then
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}

verify_only() (
  local scratch
  scratch=$(mktemp -d /tmp/fourss-verify.XXXXXXXX)
  trap 'rm -rf -- "$scratch"' EXIT
  mkdir "$scratch/release"
  prepare "$1" "$scratch" "$scratch/release"
  echo "Verified and unpacked $1 in scratch space. Activation skipped."
)

mode=cpanel
if [[ "${1:-}" == --verify-only && $# == 2 ]]; then
  verify_only "$2"
  exit "$?"
fi
if [[ $# == 1 && ( "$1" == --ssh || "$1" == --ssh-verify-only ) ]]; then
  export PATH=/usr/local/cpanel/3rdparty/lib/path-bin:/usr/local/cpanel/3rdparty/bin:/usr/bin:/bin
  # sshd supplies the request as data. Only these tokens and one full SHA are accepted.
  [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^(verify|deploy)\ ([a-f0-9]{40})$ ]] ||
    die "Expected 'verify FULL_SHA' or 'deploy FULL_SHA'"
  request=${BASH_REMATCH[1]}
  requested_sha=${BASH_REMATCH[2]}
  if [[ "$request" = verify ]]; then
    mode=ssh-verify
    commit=$(head_commit) || die "Could not resolve GitHub main using the jailed Git PATH"
    [[ "$commit" = "$requested_sha" ]] || die "Requested SHA is not current GitHub main"
    verify_only "$requested_sha"
    exit "$?"
  fi
  [[ "$1" = --ssh ]] || die "Deployment is disabled for this key"
  mode=ssh-deploy
elif (( $# != 0 )); then
  die "Usage: cpanel-deploy.sh [--verify-only FULL_SHA]"
fi
test -x "$NODE" || die "EA Node.js 22 is required"
test -r "$APP/.env.production" || die "Production environment is missing or unreadable"
test -s "$DATA/site.db" && test -r "$DATA/site.db" && test -w "$DATA/site.db" && test -w "$DATA" ||
  die "Existing SQLite database and its directory must be writable"
if [[ -e "$DATA/uploads" && ! ( -d "$DATA/uploads" && -w "$DATA/uploads" && -x "$DATA/uploads" ) ]]; then
  die "Existing uploads directory must be writable and searchable"
fi

mkdir -p "$APP/releases" "$APP/tmp"
[[ "$(stat -c %d "$APP")" = "$(stat -c %d "$APP/tmp")" ]] ||
  die "Passenger root and deployment staging must be on the same filesystem"
exec 9>"$APP/tmp/deploy.lock"
flock -n 9 || die "Another deployment is running"
transaction="$APP/tmp/deploy-recovery"
[[ ! -e "$transaction" && ! -L "$transaction" ]] || die "Pending deployment recovery at $transaction. See DEPLOY.md"
[[ -L "$APP/current" && -f "$APP/app.js" && ! -L "$APP/app.js" ]] ||
  die "Expected an existing release symlink and Passenger launcher"
previous=$(realpath -e -- "$APP/current")
[[ "$previous" == "$APP/releases/"* && -s "$previous/.next/BUILD_ID" ]] || die "Invalid previous release"
previous_sha=$(python3 -I -B - "$previous" <<'PY'
import json
from pathlib import Path
import re
import sys

build = Path(sys.argv[1]) / ".next"
commit = (build / "BUILD_ID").read_text().strip()
rules = json.loads((build / "routes-manifest.json").read_text()).get("headers", [])
if re.fullmatch(r"[a-f0-9]{40}", commit) and any(
    rule["source"] == "/" and {"key": "X-4SS-Release", "value": commit} in rule["headers"]
    for rule in rules
):
    print(commit)
PY
) || die "Could not inspect the previous release"

commit=$(head_commit) || die "Could not resolve main"
[[ "$commit" =~ ^[a-f0-9]{40}$ ]] || die "Invalid main commit"
if [[ "$mode" = ssh-deploy && "$commit" != "$requested_sha" ]]; then
  die "Requested SHA is not current GitHub main"
fi
work=$(mktemp -d "$APP/tmp/prebuilt.XXXXXXXX")
release=""
activating=0
succeeded=0
rollback_health() {
  if [[ -n "$previous_sha" ]]; then
    health "$previous_sha" "$work/rollback.headers"
  else
    legacy_health
  fi
}

cleanup() {
  local status=$?
  trap - EXIT
  trap '' INT TERM HUP
  if (( activating && ! succeeded )); then
    echo "4SS activation failed for $commit. Restoring $previous." >&2
    if cp -p -- "$transaction/app.js" "$work/restore-app.js" &&
       mv -Tf -- "$work/restore-app.js" "$APP/app.js" &&
       ln -s -- "$previous" "$work/restore-current" &&
       mv -Tf -- "$work/restore-current" "$APP/current" &&
       touch "$APP/tmp/restart.txt" &&
       rollback_health; then
      echo "Previous release restored and verified." >&2
      rm -rf -- "$transaction"
    else
      echo "Rollback could not be confirmed. Recovery files: $transaction" >&2
    fi
    status=1
  fi
  if [[ -n "$release" && ! -e "$transaction" ]] && (( ! succeeded )); then
    rm -rf -- "$release"
  fi
  rm -rf -- "$work"
  exit "$status"
}
trap cleanup EXIT
trap 'exit 1' INT TERM HUP

# A repeat click can confirm a release that is already running.
if [[ "$previous_sha" = "$commit" ]] && health "$commit" "$work/active.headers"; then
  echo "4SS release $commit is already active and healthy"
  exit 0
fi
release=$(mktemp -d "$APP/releases/${commit:0:12}.XXXXXXXX")
prepare "$commit" "$work" "$release"

(cd "$release" && timeout 10s "$NODE" -e 'require("sharp"); require("node:sqlite")') ||
  die "Native runtime dependency check failed"
ln -s -- "$APP/.env.production" "$release/.env.production"
(cd "$release" && timeout 10s "$NODE" app.js --check-env) || die "Production environment check failed"
"$NODE" --check "$release/app.js" || die "Candidate Passenger launcher has invalid syntax"
[[ "$(head_commit)" = "$commit" ]] ||
  die "Main changed or could not be verified while preparing the release. Retry from current main"

# Keep a persistent recovery record before the first live change.
mkdir "$work/recovery"
cp -p -- "$APP/app.js" "$work/recovery/app.js"
printf '%s\n' "$previous" > "$work/recovery/previous-release"
printf '%s\n' "$commit" > "$work/recovery/candidate-sha"
ln -s -- "$release" "$work/next-current"
if ! cmp -s "$APP/app.js" "$release/app.js"; then
  install -m 600 "$release/app.js" "$work/next-app.js"
fi
mv -T -- "$work/recovery" "$transaction"
activating=1
if [[ -f "$work/next-app.js" ]]; then
  mv -Tf -- "$work/next-app.js" "$APP/app.js"
fi
mv -Tf -- "$work/next-current" "$APP/current"
touch "$APP/tmp/restart.txt"
health "$commit" "$work/candidate.headers" || die "Passenger did not serve $commit before the deadline"
succeeded=1
rm -rf -- "$transaction"
echo "4SS release $commit is active and healthy"
