#!/usr/bin/env pwsh
param(
  [string]$Url = $env:DEPLOYMENT_URL,
  [string]$Secret = $env:VERCEL_AUTOMATION_BYPASS_SECRET
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if (-not $Url) { Write-Error 'Provide -Url or set DEPLOYMENT_URL'; exit 2 }
if (-not $Secret) { Write-Error 'Provide -Secret or set VERCEL_AUTOMATION_BYPASS_SECRET'; exit 2 }

Write-Host "Smoke test (bypass) -> $Url" -ForegroundColor Cyan
$headers = @{
  'x-vercel-protection-bypass' = $Secret
  'x-vercel-set-bypass-cookie' = 'true'
  'User-Agent' = 'affinity-smoke/1.0'
}
$resp = Invoke-WebRequest -Uri $Url -Headers $headers -Method GET -MaximumRedirection 5 -ErrorAction Stop
if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
  Write-Host "✅ Success: $($resp.StatusCode)" -ForegroundColor Green
  exit 0
}
Write-Error "Smoke failed: $($resp.StatusCode)"; exit 3