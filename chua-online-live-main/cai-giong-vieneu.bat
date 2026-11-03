@echo off
chcp 65001 >nul
rem NOPAUSE=1 (cho AI hoac script goi): khong dung lai cho bam phim
set "P=pause"
if defined NOPAUSE set "P=ver >nul"
cd /d "%~dp0"
title Cai giong VieNeu-TTS
rem Cai VieNeu-TTS (github.com/pnnbao97/VieNeu-TTS, Apache-2.0) vao tools\VieNeu-TTS, moi thu nam trong .venv rieng.
rem Co card NVIDIA: cai ban GPU (tai khoang 3 GB). Khong co: ban CPU (nhe hon, cham hon).
rem Chi can chay mot lan. Sau do start.bat tu bat server giong doc.

set VIENEU_REF=04044e1b8f822f946bafb2c88b716459f4164152
set DIR=tools\VieNeu-TTS

where git >nul 2>&1 || (echo [LOI] Chua cai Git: https://git-scm.com & %P% & exit /b 1)
where python >nul 2>&1 || (echo [LOI] Chua cai Python 3.10-3.13: https://www.python.org/downloads/ ^(nho tick "Add python.exe to PATH"^) & %P% & exit /b 1)

if not exist "%DIR%\.git" (
  echo Dang tai VieNeu-TTS...
  git clone https://github.com/pnnbao97/VieNeu-TTS.git "%DIR%" || (echo [LOI] Tai that bai & %P% & exit /b 1)
)
git -C "%DIR%" fetch -q origin %VIENEU_REF% 2>nul
git -C "%DIR%" checkout -q %VIENEU_REF% || (echo [LOI] Khong chuyen duoc ve ban da thu & %P% & exit /b 1)

if not exist "%DIR%\.venv\Scripts\python.exe" python -m venv "%DIR%\.venv" || (echo [LOI] Tao venv that bai & %P% & exit /b 1)
set PY=%DIR%\.venv\Scripts\python.exe
"%PY%" -m pip install -q --upgrade pip

where nvidia-smi >nul 2>&1
if %errorlevel%==0 (
  echo Co card NVIDIA: cai ban GPU, tai khoang 3 GB, mat vai phut...
  "%PY%" -m pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128 || (echo [LOI] Cai PyTorch that bai & %P% & exit /b 1)
  "%PY%" -m pip install "transformers==4.57.6" || (echo [LOI] & %P% & exit /b 1)
) else (
  echo Khong thay card NVIDIA: cai ban CPU.
)
"%PY%" -m pip install -e "%DIR%" fastapi uvicorn || (echo [LOI] Cai VieNeu that bai & %P% & exit /b 1)
rem transformers 4.57 can huggingface_hub < 1.0, nhung pip install o tren co the nang len 1.x (chi gradio cua web UI can 1.x)
"%PY%" -m pip install "huggingface_hub>=0.34.0,<1.0" || (echo [LOI] & %P% & exit /b 1)

echo.
echo Cai xong. Lan dau chay se tai them model (vai tram MB).
echo Mo chay-giong-vieneu.bat de thu, hoac chay start.bat nhu binh thuong.
%P%
