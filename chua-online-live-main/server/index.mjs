// Chánh Điện An Lạc — live server
// Runs on the streaming PC: serves the overlay and the control panel, reads a TikTok LIVE room,
// turns events into temple rituals and voice lines, and pushes everything to the overlay over WebSocket.
//
//   npm install && npm start      → http://localhost:3000/control.html
//
// Security (the code is public, so it is safe by default):
//  • listens on 127.0.0.1; set HOST to open it on the LAN, which then requires ADMIN_TOKEN
//  • Host header must be one we expect (blocks DNS rebinding), WebSocket Origin must be this server
//  • the overlay socket only receives; commands are accepted from the control socket only
//  • static files come from an allow-list: public/ and the voice cache, no dot-files, no path escapes
//  • no TikTok password, cookie or session is used; SIGN_API_KEY (optional) stays on the server
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Temple, DEFAULT_SETTINGS } from './temple.mjs';
import { Voice } from './tts.mjs';
import { TikTokLink } from './tiktok.mjs';
import { JsonStore } from './store.mjs';
import { clean, clamp } from './text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data', 'runtime'));
const TTS_DIR = path.join(DATA, 'tts');
const PORT = +process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const TOKEN = process.env.ADMIN_TOKEN || '';
const LOOPBACK = ['127.0.0.1', 'localhost', '::1'].includes(HOST);
if (!LOOPBACK && TOKEN.length < 12) {
  console.error('HOST khác 127.0.0.1 thì phải đặt ADMIN_TOKEN (ít nhất 12 ký tự) để người khác trong mạng không điều khiển được.');
  process.exit(1);
}

/* ---------------------------------------------------------------- log */
const logLines = [];
let wss = null;
function log(s) {
  const line = `[${new Date().toLocaleTimeString('vi-VN')}] ${s}`;
  logLines.push(line); if (logLines.length > 300) logLines.shift();
  broadcast({ t: 'log', line }, 'control'); console.log(line);
}

/* -------------------------------------------------------------- state */
const store = new JsonStore(path.join(DATA, 'state.json'), { settings: {}, allTime: {} });
if (store.error) console.error(store.error);
const voice = new Voice({
  dir: TTS_DIR, urlPrefix: '/tts/', send: m => broadcast(m, 'overlay'), log,
  settings: () => temple.settings, disabled: process.env.DISABLE_TTS === '1', vieneuUrl: process.env.VIENEU_URL,
});
const temple = new Temple({
  send: (m, role) => broadcast(m, role || 'all'),
  say: (text, o) => voice.say(text, o),
  log, settings: store.data.settings, allTime: store.data.allTime,
  onPersist: () => store.save(),
});
const tiktok = new TikTokLink({
  temple, log, signApiKey: process.env.SIGN_API_KEY || '',
  onState: st => {
    // a real room is live: test characters must never sit among real viewers
    if (st.status === 'connected' && (botTimer || [...temple.viewers.values()].some(v => v.demo))) {
      if (botTimer) setBots(false); else temple.clearSeats(true);
      log('Đã kết nối live thật: tắt bot và dọn người thử');
    }
    broadcast({ t: 'tiktok', ...st }, 'all');
  },
});
const isLive = () => tiktok.state.status === 'connected';

/* -------------------------------------------------------------- timers */
const tick = setInterval(() => temple.tick(), 1000);
let chantTimer = null, chantIdx = 0;
function scheduleChant() {
  clearInterval(chantTimer);
  if (temple.settings.autoChant) chantTimer = setInterval(() => temple.chant(chantIdx++), temple.settings.chantEveryMin * 60_000);
}
scheduleChant();

/* ---------------------------------------------------------------- bots */
const DEMO_NAMES = ['Diệu Hạnh', 'Minh Tâm', 'Thiện Đức', 'Huệ An', 'Tịnh Nhã', 'Quảng Trí', 'Chơn Như', 'Pháp Hỷ', 'Nguyên Thanh', 'Tâm Đăng',
  'Diệu Liên', 'Trí Hải', 'Phước Lộc', 'Hạnh Nguyện', 'Như Ý', 'Bảo Châu', 'Thanh Lương', 'Từ Tâm', 'An Lạc', 'Giác Hoa', 'Tuệ Minh',
  'Liên Hương', 'Thu Hà', 'Ngọc Lan', 'Đức Anh', 'Hải Đăng', 'Mai Anh', 'Phương Thảo', 'Trung Kiên', 'Quang Huy', 'Bảo Ngọc', 'Diệu Linh'];
const BOT_LINES = ['Nam mô A Di Đà Phật', 'Nam mô Bổn Sư Thích Ca Mâu Ni Phật', 'Con xin thành tâm sám hối', 'nữ', 'nam', 'bà', 'sư',
  'gõ mõ', 'thỉnh chuông', 'thắp hương', 'xin xăm', 'Cầu cho gia đình bình an', 'Nguyện cầu cha mẹ mạnh khỏe', 'Mô Phật, an lạc quá',
  'Chúc mọi người một ngày bình an', 'lạy Phật',
  'sang trái', 'sang phải', 'lên', 'xuống', 'kinh hành', 'lên lạy Phật'];
