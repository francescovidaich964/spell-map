@echo off
echo Stopping Spell Map Server...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *http.server*" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Server stopped successfully
) else (
    echo No server found running
)
pause
