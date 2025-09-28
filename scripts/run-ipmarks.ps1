#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Write-Host 'Running IP marks runner...' -ForegroundColor Cyan
python3 ops/ipmarks/runner.py
Write-Host 'Done.' -ForegroundColor Green