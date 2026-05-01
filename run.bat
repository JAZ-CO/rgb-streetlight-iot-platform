@echo off
cd /d "%~dp0app"
if not exist node_modules (
  echo Installing Node.js packages...
  npm install
)
npm start
pause
