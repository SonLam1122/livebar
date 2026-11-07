// =========================================================================
// CHUA ONLINE BRIDGE (CHANH DIEN AN LAC INTEGRATION)
// Tich hop WebSocket /ws va engine Chanh Dien vao server chinh Livebar
// =========================================================================

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { WebSocketServer } = require('ws');
const { ROOT_DIR } = require('./config');

const CHUA_DIR = path.join(ROOT_DIR, 'chua-online-live-main');
const DATA_DIR = path.join(CHUA_DIR, 'data', 'runtime');
const TTS_DIR = path.join(DATA_DIR, 'tts');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(TTS_DIR)) {
  fs.mkdirSync(TTS_DIR, { recursive: true });
}

let wss = null;
let templeInstance = null;
let voiceInstance = null;
let storeInstance = null;
let tiktokInstance = null;
let botTimer = null;
let chantTimer = null;
let chantIdx = 0;
const logLines = [];

function log(s) {
  const line = `[${new Date().toLocaleTimeString('vi-VN')}] ${s}`;
  logLines.push(line);
  if (logLines.length > 300) logLines.shift();
  broadcast({ t: 'log', line }, 'control');
  console.log('[ChuaOnline]', line);
}

function broadcast(msg, role = 'all') {
  if (!wss) return;
  const s = JSON.stringify(msg);
  for (const c of wss.clients) {
    if (c.readyState === 1 && (role === 'all' || c.role === role) && c.bufferedAmount < 2e6) {
      c.send(s);
    }
  }
}

