#!/usr/bin/env bash
set -Eeuo pipefail

# Run from a fresh release or preflight checkout. The subshell keeps the limit build-local.
(
  soft=$(ulimit -Sv)
  hard=$(ulimit -Hv)
  printf 'Build address space (KiB): soft=%s hard=%s\n' "$soft" "$hard"
  printf 'Build data segment (KiB): soft=%s hard=%s\n' "$(ulimit -Sd)" "$(ulimit -Hd)"
  if [[ "$soft" != "$hard" ]]; then
    if ulimit -Sv "$hard"; then
      printf 'Build address-space soft limit: %s\n' "$(ulimit -Sv)"
    else
      echo 'Could not raise the build soft limit to the inherited hard limit; continuing under the current limit.' >&2
    fi
  fi

  CPANEL_BUILD=1 DATA_DIR="$PWD/.build-data" SITE_URL="https://4ss.spydermesh.com" REQUIRE_EXISTING_DB=1 \
    NODE_OPTIONS="--max-old-space-size=2048 --disable-wasm-trap-handler" \
    npm run build -- --webpack
  test -s .next/BUILD_ID
  test ! -e .build-data
)
