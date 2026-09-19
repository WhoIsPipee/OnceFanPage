@echo off
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
if errorlevel 1 exit /b 1
echo SANA MK2 - abre http://localhost:3000
call npm.cmd run dev
