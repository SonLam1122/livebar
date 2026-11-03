@echo off
chcp 65001 >nul
rem NOPAUSE=1 (cho AI hoac script goi): khong dung lai cho bam phim
set "P=pause"
if defined NOPAUSE set "P=ver >nul"
cd /d "%~dp0"
title Chanh Dien An Lac - TikTok LIVE

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [LOI] Chua cai Node.js. Tai ban LTS tai https://nodejs.org roi chay lai file nay.
  %P%
  exit /b 1
)

if not exist "node_modules\" (
  echo Dang cai thu vien lan dau...
  call npm install --no-audit --no-fund
  if %errorlevel% neq 0 (
    echo [LOI] npm install that bai.
    %P%
    exit /b 1
  )
)

if exist "tools\VieNeu-TTS\.venv\Scripts\python.exe" (
  echo Bat giong doc VieNeu-TTS trong cua so rieng...
  start "Giong doc VieNeu" /min cmd /c "%~dp0chay-giong-vieneu.bat"
)

echo.
echo  Bang dieu khien : http://localhost:3000/control.html
echo  Overlay 9:16    : http://localhost:3000/overlay.html
echo  Giu cua so nay mo trong suot buoi live. Ctrl+C de tat.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000/control.html"
node server\index.mjs
%P%
