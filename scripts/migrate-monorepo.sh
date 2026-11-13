#!/usr/bin/env bash
set -euo pipefail

EXPECTED_REPO="dospatch/gold-logistics-bot"
BRANCH="${GITHUB_REF_NAME:-monorepo-foundation}"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$REMOTE_URL" != *"$EXPECTED_REPO"* ]]; then
  echo "Refusing to run: origin is not $EXPECTED_REPO (found: $REMOTE_URL)" >&2
  exit 1
fi

if [[ "$BRANCH" != "monorepo-foundation" ]]; then
  echo "Refusing to run on unexpected branch: $BRANCH" >&2
  exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

import_subtree() {
  local remote_name="$1"
  local source_url="$2"
  local prefix="$3"

  if git ls-tree -d HEAD -- "$prefix" | grep -q .; then
    echo "Destination already exists; refusing to overwrite: $prefix" >&2
    exit 1
  fi

  if git remote get-url "$remote_name" >/dev/null 2>&1; then
    git remote set-url "$remote_name" "$source_url"
  else
    git remote add "$remote_name" "$source_url"
  fi

  git fetch --no-tags "$remote_name" main
  git subtree add --prefix="$prefix" "$remote_name" main
}

import_subtree "bc-truck-works" \
  "https://github.com/dospatch/bc-truck-works.git" \
  "apps/bc-truck-works"

import_subtree "bc-truck-works-live" \
  "https://github.com/dospatch/bc-truck-works-live-companion.git" \
  "apps/bc-truck-works-live"

import_subtree "truck-works-discord" \
  "https://github.com/dospatch/truckWorks.git" \
  "apps/truck-works-discord"

echo "All three repositories were imported as history-preserving subtrees."
