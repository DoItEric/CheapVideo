@echo off
setlocal

cd /d "%~dp0"

if not exist out (
  echo [clear] out folder does not exist, nothing to clear.
  exit /b 0
)

del /f /q ".\out\*"
for /d %%D in (".\out\*") do rd /s /q "%%~fD"

echo [clear] out folder cleaned.
exit /b 0
