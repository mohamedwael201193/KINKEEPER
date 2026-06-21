@echo off
setlocal EnableExtensions
title KINKEEPER Guardian Mesh — Judge Launcher
cd /d "%~dp0..\.."

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js 22+ required. Install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo First run: installing dependencies (may take several minutes)...
  call npm ci
  if errorlevel 1 exit /b 1
)

if not exist "apps\guardian-mesh\dist\main.js" (
  echo Building Guardian Mesh...
  call npm run build:guardian-mesh
  if errorlevel 1 (
    echo BUILD FAILED
    pause
    exit /b 1
  )
)

if not exist "test-data\sentinel-scam-call.wav" (
  echo Generating scenario assets...
  call npm run guardian:assets
)

if not exist ".env" (
  echo Creating judge .env from template...
  copy /Y ".env.example" ".env" >nul
)

echo.
echo Starting local QVAC server (first run downloads models)...
set GUARDIAN_TELEGRAM_ACK_LISTENER=true
start "Guardian Mesh" /MIN cmd /c "set GUARDIAN_TELEGRAM_ACK_LISTENER=true&& node apps\guardian-mesh\dist\main.js"
timeout /t 12 /nobreak >nul
start http://127.0.0.1:8787/
echo.
echo Judge UI: http://127.0.0.1:8787/
echo Click "3-Min Judge Demo" or scenarios A / B / G.
echo Keep the minimized server window open.
echo.
pause
