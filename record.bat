@echo off
setlocal

cd /d "%~dp0"

if not exist node_modules (
  echo [record] node_modules not found. Please run init_npm.bat first.
  exit /b 1
)

if not defined RECORD_WIDTH set RECORD_WIDTH=2560
if not defined RECORD_HEIGHT set RECORD_HEIGHT=1360
if not defined RECORD_FPS set RECORD_FPS=30
if not defined RECORD_BITRATE set RECORD_BITRATE=12000000

echo [record] width=%RECORD_WIDTH% height=%RECORD_HEIGHT% fps=%RECORD_FPS% bitrate=%RECORD_BITRATE%
call node ".\record.js"
if errorlevel 1 (
  echo [record] recording failed.
  exit /b 1
)

echo [record] done.
exit /b 0
