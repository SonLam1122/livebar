# Kế hoạch & bối cảnh dự án

Cập nhật: 02/11/2026 (tối). File này để ai mở repo (kể cả Claude ở phiên làm việc sau) nắm được đã làm gì, đang chờ gì, đã quyết định gì và vì sao.

## Quy tắc làm việc

Trước khi làm một tính năng, phải đánh giá trước: **độ khó, khối lượng, nguồn lực cần có** (khóa API, chi phí chạy, hình ảnh mới, thời gian thử) và **rủi ro**. Chủ dự án đồng ý thì mới làm.

## Ưu tiên hiện tại: chánh điện "tích đức"

Bản chánh điện là sản phẩm chính. Mọi tính năng mới phục vụ bản này trước.

### Đã xong
- Overlay 9:16 chánh điện: ngồi thiền, gõ mõ, thỉnh chuông, thắp hương, rút thẻ an lạc (30 thẻ), lời nguyện có duyệt, mốc cộng đồng, âm lịch
- Quà: xướng tên hồi hướng, "lần thứ n", bảng công đức theo buổi và trọn đời, rút thẻ ưu tiên
- Người xem điều khiển nhân vật: `sang trái` / `sang phải` / `lên` / `xuống`, `kinh hành`, `lên lạy Phật`, bồ đoàn vàng cho top 3 người tặng
- Bảo mật mặc định, 27 test tự động
- **Kết nối TikTok thật đã thử (02/11/2026 tối)**: nối vào 3 phòng live đang phát của người khác, chỉ đọc. Nhận đủ bình luận, tim, quà (có combo), chia sẻ, người vào, số người xem; tên và avatar đúng; overlay xếp người thật vào bồ đoàn. Lần đầu thường báo "Failed to retrieve Room ID", lần thử lại thứ 2 thì vào được
- Giọng VieNeu-TTS chạy trên máy (10 giọng), tự chuyển qua lại với Edge khi một bên lỗi. Script cài `cai-giong-vieneu.bat` ghim đúng bản VieNeu đã đọc mã. **Chưa chạy thử thật trên máy**: mới test bằng server VieNeu giả
- Bot thử: tự tắt và dọn người thử khi kết nối live thật, khóa nút Bot / Đổ người, mọi người thử có nhãn "·thử"

### Việc tiếp theo, theo thứ tự

| # | Việc | Độ khó | Nguồn lực | Ghi chú |
|---|---|---|---|---|
| 1 | **Thử một buổi live TikTok thật trên kênh của mình** | — | 1 buổi live khoảng 10–30 phút | Phần nhận sự kiện đã chạy được với live của người khác. Còn phải thử: âm thanh lên live qua Live Studio/OBS, quà thật đi đủ đường (xướng tên, bồ đoàn vàng). Xem [CHECKLIST-LIVE.md](CHECKLIST-LIVE.md) |
| 2 | ~~Sửa bot thử~~ | — | — | Xong 02/11/2026 |
| 3 | **Danh hiệu trọn đời** (Phật tử → Thiện hữu → Hộ pháp → Đại thí chủ) | Dễ | Không | Tổng xu đã được lưu sẵn. Nên định danh người xem bằng mã số tài khoản thay vì @username, vì người xem đổi @username sẽ mất danh hiệu |
| 4 | **Bảng Lễ vật**: khung trên overlay ghi quà nào làm gì | Dễ (chia theo mức xu), trung bình (gán từng món quà) | Danh sách quà người xem hay tặng: tên và số xu | Danh sách quà TikTok thay đổi theo khu vực |
| 5 | **Mục tiêu đạo tràng mỗi buổi**: đủ X xu thì mở hiệu ứng đặc biệt | Trung bình | Không, nếu dùng lại hình có sẵn | Không đặt mục tiêu quá cao |
| 6 | **Order nhạc thiền / bài tụng**: tặng quà để chọn bài kế tiếp từ thư viện của mình, có hàng chờ | Dễ | **Thư viện nhạc thiền có quyền phát** (hiện chỉ có 2 bài AI từ kentjuno) | Gần như không kênh chùa online nào làm. Gộp được với ý "Trưởng đạo tràng chọn nhạc". Xem phần DJ bên dưới |

Ý tưởng khác cho bản chánh điện, chưa đánh giá chi tiết:
- hoa đăng hoặc đèn lồng mang tên treo suốt buổi
- bàn nến Dược Sư sáng dần lên
- "Trưởng đạo tràng" (người đứng đầu buổi) được chọn bài tụng, nhạc, cảnh
- rút thẻ theo chủ đề
- giờ an lạc nhân đôi công đức
- màn hình cảm tạ cuối buổi
- bảng vàng tuần

## Để sau: chế độ "Đày phiền não" (âm phủ)

Ý tưởng: người xem gõ một **phiền não hoặc thói xấu**, ví dụ `đày deadline`, `đày cơn lười`, `đày mất ngủ`, rồi tặng quà để chọn tầng địa ngục. Quà càng lớn thì xuống tầng càng sâu. Diêm Vương gõ búa phán bằng giọng đọc. Có bảng "phiền não bị đày nhiều nhất".

