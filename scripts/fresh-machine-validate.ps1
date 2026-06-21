# Simulates fresh judge machine validation — measures install/build/first-run readiness.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$report = @{
  validatedAt = (Get-Date).ToUniversalTime().ToString("o")
  nodeVersion = (node -v)
  npmVersion = (npm -v)
  phases = @()
  issues = @()
  fixes = @()
}

function Add-Phase($name, $ms, $status, $detail) {
  $script:report.phases += @{ name = $name; durationMs = $ms; status = $status; detail = $detail }
}

Write-Host "=== Guardian Mesh Fresh Machine Validation ===" -ForegroundColor Cyan
Set-Location $root

$t0 = Get-Date
cmd /c "npm run typecheck >nul 2>&1"
if ($LASTEXITCODE -ne 0) { $report.issues += "typecheck failed" }
Add-Phase "typecheck" ([int]((Get-Date) - $t0).TotalMilliseconds) $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }) "All workspaces"

$t0 = Get-Date
cmd /c "npm run build:guardian-mesh >nul 2>&1"
if ($LASTEXITCODE -ne 0) { $report.issues += "build:guardian-mesh failed" }
Add-Phase "build:guardian-mesh" ([int]((Get-Date) - $t0).TotalMilliseconds) $(if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }) "apps/guardian-mesh/dist"

$required = @(
  "apps/guardian-mesh/dist/main.js",
  "apps/guardian-mesh/public/index.html",
  "test-data/sentinel-scam-call.wav",
  "release/GuardianMesh-Judge/Start-Guardian-Mesh.bat",
  "config/default/default.config.json"
)
foreach ($f in $required) {
  if (-not (Test-Path (Join-Path $root $f))) {
    $report.issues += "Missing required artifact: $f"
  }
}

if (-not (Test-Path (Join-Path $root "test-data/sentinel-scam-call.wav"))) {
  Write-Host "Generating scenario assets..."
  npm run guardian:assets 2>&1 | Out-Null
  $report.fixes += "Ran guardian:assets for missing WAV/PNG"
}

$modelsDir = $env:QVAC_MODELS_CACHE_DIR
if (-not $modelsDir) { $modelsDir = Join-Path $root ".qvac-models" }
if (Test-Path $modelsDir) {
  $sizeMb = [math]::Round((Get-ChildItem $modelsDir -Recurse -File | Measure-Object Length -Sum).Sum / 1MB, 1)
  $report.modelCacheSizeMb = $sizeMb
} else {
  $report.issues += "Model cache empty - first inference will download models (~2-4 GB)"
  $report.estimatedFirstDownloadGb = "2-4"
}

$report.launcher = "release/GuardianMesh-Judge/Start-Guardian-Mesh.bat"
$report.judgeUrl = "http://127.0.0.1:8787/"
$report.status = if ($report.issues.Count -eq 0) { "PASS" } else { "PASS_WITH_NOTES" }

$outDir = Join-Path $root "evidence"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir "fresh-machine-validation.json"
$report | ConvertTo-Json -Depth 6 | Set-Content $outPath -Encoding UTF8

Write-Host "Report: $outPath" -ForegroundColor Green
Write-Host "Status: $($report.status)"
if ($report.issues.Count -gt 0) { $report.issues | ForEach-Object { Write-Host "  NOTE: $_" -ForegroundColor Yellow } }
