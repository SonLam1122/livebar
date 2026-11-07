# Chánh Điện An Lạc · TikTok LIVE

Overlay 9:16 cho TikTok LIVE, chủ đề chánh điện online. Người xem vào live sẽ được ngồi thiền trên bồ đoàn. Họ có thể gõ mõ, thỉnh chuông, thắp hương, rút thẻ an lạc và gửi lời nguyện bằng bình luận. Ai tặng quà sẽ được xướng tên hồi hướng bằng giọng đọc tiếng Việt và ghi tên lên bảng công đức.

Bản này gom các điểm hay của 8 dự án cùng chủ đề trên GitHub và viết lại từ đầu, với bảo mật mặc định an toàn và có test tự động. Nguồn gốc từng phần xem [THIRD_PARTY.md](THIRD_PARTY.md).

## Người mới bắt đầu từ đây

- **Để AI cài giúp**: copy prompt trong [docs/PROMPT-CAI-DAT.md](docs/PROMPT-CAI-DAT.md), dán vào Claude Code, Codex hoặc Antigravity. AI sẽ đọc [AGENTS.md](AGENTS.md) và tự cài.
- **Tự cài từng bước**: [docs/CAI-DAT.md](docs/CAI-DAT.md)
- **Kiểm tra cài đặt**: `node scripts/kiem-tra.mjs --chay`
- **Chuẩn bị đi live**: [docs/CHECKLIST-LIVE.md](docs/CHECKLIST-LIVE.md)
- **Kế hoạch, việc đang chờ, những gì đã quyết định không làm**: [docs/KE-HOACH.md](docs/KE-HOACH.md)

## Chạy nhanh (Windows)

Cần **Node.js 20 trở lên**: tải bản LTS tại https://nodejs.org.

1. Nháy đúp `start.bat`. Lần đầu file này tự chạy `npm install`, rồi mở bảng điều khiển.
2. Trong bảng điều khiển, bấm **Mở overlay (có âm thanh)**.
3. Chưa live vẫn thử được: dùng mục **Thử tương tác** hoặc **Bật bot**.

**Giọng đọc chạy trên máy (nên cài)**: nháy đúp `cai-giong-vieneu.bat` một lần. File này cài [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) (mô hình giọng Việt mã nguồn mở của Phạm Nguyễn Ngọc Bảo, Apache-2.0) vào `tools\VieNeu-TTS`. Cần **Git** và **Python 3.10–3.13**. Có card NVIDIA thì cài bản GPU (tải khoảng 3 GB) và chạy giọng **v3 Turbo** (10 giọng, nên chọn **Thiền Tâm Đức**). Máy không có card NVIDIA thì tự chạy bản **v3 Nano** bằng CPU qua `scripts/giong_nhe.py` (9 giọng riêng, cộng Mai Anh và Trúc Ly; trên Core i5-14500 câu 7 giây mất khoảng 1 giây để tạo). Sau đó `start.bat` tự bật giọng VieNeu trong một cửa sổ thu nhỏ.

Hoặc chạy bằng dòng lệnh:

```bash
npm install
npm start
```

- Bảng điều khiển: http://localhost:3000/control.html
- Overlay: http://localhost:3000/overlay.html

## Đưa lên live

**TikTok LIVE Studio hoặc OBS**: thêm nguồn *Browser source* trỏ tới `http://localhost:3000/overlay.html`, kích thước **1080×1920**. Nếu phần mềm không có Browser source thì dùng *Window capture* chọn cửa sổ overlay, nhớ bấm "Bật âm thanh" một lần trong cửa sổ đó.

1. Bật LIVE trên TikTok.
2. Nhập `@tênkênh` vào bảng điều khiển và bấm **Kết nối**. Nếu mất kết nối, server tự thử lại tối đa 8 lần với thời gian chờ tăng dần.
3. Chỉ để **một** cửa sổ overlay có âm thanh. Các cửa sổ xem thử khác mở bằng `overlay.html?audio=0`, nếu không giọng đọc sẽ phát hai lần.

## Người xem làm được gì

