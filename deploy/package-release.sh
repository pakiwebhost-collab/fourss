#!/usr/bin/env bash
set -euo pipefail

# Run from the clean CI source tree, with the output directory outside it.
commit=${1:?Expected full Git commit SHA}
output=${2:?Expected output directory}
[[ "$commit" =~ ^[a-f0-9]{40}$ ]]
test "$(node -v)" = v22.23.4
test "$(uname -m)" = x86_64
test "$(getconf GNU_LIBC_VERSION)" = 'glibc 2.28'
test -f next.config.mjs
for other in next.config.js next.config.ts next.config.cjs next.config.cts next.config.mts next.config.json; do
  if [[ -e "$other" || -L "$other" ]]; then
    echo "Unexpected second Next.js config: $other" >&2
    exit 1
  fi
done

npm ci --include=dev --include=optional
npm run lint
NODE_OPTIONS=--disable-wasm-trap-handler node -e '
  require("next/dist/build/swc").loadBindings().then(bindings => {
    if (!bindings.isWasm) throw new Error("Expected SWC WASM on the target ABI");
    console.log("SWC WASM binding verified");
  }).catch(error => { console.error(error); process.exitCode = 1; });
'
FOURSS_RELEASE_COMMIT="$commit" bash deploy/cpanel-build.sh
npm exec -- tsc --noEmit
test "$(cat .next/BUILD_ID)" = "$commit"
npm prune --omit=dev --include=optional
# Sharp must use the lockfile's Linux x64 binaries, including the bundled libvips.
node -e 'const sharp = require("sharp"); if (!sharp.versions.vips) process.exit(1)'

mkdir -p "$output"
tar -czf "$output/fourss-linux-x64.tar.gz" --hard-dereference \
  --exclude='*/.bin' --exclude='*/.cache' \
  --exclude='*/.env' --exclude='*/.env.*' --exclude='*/.npmrc' \
  --exclude='.next/cache' --exclude='.next/dev' --exclude='.next/diagnostics' \
  --exclude='.next/trace*' --exclude='.next/types' --exclude='public/uploads' \
  app.js package.json next.config.mjs .next public node_modules

archive="$output/fourss-linux-x64.tar.gz"
digest=$(sha256sum "$archive")
printf '{"version":1,"repository":"pakiwebhost-collab/fourss","commit":"%s","target":"linux-x64-glibc-2.28","node":"22.23.4","archive":"fourss-linux-x64.tar.gz","bytes":%s,"sha256":"%s"}\n' \
  "$commit" "$(wc -c < "$archive")" "${digest%% *}" > "$output/manifest.json"

scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
mkdir "$scratch/release"
python3 -I -B deploy/verify-release.py extract "$output/manifest.json" "$commit" "$archive" "$scratch/release"
node deploy/smoke-release.cjs "$scratch/release" "$scratch/test-data" "$commit"
