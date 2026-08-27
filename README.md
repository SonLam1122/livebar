# TaoLiveTuongTac.com — Local Dashboard & Overlay Runner

Bộ source code hoàn chỉnh của **Bảng điều khiển (Dashboard)** và **Màn hình tương tác (Overlay Live Bar)** từ **TaoLiveTuongTac.com**, đã clone toàn bộ tài nguyên (HTML, CSS, JS bundles, API JSON data, Audio MP3, Sprite, 3D Models, Dancers GIF, Badges, Wings, Textures...) để chạy hoàn toàn trên máy local.

---

## 📁 Cấu trúc thư mục

- [`dashboard.html`](file:///d:/TiktokLive/livebar/dashboard.html): Giao diện Bảng điều khiển (Dashboard) cấu hình màn hình `cmta2zkpq00aokx08uyc7iys2`.
- [`dashboard_assets/`](file:///d:/TiktokLive/livebar/dashboard_assets/): JS Controller ([`dashboard.js`](file:///d:/TiktokLive/livebar/dashboard_assets/dashboard.js)) và CSS giao diện Dashboard.
- [`index.html`](file:///d:/TiktokLive/livebar/index.html): Giao diện Overlay chạy trực tiếp trong OBS Studio.
- [`assets/`](file:///d:/TiktokLive/livebar/assets/): Các bundle PixiJS, Shaders và Theme Runtime của Overlay.
- [`bar/`](file:///d:/TiktokLive/livebar/bar/): Tài nguyên đồ họa sàn nhảy (Dancers GIF, VIP skins, Badges, Wings, DJ Screens...).
- [`football-duel/`](file:///d:/TiktokLive/livebar/football-duel/): Tài nguyên đồ họa game Đấu bóng đá.
- [`army/`](file:///d:/TiktokLive/livebar/army/): Tài nguyên đồ họa game Đại chiến quân đoàn.
- [`chainsaw/`](file:///d:/TiktokLive/livebar/chainsaw/): Tài nguyên đồ họa game Cưa xích.
- [`podium/`](file:///d:/TiktokLive/livebar/podium/): Model 3D Dancer và phông nền vinh quang.
- [`receipt-printer/`](file:///d:/TiktokLive/livebar/receipt-printer/): Máy in và các khung hóa đơn.
- [`vote-tank/`](file:///d:/TiktokLive/livebar/vote-tank/): Bể bình chọn tương tác.
- [`sfx/`](file:///d:/TiktokLive/livebar/sfx/): Toàn bộ âm thanh hiệu ứng.
- [`screen_data.json`](file:///d:/TiktokLive/livebar/screen_data.json): Dữ liệu cấu hình màn hình gốc được tải trực tiếp từ API.
- [`server.js`](file:///d:/TiktokLive/livebar/server.js): Web server chạy bằng Node.js (Zero-dependency).
- [`server.py`](file:///d:/TiktokLive/livebar/server.py): Web server chạy bằng Python 3.
- [`start.bat`](file:///d:/TiktokLive/livebar/start.bat): File nhấp đúp khởi động nhanh trên Windows.

---

## 🚀 Cách khởi chạy

### Cách 1: Nhấp đúp chuột vào file
Chạy file [`start.bat`](file:///d:/TiktokLive/livebar/start.bat).

### Cách 2: Dùng Node.js
```bash
node server.js
```
*(hoặc `npm start`)*

### Cách 3: Dùng Python
```bash
python server.py
```

---

## 🌐 Các đường dẫn truy cập:

1. **Bảng điều khiển Dashboard**:
   ```
   http://localhost:3000/dashboard
   ```
   *(Cung cấp đầy đủ 6 tab: Tổng quan, Cấu hình game, Luật chơi, Giao diện, Âm thanh & TTS, Link Live & Kết nối, cùng công cụ **Giả lập Live (Test tương tác)**)*.

2. **Màn hình Overlay cho OBS / TikTok Live Studio**:
   ```
   http://localhost:3000/?token=SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI
   ```