let botTimer = null;
const pick = a => a[Math.floor(Math.random() * a.length)];
// every test character carries a visible tag, so nobody on stream mistakes it for a real viewer
const demoName = s => clean(s, 18) + ' ·thử';
const SKINS = ['man', 'woman', 'woman', 'man', 'granny', 'monk', 'nun', 'child'];
const seatDemo = i => temple.seat('demo_' + i, demoName(DEMO_NAMES[i % DEMO_NAMES.length] + (i >= DEMO_NAMES.length ? ' ' + (1 + Math.floor(i / DEMO_NAMES.length)) : '')), { demo: true, skin: SKINS[i % 8] });
function setBots(on, n, pace) {
  clearInterval(botTimer); botTimer = null;
  if (!on) { temple.clearSeats(true); log('🤖 Tắt bot'); broadcast({ t: 'bots', on: false }, 'control'); return; }
  if (isLive()) { log('Đang kết nối live thật: không bật bot. Ngắt kết nối TikTok trước nếu muốn thử'); broadcast({ t: 'bots', on: false }, 'control'); return; }
  n = clamp(n, 1, 100);
  for (let i = 0; i < n; i++) seatDemo(i);
  const every = { slow: 4000, mid: 1800, fast: 700 }[pace] || 1800;
  botTimer = setInterval(() => {
    const ids = [...temple.viewers.values()].filter(v => v.demo); if (!ids.length) return;
    const v = pick(ids), w = { id: v.id, name: v.name, demo: true }, r = Math.random();
    if (r < .5) temple.onChat(w, pick(BOT_LINES));
    else if (r < .88) temple.onLike(w, 1 + Math.floor(Math.random() * 8));
    else if (r < .91) temple.onFollow(w);
    else if (r < .985) temple.onGift({ userId: v.id, name: v.name, demo: true, giftId: '5655', giftName: 'Hoa hồng', streakable: false, repeatCount: 1 + Math.floor(Math.random() * 3), diamonds: 1 });
    else temple.onGift({ userId: v.id, name: v.name, demo: true, giftId: 'lotus', giftName: 'Đèn hoa sen', streakable: false, repeatCount: 1, diamonds: 99 });
  }, every);
  log(`🤖 Bật ${n} bot, nhịp ${pace}`); broadcast({ t: 'bots', on: true }, 'control');
}

/* ------------------------------------------------------------- control */
function onControl(m) {
  const S = (v, n, d) => clean(v ?? d, n) || d;
  switch (m.cmd) {
    case 'connect': tiktok.connect(m.uniqueId); break;
    case 'disconnect': tiktok.disconnect(); log('Đã ngắt kết nối TikTok'); break;
    case 'sim': {
      const name = demoName(S(m.name, 24, 'Khách')), who = { id: 'sim_' + name, name, demo: true };
      switch (m.kind) {
        case 'chat': temple.onChat(who, S(m.text, 150, 'Nam mô A Di Đà Phật')); break;
        case 'like': temple.onLike(who, clamp(m.count, 1, 50)); break;
        case 'follow': temple.thanked.delete('f:' + who.id); temple.onFollow(who); break;
        case 'share': temple.cool.delete('share:' + who.id); temple.onShare(who); break;
        case 'join': temple.seat(who.id, name, { demo: true }); break;
        case 'gift': temple.onGift({ userId: who.id, name, demo: true, giftId: S(m.gift, 30, 'Hoa hồng'), giftName: S(m.gift, 30, 'Hoa hồng'),
          streakable: false, repeatCount: clamp(m.count, 1, 99), diamonds: clamp(m.diamonds, 1, 50000) }); break;
        case 'viewers': temple.onViewerCount(clamp(m.count, 0, 100000)); break;
      }
      break;
    }
    case 'fill':
      if (isLive()) { log('Đang kết nối live thật: không đổ người mẫu'); break; }
      for (let i = 0; i < clamp(m.n, 1, 100); i++) seatDemo(i);
      log(`Đổ người mẫu: ${temple.viewers.size} người`); break;
    case 'clear': temple.clearSeats(!!m.demoOnly); log('Đã làm trống bồ đoàn'); break;
    case 'bots': setBots(!!m.on, +m.n || 12, m.pace); break;
    case 'bell': broadcast({ t: 'bell', big: true }, 'overlay'); break;
    case 'mo': broadcast({ t: 'mo', n: 1 }, 'overlay'); break;
    case 'chant': temple.chant(chantIdx++); break;
    case 'say': if (m.text) { const text = clean(m.text, 400); broadcast({ t: 'abbot', text }, 'overlay'); voice.say(text, { prio: 2, tag: 'abbot' }); } break;
    case 'prayer': temple.moderate(m.id, !!m.approve); break;
    case 'newSession': temple.newSession(); broadcast(temple.snapshot(), 'all'); log('Bắt đầu buổi mới: bảng công đức buổi và mốc đã đặt lại'); break;
    case 'resetAllTime':
      if (m.confirm !== 'XÓA') { log('Muốn xóa bảng công đức trọn đời thì gõ đúng chữ XÓA'); break; }
      for (const k of Object.keys(temple.allTime)) delete temple.allTime[k];
      store.save(); broadcast({ t: 'board', boards: temple.boards(), stats: temple.stats, next: temple.nextMilestones() }, 'all'); log('Đã xóa bảng công đức trọn đời'); break;
    case 'settings':
      temple.applySettings(m.settings || {});
      store.data.settings = temple.settings; store.save();
      scheduleChant();
      broadcast({ t: 'settings', settings: temple.settings, cap: temple.capacity() }, 'all'); break;
  }
}

