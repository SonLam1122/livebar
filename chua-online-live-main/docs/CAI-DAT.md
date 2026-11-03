# Hướng dẫn cài đặt cho người mới

Làm lần lượt từ trên xuống, mất khoảng 30–45 phút cho lần đầu (phần lớn là chờ tải). Không cần biết lập trình.

Muốn để AI cài giúp thì xem [PROMPT-CAI-DAT.md](PROMPT-CAI-DAT.md): copy prompt trong đó, dán vào Claude Code, Codex hoặc Antigravity.

## 1. Cần chuẩn bị

| Thứ cần có | Ghi chú |
| --- | --- |
| Máy tính Windows 10/11 64-bit | RAM 16 GB là chạy ổn. Không cần card rời; có card NVIDIA thì giọng đọc hay hơn |
| Mạng | Upload từ 6 Mbps trở lên, cắm dây LAN thì tốt nhất |
| Tài khoản TikTok có quyền live từ máy tính | Đủ 18 tuổi, không dính vi phạm. Xem mục 6 |
| Camera | Laptop có sẵn thì dùng luôn. Máy bàn không có webcam thì dùng điện thoại làm webcam (mục 7) |
| Micro | Tai nghe có micro là đủ |

## 2. Cài phần mềm nền

1. **Node.js**: vào https://nodejs.org, tải bản **LTS**, cài mặc định (bấm Next đến hết).
2. **Git** (cần nếu cài giọng VieNeu): https://git-scm.com, cài mặc định.
3. **Python 3.11** (cần nếu cài giọng VieNeu): https://www.python.org/downloads/. Ở màn hình đầu tiên **tick ô "Add python.exe to PATH"** rồi mới bấm Install.
4. **TikTok LIVE Studio**: https://www.tiktok.com/studio/download

## 3. Tải tool

Cách dễ nhất: vào https://github.com/DoanDuyThanh71/chua-online-live, bấm nút xanh **Code → Download ZIP**, giải nén ra ổ D, ví dụ `D:\chua-online-live`.

Nên đặt ở thư mục ngắn, **không dấu, không khoảng trắng**.

## 4. Chạy thử lần đầu

1. Nháy đúp **`start.bat`**. Lần đầu nó tự cài thư viện (khoảng 1 phút), rồi tự mở bảng điều khiển trên trình duyệt.
2. **Giữ cửa sổ đen này mở** suốt buổi live. Đóng là overlay ngừng chạy.
3. Windows Firewall hỏi quyền cho Node.js thì chọn Private hoặc Cancel đều được.
4. Trong bảng điều khiển: bấm **Mở overlay (có âm thanh)**, trong cửa sổ overlay bấm **Bật âm thanh**, rồi quay lại bấm thử **Xin xăm**, **Thỉnh chuông**, **Kinh hành**. Có hình và có tiếng đọc là được.

## 5. Cài giọng đọc VieNeu (nên làm)

Không cài thì tool vẫn đọc bằng giọng Edge qua Internet, nhưng giọng này hay hỏng (khoảng 1/3 số câu). [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) là giọng Việt mã nguồn mở chạy ngay trên máy.

1. Tắt cửa sổ đen của `start.bat` (nếu đang mở).
2. Nháy đúp **`cai-giong-vieneu.bat`**, chờ đến khi hiện **"Cai xong"**.
   - Máy có card NVIDIA: tải khoảng 3 GB, 10–20 phút.
   - Máy không có: nhẹ hơn nhiều.
3. Nháy đúp lại **`start.bat`**. Sẽ có thêm cửa sổ thu nhỏ **"Giong doc VieNeu"**, cũng giữ mở. Lần đầu chờ khoảng 1 phút để nó tải model.
4. Bảng điều khiển → **Cài đặt → Giọng đọc**:
   - Máy có NVIDIA: chọn trong nhóm **VieNeu Turbo**, gợi ý **Thiền Tâm Đức**.
   - Máy không có: chọn trong nhóm **VieNeu Nano**, gợi ý **Minh Quân**.
   - Bấm **Lưu**, rồi bấm Xin xăm để nghe thử.

## 6. Xin quyền live trên máy tính

Mở LIVE Studio, đăng nhập tài khoản TikTok. Nếu góc trên hiện **"No access"**, bấm vào đó để nhận **quyền dùng thử 14 ngày**. Không bị vi phạm trong 14 ngày đó thì TikTok tự gia hạn. Vì vậy 2 tuần đầu phải live cẩn thận (mục 10).

## 7. Camera

LIVE Studio yêu cầu có camera. Không có webcam thì dùng điện thoại:

