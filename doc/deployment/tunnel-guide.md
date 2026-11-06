# Huong Dan Van Hanh Public URL Va Ket Noi TikTok Live

Tai lieu huong dan chi tiet cach van hanh Public URL thong qua Cloudflare Tunnel va ket noi truc tiep vao phong live TikTok.

---

## 1. Thong Tin Public URL Dang Hoat Dong

- Dia chi Dashboard quan tri:
  `https://football-boring-blocked-arabia.trycloudflare.com/dashboard`
  (Hoac ten mien deployment vi du: `https://livebar.onrender.com/dashboard`)
- Dia chi Overlay dung cho OBS Studio hoac TikTok Live Studio:
  `https://football-boring-blocked-arabia.trycloudflare.com/?token=SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI`
  (Luu y: Man hinh Overlay bat buoc phai co tham so `?token=...` de tai du lieu man hinh)
- Endpoint kiem tra trang thai ket noi:
  `https://football-boring-blocked-arabia.trycloudflare.com/api/tiktok/status`

---

## 2. Co Che Xu Ly Khi Truy Cap Trang Chu

- Khi nguoi dung truy cap dia chi goc khong kem token (vi du `https://livebar.onrender.com/`), he thong se tu dong chuyen huong ve `/dashboard` de truy cap bang dieu khien.
- Neu client mo overlay truc tiep ma thieu token, ma nguon se tu dong bo sung token mac dinh `SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI` de tranh tinh trang trang man hinh.

---

## 3. Quy Trinh Treo Live Voi OBS Studio

1. Mo phan mem OBS Studio hoac TikTok Live Studio.
2. Nhan dau cong tai khung Sources va chon Browser.
3. Dan duong link Overlay o tren vao o URL.
4. Thiet lap thong so hien thi:
   - Width: 1080
   - Height: 1920
   - Tich chon: Shutdown source when not visible
5. Nhan OK de hoan tat.

---

## 3. Ket Noi Vao Phong TikTok Live That

1. Truy cap vao Dashboard quan tri:
   `https://football-boring-blocked-arabia.trycloudflare.com/dashboard`
2. Chuyen qua tab Ket Noi TikTok Live.
3. Nhap username TikTok cua streamer dang phat truc tiep vao o input.
4. Nhan nut Ket Noi.
5. He thong se tu dong lang nghe qua tang, binh luan va luot tha tim tu phong live that de cap nhat vao tran dau tren man hinh OBS.