/* -------------------------------------------------------------- server */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`]);
const okHost = h => !LOOPBACK || ALLOWED_HOSTS.has(String(h || '').toLowerCase());
const okToken = k => !TOKEN || (typeof k === 'string' && k.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(k), Buffer.from(TOKEN)));

function resolveStatic(p) {
  if (p === '/') p = '/control.html';
  if (p.split('/').some(seg => seg.startsWith('.') || seg === 'node_modules')) return null;
  let base = PUBLIC, rel = p;
  if (p.startsWith('/tts/')) { base = TTS_DIR; rel = p.slice(4); if (!/^\/[a-f0-9]{20}\.(mp3|wav)$/.test(rel)) return null; }
  const file = path.normalize(path.join(base, rel));
  if (!file.startsWith(base + path.sep)) return null;
  return file;
}

const server = http.createServer((req, res) => {
  if (!okHost(req.headers.host)) { res.writeHead(421).end('wrong host'); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (p === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true, tiktok: tiktok.state.status })); return; }
  const file = resolveStatic(p);
  if (!file) { res.writeHead(404).end('not found'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size, 'Cache-Control': p.startsWith('/assets/') ? 'max-age=3600' : 'no-cache',
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
});

wss = new WebSocketServer({
  server, path: '/ws', maxPayload: 64 * 1024,
  verifyClient: ({ origin, req }) => {
    if (!okHost(req.headers.host)) return false;
    if (!origin) return true;                                   // OBS / non-browser clients send no Origin
    try { return new URL(origin).host === String(req.headers.host).toLowerCase(); } catch { return false; }
  },
});
function broadcast(msg, role = 'all') {
  if (!wss) return;
  const s = JSON.stringify(msg);
  for (const c of wss.clients) if (c.readyState === 1 && (role === 'all' || c.role === role) && c.bufferedAmount < 2e6) c.send(s);
}
wss.on('connection', (ws, req) => {
  const q = new URL(req.url, 'http://x').searchParams;
  const wantsControl = q.get('role') === 'control';
  if (wantsControl && !okToken(q.get('key'))) { ws.close(4001, 'token'); return; }
  ws.role = wantsControl ? 'control' : 'overlay';
  ws.alive = true; ws.on('pong', () => { ws.alive = true; });
  ws.send(JSON.stringify(temple.snapshot()));
  ws.send(JSON.stringify({ t: 'tiktok', ...tiktok.state }));
  if (ws.role === 'control') {
    ws.send(JSON.stringify({ t: 'logs', lines: logLines }));
    ws.send(JSON.stringify(temple.controlSnapshot()));
    ws.send(JSON.stringify({ t: 'bots', on: !!botTimer }));
    if (store.error) ws.send(JSON.stringify({ t: 'log', line: '⚠️ ' + store.error }));
  }
  ws.on('message', buf => {
    if (ws.role !== 'control') return;                          // overlays only listen
    try { const m = JSON.parse(buf); if (m && m.t === 'ctl') onControl(m); } catch (e) { log('Lệnh lỗi: ' + e.message); }
  });
});
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); }
}, 30_000);

server.listen(PORT, HOST, () => {
  log(`Server chạy tại http://localhost:${PORT}  ·  Bảng điều khiển: /control.html  ·  Overlay 9:16: /overlay.html`);
  if (process.env.TIKTOK_USER) tiktok.connect(process.env.TIKTOK_USER);
});

/* -------------------------------------------------------------- shutdown */
let closing = false;
async function shutdown() {
  if (closing) return; closing = true;
  console.log('Đang tắt server, lưu dữ liệu…');
  clearInterval(tick); clearInterval(heartbeat); clearInterval(chantTimer); clearInterval(botTimer);
  try { store.flush(); } catch (e) { console.error('Lưu thất bại:', e.message); }
  await Promise.race([tiktok.disconnect(true), new Promise(r => setTimeout(r, 3000))]);
  for (const c of wss.clients) c.terminate();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', e => log('Lỗi không mong muốn: ' + (e?.stack || e)));
process.on('unhandledRejection', e => log('Lỗi không mong muốn: ' + (e?.message || e)));

export { DEFAULT_SETTINGS };
