# Builds Guardian Mesh judge bundle + documents Electron artifacts.
$ErrorActionPreference = "Stop"
$root = if (Test-Path (Join-Path $PSScriptRoot "..\package.json")) { Split-Path $PSScriptRoot -Parent } else { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }
$releaseDir = Join-Path $root "release\GuardianMesh-Judge"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

Copy-Item (Join-Path $root "DEMO_RUNBOOK.md") (Join-Path $releaseDir "JUDGE_INSTRUCTIONS.txt") -Force
Copy-Item (Join-Path $root "release\GuardianMesh-Judge\Start-Guardian-Mesh.bat") (Join-Path $releaseDir "Start-Guardian-Mesh.bat") -Force

Write-Output "Judge bundle: $releaseDir"
Write-Output "Electron portable: $(Join-Path $root 'release\guardian-desktop\KINKEEPER-Guardian-Mesh-Portable-0.1.0.exe')"
Write-Output "Electron installer: $(Join-Path $root 'release\guardian-desktop\KINKEEPER-Guardian-Mesh-0.1.0.exe')"
Get-ChildItem $releaseDir | Format-Table Name, Length
