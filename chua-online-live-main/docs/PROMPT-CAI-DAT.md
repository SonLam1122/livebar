# Prompt để AI tự cài

Copy nguyên khung dưới đây, dán vào một AI agent chạy được lệnh trên máy bạn: **Claude Code**, **Codex**, **Antigravity** hoặc **Cursor**. Mở agent ở một thư mục trống, ví dụ `D:\`.

Prompt này **không** làm được trên ChatGPT hay Claude bản web thường, vì chúng không chạy lệnh trên máy bạn.

## Prompt cài đặt

```text
Cài giúp tôi tool overlay TikTok LIVE "Chánh Điện An Lạc" trên máy Windows này.

Mã nguồn: https://github.com/DoanDuyThanh71/chua-online-live

Làm như sau:
1. Tải code về D:\chua-online-live (nếu ổ D không có thì dùng thư mục người dùng, đường dẫn không dấu).
2. Đọc kỹ file AGENTS.md trong repo trước khi làm gì khác, và làm đúng theo đó, nhất là phần "Quy tắc bắt buộc".
3. Kiểm tra máy, cài thư viện, chạy test, rồi hỏi tôi có muốn cài giọng đọc VieNeu không (cho tôi biết dung lượng tải trước).
4. Chạy app và giọng đọc, chạy "node scripts/kiem-tra.mjs --chay" và báo kết quả.
5. Cuối cùng hướng dẫn tôi từng bước phần tôi phải tự làm: chọn giọng, thiết lập TikTok LIVE Studio, camera, lên live và kết nối.

Nói với tôi bằng tiếng Việt, ngắn gọn, dễ hiểu vì tôi không biết lập trình. Thiếu phần mềm nào (Node.js, Git, Python) thì chỉ tôi cài. Không hỏi mật khẩu TikTok và không thao tác trên tài khoản TikTok của tôi.
```

## Prompt làm phiên bản riêng

Dùng sau khi đã cài xong, để đổi tên chùa, hình nền, nhạc nền cho khỏi trùng với người khác:

```text
Trong thư mục D:\chua-online-live, đọc AGENTS.md (mục "Khi người dùng muốn làm phiên bản riêng") rồi giúp tôi làm phiên bản riêng:
- Tên chùa: [điền tên]
- Hình nền: [đường dẫn ảnh dọc 1080x1920 của tôi, hoặc "giữ nguyên"]
- Nhạc nền: [đường dẫn file mp3 tôi có quyền dùng, hoặc "giữ nguyên"]
Sửa xong chạy npm test, chạy lại app và cho tôi xem kết quả.
```

## Khi AI báo lỗi

Bảo AI: *"Chạy node scripts/kiem-tra.mjs --chay, đọc lại mục Lỗi đã gặp trong AGENTS.md rồi sửa."* Vẫn không được thì gửi kết quả lệnh đó cho người hỗ trợ.
