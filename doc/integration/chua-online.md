# Tich Hop Chua Online (Chanh Dien An Lac)

## 1. Tong Quan
Module Chua Online (nam tai thu muc `chua-online-live-main/`) la ung dung overlay 9:16 doc lap danh cho TikTok LIVE voi chu de chanh dien truc tuyen.
Module duoc merge tu nhanh `god` vao nhanh `main`.

## 2. Cau Truc Module
- Thu muc: `chua-online-live-main/`
- Giao dien Overlay: `http://localhost:3000/overlay.html`
- Bang dieu khien: `http://localhost:3000/control.html`
- Server Engine: `chua-online-live-main/server/index.mjs`
- Ket noi TikTok Live: `chua-online-live-main/server/tiktok.mjs`
- Engine am thanh & TTS: `chua-online-live-main/server/tts.mjs`

## 3. Cach Khoi Chay
1. Chuyen vao thu muc:
   ```bash
   cd chua-online-live-main
   ```
2. Cai dat goi phu thuoc neu can:
   ```bash
   npm install
   ```
3. Khoi dong server:
   ```bash
   npm start
   ```

## 4. Kiem Tra & Kiem Thu
Chay bo kiem thu tu dong cua module:
```bash
cd chua-online-live-main
node --test test/*.test.mjs
```
Ket qua: 31/31 test cases pass.

