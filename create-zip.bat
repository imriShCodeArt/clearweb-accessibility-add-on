@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-release-zip.ps1"
if errorlevel 1 (
    echo.
    echo ZIP build failed.
    pause
    exit /b 1
)
echo.
pause
