# Hướng dẫn cho AI agent (Claude Code, Codex, Antigravity, Cursor…)

File này dành cho AI được người dùng nhờ **cài đặt, chạy thử hoặc sửa** Chánh Điện An Lạc, một overlay TikTok LIVE chủ đề chùa online. Người dùng thường **không biết lập trình**. Đọc hết file này trước khi chạy lệnh nào.

Hướng dẫn cho người đọc nằm ở [docs/CAI-DAT.md](docs/CAI-DAT.md). Khi cần chỉ người dùng tự làm một bước, dẫn họ tới mục tương ứng trong file đó.

## Quy tắc bắt buộc

1. **Nói với người dùng bằng tiếng Việt, câu ngắn, không dùng thuật ngữ.** Mỗi bước nói rõ: đang làm gì, mất bao lâu, người dùng cần làm gì.
2. **Không bao giờ hỏi, nhập hay lưu mật khẩu, cookie, mã đăng nhập TikTok.** Tool chỉ cần `@tênkênh` và chỉ đọc sự kiện công khai.
3. **Không bấm "Phát LIVE" và không thao tác trên tài khoản TikTok của người dùng.** Đăng nhập LIVE Studio, bấm Phát LIVE, xin quyền live là việc người dùng tự làm. Chỉ hướng dẫn họ.
4. **Không dựng camera ảo hay hình giả để lách yêu cầu camera của LIVE Studio** khi người dùng định phát live công khai. TikTok xử lý live không có người thật, tài khoản mới có thể mất quyền live từ máy tính. Không có webcam thì hướng dẫn dùng điện thoại làm webcam (docs/CAI-DAT.md, mục Camera).
5. **Không bật bot hay "Đổ người" khi đang kết nối live thật.** Server đã chặn sẵn việc này, đừng sửa code để bỏ chặn.
6. **Không xóa `data/runtime/`**: đó là bảng công đức và cài đặt của người dùng.
7. **Không đổi phiên bản đã ghim** (`package.json`, `VIENEU_REF` trong `cai-giong-vieneu.bat`, gói `huggingface_hub<1.0`) trừ khi người dùng nhờ và đã chạy test lại.
8. Lệnh chạy lâu (cài VieNeu khoảng 3 GB, chạy server) thì **chạy nền** và báo người dùng đang chờ gì.

## Môi trường

- Chỉ hỗ trợ **Windows 10/11 64-bit**. Trên macOS/Linux, app Node vẫn chạy (`npm start`), nhưng TikTok LIVE Studio và các file `.bat` thì không.
- Các file `.bat` dừng chờ bấm phím ở cuối. Khi AI gọi, đặt `NOPAUSE=1` để chúng không dừng.
  - PowerShell: `$env:NOPAUSE='1'; cmd /c .\cai-giong-vieneu.bat`
  - Không gọi `cmd /c file.bat` từ Git Bash bằng đường dẫn tương đối; dùng PowerShell như trên.
- Cổng mặc định: app `3000`, giọng VieNeu `8000`. Bị chiếm cổng thì đặt `PORT` (app) hoặc `VIENEU_URL` (app gọi giọng ở đâu).

## Cài đặt từng bước

### Bước 0: kiểm tra máy

```powershell
node -v            # cần v20 trở lên
git --version      # cần cho bước tải code và cài VieNeu
python --version   # chỉ cần nếu cài giọng VieNeu: 3.10–3.13
nvidia-smi         # có card NVIDIA thì giọng VieNeu chạy bản Turbo (GPU), không có thì bản Nano (CPU)
```

Thiếu Node.js: nhờ người dùng tải bản LTS tại https://nodejs.org (hoặc `winget install OpenJS.NodeJS.LTS` nếu họ đồng ý). Thiếu Python: bản 3.11 tại https://www.python.org/downloads/, nhắc tick **"Add python.exe to PATH"**. Cài xong phải **mở terminal mới** thì lệnh mới nhận.

### Bước 1: tải code

```powershell
git clone https://github.com/DoanDuyThanh71/chua-online-live.git
cd chua-online-live
```

Nên đặt ở ổ D hoặc thư mục ngắn, không dấu, ví dụ `D:\chua-online-live`.

### Bước 2: cài thư viện và chạy test

```powershell
npm install
npm test          # phải pass hết (31 test). Test không cần mạng hay TikTok
```

### Bước 3 (nên làm): cài giọng đọc VieNeu-TTS

Không cài thì tool vẫn đọc bằng giọng Edge qua Internet, nhưng giọng đó hỏng khoảng 30–40% số câu. Hỏi người dùng trước, vì bước này tải khoảng 3 GB (máy có NVIDIA) hoặc vài trăm MB (máy không có).

```powershell
$env:NOPAUSE='1'; cmd /c .\cai-giong-vieneu.bat     # chạy nền, 10–20 phút
```

Script tự tải VieNeu-TTS vào `tools\VieNeu-TTS` (đã ghim commit), tạo `.venv` riêng, có NVIDIA thì cài PyTorch CUDA. Lần đầu chạy server, model tải thêm vài trăm MB từ Hugging Face.

### Bước 4: chạy

Cho người dùng: nháy đúp **`start.bat`**. Nó bật app, bật cửa sổ giọng VieNeu (nếu đã cài) và mở bảng điều khiển.

Cho AI (chạy nền từng cái):