async function initChuaBridge(httpServer) {
  try {
    const templeModuleUrl = pathToFileURL(path.join(CHUA_DIR, 'server', 'temple.mjs')).href;
    const ttsModuleUrl = pathToFileURL(path.join(CHUA_DIR, 'server', 'tts.mjs')).href;
    const storeModuleUrl = pathToFileURL(path.join(CHUA_DIR, 'server', 'store.mjs')).href;
    const textModuleUrl = pathToFileURL(path.join(CHUA_DIR, 'server', 'text.mjs')).href;
    const tiktokModuleUrl = pathToFileURL(path.join(CHUA_DIR, 'server', 'tiktok.mjs')).href;

    const { Temple, DEFAULT_SETTINGS } = await import(templeModuleUrl);
    const { Voice } = await import(ttsModuleUrl);
    const { JsonStore } = await import(storeModuleUrl);
    const { clean, clamp } = await import(textModuleUrl);
    const { TikTokLink } = await import(tiktokModuleUrl);

    storeInstance = new JsonStore(path.join(DATA_DIR, 'state.json'), { settings: {}, allTime: {} });

    voiceInstance = new Voice({
      dir: TTS_DIR,
      urlPrefix: '/tts/',
      send: m => broadcast(m, 'overlay'),
      log,
      settings: () => templeInstance.settings,
      disabled: process.env.DISABLE_TTS === '1',
      vieneuUrl: process.env.VIENEU_URL
    });

    templeInstance = new Temple({
      send: (m, role) => broadcast(m, role || 'all'),
      say: (text, o) => voiceInstance.say(text, o),
      log,
      settings: storeInstance.data.settings,
      allTime: storeInstance.data.allTime,
      onPersist: () => storeInstance.save()
    });

    tiktokInstance = new TikTokLink({
      temple: templeInstance,
      log,
      signApiKey: process.env.SIGN_API_KEY || '',
      onState: st => {
        if (st.status === 'connected' && (botTimer || [...templeInstance.viewers.values()].some(v => v.demo))) {
          if (botTimer) setBots(false);
          else templeInstance.clearSeats(true);
          log('Da ket noi live that: tat bot va don nguoi thu');
        }
        broadcast({ t: 'tiktok', ...st }, 'all');
      }
    });

    // Khoi chay timer chu ky 1 giay cho temple
    setInterval(() => templeInstance && templeInstance.tick(), 1000);

    function scheduleChant() {
      clearInterval(chantTimer);
      if (templeInstance.settings.autoChant) {
        chantTimer = setInterval(() => templeInstance.chant(chantIdx++), templeInstance.settings.chantEveryMin * 60000);
      }
    }
    scheduleChant();

    // Khoi tao danh sach ten bot mau
    const DEMO_NAMES = [
      'Dieu Hanh', 'Minh Tam', 'Thien Duc', 'Hue An', 'Tinh Nha', 'Quang Tri', 'Chon Nhu', 'Phap Hy',
      'Nguyen Thanh', 'Tam Dang', 'Dieu Lien', 'Tri Hai', 'Phuoc Loc', 'Hanh Nguyen', 'Nhu Y', 'Bao Chau'
    ];
    const BOT_LINES = [
      'Nam mo A Di Da Phat', 'Nam mo Bon Su Thich Ca Mau Ni Phat', 'Con xin thanh tam sam hoi',
      'nu', 'nam', 'ba', 'su', 'go mo', 'thinh chuong', 'thap huong', 'xin xam',
      'Cau cho gia dinh binh an', 'Nguyen cau cha me manh khoe', 'Mo Phat, an lac qua',
      'lay Phat', 'sang trai', 'sang phai', 'len', 'xuong', 'kinh hanh', 'len lay Phat'
    ];
    const SKINS = ['man', 'woman', 'woman', 'man', 'granny', 'monk', 'nun', 'child'];
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const demoName = s => clean(s, 18) + ' thu';
    const seatDemo = i => templeInstance.seat('demo_' + i, demoName(DEMO_NAMES[i % DEMO_NAMES.length]), { demo: true, skin: SKINS[i % 8] });

    function setBots(on, n = 12, pace = 'mid') {
      clearInterval(botTimer);
      botTimer = null;
      if (!on) {
        templeInstance.clearSeats(true);
        log('Tat bot thu nghiem');
        broadcast({ t: 'bots', on: false }, 'control');
        return;
      }
      n = clamp(n, 1, 100);
      for (let i = 0; i < n; i++) seatDemo(i);
      const every = { slow: 4000, mid: 1800, fast: 700 }[pace] || 1800;
      botTimer = setInterval(() => {
        const ids = [...templeInstance.viewers.values()].filter(v => v.demo);
        if (!ids.length) return;
        const v = pick(ids);
        const w = { id: v.id, name: v.name, demo: true };
        const r = Math.random();
        if (r < 0.5) templeInstance.onChat(w, pick(BOT_LINES));
        else if (r < 0.88) templeInstance.onLike(w, 1 + Math.floor(Math.random() * 8));
        else if (r < 0.91) templeInstance.onFollow(w);
        else if (r < 0.985) templeInstance.onGift({ userId: v.id, name: v.name, demo: true, giftId: '5655', giftName: 'Hoa hong', streakable: false, repeatCount: 1, diamonds: 1 });
        else templeInstance.onGift({ userId: v.id, name: v.name, demo: true, giftId: 'lotus', giftName: 'Den hoa sen', streakable: false, repeatCount: 1, diamonds: 99 });
      }, every);
      log(`Bat ${n} bot thu nghiem`);
      broadcast({ t: 'bots', on: true }, 'control');
    }

    function onControl(m) {
      const S = (v, n, d) => clean(v ?? d, n) || d;
      switch (m.cmd) {
        case 'connect':
          tiktokInstance.connect(m.uniqueId);
          break;
        case 'disconnect':
          tiktokInstance.disconnect();
          log('Da ngat ket noi TikTok');
          break;
        case 'sim': {
          const name = demoName(S(m.name, 24, 'Khach'));
          const who = { id: 'sim_' + name, name, demo: true };
          switch (m.kind) {
            case 'chat': templeInstance.onChat(who, S(m.text, 150, 'Nam mo A Di Da Phat')); break;
            case 'like': templeInstance.onLike(who, clamp(m.count, 1, 50)); break;
            case 'follow': templeInstance.thanked.delete('f:' + who.id); templeInstance.onFollow(who); break;
            case 'share': templeInstance.cool.delete('share:' + who.id); templeInstance.onShare(who); break;
            case 'join': templeInstance.seat(who.id, name, { demo: true }); break;
            case 'gift':
              templeInstance.onGift({
                userId: who.id, name, demo: true, giftId: S(m.gift, 30, 'Hoa hong'),
                giftName: S(m.gift, 30, 'Hoa hong'), streakable: false, repeatCount: clamp(m.count, 1, 99),
                diamonds: clamp(m.diamonds, 1, 50000)
              });
              break;
            case 'viewers': templeInstance.onViewerCount(clamp(m.count, 0, 100000)); break;
          }
          break;
        }
        case 'fill':
          for (let i = 0; i < clamp(m.n, 1, 100); i++) seatDemo(i);
          log(`Do nguoi mau: ${templeInstance.viewers.size} nguoi`);
          break;
        case 'clear':
          templeInstance.clearSeats(!!m.demoOnly);
          log('Da lam trong bo doan');
          break;
        case 'bots':
          setBots(!!m.on, +m.n || 12, m.pace);
          break;
        case 'bell':
          broadcast({ t: 'bell', big: true }, 'overlay');
          break;
        case 'mo':
          broadcast({ t: 'mo', n: 1 }, 'overlay');
          break;
        case 'chant':
          templeInstance.chant(chantIdx++);
          break;
        case 'say':
          if (m.text) {
            const text = clean(m.text, 400);
            broadcast({ t: 'abbot', text }, 'overlay');
            voiceInstance.say(text, { prio: 2, tag: 'abbot' });
          }
          break;
        case 'prayer':
          templeInstance.moderate(m.id, !!m.approve);
          break;
        case 'newSession':
          templeInstance.newSession();
          broadcast(templeInstance.snapshot(), 'all');
          log('Bat dau buoi moi: dat lai bang cong duc va moc');
          break;
        case 'resetAllTime':
          if (m.confirm !== 'XOA' && m.confirm !== 'XÓA') {
            log('Muon xoa bang cong duc tron doi thi go dung chu XOA');
            break;
          }
          for (const k of Object.keys(templeInstance.allTime)) delete templeInstance.allTime[k];
          storeInstance.save();
          broadcast({ t: 'board', boards: templeInstance.boards(), stats: templeInstance.stats, next: templeInstance.nextMilestones() }, 'all');
          log('Da xoa bang cong duc tron doi');
          break;
        case 'settings':
          templeInstance.applySettings(m.settings || {});
          storeInstance.data.settings = templeInstance.settings;
          storeInstance.save();
          scheduleChant();
          broadcast({ t: 'settings', settings: templeInstance.settings, cap: templeInstance.capacity() }, 'all');
          break;
      }
    }

    // Khoi tao WebSocketServer voi che do noServer de tranh tranh chap su kien upgrade voi Socket.IO
    wss = new WebSocketServer({
      noServer: true,
      maxPayload: 64 * 1024
    });

    // Xu ly su kien upgrade rieng cho duong dan /ws ma khong lam anh huong Socket.IO tren /socket.io/
    httpServer.on('upgrade', (req, socket, head) => {
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        if (parsedUrl.pathname === '/ws' || parsedUrl.pathname.startsWith('/ws')) {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      } catch (e) {
        // Bo qua neu co loi parse URL de cac trinh lang nghe khac xu ly
      }
    });

    wss.on('connection', (ws, req) => {
      const q = new URL(req.url, 'http://localhost').searchParams;
      const wantsControl = q.get('role') === 'control';
      ws.role = wantsControl ? 'control' : 'overlay';
      ws.alive = true;
      ws.on('pong', () => { ws.alive = true; });

      ws.send(JSON.stringify(templeInstance.snapshot()));
      ws.send(JSON.stringify({ t: 'tiktok', ...tiktokInstance.state }));

      if (ws.role === 'control') {
        ws.send(JSON.stringify({ t: 'logs', lines: logLines }));
        ws.send(JSON.stringify(templeInstance.controlSnapshot()));
        ws.send(JSON.stringify({ t: 'bots', on: !!botTimer }));
        if (storeInstance.error) ws.send(JSON.stringify({ t: 'log', line: storeInstance.error }));
      }

      ws.on('message', buf => {
        if (ws.role !== 'control') return;
        try {
          const m = JSON.parse(buf);
          if (m && m.t === 'ctl') onControl(m);
        } catch (e) {
          log('Loi lenh: ' + e.message);
        }
      });
    });

    setInterval(() => {
      if (!wss) return;
      for (const ws of wss.clients) {
        if (!ws.alive) {
          ws.terminate();
          continue;
        }
        ws.alive = false;
        ws.ping();
      }
    }, 30000);

    log('Khoi tao thanh cong engine Chua Online (Chanh Dien An Lac) tren duong dan /ws');
  } catch (err) {
    console.error('[ChuaOnline] Loi khoi tao engine Chua Online:', err);
  }
}

function updateTempleSettings(newSettings) {
  if (!templeInstance || !newSettings) return;
  templeInstance.applySettings(newSettings);
  if (storeInstance) {
    storeInstance.data.settings = templeInstance.settings;
    storeInstance.save();
  }
  broadcast({ t: 'settings', settings: templeInstance.settings, cap: templeInstance.capacity() }, 'all');
  log('Da dong bo cai dat Chanh Dien tu Dashboard');
}

module.exports = {
  initChuaBridge,
  updateTempleSettings,
  broadcast,
  getTemple: () => templeInstance
};
