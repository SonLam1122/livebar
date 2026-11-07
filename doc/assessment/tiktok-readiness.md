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

## 2. Co Che Tu Dong Xu Ly Link Live TikTok

- Ho tro dan truc tiep bat ky duong link live TikTok nao:
  - Link chia se rut gon: `https://vt.tiktok.com/ZS9fFDvrmfSHg-QDgxt/`
  - Link phong live web: `https://www.tiktok.com/@username/live`
  - Username truc tiep: `@username` hoac `username`
- Co che hoat dong:
  - Tu dong theo doi cac ma chuyen huong HTTP 301 va 302 de lay URL cuoi cung.
  - Tu dong trich xuat username nguoi live.
  - Ket noi truc tiep vao may chu Webcast TikTok de nhan luong su kien thoi gian thuc.
  - Khong can key tra phi, khong can thao tac phuc tap tu nguoi dung.

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
