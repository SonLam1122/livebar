#!/bin/bash
# =========================================================================
# KHỞI ĐỘNG TẤT CẢ TRÊN MAC
#   • livebar (6 game + cầu nối TikTok) tại http://localhost:3000
#   • Chánh Điện An Lạc (game đi chùa)   tại http://localhost:3001
# Nháy đúp file này để chạy. Đóng cửa sổ Terminal là tắt cả hai.
# =========================================================================
cd "$(dirname "$0")" || exit 1
LIVEBAR_DIR="$(pwd)"
CHUA_DIR="$LIVEBAR_DIR/chua-online-live-main"

# --- Nạp biến môi trường từ .env (SIGN_API_KEY...) nếu có; file này đã gitignore ---
if [ -f "$LIVEBAR_DIR/.env" ]; then
  set -a; . "$LIVEBAR_DIR/.env"; set +a
  [ -n "$SIGN_API_KEY" ] && echo " • Đã nạp SIGN_API_KEY từ .env (Euler Stream)"
fi

echo "============================================================"
echo " Đang khởi động 2 server..."
echo "============================================================"

# --- Cài phụ thuộc nếu thiếu ---
if [ ! -d "$LIVEBAR_DIR/node_modules" ]; then
  echo "• Cài phụ thuộc livebar..."; (cd "$LIVEBAR_DIR" && npm install)
fi
if [ -d "$CHUA_DIR" ] && [ ! -d "$CHUA_DIR/node_modules" ]; then
  echo "• Cài phụ thuộc game đi chùa..."; (cd "$CHUA_DIR" && npm install)
fi

# --- Dọn tiến trình cũ chiếm cổng 3000 / 3001 (theo cổng, chắc chắn hơn) ---
lsof -nP -tiTCP:3000 -sTCP:LISTEN | xargs kill -9 2>/dev/null
lsof -nP -tiTCP:3001 -sTCP:LISTEN | xargs kill -9 2>/dev/null
sleep 1

# --- Chạy livebar (cổng 3000) ---
( cd "$LIVEBAR_DIR" && PORT=3000 node server.js ) &
LIVEBAR_PID=$!

# --- Chạy game đi chùa (cổng 3001) ---
if [ -d "$CHUA_DIR" ]; then
  ( cd "$CHUA_DIR" && PORT=3001 node server/index.mjs ) &
  CHUA_PID=$!
fi

sleep 2
echo ""
echo "============================================================"
echo " ✅ ĐÃ CHẠY. Các đường dẫn:"
echo "------------------------------------------------------------"
echo " livebar – Dashboard   : http://localhost:3000/dashboard"
echo " livebar – Kết nối TikTok: http://localhost:3000/tiktok-connect.html"
echo " livebar – Overlay OBS : http://localhost:3000/?token=SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI"
echo ""
echo " ĐI CHÙA – Bảng điều khiển: http://localhost:3001/control.html"
echo " ĐI CHÙA – Overlay OBS   : http://localhost:3001/overlay.html"
echo "============================================================"
echo " (Đóng cửa sổ này để tắt cả hai server)"

# Tắt cùng lúc khi đóng Terminal
trap "kill $LIVEBAR_PID $CHUA_PID 2>/dev/null" EXIT
wait