- **Bắt buộc: không cho đày tên người.** Người xem chọn từ danh sách phiền não có sẵn, hoặc gõ tự do nhưng chủ live duyệt trước.
- Độ khó trung bình. Khối lượng vừa đến lớn: cảnh mới, cách tính tầng theo quà, hoạt cảnh phán, bảng xếp hạng.
- Nguồn lực lớn nhất là **hình ảnh**: cảnh âm phủ nhiều tầng, Diêm Vương, quỷ sứ, lửa, xích.
- Trình tự đề xuất: làm bản thử với hình vẽ bằng code và live thử để xem phản ứng. Nếu khán giả thích thì tạo bộ hình đẹp bằng AI theo mô tả viết sẵn, rồi ghép vào.
- Rủi ro: cảnh địa ngục đặt cạnh chánh điện có thể bị một số người chê phản cảm.

## Để sau: DJ / order nhạc tự do (đánh giá 02/11/2026)

Ý tưởng: người xem tặng quà để order nhạc, công cụ tự phát và tự mix.

**Đã có người làm**:
- TikFinity ([Song Requests](https://tikfinity.zerody.one/tiktok/songrequests), order qua Spotify)
- BetterTok (hàng chờ Spotify, có thể chỉ cho top người tặng quà order)
- IndoFinity (YouTube Music)
- Một số phần mềm Việt Nam "tặng quà tự phát nhạc"
- Chính TikTok được cho là có tính năng "Song Gift" (chưa có xác nhận chính thức)

Vì vậy **không nên tự viết lại**.

**Rủi ro chính là bản quyền nhạc.**
- TikTok LIVE có thể tắt tiếng hoặc dừng live khi phát nhạc không có quyền. Nhạc có trong thư viện TikTok cho video thường chưa chắc được phép dùng khi live.
- Nhiều DJ đã bỏ TikTok LIVE sau lần TikTok đổi chính sách ([Daily Dot](https://dailydot.com/tiktok-live-djs-flee)). Điều khoản âm nhạc tháng 1/2026 hạn chế DJ set trên live ([Hypebot](https://www.hypebot.com/new-tiktok-m.md)).
- Không được lấy nhạc từ YouTube hay Spotify để phát lại.

| Phương án | Độ khó | Nguồn lực | Kết luận |
|---|---|---|---|
| A. Order nhạc thiền từ thư viện của mình (việc số 6 ở trên) | Dễ | Thư viện có quyền phát | **Nên làm** |
| B. DJ đơn giản: hàng chờ, quà to được chen lên trước, chuyển bài mượt, hình sàn DJ | Trung bình | Khoảng 50–100 bài có quyền phát, hình sàn DJ mới | Để sau. Làm thành **cảnh hoặc kênh riêng**, không trộn vào chánh điện (DJ cạnh chánh điện dễ bị chê phản cảm) |
| C. DJ "thật": tự khớp nhịp, chỉnh âm sắc khi chuyển bài | Khó | Như B, cộng nhiều thời gian thử | Không đáng làm lúc này |
| D. Cho order bài bất kỳ (YouTube, Spotify) | — | — | **Không làm**: dính bản quyền |

Nếu muốn thử DJ: dùng TikFinity trên **một kênh phụ** trước, không đụng kênh chính, để xem TikTok có tắt tiếng hay dừng live không.

## Đã quyết định không làm

| Ý tưởng | Lý do |
|---|---|
| Người xem giả, quà giả, tên giả trên bảng công đức | Đánh lừa người đang bỏ tiền thật; TikTok cấm tương tác giả, có thể mất quyền nhận quà hoặc bị khóa kênh |
| Địa ngục ghi **tên người** mình ghét | Trả tiền để bêu tên người thật là quấy rối; có thể vi phạm luật về xúc phạm danh dự (BLHS Điều 155); thu tiền trù ẻo dưới hình ảnh chùa dễ bị coi là mê tín và xúc phạm tôn giáo |
| Sư Trụ Trì AI trò chuyện với người xem | Chủ dự án bỏ (02/11/2026). Nếu làm lại: phải ghi rõ là AI, cần khóa API Anthropic, có chi phí theo giờ, và có rủi ro AI nói sai trên live |

## Rủi ro đã biết

- `tiktok-live-connector` là thư viện không chính thức. Kết nối qua máy chủ ký Euler Stream có thể bị giới hạn lượt; khi đó đặt `SIGN_API_KEY`.
- Edge TTS chập chờn trên mạng của chủ dự án. Đo ngày 02/11/2026: khoảng 30–40% lần gọi hỏng sau ~2,4 giây ("no turn.end received"), kể cả khi mở kết nối mới, nên là do dịch vụ hoặc mạng chứ không phải code. Đã có cơ chế thử lại 3 lần và dự phòng bằng giọng trình duyệt, vì vậy **nên cài giọng tiếng Việt của Windows** (xem checklist).
- Hình ảnh và nhạc do AI tạo, lấy từ kentjuno (MIT). Kiểm tra điều khoản trước khi dùng thương mại.
- Các repo tham khảo nằm ở `D:\RepoGithub\_research_chua`. Chỉ kentjuno/chanh-dien-online và Miinh2k4 có giấy phép MIT. Repo khác chỉ lấy ý tưởng, **không chép code hay hình**.
