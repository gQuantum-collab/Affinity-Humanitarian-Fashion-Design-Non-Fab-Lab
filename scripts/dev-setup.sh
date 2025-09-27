#!/usr/bin/env bash
set -euo pipefail

echo "Installing project dependencies and Husky hooks..."
pnpm install
pnpm prepare || true

echo "Configuring git hooks path to .husky"
git config core.hooksPath .husky || true

echo "Dev setup complete. Run 'pnpm dev' to start the dev server."
