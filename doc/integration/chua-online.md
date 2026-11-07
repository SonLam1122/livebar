# Tich Hop Chua Online (Chanh Dien An Lac)

## 1. Tong Quan
Module Chua Online (Chanh Dien An Lac) da duoc tich hop toan dien vao Livebar:
- ID man hinh: `cmtdichua0001`
- Loai game: `di_chua`
- Nut chuyen game: `Đi Chùa` tren Navbar

## 2. He Thong Luat Tuong Tac (Rules)
Bao gom 13 luat tuong tac mac dinh va ho tro them/sua/xoa truc tiep tu Tab Luat choi:
- **Binh luan**:
  - `xin xam`: Rut the que an lac, phat tho va loi chuc (+5 cong duc).
  - `go mo`: Hieu ung mo go thanh am tram am (+3 cong duc).
  - `thinh chuong`: Tieng chuong chua dai hong chung (+3 cong duc).
  - `thap huong`: Dang nen huong len ban tho (+3 cong duc).
  - `lay Phat`: Nhan vat quy lay sam hoi (+3 cong duc).
  - `cau...` / `nguyen...`: Gui loi nguyen cau an, tha den troi (+5 cong duc).
  - `kinh hanh`: Di kinh hanh mot vong quanh chanh dien (+2 cong duc).
  - `Moi binh luan`: Vao chanh dien ngoi bo doan thien dinh (+1 cong duc).
- **Tha tim**: Bay tim quanh nhan vat, go mo nhe (+1 cong duc/tim).
- **Tang qua**:
  - Xuong ten hoi huong cong duc bang giong doc TTS tieng Viet (+10 cong duc/xu).
  - Tang tu 10 xu: Buoc len 3 bo doan vang danh du hoac len truoc ban tho lay Phat.
- **Theo doi & Chia se**: Tri an cong duc tren man hinh.

## 3. He Thong Am Thanh & TTS (Sound)
- Bo am thanh Zen thanh tinh:
  - `mo`: Tieng mo go tu nhien qua Web Audio API (dao dong tan so 620Hz xuong 380Hz qua bo loc bandpass 700Hz).
  - `bell`: Tieng chuong chua da am sac voi 4 hoa am (216Hz, 432Hz, 1296Hz, 2160Hz).
  - `fortune`: Am thanh an lac khi gieo duoc the que may man.
  - `bgm`: 2 ban nhac thien khong loi thanh tinh (`/assets/music/music1.mp3`, `/assets/music/music2.mp3`).
- Giong doc xướng tên hoi huong: Ho tro Edge TTS va VieNeu-TTS cuc bo (Nam Minh, Hoai My, Thien Tam Duc, v.v.).

## 4. Bang Cau Hinh Chanh Dien (Config)
Trang bi day du cac muc tuy chinh:
- **Hoanh phi**: Tieu de, cau doi, bat/tat lich am.
- **Bo doan**: Tu dong mo rong (24 den 100 cho), moc xu len bo doan vang, cho phep doi cho.
- **Mo & Chuong**: Bat/tat mo go nhip tu dong, chinh toc do BPM (30 den 90), chu ky tung kinh tu dong.
- **The que An Lac**: Che do rut the (mien phi/chi nguoi tang qua), moc xu uu tien, thoi gian cho.
- **Giong doc**: Chon giong TTS, bat/tat xuong ten qua, doc kem loi nguyen, bo loc tu cam.
- **Dong bo thoi gian thuc**: Moi thay doi khi bam "Luu cau hinh" duoc dong bo ngay lap tuc toi engine Chanh Dien qua WebSocket `/ws`.

## 5. Tuong Thich Ha Tang WebSocket & Socket.IO
- `server/chuaBridge.js` su dung `new WebSocketServer({ noServer: true })` va gan trinh xu ly su kien `upgrade` chi rieng cho duong dan `/ws`.
- Co che nay tach biet hoan toan kenh WebSocket `/ws` cua Chua Online khoi kenh `/socket.io/` cua 10 game goc (Live Bar, Ca Lon Be, San Co, v.v.), dam bao overlay tat ca cac game khong bi ngat ket noi hoac bi man hinh den trong khung xem truoc OBS.
