#!/usr/bin/env bash
# Regenerate the Linux @visual screenshot baselines in the official Playwright
# image, so they match what GitHub Actions renders. Run from anywhere:
#
#   npm run test:e2e:visual:update            rewrite the baselines
#   npm run test:e2e:visual:update -- --check compare only; diffs land in
#                                             e2e/test-results/visual-docker
#
# The repository is copied into the container (node_modules stays untouched),
# built, and only the snapshot folder (or the diffs) is copied back.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="$(node -p "require('$ROOT/node_modules/@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"
OUT="$ROOT/e2e/tests/visual/visual.spec.ts-snapshots"

# amd64 matches ubuntu-latest on GitHub Actions; arm64 renders text slightly
# differently. Override with DOCKER_PLATFORM only to debug.
PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"
RESULTS="$ROOT/e2e/test-results/visual-docker"
mkdir -p "$RESULTS"

MODE=--update-snapshots
if [ "${1:-}" = "--check" ]; then MODE=; fi

mkdir -p "$OUT"
docker run --rm --ipc=host --platform "$PLATFORM" \
  -v "$ROOT":/src:ro \
  -v "$OUT":/out \
  -v "$RESULTS":/out-results \
  "$IMAGE" bash -euo pipefail -c '
    mkdir /work
    tar -C /src --exclude=./.git --exclude=node_modules --exclude="./*/build" \
        --exclude="./e2e/test-results" -cf - . | tar -C /work -xf -
    cd /work
    npm ci
    npm run build
    VISUAL=1 CI=true GITHUB_ACTIONS= npm exec -w e2e -- playwright test \
      --project=visual $0 --retries=0 || status=$?
    if [ -n "$0" ]; then
      cp -R e2e/tests/visual/visual.spec.ts-snapshots/. /out/
    else
      mkdir -p /out-results && cp -R e2e/test-results/. /out-results/ 2>/dev/null || true
    fi
    exit ${status:-0}
  ' "$MODE"
if [ -n "$MODE" ]; then
  echo "Updated baselines in e2e/tests/visual/visual.spec.ts-snapshots"
else
  echo "Baselines match."
fi
