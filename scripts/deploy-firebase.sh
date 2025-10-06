#!/usr/bin/env bash
set -euo pipefail

echo "== Exporting Next.js (static) =="
pnpm export

if [ ! -d .next/export ]; then
  echo "Export directory missing (.next/export)." >&2
  exit 1
fi

echo "== Deploying to Firebase Hosting =="
firebase deploy --only hosting "$@"