```powershell
npm start                                              # app: http://localhost:3000/control.html
$env:NOPAUSE='1'; cmd /c .\chay-giong-vieneu.bat       # giọng VieNeu: http://127.0.0.1:8000
```

`chay-giong-vieneu.bat` tự chọn: có `nvidia-smi` thì chạy server Turbo của VieNeu (`apps.openai_speech`), không có thì chạy `scripts\giong_nhe.py` (bản Nano, CPU). Ép bản Nano: `$env:VIENEU_MODE='nano'`.

### Bước 5: kiểm tra

```powershell
node scripts/kiem-tra.mjs          # trước khi chạy server
node scripts/kiem-tra.mjs --chay   # sau khi chạy: hỏi app, hỏi giọng và cho đọc thử một câu
```

Dòng ❌ là lỗi phải sửa, ⚠️ là không bắt buộc. Thoát mã 0 nghĩa là không có lỗi chặn.

### Bước 6: hướng dẫn người dùng phần còn lại

Phần này người dùng tự làm, AI chỉ đọc cho họ từng bước theo [docs/CAI-DAT.md](docs/CAI-DAT.md):

1. Bảng điều khiển → **Cài đặt → Giọng đọc** → chọn giọng (máy có NVIDIA: *Thiền Tâm Đức*; không có: *Minh Quân*) → **Lưu**.
2. Thử: **Mở overlay (có âm thanh)** → **Bật âm thanh** → bấm **Xin xăm**, **Thỉnh chuông**.
3. TikTok LIVE Studio: thêm nguồn **Liên kết** `http://localhost:3000/overlay.html`, 1080×1920, **Vừa với màn hình**; thêm camera thật.
4. Người dùng bấm **Phát LIVE**, rồi nhập `@tênkênh` vào bảng điều khiển và bấm **Kết nối**.

## Khi người dùng muốn làm phiên bản riêng

Nhiều người dùng chung một bản dễ bị TikTok coi là nội dung trùng lặp. Các chỗ nên đổi:

| Muốn đổi | Sửa ở đâu |
| --- | --- |
| Tên chùa, dòng phụ | Bảng điều khiển → Cài đặt (không cần sửa code) |
| Hình nền | `public/assets/hall.jpg`, giữ đúng **1080×1920**. Bồ đoàn và vị trí ngồi tính theo hình này trong `public/seats.js`; đổi bố cục hình thì phải chỉnh lại tọa độ |
| Nhạc nền | `public/assets/music/music1.mp3`, `music2.mp3` (danh sách ở `TRACKS` trong `public/overlay.js`). Chỉ dùng nhạc có quyền phát |
| Nội dung thẻ an lạc | `data/fortunes.json`. Giữ đúng cấu trúc: `n`, `grade`, `title`, `poem` (4 câu), `meaning`. Thẻ là lời chúc giải trí, không viết thành lời hứa hay bói toán |
| Câu bình luận nhận diện | `server/rules.mjs` |
| Chủ đề khác (tu tiên, …) | Làm theo hướng: thay hình, nhạc, câu chữ, giữ nguyên lõi trong `server/temple.mjs`. Nội dung kiểu "đày" hay nguyền rủa người thật thì không làm (xem docs/KE-HOACH.md, mục đã quyết định không làm) |

Sửa xong luôn chạy `npm test`.

## Cấu trúc code

```
server/index.mjs     HTTP + WebSocket, bảo mật, bảng điều khiển, bot
server/temple.mjs    lõi: sự kiện → nghi lễ, công đức, thẻ, lời nguyện, mốc; cài đặt hợp lệ (VOICES)
server/tiktok.mjs    kết nối TikTok qua tiktok-live-connector (không chính thức), tự nối lại
server/tts.mjs       giọng đọc: VieNeu (vieneu:<tên>) → Edge → giọng trình duyệt
scripts/giong_nhe.py server giọng VieNeu v3 Nano cho máy không có NVIDIA
scripts/kiem-tra.mjs kiểm tra cài đặt
public/overlay.*     màn hình 9:16 · public/control.* bảng điều khiển
```

## Lỗi đã gặp và cách sửa

| Lỗi | Nguyên nhân | Sửa |
| --- | --- | --- |
| VieNeu: `huggingface-hub>=0.34.0,<1.0 is required … found 1.x` | `pip install -e` nâng `huggingface_hub` | `tools\VieNeu-TTS\.venv\Scripts\python.exe -m pip install "huggingface_hub>=0.34.0,<1.0"` (script cài đã làm sẵn) |
| pip báo gradio xung đột huggingface_hub | gradio chỉ dùng cho web UI của VieNeu | Bỏ qua, server API không cần gradio |
| TikTok: `Failed to retrieve Room ID from all sources` | Lần đầu hay bị | App tự thử lại, thường vào được ở lần 2 |
| TikTok: `isn't online` | Kênh chưa phát live | Người dùng bấm Phát LIVE trước, đợi 20–30 giây rồi kết nối |
| Edge TTS: `no turn.end received` | Dịch vụ Edge chập chờn | App tự thử lại và chuyển sang VieNeu; nên cài VieNeu |
| Overlay trong LIVE Studio bị nhỏ hoặc chỉ thấy một góc | Khung nguồn không vừa khung | Chọn nguồn → nút ⤢ → **Vừa với màn hình** |
| LIVE Studio: camera đỏ, "độ phân giải không khả dụng" | Camera không có tín hiệu (thường là OBS Virtual Camera chưa bật) | Dùng camera thật hoặc điện thoại làm webcam |
