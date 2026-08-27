@echo off
cd /d "%~dp0"
title TaoLiveTuongTac - Local Server (Offline)

echo ====================================================
echo  TaoLiveTuongTac Local Server (100% OFFLINE)
echo ====================================================
echo.

node -v >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Giai phong cong 3000 neu dang bi chiem...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>nul
    )

    echo [INFO] Dang khoi chay server bang Node.js...
    echo [INFO] Mo Dashboard tai: http://localhost:3000/dashboard
    echo [INFO] Nhan Ctrl+C de dung server.
    echo ====================================================
    start http://localhost:3000/dashboard
    node server.js
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Server da dung!
        pause
    )
    goto end
)

python --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Dang khoi chay server bang Python...
    echo [INFO] Mo Dashboard tai: http://localhost:3000/dashboard
    echo [INFO] Nhan Ctrl+C de dung server.
    echo ====================================================
    start http://localhost:3000/dashboard
    python server.py
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Server da dung!
        pause
    )
    goto end
)

echo [ERROR] Khong tim thay Node.js hoac Python tren may tinh!
echo Vui long cai dat Node.js tai https://nodejs.org
pause

:end
