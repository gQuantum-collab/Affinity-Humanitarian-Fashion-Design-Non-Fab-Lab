#!/usr/bin/env pwsh
<#$
Apply a SQL file to the database using POSTGRES_URL_NON_POOLING.
Equivalent to scripts/db-apply.sh
Usage:
  ./scripts/db-apply.ps1 [-File path/to/file.sql] [--Insecure] [--CA /path/to/ca.pem]
#>
param(
  [string]$File = 'ops/supabase/notes.sql',
  [switch]$Insecure,
  [string]$CA
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path .env.secrets)) {
  Write-Error '.env.secrets not found. Copy .env.example to .env.secrets and fill values.'
  exit 1
}

# Load .env.secrets (simple parser: KEY=VALUE)
Get-Content .env.secrets | ForEach-Object {
  if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
    $k,$v = $_.Split('=',2)
    if (-not [string]::IsNullOrWhiteSpace($k)) { $env:$k = $v }
  }
}

if (-not (Test-Path $File)) {
  Write-Error "SQL file $File not found"
  exit 1
}

if ($CA) {
  if (-not (Test-Path $CA)) { Write-Error "CA file not found: $CA"; exit 1 }
  Write-Host "Using CA at $CA" -ForegroundColor Yellow
  $env:PGSSLROOTCERT = (Resolve-Path $CA)
  $env:PGSSLMODE = 'verify-full'
}

$psqlArgs = @('-v','ON_ERROR_STOP=1','-f', $File)

if ($Insecure) {
  Write-Host 'Running insecure (NODE_TLS_REJECT_UNAUTHORIZED=0) — local testing only' -ForegroundColor DarkYellow
  $env:NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

if (-not $env:POSTGRES_URL_NON_POOLING) { Write-Error 'POSTGRES_URL_NON_POOLING not set'; exit 1 }

Write-Host "Applying $File..." -ForegroundColor Cyan
& psql $env:POSTGRES_URL_NON_POOLING @psqlArgs

Write-Host '✅ Done.' -ForegroundColor Green