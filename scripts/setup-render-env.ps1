# Generates a paste-ready env block for Render Dashboard (DO NOT COMMIT output)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-render-env.ps1
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$envFile = Join-Path $root ".env"
$privFile = Join-Path $root ".jwt-private.pem"
$pubFile = Join-Path $root ".jwt-public.pem"
$outFile = Join-Path $root "render-env-paste.txt"

if (-not (Test-Path $envFile)) { throw "Missing .env at $envFile" }

function Get-EnvValue([string]$key) {
  Get-Content $envFile | Where-Object { $_ -match "^\s*$key=" } | ForEach-Object {
    ($_ -split "=", 2)[1]
  } | Select-Object -First 1
}

$priv = if (Test-Path $privFile) { Get-Content $privFile -Raw } else { "" }
$pub = if (Test-Path $pubFile) { Get-Content $pubFile -Raw } else { "" }

$renderUrl = Read-Host "Render API URL (default: https://kinkeeper-api.onrender.com)"
if ([string]::IsNullOrWhiteSpace($renderUrl)) { $renderUrl = "https://kinkeeper-api.onrender.com" }

$qvacUrl = Read-Host "QVAC tunnel URL (ngrok to localhost:3001, or http://localhost:3001 for testing)"
if ([string]::IsNullOrWhiteSpace($qvacUrl)) { $qvacUrl = "http://localhost:3001" }

$lines = @(
  "NODE_ENV=production"
  "APP_ENV=production"
  "LOG_LEVEL=info"
  "APP_URL=https://kinkeeper-web.vercel.app"
  "API_URL=$renderUrl"
  "CORS_ORIGINS=https://kinkeeper-web.vercel.app"
  "DATABASE_URL=$(Get-EnvValue 'DATABASE_URL')"
  "DATABASE_DIRECT_URL=$(Get-EnvValue 'DATABASE_DIRECT_URL')"
  "REDIS_URL=$(Get-EnvValue 'REDIS_URL')"
  "PRIVY_APP_ID=$(Get-EnvValue 'PRIVY_APP_ID')"
  "PRIVY_APP_SECRET=$(Get-EnvValue 'PRIVY_APP_SECRET')"
  "QVAC_NODE_SECRET=$(Get-EnvValue 'QVAC_NODE_SECRET')"
  "QVAC_NODE_URL=$qvacUrl"
  "EVIDENCE_DIR=/tmp/evidence"
  "UPLOAD_DIR=/tmp/uploads"
  "TELEGRAM_BOT_TOKEN=$(Get-EnvValue 'TELEGRAM_BOT_TOKEN')"
  "TELEGRAM_ENABLED=true"
  "TELEGRAM_LINK_TOKEN_TTL_SEC=900"
  "JWT_ACCESS_EXPIRES_IN=15m"
  "JWT_REFRESH_EXPIRES_IN=30d"
  "JWT_PRIVATE_KEY=$($priv.Trim())"
  "JWT_PUBLIC_KEY=$($pub.Trim())"
)

$lines | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Wrote $outFile"
Write-Host "Copy each KEY=VALUE into Render Dashboard -> kinkeeper-api -> Environment"
Write-Host "Also set Vercel VITE_API_URL=$renderUrl"