| Người xem | Trên live |
|---|---|
| Bình luận bất kỳ | Vào chánh điện, ngồi xuống bồ đoàn (24 chỗ, tự mở rộng tới 36, 64, 100), hiện bong bóng lời nói, +1 công đức (mỗi 10 giây một lần) |
| `xin xăm` / `gieo quẻ` / `rút thẻ` | Rút **thẻ an lạc**: thẻ hiện lên đúng lúc giọng đọc bắt đầu, người rút được chiếu sáng. Mỗi người được rút miễn phí 10 phút một lần |
| `gõ mõ` · `thỉnh chuông` · `thắp hương` · `lạy Phật` | Hiệu ứng và âm thanh tương ứng trên nhân vật của người đó, +3 công đức |
| `cầu …` / `nguyện …` / `xin cho …` | Lời nguyện vào hàng **chờ duyệt**. Duyệt xong thì thả đèn trời và đọc lên live |
| `nam` `nữ` `sư` `ni` `tiểu` `bà` `cao tăng` | Đổi hình nhân vật. Chỉ áp dụng khi bình luận chỉ có đúng chữ đó, nên "Nam mô A Di Đà Phật" không bị hiểu là "nam" |
| `sang trái` · `sang phải` · `lên` · `xuống` | Dời sang bồ đoàn trống gần nhất theo hướng đó. Đi lên hoặc đi ngang thì nhân vật đứng dậy và bước sang. Đi xuống thì mờ đi rồi hiện ở chỗ mới. Mỗi 3 giây một lần |
| `kinh hành` / `đi dạo` | Đứng dậy, đi một vòng trước bàn thờ rồi về chỗ (2 phút một lần) |
| `lên lạy Phật` | Đi lên trước bàn thờ, quỳ lạy 3 lạy rồi về chỗ (3 phút một lần) |
| Thả tim | Tim bay trên nhân vật, tiếng mõ nhẹ, +1 công đức mỗi tim (tối đa 15 mỗi phút) |
| Theo dõi / Chia sẻ | Thông báo cảm ơn, +10 / +5 công đức |
| Tặng quà | Banner xướng tên kèm "lần thứ n", giọng đọc hồi hướng (đọc lời nguyện gần nhất của người đó nếu lời đó sạch), hiệu ứng theo giá trị quà, +10 công đức mỗi xu. Quà từ 5 xu được rút thẻ và được xếp trước người rút miễn phí |

**Bồ đoàn vàng**: 3 người tặng nhiều xu nhất trong buổi, mỗi người tối thiểu 10 xu, được đi lên ngồi ba bồ đoàn vàng ngay trước bàn thờ, và đổi vị trí theo thứ hạng. Ai tặng từ 10 xu mà chưa vào top 3 thì tự đi lên lạy Phật. Cùng lúc tối đa 6 người được đi lại để màn hình không bị loạn. Người đang ngồi bồ đoàn vàng không dời chỗ được.

**Mốc cộng đồng**: khi tổng công đức, số tim hoặc số người xem chạm mốc (100, 300, 500, 1.000…) thì có mưa hoa, chuông lớn và lời hồi hướng. Mỗi mốc chỉ chạy một lần mỗi buổi. Nếu một lần vượt nhiều mốc cùng lúc thì chỉ chúc mốc cao nhất.

## Bảng điều khiển

- **Duyệt lời nguyện**: ẩn hoặc duyệt từng lời. Có thể bật tự duyệt.
- **Lời thầy trụ trì**: gõ lời nhắn để đọc và hiện lên live. Có nút tụng kinh, thỉnh chuông, gõ mõ.
- **Cài đặt** (lưu lại sau khi tắt server):
  - giọng Nam Minh hoặc Hoài My, độ trầm, tốc độ đọc
  - nhạc nền, nhịp mõ, tụng kinh định kỳ
  - chế độ rút thẻ: miễn phí, chỉ khi tặng quà, hoặc tắt; mức quà tối thiểu
  - nhắc người xem chia sẻ định kỳ
  - xen kẽ bảng công đức trọn đời
  - ngày âm lịch
  - cho phép người xem đổi chỗ, kinh hành, lên lạy Phật; mức xu cho bồ đoàn vàng và cho tự lên lạy Phật
  - danh sách từ cấm thêm
- **Buổi live**: "Bắt đầu buổi mới" đặt lại bảng công đức của buổi. Công đức trọn đời vẫn giữ, muốn xóa phải gõ đúng chữ `XÓA`.
- **Dữ liệu thử** từ nút giả lập hoặc bot chỉ hiện trên màn hình, không bao giờ ghi vào bảng công đức trọn đời.

## An toàn và bảo mật

- **Không dùng tài khoản TikTok.** Server chỉ đọc sự kiện công khai của phòng live theo username. Không hỏi và không lưu mật khẩu, cookie hay session.
- **Chỉ mở trên máy phát.** Server nghe ở `127.0.0.1`. Muốn mở ra mạng LAN (ví dụ điều khiển bằng điện thoại) thì đặt `HOST=0.0.0.0` **và** `ADMIN_TOKEN=<chuỗi dài>`, rồi mở `http://<ip-máy>:3000/control.html?key=<token>`. Thiếu token thì server từ chối khởi động.
- **Chặn trang web lạ.** Server kiểm tra header Host (chống DNS rebinding) và Origin của WebSocket. Overlay chỉ nhận dữ liệu, không gửi được lệnh.
- **File tĩnh theo danh sách trắng**: chỉ phục vụ `public/` và file giọng đọc. Không phục vụ mã server, `package.json` hay file ẩn.
- **Không tin dữ liệu người xem**:
  - Tên và bình luận bị cắt độ dài, chữ kiểu "𝓜𝓪𝓷𝓱" được đưa về chữ thường.
  - Mọi chữ trên màn hình vẽ bằng `textContent` hoặc canvas, không chèn HTML.
  - Bộ lọc từ tục so khớp nguyên từ, không đánh nhầm "đi cưới", "buổi live", "các bạn".
  - Bình luận có từ cấm vẫn được vào ngồi nhưng không hiện và không đọc.
