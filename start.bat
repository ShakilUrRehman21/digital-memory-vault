@echo off
title Memory Vault - localhost:3002
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting Memory Vault on http://localhost:3002
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3002"
call npm run dev -- -p 3002
pause
