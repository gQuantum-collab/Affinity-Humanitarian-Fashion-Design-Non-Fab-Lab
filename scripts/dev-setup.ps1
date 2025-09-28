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

Write-Host 'Installing dependencies...' -ForegroundColor Yellow
pnpm install
try { pnpm prepare } catch { Write-Host 'prepare step failed (non-fatal)' -ForegroundColor DarkYellow }

Write-Host 'Configuring git hooks path (.husky)' -ForegroundColor Yellow
git config core.hooksPath .husky | Out-Null

Write-Host 'Running IP marks runner (idempotent)...' -ForegroundColor Yellow
python3 ops/ipmarks/runner.py

Write-Host '✅ Dev setup complete. Run "pnpm dev" to start the dev server.' -ForegroundColor Green