- **Chống spam**:
  - Công đức bình luận có thời gian chờ, tim có giới hạn mỗi phút.
  - Hàng đợi giọng đọc tối đa 15 câu, quà và thẻ được ưu tiên, câu thường chờ quá 60 giây thì bỏ.
  - Chuông, mõ, hương có thời gian chờ riêng cho từng người.
- **Dữ liệu** nằm trong `data/runtime/state.json`, ghi kiểu nguyên tử. Nếu file hỏng, server giữ nguyên file và không ghi đè.

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng |
| `HOST` | `127.0.0.1` | Địa chỉ lắng nghe |
| `ADMIN_TOKEN` | (trống) | Bắt buộc khi `HOST` không phải 127.0.0.1 |
| `TIKTOK_USER` | (trống) | Tự kết nối kênh này khi khởi động |
| `SIGN_API_KEY` | (trống) | Khóa Euler Stream, nếu máy chủ ký miễn phí bị giới hạn lượt. Khóa chỉ nằm trên server |
| `DATA_DIR` | `data/runtime` | Nơi lưu dữ liệu và bộ nhớ đệm giọng đọc |
| `DISABLE_TTS` | (trống) | Đặt `1` để tắt cả VieNeu lẫn Edge TTS và dùng giọng của trình duyệt |
| `VIENEU_URL` | `http://127.0.0.1:8000` | Địa chỉ server VieNeu-TTS |

## Giới hạn cần biết

- `tiktok-live-connector` là **thư viện cộng đồng, không phải API chính thức của TikTok**. Nó có thể ngừng chạy khi TikTok đổi hệ thống. Kiểm tra điều khoản của TikTok trước khi dùng cho kênh của bạn.
- Giọng đọc có hai nguồn: **VieNeu-TTS** chạy ngay trên máy, và **Read Aloud của Microsoft Edge** qua Internet. Edge hỏng khoảng 30–40% số lần (đo ngày 02/11/2026), nên server tự thử lại 3 lần. Giọng đang chọn lỗi thì server chuyển sang nguồn còn lại. Cả hai cùng lỗi thì overlay đọc bằng giọng tiếng Việt của trình duyệt.
- VieNeu tự gắn watermark âm thanh không nghe được vào giọng đọc (tính năng của dự án gốc, để giữ nguyên).
- Hình ảnh và nhạc do AI tạo, lấy từ dự án gốc (xem THIRD_PARTY.md). Kiểm tra điều khoản trước khi dùng thương mại, hoặc thay bằng tài nguyên của bạn.

## Lưu ý về nội dung

Thẻ an lạc là **lời chúc mang tính giải trí**, không phải bói toán, và overlay có ghi rõ điều này. Khi live:

- Không hứa hẹn "tặng quà để được phù hộ".
- Không kêu gọi chuyển khoản "công đức" ra ngoài TikTok.
- Không mạo danh chùa hay tổ chức tôn giáo.

Pháp luật Việt Nam cấm lợi dụng tín ngưỡng để trục lợi. Bạn tự chịu trách nhiệm về nội dung phát sóng, các khoản thu, thuế và việc tuân thủ điều khoản của nền tảng. Dự án không đại diện cho chùa hay tổ chức tôn giáo nào.

## Phát triển

```bash
npm test
```

Có 26 test dùng `node:test`: cú pháp bình luận, bộ lọc từ, đếm chuỗi quà, công đức, mốc, hàng đợi thẻ, duyệt lời nguyện, nhường chỗ, đổi chỗ, kinh hành, bồ đoàn vàng, cài đặt, âm lịch. Phần server được khởi động thật để thử các lớp bảo mật.

```
server/
  index.mjs    HTTP + WebSocket, bảo mật, bảng điều khiển, bot
  temple.mjs   lõi: sự kiện → nghi lễ, công đức, thẻ, lời nguyện, mốc
  rules.mjs    hiểu bình luận (nguyên từ, có hoặc không dấu)
  gifts.mjs    đếm chuỗi quà chính xác
  text.mjs     chuẩn hóa chữ, lọc từ, tên dễ đọc
  tts.mjs      giọng Edge TTS: hàng đợi ưu tiên, bộ nhớ đệm, thử lại
  tiktok.mjs   kết nối TikTok, tự nối lại
  store.mjs    lưu JSON an toàn
public/
  overlay.*    màn hình 9:16
  control.*    bảng điều khiển
  lunar.js     âm lịch
  seats.js     vị trí bồ đoàn (dùng chung cho server và overlay)
data/fortunes.json   30 thẻ an lạc
```

## Giấy phép

MIT, xem [LICENSE](LICENSE). Phần lấy từ kentjuno/chanh-dien-online vẫn theo giấy phép MIT của tác giả gốc, xem [THIRD_PARTY.md](THIRD_PARTY.md).