- **Iriun Webcam** (iPhone và Android): cài trên máy tính (iriun.com) và trên điện thoại, hai máy cùng wifi, mở app trên điện thoại là máy tính nhận camera tên "Iriun Webcam".
- **Android + Windows 11**: Settings → Bluetooth & devices → Mobile devices → bật quyền truy cập, ghép điện thoại qua app Link to Windows, bật "Use as a connected camera".

Không nên dùng camera ảo (OBS Virtual Camera phát hình tĩnh) khi live thật: TikTok coi là live không có người.

## 8. Thiết lập TikTok LIVE Studio

1. Lần đầu mở, LIVE Studio hỏi mấy bước:
   - Loại nội dung: **Phiên LIVE thông thường** (không chọn game).
   - Micrô: chọn **micro thật**, không chọn kiểu "CABLE Output".
   - Camera: chọn webcam hoặc điện thoại. Trải đều màn hình: **Xén**.
   - Chất lượng: **Ưu tiên chất lượng (1080p)**.
2. Ở màn hình chính chọn chế độ **dọc** (biểu tượng điện thoại).
3. **Thêm nguồn → Liên kết**, dán `http://localhost:3000/overlay.html`, kích thước **1080 × 1920**.
4. Chọn nguồn Liên kết → bấm mũi tên cạnh biểu tượng ⤢ trên thanh công cụ → **Vừa với màn hình**. Đúng thì chánh điện phủ kín khung điện thoại.
5. Kéo khung camera nhỏ lại, đặt vào một góc, để nó nằm trên lớp Liên kết.
6. Bấm **Thỉnh chuông** trên bảng điều khiển: thanh loa ở dưới LIVE Studio phải nhảy.

## 9. Lên live

1. Bảng điều khiển: bấm **Làm trống bồ đoàn**, rồi **Bắt đầu buổi mới**.
2. Tắt hết tab nhạc, YouTube.
3. LIVE Studio → **Phát LIVE** → điền tiêu đề (ví dụ *Chánh Điện An Lạc – bình luận "xin xăm" nhận thẻ an lạc*), chọn chủ đề **Trò chuyện**, ghi trong phần giới thiệu là giọng và hình do AI tạo → **Phát LIVE**.
4. Đợi 15–20 giây, vào bảng điều khiển nhập `@tênkênh` → **Kết nối**. Góc trên phải hiện **"đang nhận sự kiện"** là xong.
5. Nhờ một người bình luận "xin xăm" để thử.

## 10. Lưu ý để không bị khóa tài khoản

- **Luôn có người trực.** Khoảng 5 phút nói một câu vào micro, hoặc gõ vào ô **Lời thầy trụ trì** để giọng đọc nói thay.
- Buổi đầu live **dưới 30 phút**. Sau đó mỗi buổi dưới 3 tiếng.
- **Không** nói "tặng quà để được phù hộ", **không** kêu gọi chuyển khoản công đức ra ngoài TikTok, **không** tự nhận là chùa thật. Pháp luật Việt Nam cấm lợi dụng tín ngưỡng để trục lợi.
- **Không** phát nhạc có bản quyền.
- **Không** bật bot hay "Đổ người" khi đang live (tool đã tự khóa).
- Nên **đổi tên chùa, hình nền, nhạc nền** để không trùng với người khác (xem AGENTS.md, mục phiên bản riêng).

## 11. Kiểm tra khi có lỗi

Mở cửa sổ dòng lệnh (bấm vào thanh địa chỉ của thư mục tool, gõ `cmd`, Enter) rồi chạy:

```
node scripts/kiem-tra.mjs --chay
```

Nó báo từng phần: Node.js, thư viện, giọng VieNeu, app có chạy không, giọng có đọc được không. Dòng ❌ kèm cách sửa.

| Hiện tượng | Cách xử lý |
| --- | --- |
| Overlay nhỏ hoặc chỉ thấy một góc | Nguồn Liên kết → ⤢ → Vừa với màn hình |
| Camera đỏ, "độ phân giải không khả dụng" | Camera không có tín hiệu: chọn camera thật, mở danh sách độ phân giải và chọn mức có sẵn |
| Nút Phát LIVE bị mờ | Chưa chọn chủ đề |
| "Chưa phát trực tiếp (offline)" | Bật live trước, đợi 30 giây rồi bấm Kết nối lại |
| "Chưa lấy được mã phòng live" | Bình thường ở lần đầu, tool tự thử lại |
| Không có tiếng đọc | Đã bấm Bật âm thanh trong overlay chưa; cửa sổ "Giong doc VieNeu" còn mở không |
| Giọng đọc phát hai lần | Đang mở hai overlay có tiếng; cái xem thử mở bằng `overlay.html?audio=0` |
| Hoạt cảnh giật | Tắt OBS nếu đang mở cùng lúc |

Hỏi người hỗ trợ thì gửi kèm kết quả lệnh kiểm tra và khung **Nhật ký** trong bảng điều khiển.
