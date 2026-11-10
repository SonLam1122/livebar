@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Livebar - Setup & Run (Windows VPS)

echo ====================================================
echo  LIVEBAR - CAI DAT VA CHAY TREN WINDOWS VPS
echo ====================================================
echo.

REM --- 1. Kiem tra Node.js ---
node -v >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Chua cai Node.js. Tai ban LTS 20+ tai https://nodejs.org roi chay lai.
    pause
    goto end
)
for /f %%v in ('node -v') do echo [INFO] Node.js: %%v

REM --- 2. Kiem tra file .env ---
if not exist ".env" (
    echo.
    echo [CANH BAO] Khong thay file .env
    echo Dang tao .env mau. Hay mo no va dien SIGN_API_KEY that.
    echo SIGN_API_KEY=>.env
)

REM --- 3. Cai dependencies ---
echo.
echo [INFO] Dang cai dependencies (npm ci)...
if exist "package-lock.json" (
    call npm ci --omit=dev
) else (
    call npm install --omit=dev
)
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cai dependencies that bai!
    pause
    goto end
)

REM --- 4. Giai phong cong 3000 neu dang bi chiem ---
echo [INFO] Giai phong cong 3000 neu dang bi chiem...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)

REM --- 5. Chay server ---
echo.
echo ====================================================
echo  Dashboard: http://localhost:3000/dashboard
echo  Nhan Ctrl+C de dung.
echo ====================================================
set NODE_ENV=production
node server.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server da dung!
    pause
)

:end
