# Nguồn gốc mã và tài nguyên

Dự án này viết lại từ đầu. Code và tài nguyên được **chép** chỉ lấy từ các dự án có giấy phép MIT dưới đây. Với các dự án khác, chúng tôi chỉ tham khảo ý tưởng và không chép code, hình ảnh hay âm thanh của họ.

## Có dùng lại code hoặc tài nguyên (MIT)

### kentjuno/chanh-dien-online
- Nguồn: https://github.com/kentjuno/chanh-dien-online
- Giấy phép: MIT, Copyright (c) 2026 Kent Juno
- Những gì đã dùng:
  - Hình ảnh trong `public/assets/` (chánh điện, nhân vật, hiệu ứng). Tác giả gốc cho biết ảnh được tạo bằng Google Flow.
  - Nhạc nền `public/assets/music/`. Tác giả gốc cho biết nhạc được tạo bằng Gemini.
  - Phần vẽ cảnh trong `public/overlay.js` và `public/overlay.css` (khung 1080×1920, sắp xếp bồ đoàn, hoạt cảnh đi vào ngồi, thẻ tên, cánh hoa, tiếng chuông và mõ tổng hợp bằng Web Audio), có sửa đổi.
  - Mô hình bảo mật của server: chỉ nghe 127.0.0.1, kiểm tra Host và Origin, danh sách trắng file tĩnh, socket overlay chỉ được nhận dữ liệu.
- Lưu ý: bản gốc có một đoạn code bị mã hóa, cứ 5 đến 10 phút lại vẽ dòng chữ ghi công tác giả lên màn hình live. Bản này không giữ đoạn đó. Công của tác giả được ghi tại đây và trong các comment code.
- Trước khi dùng thương mại, hãy kiểm tra điều khoản của Google Flow và Gemini đối với hình ảnh và nhạc do AI tạo, hoặc thay bằng tài nguyên của bạn.

Toàn văn giấy phép MIT của kentjuno/chanh-dien-online:

```
MIT License

Copyright (c) 2026 Kent Juno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Chỉ tham khảo ý tưởng (không có giấy phép, không chép code hay tài nguyên)

| Dự án | Ý tưởng đã tự viết lại |
|---|---|
| zane-tv/tiktok-live-temple-rpc | Từ khóa bình luận cho từng nghi lễ (gõ mõ, thỉnh chuông, thắp hương, xin xăm); hiện thẻ quẻ đúng lúc giọng đọc bắt đầu |
| ass3mble/tiktok-live-chua-online | Đếm chuỗi quà chính xác; bỏ sự kiện trễ từ kết nối cũ; ghi file kiểu nguyên tử; không ghi đè file hỏng; dữ liệu thử không vào bảng thật |
| mashupsolution/an-nhien-pagoda | Duyệt lời nguyện trước khi lên live; mốc cộng đồng chỉ kích hoạt một lần mỗi buổi; tự kết nối lại với thời gian chờ tăng dần |
| hanguyxn/tiktok-live--chua | Thứ tự nhường chỗ (người tặng quà được giữ chỗ); lời thầy trụ trì; hàng đợi giọng đọc ưu tiên; làm sạch tên trước khi đọc |
| blackmoon990/chua-online | Banner "lần thứ n"; lời khuyên chia theo công việc, gia đạo, sức khỏe; ngày âm lịch |
| nguyenxuandat20091985-rgb/chua-tinh-tam | Bảng quy tắc quà theo số xu |
| Miinh2k4/LiveTikTokDiChuaCauAn (MIT) | Ý tưởng bốc quẻ kèm lời chúc. Không dùng code hay tài nguyên của dự án này. |

## Thư viện

- `tiktok-live-connector`: thư viện cộng đồng (MIT), **không phải API chính thức của TikTok**.
- `msedge-tts`: dùng dịch vụ đọc văn bản Read Aloud của Microsoft Edge qua mạng.
- `ws`: WebSocket (MIT).

Thuật toán âm lịch trong `public/lunar.js` dựa trên thuật toán đã công bố của Hồ Ngọc Đức.
