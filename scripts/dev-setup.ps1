#!/usr/bin/env pwsh
<#$
PowerShell dev setup script (cross-platform)
Mirrors scripts/dev-setup.sh
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host '== Affinity Dev Setup (PowerShell) ==' -ForegroundColor Cyan

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host 'Enabling corepack for pnpm...' -ForegroundColor Yellow
  corepack enable
}

Write-Host 'Installing dependencies (pnpm install)...' -ForegroundColor Yellow
if (Test-Path node_modules) {
  Write-Host 'node_modules exists – using incremental install' -ForegroundColor DarkGray
}
pnpm install

# Only run prepare manually if it is not triggered automatically (pnpm already runs lifecycle). Suppress duplicate husky output.
try {
  $env:HUSKY_SKIP_INSTALL = '1'
  pnpm prepare *> $null 2>&1
} catch { Write-Host 'prepare step (manual) skipped/non-fatal' -ForegroundColor DarkYellow } finally { Remove-Item Env:HUSKY_SKIP_INSTALL -ErrorAction SilentlyContinue }

Write-Host 'Configuring git hooks path (.husky)' -ForegroundColor Yellow
git config core.hooksPath .husky | Out-Null

Write-Host 'Running IP marks runner (idempotent)...' -ForegroundColor Yellow
python3 ops/ipmarks/runner.py

if (Test-Path requirements.txt) {
  Write-Host 'Python requirements found (optional): pip install -r requirements.txt' -ForegroundColor DarkGray
}

Write-Host 'Summary:' -ForegroundColor Cyan
Write-Host "  pnpm: $(pnpm -v)" -ForegroundColor DarkGray
Write-Host "  node: $(node -v)" -ForegroundColor DarkGray
try { Write-Host "  python: $(python3 --version)" -ForegroundColor DarkGray } catch {}
Write-Host '✅ Dev setup complete. Run "pnpm dev" to start the dev server.' -ForegroundColor Green
if (Test-Path package.json) { Write-Host '   (For first-time contributors: run pnpm approve-builds to review blocked postinstall scripts if needed.)' -ForegroundColor DarkGray }