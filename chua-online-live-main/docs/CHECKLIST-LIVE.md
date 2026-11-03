# Checklist buổi live

## Trước giờ live (làm một lần)

- [ ] Máy đã cài **Node.js 20 trở lên**: mở cmd, gõ `node -v`
- [ ] Code mới nhất: `git pull` trong thư mục `chua-online-live`, hoặc tải repo về nếu là máy khác
- [ ] Đã cài **TikTok LIVE Studio** hoặc **OBS**, và tài khoản đã **được phép live từ máy tính**
- [ ] Tắt chế độ ngủ của máy: Settings → System → Power → Sleep: **Never** khi đang cắm sạc
- [ ] Mạng ổn định, tốc độ upload từ khoảng **6 Mbps** trở lên
- [ ] **Tạm dừng Windows Update** (Settings → Update & Security → Pause updates 7 days), để máy không tự khởi động lại giữa buổi live
- [ ] Cài **giọng VieNeu** chạy trên máy: nháy đúp `cai-giong-vieneu.bat` (cần Git và Python 3.10–3.13, tải khoảng 3 GB). Sau đó trong bảng điều khiển → Cài đặt → Giọng đọc, chọn **Thiền Tâm Đức** hoặc giọng khác trong nhóm VieNeu rồi bấm Lưu
- [ ] Có thể cài thêm **giọng tiếng Việt của Windows** làm lớp dự phòng cuối: Settings → Time & Language → Speech → Add voices → Vietnamese
- [ ] Nếu Windows Firewall hỏi quyền cho Node.js khi chạy lần đầu, chọn **Private network** hoặc Cancel đều được (server chỉ chạy trong máy)
- [ ] Máy RTX 3060 Ti: trong OBS hoặc Live Studio, chọn bộ mã hóa **NVENC (GPU)** để CPU nhẹ

## Chuẩn bị, khoảng 15 phút trước live

1. Nháy đúp **`start.bat`**. **Giữ cửa sổ đen này mở suốt buổi**, đóng là overlay ngừng chạy. Nếu đã cài VieNeu, sẽ có thêm cửa sổ thu nhỏ "Giong doc VieNeu": cũng giữ mở. Lần đầu VieNeu tải model và khởi động khoảng 1 phút.
2. Bảng điều khiển tự mở. Nếu không, vào http://localhost:3000/control.html
3. Thử nhanh: bấm **Xin xăm**, **Chuông · 199**, **Kinh hành**, rồi xem overlay có phản ứng và **có tiếng đọc** không.
4. Bấm **Làm trống bồ đoàn** để xóa người thử. Bấm **Bắt đầu buổi mới** để đặt lại bảng công đức của buổi.
5. Trong TikTok LIVE Studio hoặc OBS, thêm **Browser source**:
   - URL: `http://localhost:3000/overlay.html`
   - Kích thước: **1080 × 1920**
   - Nếu phần mềm chỉ có Window capture: mở overlay bằng nút **Mở overlay (có âm thanh)**, bấm **Bật âm thanh** một lần trong cửa sổ đó, rồi capture cửa sổ.
6. Chỉ để **một** nguồn overlay có âm thanh. Các cửa sổ xem thử khác dùng `overlay.html?audio=0`.
7. **Kiểm tra âm thanh có lên live không**: xem phần xem trước của Live Studio hoặc OBS, bấm Thỉnh chuông và nhìn thanh âm lượng. Với Window capture, âm thanh trình duyệt thường **không** tự lên live, phải thêm nguồn âm thanh desktop hoặc âm thanh ứng dụng.
8. Nếu dùng Window capture: **không thu nhỏ cửa sổ overlay** (để nó nằm sau các cửa sổ khác thì được). Trình duyệt sẽ làm chậm hoặc dừng hoạt cảnh của cửa sổ bị thu nhỏ.

## Lúc live

1. Bấm **Phát trực tiếp** trên TikTok trước.
2. Trong bảng điều khiển, nhập `@tênkênh` và bấm **Kết nối**. Trạng thái ở góc trên phải phải chuyển sang **"đang nhận sự kiện"**.
3. Nhờ một người bình luận thử "xin xăm" để kiểm tra.
4. Khi đã kết nối, server **tự tắt bot và dọn người thử**, nút Bot và Đổ người bị khóa. Người tạo từ mục Thử tương tác luôn có nhãn **"·thử"** sau tên. Hạn chế bấm Thử tương tác khi đang live để màn hình chỉ có người xem thật.
5. Thỉnh thoảng mở mục **Duyệt lời nguyện** để duyệt lời nguyện của người xem.

## Nếu có lỗi

| Hiện tượng | Cách xử lý |
|---|---|
| "chưa phát trực tiếp (offline)" | Bật LIVE trên TikTok trước, đợi khoảng 30 giây rồi bấm Kết nối lại |
| "Máy chủ ký… giới hạn lượt" | Đợi vài phút. Nếu lặp lại nhiều lần thì cần khóa `SIGN_API_KEY` (Euler Stream) |
| "Chưa lấy được mã phòng live" | Bình thường ở lần đầu, server tự thử lại sau vài giây. Lần thử ngày 02/11 đều vào được ở lần thứ 2 |
| Mất kết nối giữa buổi | Server tự thử lại tối đa 8 lần. Nếu báo hết lượt thử thì bấm Kết nối lại |
| Không có tiếng đọc | Xem nhật ký: "chưa chạy server VieNeu" thì mở `chay-giong-vieneu.bat`. Giọng đang chọn lỗi thì server tự chuyển sang nguồn còn lại, cả hai lỗi thì dùng giọng trình duyệt. Nếu vẫn im lặng, kiểm tra đã bấm **Bật âm thanh** trong cửa sổ overlay chưa |
| Overlay đứng hình, hoạt cảnh chậm | Cửa sổ overlay đang bị thu nhỏ. Mở lại cửa sổ, hoặc chuyển sang Browser source |
| TikTok báo live "chất lượng thấp" hoặc ít được đề xuất | Live chỉ có overlay tự chạy thì dễ bị đánh giá thấp. Thỉnh thoảng nói vài câu bằng micro, chào người mới, hoặc dùng "Lời thầy trụ trì" |
| Giọng đọc phát hai lần | Đang mở hai overlay có âm thanh. Đóng bớt một cái, hoặc thêm `?audio=0` cho cái còn lại |

**Sau buổi live**: chép toàn bộ khung **Nhật ký** trong bảng điều khiển (hoặc chụp màn hình cửa sổ đen) và gửi lại để kiểm tra kết nối TikTok thật có vấn đề gì không.
