@echo off
chcp 65001 >nul
rem NOPAUSE=1 (cho AI hoac script goi): khong dung lai cho bam phim
set "P=pause"
if defined NOPAUSE set "P=ver >nul"
cd /d "%~dp0tools\VieNeu-TTS"
title Giong doc VieNeu-TTS - giu cua so nay mo
if not exist ".venv\Scripts\python.exe" (echo Chua cai VieNeu. Chay cai-giong-vieneu.bat truoc. & %P% & exit /b 1)
rem Chi nghe trong may nay. Watermark am cua VieNeu giu nguyen.
set HOST=127.0.0.1
set PORT=8000
set PYTHONUTF8=1
rem Co card NVIDIA: ban v3 Turbo (hay nhat). Khong co: ban v3 Nano chay bang CPU (nhe, nhanh tren may yeu).
rem Muon ep dung ban Nano: dat VIENEU_MODE=nano truoc khi chay file nay.
set MODE=%VIENEU_MODE%
if "%MODE%"=="" (where nvidia-smi >nul 2>&1 && set MODE=turbo || set MODE=nano)
if /i "%MODE%"=="nano" (
  echo Dung ban VieNeu v3 Nano ^(CPU^)
  set VIENEU_BACKEND=onnx
  .venv\Scripts\python.exe "%~dp0scripts\giong_nhe.py"
) else (
  echo Dung ban VieNeu v3 Turbo ^(GPU^)
  .venv\Scripts\python.exe -m apps.openai_speech
)
%P%
