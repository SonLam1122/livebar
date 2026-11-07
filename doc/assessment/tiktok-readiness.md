# Danh Gia Trang Thai Ket Noi Va San Sang Treo Live

Tai lieu danh gia he thong mang, ket noi tunnel va kha nang tich hop TikTok Live cua du an.

---

## 1. Hien Trang Mang Va URL

- He thong ho tro deploy truc tiep qua Docker hoac Render.
- Endpoint public:
  - Dashboard: `/dashboard`
  - Overlay OBS: `/?token=SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI`
  - TikTok Webhook: `/api/tiktok/webhook`

---

## 2. Co Che Bat Su Kien TikTok Live

He thong cung cap hai phuong thuc ket noi va bat su kien:

### Phuong Thuc 1: Cau Noi Trinh Duyet (Khuyen dung, 100% truc tiep)
- Ban chat: Khi streamer mo tab live TikTok tren trinh duyet Chrome hoac Edge, trinh duyet da vuot qua toan bo co che kiem tra bot cua TikTok.
- Co che: Su dung doan ma JavaScript (sao chep tu Dashboard) chay trong tab live TikTok. Doan ma nay theo doi khung chat bang MutationObserver va gui ngay su kien ve `/api/tiktok/webhook`.
- Uu diem:
  - Khong phu thuoc bat ky ben thu ba nao nhu Euler Stream.
  - Do tre 0ms, bat 100% nguoi xem vao phong, comment, tang qua, tha tim.
  - Khong bao gio bi gioi han luot ket noi (rate limit).

### Phuong Thuc 2: Ket Noi May Chu Nen
- Ket noi WebSocket ngam tu may chu toi may chu TikTok qua TikTokLiveConnection.
- Ho tro truyen Euler API Key neu co key mien phi tu eulerstream.com.
- Tu dong vo hieu hoa route Euler doi voi Room ID de lay Room ID truc tiep tu may chu TikTok.

---

## 3. Dong Bo Tuong Tac Len San Nhay Live Bar

Moi su kien TikTok deu duoc dong bo ngay lap tuc vao vung nho tran dau cua man hinh:
- Nguoi xem vao phong: Tao nhan vat vu cong tren san, gan slot va hien toast thong bao.
- Binh luan: Kich hoat vu cong tuong ung nhay len cao (jump effect), hien toast noi dung chat.
- Tang qua: Cong diem, cong kim cuong, cap nhat Podium top 1 2 3 va kich hoat Spotlight camera khi dat tu 50 kim cuong.
- Tha tim: Cong luot tim va hien toast tha tim.

---

## 4. Thiet Lap Do Phan Giai OBS Chuan

- Trong OBS Browser Source, bat buoc dien Width: 1080 va Height: 1920.
- Khong de 800x600 roi keo to vi se lam mo man hinh.
