# Tich Hop Chua Online (Chanh Dien An Lac)

## 1. Tong Quan
Module Chua Online (Chanh Dien An Lac) da duoc tich hop truc tiep vao thanh chon Game tren Dashboard cua Livebar cung voi 10 game hien co:
- ID man hinh: `cmtdichua0001`
- Loai game: `di_chua`
- Nut chon tren Navbar: `Đi Chùa`

## 2. Cac Diem Ket Noi Tren He Thong
- Giao dien Dashboard: `http://localhost:3000/dashboard`
- Link OBS Overlay: `http://localhost:3000/chua/overlay.html` (kich thuoc 1080x1920)
- Bang dieu khien rieng: `http://localhost:3000/chua/control.html`
- Kenh WebSocket thoi gian thuc: `ws://localhost:3000/ws?role=overlay` va `ws://localhost:3000/ws?role=control`
- Thu muc ma nguon goc: `chua-online-live-main/`

## 3. Cac File Chinh
- `server/chuaBridge.js`: Cau noi khoi tao engine Temple, Voice, Store va gan WebSocketServer `/ws` vao HTTP server chinh.
- `server/staticServer.js`: Dieu huong phuc vu file tinh cho `/chua/*`, `/tts/*`, va cac asset cua Chanh Dien.
- `screens_data.json`: Khai bao man hinh `cmtdichua0001`.
- `dashboard_partials/navbar.html`: Bo sung nut chuyen game `btn-switch-dichua`.
- `dashboard_assets/js/state.js` & `dashboard_assets/js/globalActions.js`: Xu ly logic chuyen man hinh va iframe xem truoc.
- `dashboard_partials/config/config_dichua.html`: The cau hinh va phim tat dieu khien cho Chanh Dien An Lac.

## 4. Kiem Tra & Ket Qua
- Kiem tra ket noi WebSocket `/ws`: Hoat dong chuan xac, phat day du state ban dau.
- Kiem tra static routes: Tat ca deu tra ve HTTP 200 OK.
- Kiem tra unit test module Chua Online: 31/31 test pass.
