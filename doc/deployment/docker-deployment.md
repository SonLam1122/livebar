# Huong Dan Trien Khai Voi Docker

Tai lieu huong dan dong goi va van hanh he thong bang Docker va Docker Compose.

---

## 1. Yeu Cau He Thong

- Docker Engine phien ban 20.10 tro len.
- Docker Compose phien ban v2 tro len.

---

## 2. Cau Truc File Docker

- `Dockerfile`: Khai bao moi truong Node.js 20 Alpine, cai dat dependencies (bao gom `tiktok-live-connector`), thiet lap healthcheck va quyen chay khong phai root (`user node`).
- `docker-compose.yml`: Dinh nghia 2 service:
  - `livebar`: Chay ung dung Node.js tren cong 3000, volume mount du lieu cau hinh.
  - `tunnel`: Chay Cloudflare Tunnel (`cloudflare/cloudflared:latest`) ket noi thang toi `livebar:3000`, tu dong cap phat URL HTTPS public ra Internet.
- `.dockerignore`: Loai bo `node_modules`, log, file tam va git khoi image build context.
- `.env.example`: File bien moi truong mau.

---

## 3. Cac Buoc Trien Khai

### Khoi chay bang Docker Compose (Tich hop san Tunnel)

1. Build va khoi chay ca 2 service (ung dung va tunnel):
```bash
docker compose up -d --build
```

2. Xem Public URL duoc cap phat tu container tunnel:
```bash
docker compose logs tunnel | grep trycloudflare.com
```

3. Kiem tra trang thai 2 container:
```bash
docker compose ps
```

4. Theo doi toan bo log he thong:
```bash
docker compose logs -f
```

5. Dung he thong:
```bash
docker compose down
```

---

### Cach 2: Su dung Docker CLI truyen thong

1. Build image:
```bash
docker build -t livebar-app:latest .
```

2. Khoi chay container:
```bash
docker run -d \
  --name livebar-app \
  -p 3000:3000 \
  -v $(pwd)/screens_data.json:/app/screens_data.json \
  -v $(pwd)/screen_data.json:/app/screen_data.json \
  --restart unless-stopped \
  livebar-app:latest
```

---

## 4. Kiem Tra Sau Khi Khoi Chay

- Dashboard quan tri: `http://localhost:3000/dashboard`
- Man hinh Overlay OBS: `http://localhost:3000/?token=SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI`
- Endpoint Healthcheck: `http://localhost:3000/api/screens`

