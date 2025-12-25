@echo off
echo ========================================
echo   MOM ^& ME's - Quick Start
echo ========================================
echo.

REM Check if setup has been run
if not exist "backend\.env" (
    echo Running setup...
    powershell -ExecutionPolicy Bypass -File setup.ps1
    echo.
)

echo Starting application...
powershell -ExecutionPolicy Bypass -File start.ps1

pause
