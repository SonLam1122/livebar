# ============================================================
#  BUILD PORTABLE - Dong goi Livebar thanh thu muc chay doc lap
#  Chay TREN WINDOWS:  chuot phai -> Run with PowerShell
#  (hoac mo PowerShell va go:  powershell -ExecutionPolicy Bypass -File build-portable.ps1)
#  Ket qua: thu muc  dist-portable\  -> nen lai, bo len VPS, double-click Livebar.bat
# ============================================================
$ErrorActionPreference = "Stop"

# --- Cau hinh ---
$NodeVersion = "v22.12.0"      # Node 22 LTS: BAT BUOC >=22.12 vi code require() ESM (tiktok-live-connector)
$Arch        = "x64"
$Root        = $PSScriptRoot
$Dist        = Join-Path $Root "dist-portable"
$NodeDir     = Join-Path $Dist "node"

Write-Host "==> [1/5] Don thu muc dist-portable..." -ForegroundColor Cyan
if (Test-Path $Dist) { Remove-Item $Dist -Recurse -Force }
New-Item -ItemType Directory -Path $Dist | Out-Null

# --- 1. Tai Node portable (chi can mang luc BUILD) ---
Write-Host "==> [2/5] Tai Node $NodeVersion..." -ForegroundColor Cyan
$NodeZip = "node-$NodeVersion-win-$Arch.zip"
$NodeUrl = "https://nodejs.org/dist/$NodeVersion/$NodeZip"
$ZipPath = Join-Path $env:TEMP $NodeZip
if (-not (Test-Path $ZipPath)) {
    Invoke-WebRequest -Uri $NodeUrl -OutFile $ZipPath
}
Expand-Archive -Path $ZipPath -DestinationPath $Dist -Force
Rename-Item (Join-Path $Dist "node-$NodeVersion-win-$Arch") "node"

# --- 2. Copy ma nguon (bo cac thu khong can) ---
Write-Host "==> [3/5] Copy ma nguon..." -ForegroundColor Cyan
# robocopy tra ve exit code < 8 la thanh cong -> nuot loi
$null = robocopy $Root $Dist /E `
    /XD (Join-Path $Root "dist-portable") (Join-Path $Root ".git") "node_modules" (Join-Path $Root "doc") `
    /XF "*.log" ".env" ".DS_Store"
if ($LASTEXITCODE -ge 8) { throw "robocopy loi (code $LASTEXITCODE)" }

# --- 3. Cai dependencies production bang Node vua tai ---
Write-Host "==> [4/5] Cai dependencies (npm ci --omit=dev)..." -ForegroundColor Cyan
$env:Path = "$NodeDir;$env:Path"
$npmCmd = Join-Path $NodeDir "npm.cmd"
Push-Location $Dist
try {
    if (Test-Path (Join-Path $Dist "package-lock.json")) {
        & $npmCmd ci --omit=dev
    } else {
        & $npmCmd install --omit=dev
    }
    if ($LASTEXITCODE -ne 0) { throw "npm cai that bai (code $LASTEXITCODE)" }
} finally { Pop-Location }

# --- 4. Tao launcher double-click (dung Node nhung san, khong can cai Node) ---
Write-Host "==> [5/5] Tao launcher Livebar.bat..." -ForegroundColor Cyan
$launcher = @'
@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Livebar - Server
set NODE_ENV=production
set PORT=3000

if not exist ".env" (
    echo [CANH BAO] Chua co .env - tao file mau. Hay mo .env va dien SIGN_API_KEY that.
    echo SIGN_API_KEY=>.env
)

echo [INFO] Giai phong cong 3000 neu dang bi chiem...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

echo [INFO] Dashboard: http://localhost:3000/dashboard
start "" http://localhost:3000/dashboard
"%~dp0node\node.exe" server.js
echo.
echo [INFO] Server da dung.
pause
'@
Set-Content -Path (Join-Path $Dist "Livebar.bat") -Value $launcher -Encoding ASCII

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " XONG! Thu muc portable da san sang:" -ForegroundColor Green
Write-Host "   $Dist" -ForegroundColor Green
Write-Host ""
Write-Host " - Nen lai thanh .zip, bo len VPS Windows, giai nen." -ForegroundColor Green
Write-Host " - Mo .env dien SIGN_API_KEY." -ForegroundColor Green
Write-Host " - Double-click  Livebar.bat  de chay (KHONG can cai Node)." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
