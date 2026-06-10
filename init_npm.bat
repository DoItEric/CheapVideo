@echo off
setlocal

cd /d "%~dp0"

if not exist package.json (
  echo [init] package.json not found, running npm init -y...
  call npm init -y
  if errorlevel 1 (
    echo [init] npm init failed.
    exit /b 1
  )
) else (
  echo [init] package.json exists, skip npm init.
)

echo [init] installing dependencies...
call npm install
if errorlevel 1 (
  echo [init] npm install failed.
  exit /b 1
)

echo [init] done.
exit /b 0
