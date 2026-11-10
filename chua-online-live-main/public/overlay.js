// Overlay 9:16. Scene rendering (hall, seats, walking sprites, name tags, petals, synthesized bell / wooden fish)
// adapted from kentjuno/chanh-dien-online (MIT, © 2026 Kent Juno). Fortune cards, prayer lanterns, milestones,
// lunar date, browser-voice fallback and audio-off previews added here.
// URL options: ?audio=0 → silent preview (use it for every window except the one captured into the live).
import { lunarLine } from '/lunar.js';
import { FLOOR, GRID, seatOrder, VIP_SPOTS, ALTAR_SPOTS } from '/seats.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const AUDIO = params.get('audio') !== '0';

/* ======================= stage fit ======================= */
const stage = $('stage');
function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
addEventListener('resize', fit); fit();

/* ======================= assets ======================= */
const A = {};
const IMG = { hall: 'hall.jpg', monk: 'c_monk.png', nun: 'c_nun.png', granny: 'c_granny.png', man: 'c_man.png', woman: 'c_woman.png', child: 'c_child.png',
  anim_man: 'anim_man.png', anim_woman: 'anim_woman.png', anim_granny: 'anim_granny.png',
  lotus: 'fx_lotus.png', halo: 'fx_halo.png', bell: 'fx_bell.png', incense: 'fx_incense.png', petal: 'fx_petal.png', mo: 'fx_mo.png', scroll: 'fx_scroll.png' };
for (const [k, src] of Object.entries(IMG)) { const im = new Image(); im.src = '/assets/' + src; A[k] = im; }
const ANIM = { man: { fw: 212, fh: 300, seatH: 210 }, woman: { fw: 212, fh: 300, seatH: 220 }, granny: { fw: 195, fh: 300, seatH: 222 } };
const hasAnim = k => ANIM[k] && A['anim_' + k]?.naturalWidth > 0;
const avatars = new Map();
function avatar(url) { if (!url) return null; let im = avatars.get(url); if (!im) { if (avatars.size > 300) avatars.clear(); im = new Image(); im.referrerPolicy = 'no-referrer'; im.src = url; avatars.set(url, im); } return im.naturalWidth ? im : null; }

/* ======================= seats ======================= */
// The server decides who sits where (v.slot). A visitor's "home" is their cushion, or a golden cushion for top donors.
let cap = 24, seats = seatOrder(24), vipIds = [];
const visitors = new Map();
function layout(c) { cap = GRID[c] ? c : 24; seats = seatOrder(cap); for (const v of visitors.values()) v.seat = seats[v.slot] || null; }
function home(v) {
  // Xếp theo công đức: ai cũng ngồi trên ghế lưới (server đã đưa người công đức cao lên slot đầu).
  // Top 3 chỉ ĐỔI KIỂU (bồ đoàn vàng + bảng tên VIP), KHÔNG dời ra chỗ nổi riêng -> hết chồng chỗ.
  if (!v.seat) return v.seat;
  return vipIds.includes(v.id) ? { ...v.seat, vip: true } : v.seat;
}
const sc = v => home(v)?.scale || .4;
const TEACHERS = [{ name: 'Thầy Minh Đạo', skin: 'monk', x: 300, y: 1255, s: .36 }, { name: 'Sư Trụ Trì', skin: 'monk', x: 540, y: 1275, s: .4, master: true }, { name: 'Thầy Tâm Từ', skin: 'monk', x: 780, y: 1255, s: .36 }];
function addVisitor(p, instant) {
  if (visitors.has(p.id)) { Object.assign(visitors.get(p.id), { name: p.name, skin: p.skin, avatar: p.avatar, coins: p.coins }); setSlot(visitors.get(p.id), p.slot); return; }
  const v = { ...p, seat: seats[p.slot] || null, state: 'walk', x: 540, y: 2020, frame: 0, ft: 0, sitT: 0, flip: false, fade: 0, bubble: null, glow: 0, bow: 0,
    phase: Math.random() * 6.28, joined: performance.now(), path: null };
  visitors.set(p.id, v);
  const h = home(v);
  if (instant || !hasAnim(v.skin) || !h) { v.state = 'sit'; v.frame = 7; v.x = h?.x || 540; v.y = h?.y || 1500; v.fade = instant ? 1 : 0; }
}
function removeVisitor(id) { visitors.delete(id); }
const seated = v => v && home(v);

/* ======================= moving around ======================= */
// Sprites only exist walking away from the camera (up the hall). Going up or sideways is animated; going down
// (towards the camera) fades out and reappears at the destination instead.
function setSlot(v, slot) {
  if (!v || v.slot === slot && v.seat === seats[slot]) return;
  v.slot = slot; v.seat = seats[slot] || null;
  if (v.state === 'path' || v.state === 'kneel' || v.state === 'stand') return;
  travel(v, home(v));                              // công đức đổi -> tự đi tới chỗ mới (lên đầu / lùi xuống)
}
/** Get from where v is to `to` and sit there: walk if it is up or level, otherwise fade across. */
function travel(v, to, then = 'sit') {
  if (!to) return;
  if (to.y <= v.y + 4 && hasAnim(v.skin)) { v.path = [{ x: v.x, y: to.y }, { x: to.x, y: to.y }]; v.after = then; v.state = 'stand'; v.sitT = 0; }
  else { v.state = 'fade'; v.after = then; v.dest = to; }
}
function startWalk(v, kind, spot) {
  if (!v || !home(v)) return;
  const x0 = v.x;
  if (kind === 'altar') {
    const s = ALTAR_SPOTS[spot] || ALTAR_SPOTS[0];
    v.path = [{ x: x0, y: s.y }, { x: s.x, y: s.y }]; v.after = 'kneel';
  } else {
    // kinh hành: up your side of the hall, across in front of the altar, back down the other side (fading)
    const side = x0 < 540 ? -1 : 1, lane = 540 + side * 470, other = 540 - side * 470;
    v.path = [{ x: x0, y: 1200 }, { x: lane - side * 120, y: 1200 }, { x: other, y: 1196 }]; v.after = 'home';
  }
  v.state = 'stand'; v.sitT = 0; v.glow = Math.max(v.glow, .6);
}
const walkScale = y => {
  const gf = (6 / ((GRID[cap] || GRID[24])[0])) ** .7, d = (y - FLOOR.yTop) / (FLOOR.yBot - FLOOR.yTop);
  const blend = Math.max(0, Math.min(1, -d * 4));                    // above the floor (near the altar) all grids look alike
  return (.26 + .26 * Math.max(0, Math.min(1, d))) * (gf + (1 - gf) * blend);
};

/* ======================= HUD ======================= */
let startedAt = Date.now(), settings = { music: true, mo: true, moBpm: 52, volume: 80, lunar: true, showAllTime: false }, boards = { session: [], allTime: [] }, stats = { likes: 0, merit: 0 }, next = { merit: 100, likes: 1000 };
const fmt = n => n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',') + 'k' : n.toLocaleString('vi-VN');
function updateCount() { $('count').textContent = `${visitors.size}/${cap}`; }
let boardMode = 'session';
function renderMerit() {
  const list = (boardMode === 'allTime' ? boards.allTime : boards.session).slice(0, 5);
  $('meritTitle').textContent = boardMode === 'allTime' ? '✦ Trọn Đời ✦' : '✦ Công Đức ✦';
  const ol = $('meritList'); ol.replaceChildren();
  if (!list.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Chưa có'; ol.append(li); return; }
  list.forEach((b, i) => { const li = document.createElement('li'); const a = document.createElement('span'); a.textContent = `${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'} ${b.name}`; const c = document.createElement('span'); c.textContent = fmt(b.merit); li.append(a, c); ol.append(li); });
}
setInterval(() => { if (settings.showAllTime && boards.allTime.length) { boardMode = boardMode === 'session' ? 'allTime' : 'session'; renderMerit(); } else if (boardMode !== 'session') { boardMode = 'session'; renderMerit(); } }, 15000);
function renderGoal() {
  const k = Math.max(0, Math.min(1, stats.merit / (next.merit || 1)));
  $('goalFill').style.width = (k * 100).toFixed(1) + '%';
  $('goalText').textContent = `Công đức đạo tràng ${fmt(stats.merit)} / ${fmt(next.merit)}`;
  $('likes').textContent = fmt(stats.likes || 0);
}
// the guide card has two pages (rituals / moving around) that take turns
let guidePage = 0;
setInterval(() => { const pages = document.querySelectorAll('#guide .page'); pages[guidePage].classList.remove('show'); guidePage = (guidePage + 1) % pages.length; pages[guidePage].classList.add('show'); }, 9000);
function renderLunar() { $('lunar').textContent = settings.lunar ? '☸ ' + lunarLine().text : ''; }
setInterval(renderLunar, 60_000);
setInterval(() => { const s = Math.floor((Date.now() - startedAt) / 1000); $('timer').textContent = [s / 3600, s / 60 % 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':'); }, 1000);

// Banners (gift, milestone, chant, abbot) share one slot and take turns, so they never pile up on each other.
const bannerQ = []; let bannerBusy = false;
function banner(el, ms, fill, important = true) {
  if (!important && (bannerBusy || bannerQ.length)) return;          // a chant is skipped rather than delayed
  if (bannerQ.length >= 8) bannerQ.shift();
  bannerQ.push({ el, ms, fill }); pumpBanner();
}
function pumpBanner() {
  if (bannerBusy || !bannerQ.length) return;
  bannerBusy = true; const b = bannerQ.shift(); b.fill(); b.el.classList.add('show');
  const ms = bannerQ.length ? Math.min(b.ms, 4500) : b.ms;            // speed up when others are waiting
  setTimeout(() => { b.el.classList.remove('show'); setTimeout(() => { bannerBusy = false; pumpBanner(); }, 600); }, ms);
}
function showGift(m) {
  banner($('gift'), m.tier >= 3 ? 9000 : 6500, () => {
    $('giftWho').textContent = m.name;
    $('giftWhat').textContent = `thành tâm dâng ${m.giftName}${m.count > 1 ? ' ×' + m.count : ''}${m.nth > 1 ? ` · lần thứ ${m.nth}` : ''}`;
    $('giftPray').textContent = '“' + m.prayer + '”';
  });
}
function showChant(head, text, ms = 14000, important = false) { banner($('chant'), ms, () => { $('chantHead').textContent = head; $('chantText').textContent = text; }, important); }
function toast(text) {
  const box = $('toasts'); while (box.children.length >= 3) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = text; box.append(d); setTimeout(() => d.remove(), 5200);
}
function lantern(name, wish) {
  const box = $('lanterns'); if (box.children.length >= 5) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'lantern';
  const b = document.createElement('b'); b.textContent = '🏮 ' + name; const s = document.createElement('span'); s.textContent = wish;
  d.append(b, s); d.style.left = (120 + Math.random() * 640) + 'px'; d.style.top = '1450px';
  box.append(d); setTimeout(() => d.remove(), 16500);
}

/* ======================= fortune cards ======================= */
// A card waits for its voice line to start (so card and voice are in sync), with a 10 s safety net.
const cards = []; let cardBusy = false; const waitingKey = new Map();
function queueFortune(m) { cards.push(m); pumpCards(); }
function pumpCards() {
  if (cardBusy || !cards.length) return;
  cardBusy = true; const m = cards.shift();
  const show = () => { if (m.shown) return; m.shown = true; waitingKey.delete(m.key); renderCard(m); };
  if (m.key && AUDIO && AC) { waitingKey.set(m.key, show); setTimeout(show, 10_000); } else show();
}
function renderCard(m) {
  const c = m.card, v = visitors.get(m.id);
  $('fWho').textContent = m.name; $('fNo').textContent = `Thẻ số ${c.n} · ${c.grade}`; $('fTitle').textContent = c.title;
  $('fPoem').replaceChildren(...c.poem.flatMap((l, i) => i ? [document.createElement('br'), document.createTextNode(l)] : [document.createTextNode(l)]));
  $('fMeaning').textContent = c.meaning; $('fWork').textContent = c.advice.work; $('fFamily').textContent = c.advice.family; $('fHealth').textContent = c.advice.health;
  $('fFoot').textContent = m.queue ? `Còn ${m.queue} người đang chờ rút thẻ · lời chúc mang tính giải trí` : 'Lời chúc mang tính giải trí, an vui';
  if (v) { v.glow = 1.6; v.bow = 1; spot = { v, until: performance.now() + m.duration }; }
  bell(); $('fortune').classList.add('show'); stage.classList.add('card-open');
  setTimeout(() => {
    $('fortune').classList.remove('show'); stage.classList.remove('card-open');
    setTimeout(() => { cardBusy = false; pumpCards(); }, 700);
  }, Math.max(4_000, m.duration - 600));
}
let spot = null;

/* ======================= audio ======================= */
let AC = null, master = null, musicGain = null, sfx = null;
const TRACKS = ['/assets/music/music1.mp3', '/assets/music/music2.mp3']; let trackIdx = Math.floor(Math.random() * TRACKS.length), musicEl = null;
$('unmute').onclick = () => startAudio(false);
if (!AUDIO) $('unmute').remove();
function startAudio(auto) {
  if (AC || !AUDIO) return;
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  if (auto && ac.state !== 'running') { ac.close(); return; }      // autoplay blocked: wait for the button
  AC = ac; if (AC.state !== 'running') AC.resume();
  $('unmute')?.remove();
  master = AC.createGain(); master.gain.value = (settings.volume ?? 80) / 100; master.connect(AC.destination);
  musicGain = AC.createGain(); musicGain.gain.value = settings.music ? .5 : 0; musicGain.connect(master);
  sfx = AC.createGain(); sfx.gain.value = 1; sfx.connect(master);
  nextTrack(); scheduleMo(); bell(); playTTS();
}
function nextTrack() {
  if (musicEl) musicEl.pause();
  musicEl = new Audio(TRACKS[trackIdx++ % TRACKS.length]); const src = AC.createMediaElementSource(musicEl); src.connect(musicGain);
  musicEl.onended = nextTrack; musicEl.play().catch(() => {});
}
function duck(on) { if (!AC || !musicGain) return; const t = AC.currentTime, target = !settings.music ? 0 : on ? .14 : .5; musicGain.gain.cancelScheduledValues(t); musicGain.gain.setValueAtTime(musicGain.gain.value, t); musicGain.gain.linearRampToValueAtTime(target, t + .5); }
let haloPulse = 0;
function bell(big) {
  haloPulse = 1; if (!AC) return; const t = AC.currentTime, k = big ? 1.7 : 1;
  for (const [f, a, d] of [[216, .55, 7], [432, .35, 5], [1296, .12, 3], [2160, .05, 2]]) { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f * (big ? .75 : 1); const g = AC.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * k * .7, t + .015); g.gain.exponentialRampToValueAtTime(.0005, t + d * k); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + d * k + .1); }
}
function mo(vol = .35) {
  if (!AC) return; const t = AC.currentTime;
  const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(380, t + .05);
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 3; const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .14);
  o.connect(bp); bp.connect(g); g.connect(sfx); o.start(t); o.stop(t + .16);
}
let moTimer = null; function scheduleMo() { clearInterval(moTimer); if (AC && settings.mo) moTimer = setInterval(() => mo(.22), 60000 / Math.max(20, settings.moBpm || 52)); }
let lastLikeMo = 0;

// voice lines play one after another; `speak` = server could not reach Edge TTS → browser voice instead
const ttsQ = []; let ttsPlaying = false, curAudio = null;
function queueTTS(m) {
  if (!AUDIO || !AC) { waitingKey.get(m.key)?.(); return; }       // silent preview / sound not enabled yet
  if (ttsQ.length >= 12) ttsQ.shift();
  ttsQ.push(m); playTTS();
}
// Dọn dữ liệu / buổi mới: dừng NGAY mọi thứ đang đọc & đang hiện
function hush() {
  try { ttsQ.length = 0; } catch (e) {} ttsPlaying = false;
  try { if (curAudio) { curAudio.pause(); curAudio.onended = curAudio.onerror = null; curAudio = null; } } catch (e) {}
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
  try { waitingKey.clear(); } catch (e) {}
  try { cards.length = 0; } catch (e) {} cardBusy = false; spot = null;
  try { bannerQ.length = 0; } catch (e) {} bannerBusy = false;
  // ẩn hết banner (quà/tụng kinh/mốc/...) + thẻ quẻ
  try { document.querySelectorAll('.banner, #fortune').forEach(el => el.classList.remove('show')); } catch (e) {}
  try { stage.classList.remove('card-open'); } catch (e) {}
  try { duck(false); } catch (e) {}
}
function playTTS() {
  if (ttsPlaying || !ttsQ.length || !AC) return; ttsPlaying = true;
  const m = ttsQ.shift();
  const done = () => { duck(false); ttsPlaying = false; curAudio = null; setTimeout(playTTS, Math.max(0, (settings.readGapSec != null ? settings.readGapSec : 0.3) * 1000)); };
  const start = () => { duck(true); waitingKey.get(m.key)?.(); };
  if (m.url) {
    const el = new Audio(m.url); curAudio = el; const src = AC.createMediaElementSource(el); const g = AC.createGain(); g.gain.value = 1.25; src.connect(g); g.connect(master);
    el.onplay = start; el.onended = el.onerror = done; el.play().catch(done);
  } else if ('speechSynthesis' in window && speechSynthesis.getVoices().some(v => /^vi/i.test(v.lang))) {
    // only with a real Vietnamese voice installed; an English voice reading Vietnamese sounds broken on stream
    const u = new SpeechSynthesisUtterance(m.text); u.lang = 'vi-VN'; u.rate = .95;
    u.voice = speechSynthesis.getVoices().find(v => /^vi/i.test(v.lang));
    u.onstart = start; u.onend = u.onerror = done; speechSynthesis.speak(u);
    setTimeout(() => { if (ttsPlaying && !speechSynthesis.speaking) done(); }, 30_000);
  } else { start(); setTimeout(done, 4000); }                       // no voice at all: keep the visuals in step, stay silent
}

/* ======================= effects ======================= */
const fx = [], petals = [];
function rise(kind, x, y, scale, life = 2.6) { if (fx.length < 40) fx.push({ kind, x, y, t: 0, life, scale }); }
function giftFx(v, tier) {
  v.glow = 1; v.bow = 1;
  const kind = tier >= 3 ? 'bell' : tier >= 2 ? 'lotus' : 'incense', s = sc(v);
  rise(kind, v.x, v.y - 220 * s, s * (tier >= 3 ? 1.5 : 1.1), tier >= 3 ? 3.4 : 2.4);
  for (let i = 0; i < (tier >= 3 ? 22 : tier >= 2 ? 10 : 4); i++) petal(v.x + (Math.random() - .5) * 120, v.y - 80, (Math.random() - .5) * 40, -(70 + Math.random() * 90), 2.6 + Math.random(), .16 + Math.random() * .14);
  if (tier >= 3) { bell(true); rain(30); }
}
function rain(n) { for (let i = 0; i < n; i++) petal(540 + (Math.random() - .5) * 700, 300 + Math.random() * 250, (Math.random() - .5) * 40, 30 + Math.random() * 50, 5, .2 + Math.random() * .15); }
function petal(x, y, vx, vy, life, s, heart) { if (petals.length < 260) petals.push({ x, y, vx, vy, t: 0, life, s, heart }); }
function hearts(v, n) { for (let i = 0; i < Math.min(6, n); i++) petal(v.x + (Math.random() - .5) * 60, v.y - 140 * sc(v), (Math.random() - .5) * 20, -(50 + Math.random() * 40), 1.6, .08, true); }
function sideHearts(n) { for (let i = 0; i < Math.min(5, n); i++) petal(980 + (Math.random() - .5) * 60, 1800, (Math.random() - .5) * 30, -(140 + Math.random() * 80), 2.4, .08, true); }

/* ======================= server link ======================= */
let ws = null;
function connect() {
  ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?role=overlay`);
  const st = $('conn');
  ws.onopen = () => { st.textContent = ''; };
  ws.onclose = () => { st.textContent = 'mất kết nối server… đang thử lại'; setTimeout(connect, 2000); };
  ws.onmessage = e => { try { onMsg(JSON.parse(e.data)); } catch (err) { console.error(err); } };
}
function onMsg(m) {
  const v = m.id != null ? visitors.get(m.id) : null;
  switch (m.t) {
    case 'state':
      Object.assign(settings, m.settings); applySettings(); startedAt = m.startedAt;
      visitors.clear(); vipIds = m.vip || []; layout(m.cap); for (const p of m.viewers) addVisitor(p, true);
      boards = m.boards; stats = m.stats; next = m.next; updateCount(); renderMerit(); renderGoal(); break;
    case 'settings': Object.assign(settings, m.settings); applySettings(); if (m.cap !== cap) { layout(m.cap); updateCount(); } break;
    case 'join': if (m.cap !== cap) layout(m.cap); addVisitor(m.v, m.v.demo && visitors.size > 8); updateCount(); break;
    case 'leave': removeVisitor(m.id); updateCount(); break;
    case 'hush': hush(); break;                                     // dọn dữ liệu -> dừng đọc + ẩn thẻ quẻ/banner
    case 'slots': layout(m.cap); for (const [id, slot] of m.slots) setSlot(visitors.get(id), slot); updateCount(); break;
    case 'seat': setSlot(v, m.slot); break;
    case 'walk': if (v) startWalk(v, m.kind, m.spot); break;
    case 'vip': {
      // chỉ đổi kiểu hiển thị (bồ đoàn vàng + tên VIP); việc dời chỗ do 'slots' (xếp theo công đức) lo
      const was = vipIds; vipIds = m.ids || [];
      for (const id of vipIds) if (!was.includes(id)) { const w = visitors.get(id); if (w) w.glow = Math.max(w.glow, 1.4); }
      break;
    }
    case 'skin': if (v) { v.skin = m.skin; v.glow = .8; if (v.state !== 'sit') { v.state = 'sit'; v.frame = 7; } } break;
    case 'chat': if (v) { v.bubble = { text: m.text, until: performance.now() + 6000 }; v.bow = .6; } break;
    case 'giftTick': if (v) { v.coins = m.total; v.glow = Math.max(v.glow, .7); } break;
    case 'gift': if (v) { v.coins = m.total; giftFx(v, m.tier); } else rain(m.tier * 8); showGift(m); break;
    case 'like':
      for (const it of m.items) { const w = visitors.get(it.id); seated(w) ? hearts(w, it.n) : sideHearts(it.n); }
      stats.likes = m.total; renderGoal();
      if (settings.mo && AC && performance.now() - lastLikeMo > 450) { lastLikeMo = performance.now(); mo(.28); }
      break;
    case 'board': boards = m.boards; stats = m.stats; next = m.next; renderMerit(); renderGoal(); break;
    case 'bell': bell(m.big || !v); if (v) { v.glow = 1; v.bow = 1; rise('bell', v.x, v.y - 200 * sc(v), sc(v) * 1.2); } break;
    case 'mo': for (let i = 0; i < (m.n || 1); i++) setTimeout(() => mo(), i * 420); if (v) { v.bow = 1; rise('mo', v.x, v.y - 200 * sc(v), sc(v) * 1.1, 1.6); } break;
    case 'incense': if (v) { v.bow = 1; v.glow = .7; rise('incense', v.x, v.y - 200 * sc(v), sc(v) * 1.2, 3); } break;
    case 'bow': if (v) v.bow = 1; break;
    case 'follow': toast(`🙏 ${m.name} đã theo dõi đạo tràng`); bell(); if (v) v.glow = 1; break;
    case 'share': toast(`🌸 ${m.name} đã chia sẻ phiên live`); if (v) v.glow = 1; break;
    case 'notice': toast(m.text); break;
    case 'fortune': queueFortune(m); break;
    case 'fortuneQueue': break;
    case 'prayer': lantern(m.name, m.wish); if (v) { v.glow = 1; v.bow = 1; } break;
    case 'milestone': banner($('milestone'), 8000, () => { $('milestoneText').textContent = m.text; bell(true); rain(60); }); next = m.next; renderGoal(); break;
    case 'chant': showChant('✦ TỤNG KINH ✦', m.text); bell(); break;
    case 'abbot': showChant('✦ LỜI THẦY TRỤ TRÌ ✦', m.text, Math.min(30000, 6000 + m.text.length * 90), true); bell(); break;
    case 'tts': case 'speak': queueTTS(m); break;
  }
}
function applySettings() {
  $('title').textContent = settings.title || 'Chánh Điện An Lạc';
  $('subtitle').textContent = settings.subtitle || 'Nam Mô A Di Đà Phật';
  if (master) master.gain.value = (settings.volume ?? 80) / 100;
  renderGuide();
  duck(false); scheduleMo(); renderLunar(); renderMerit();
}
// Bảng hướng dẫn người xem: tuỳ chỉnh từ dashboard (guideText), '---' = sang trang, **đậm**.
function renderGuide() {
  const g = $('guide'); if (!g) return;
  if (settings.showGuide === false) { g.style.display = 'none'; return; }
  g.style.display = '';
  const txt = (settings.guideText || '').trim();
  if (!txt) return;                                  // trống -> giữ bảng mặc định dựng sẵn
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const pages = txt.split(/^\s*---\s*$/m).map(p => p.split('\n').map(l => l.trim()).filter(Boolean)).filter(p => p.length);
  if (!pages.length) return;
  g.innerHTML = pages.map((lines, i) => `<div class="page${i === 0 ? ' show' : ''}">${lines.map(l => `<div>${fmt(l)}</div>`).join('')}</div>`).join('');
  guidePage = 0;
}
connect();

/* ======================= render ======================= */
const ctx = $('c').getContext('2d');
function sprite(im, x, y, s, ay = 1) { if (!im?.naturalWidth) return; const w = im.naturalWidth * s, h = im.naturalHeight * s; ctx.drawImage(im, x - w / 2, y - h * ay, w, h); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function tag(text, x, y, s, style, av, maxW) {
  let fs = Math.max(15, Math.round(30 * s / .4));
  const setFont = () => ctx.font = `600 ${fs}px "Be Vietnam Pro",system-ui,sans-serif`;
  setFont();
  let pad = fs * .5, aw = av ? fs * 1.15 : 0;
  if (maxW) {
    if (aw && maxW < fs * 5) { aw = 0; av = null; }
    // Thu NHỎ cỡ chữ cho vừa khoảng trống, thay vì cắt mất tên
    const need = ctx.measureText(text).width + pad * 2 + aw;
    if (need > maxW) {
      const minFs = 11;
      fs = Math.max(minFs, Math.floor(fs * (maxW / need)));
      setFont(); pad = fs * .5; aw = av ? fs * 1.15 : 0;
      // chỉ khi ở cỡ nhỏ nhất vẫn quá dài mới cắt (hiếm gặp)
      let t = text;
      while (t.length > 2 && ctx.measureText(t).width + pad * 2 + aw > maxW) t = t.slice(0, -1);
      if (t !== text) text = t.trimEnd() + '…';
    }
  }
  const w = ctx.measureText(text).width + pad * 2 + aw, h = fs * 1.5;
  ctx.fillStyle = style === 'gold' ? 'rgba(70,30,8,.92)' : 'rgba(18,9,5,.72)'; rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.lineWidth = style === 'gold' ? 3 : 1.5; ctx.strokeStyle = style === 'gold' ? '#e2b04f' : 'rgba(226,176,79,.55)'; ctx.stroke();
  if (av) { ctx.save(); ctx.beginPath(); ctx.arc(x - w / 2 + pad * .55 + aw / 2, y, fs * .5, 0, 6.29); ctx.clip(); ctx.drawImage(av, x - w / 2 + pad * .55 + aw / 2 - fs * .5, y - fs * .5, fs, fs); ctx.restore(); }
  ctx.fillStyle = style === 'gold' ? '#ffd98a' : '#f6e9cf'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + aw / 2, y + 1);
}
function bubble(text, x, y, s) {
  const fs = Math.max(18, Math.round(26 * s / .4)); ctx.font = `500 ${fs}px "Be Vietnam Pro",system-ui,sans-serif`;
  let t = text; while (ctx.measureText(t).width > 320 && t.length > 4) t = t.slice(0, -2); if (t !== text) t = t.trimEnd() + '…';
  const w = ctx.measureText(t).width + fs * 1.1, h = fs * 1.6;
  ctx.fillStyle = 'rgba(255,247,230,.95)'; rr(x - w / 2, y - h, w, h, fs * .5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.lineTo(x, y + 10); ctx.fill();
  ctx.fillStyle = '#3a1a08'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y - h / 2 + 1);
}
// When the hall is crowded, only the top donors and the newest few get a name tag.
function labelSet(list) {
  const mode = settings.nameTagMode || 'auto';
  if (mode === 'all') return null;                                 // luôn hiện mọi tên
  const topN = settings.nameTagTopN != null ? settings.nameTagTopN : 6;
  const keep = new Set();
  // LUÔN giữ: bảng Công Đức (top merit, cả buổi lẫn trọn đời) + VIP + top N người tặng nhiều xu
  for (const b of (boards.session || [])) keep.add(b.id);
  for (const b of (boards.allTime || [])) keep.add(b.id);
  for (const id of vipIds) keep.add(id);
  for (const v of list.filter(v => v.coins > 0).sort((a, b) => b.coins - a.coins).slice(0, topN)) keep.add(v.id);
  if (mode === 'topOnly') return keep;                             // chỉ hiện top + VIP, ẩn người thường
  // auto: ít người thì hiện hết; đông (>36) mới ẩn bớt người thường (vẫn giữ nhóm trên)
  if (list.length <= 36) return null;
  for (const v of list.slice().sort((a, b) => b.joined - a.joined).slice(0, 5)) keep.add(v.id);
  for (const v of list) if (v.state !== 'sit') keep.add(v.id);     // whoever is moving
  return keep;
}
let last = performance.now();
// Vẽ 1 bồ đoàn (ghế thiền) nâu ở (x,y), kích thước theo scale của chỗ ngồi.
function drawCushion(x, y, scl) {
  const rx = 132 * scl, ry = 44 * scl;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  ctx.beginPath(); ctx.ellipse(x, y + ry * 0.22, rx * 1.04, ry * 1.02, 0, 0, 6.29); ctx.fill();
  const g = ctx.createLinearGradient(x, y - ry, x, y + ry);
  g.addColorStop(0, '#8a5d35'); g.addColorStop(0.55, '#5f3d21'); g.addColorStop(1, '#3a2512');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(205,155,95,.32)';
  ctx.beginPath(); ctx.ellipse(x, y - ry * 0.3, rx * 0.8, ry * 0.56, 0, 0, 6.29); ctx.fill();
  ctx.restore();
}

function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min((now - last) / 1000, .05); last = now; const t = now / 1000;
  ctx.clearRect(0, 0, 1080, 1920);
  if (A.hall.naturalWidth) ctx.drawImage(A.hall, 0, 0, 1080, 1920);
  // light: halo pulse behind the Buddha, candle flicker, incense smoke
  haloPulse = Math.max(0, haloPulse - dt * .4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .2 + .08 * Math.sin(t * 1.2) + haloPulse * .5; sprite(A.halo, 540, 560, 2.7 + haloPulse * .35, .5); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .05 + .035 * Math.sin(t * 9) * Math.sin(t * 13.3); ctx.fillStyle = '#ffb347'; ctx.fillRect(0, 300, 1080, 800); ctx.restore();
  ctx.save(); ctx.fillStyle = '#efe3cc'; for (let i = 0; i < 16; i++) { const a = (t * .08 + i * .0625) % 1; ctx.globalAlpha = .28 * (1 - a); ctx.beginPath(); ctx.arc(540 + Math.sin(a * 7 + i) * 20 * a, 1000 - a * 280, 4 + a * 15, 0, 6.28); ctx.fill(); } ctx.restore();
  // Bồ đoàn: vẽ ghế dưới mỗi chỗ ngồi (theo sức chứa — tự tăng khi đông) + dưới 3 sư
  for (const st of (seats && seats.length ? seats : seatOrder(cap))) drawCushion(st.x, st.y, st.scale);
  for (const tc of TEACHERS) drawCushion(tc.x, tc.y, tc.s * 0.92);
  TEACHERS.forEach((tc, i) => {
    if (tc.master) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 + .1 * Math.sin(t * 1.5); sprite(A.halo, tc.x, tc.y - 120, .9, .5); ctx.restore(); }
    const nm = (settings.teacherNames && settings.teacherNames[i]) || tc.name;    // tên sư thầy tuỳ chỉnh
    sprite(A[tc.skin], tc.x, tc.y, tc.s); tag(nm, tc.x, tc.y - tc.s * 260 - 22, tc.s, 'gold');
  });
  // spotlight on whoever is drawing a fortune card
  if (spot && now < spot.until && visitors.has(spot.v.id)) {
    const v = spot.v, s = sc(v);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55 + .15 * Math.sin(t * 3);
    const g = ctx.createRadialGradient(v.x, v.y - 120 * s, 10, v.x, v.y - 120 * s, 320 * s); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g; ctx.fillRect(v.x - 340 * s, v.y - 460 * s, 680 * s, 560 * s); ctx.restore();
  } else spot = null;
  // bồ đoàn vàng cho top công đức — vẽ ngay dưới chỗ họ đang ngồi (top đã ở hàng đầu nhờ xếp theo công đức)
  vipIds.forEach((id, i) => {
    const w = visitors.get(id), h = w && home(w);
    if (!h) return;
    const s = h.scale || .3, px = h.x, py = h.y + 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .5 + .15 * Math.sin(t * 2 + i);
    const g = ctx.createRadialGradient(px, py, 4, px, py, 150 * s); g.addColorStop(0, 'rgba(255,215,120,.95)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, 150 * s, 48 * s, 0, 0, 6.29); ctx.fill(); ctx.restore();
  });
  // visitors back to front
  const bubbles = [], list = [...visitors.values()].filter(seated).sort((a, b) => a.y - b.y), labels = labelSet(list);
  for (const v of list) {
    const anim = hasAnim(v.skin), h = home(v), s = h.scale;
    const depth = (v.y - FLOOR.yTop) / (FLOOR.yBot - FLOOR.yTop), sp = (170 + 190 * Math.max(0, Math.min(1.5, depth))) * dt * ((settings.walkSpeed || 100) / 100);
    const step = () => { v.ft += dt; if (v.ft > .15) { v.ft = 0; v.frame = (v.frame + 1) % 4; } };
    if (v.state === 'walk') {                                                   // entering: up the centre aisle, then sideways
      const dx = h.x - v.x, dy = h.y - v.y;
      if (Math.abs(dy) > 3) { v.y += Math.max(-sp, Math.min(sp, dy)); v.x += (540 - v.x) * Math.min(1, dt * 6); v.flip = false; } else { v.x += Math.max(-sp, Math.min(sp, dx)); v.flip = dx < 0; }
      step();
      if (Math.abs(v.x - h.x) < 2 && Math.abs(v.y - h.y) < 3) { v.x = h.x; v.y = h.y; v.state = 'sitting'; v.sitT = 0; v.flip = false; }
    } else if (v.state === 'sitting') { v.sitT += dt; v.frame = 4 + Math.min(3, Math.floor(v.sitT / .22)); if (v.sitT > .9) { v.state = 'sit'; v.frame = 7; } }
    else if (v.state === 'stand') {                                              // getting up: the sit-down frames backwards
      v.sitT += dt; v.frame = 7 - Math.min(3, Math.floor(v.sitT / .18)); if (v.sitT > .72) { v.state = 'path'; v.frame = 0; }
    } else if (v.state === 'path') {
      const p = v.path?.[0];
      if (!p) {
        v.flip = false;
        if (v.after === 'kneel') { v.state = 'kneel'; v.sitT = 0; }
        else if (v.after === 'sit') { v.state = 'sitting'; v.sitT = 0; }
        else travel(v, h);
      } else {
        const dx = p.x - v.x, dy = p.y - v.y, d = Math.hypot(dx, dy), k = Math.min(1, sp / (d || 1));
        v.x += dx * k; v.y += dy * k; if (Math.abs(dx) > 2) v.flip = dx < 0; step();
        if (d < 3) v.path.shift();
      }
    } else if (v.state === 'kneel') {                                            // kneel, three bows, then go home
      v.sitT += dt; v.frame = 4 + Math.min(3, Math.floor(v.sitT / .22));
      for (const b of [1.3, 2.5, 3.7]) if (v.sitT - dt < b && v.sitT >= b) { v.bow = 1; v.glow = Math.max(v.glow, .5); }
      if (v.sitT > 4.9) travel(v, h);
    } else if (v.state === 'fade') {                                             // walking towards the camera is not drawn: cross-fade
      v.fade -= dt * 2.5;
      if (v.fade <= 0) { const d = v.dest || h; v.x = d.x; v.y = d.y; v.fade = 0; v.state = 'sit'; v.frame = 7; v.flip = false; }
    } else { v.x += (h.x - v.x) * Math.min(1, dt * 3); v.y += (h.y - v.y) * Math.min(1, dt * 3); }
    if (v.state !== 'fade') v.fade = Math.min(1, v.fade + dt * 2);
    v.glow = Math.max(0, v.glow - dt * .45); v.bow = Math.max(0, v.bow - dt * .7);
    const ws = v.state === 'sit' || v.state === 'sitting' ? s : walkScale(v.y);
    if (v.glow > 0 || v.skin === 'master') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(Math.min(1, v.glow) * .75, v.skin === 'master' ? .35 + .1 * Math.sin(t * 1.6) : 0);
      const g = ctx.createRadialGradient(v.x, v.y - 110 * ws, 8, v.x, v.y - 110 * ws, 200 * ws); g.addColorStop(0, 'rgba(255,205,120,.95)'); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = g; ctx.fillRect(v.x - 230 * ws, v.y - 340 * ws, 460 * ws, 400 * ws); ctx.restore();
    }
    const breathe = v.state === 'sit' ? Math.sin(t * 1.1 + v.phase) * 2 * ws : 0, bowK = v.state === 'sit' || v.state === 'kneel' ? Math.sin(Math.min(1, v.bow) * Math.PI) * (v.state === 'kneel' ? .14 : .06) : 0;
    ctx.save(); ctx.globalAlpha = v.fade; ctx.translate(v.x, v.y); if (bowK) ctx.transform(1, 0, 0, 1 - bowK, 0, 0);
    let topY;
    if (anim) { const a = ANIM[v.skin], k = ws * 1.05 * 260 / a.seatH; if (v.flip) ctx.scale(-1, 1); ctx.drawImage(A['anim_' + v.skin], v.frame * a.fw, 0, a.fw, a.fh, -a.fw * k / 2, -a.fh * k + breathe, a.fw * k, a.fh * k); topY = (v.frame >= 6 ? a.seatH : a.fh * .97) * k; }
    else { const sk = v.skin === 'master' ? 'monk' : v.skin; sprite(A[sk] || A.man, 0, breathe, ws * 1.05); topY = 260 * ws; }
    ctx.restore();
    // So le bang ten theo cot ghe de ten hang xom khong de len nhau khi ngoi sat
    const col = (h && h.k != null) ? h.k : Math.round((v.x - 540) / 170);
    const stagger = v.state === 'sit' && (col & 1) ? 34 * ws / .4 : 0;
    const ty = v.y - topY - 14 * ws / .4 - stagger;
    if (!labels || labels.has(v.id) || v.bubble) tag(v.name, v.x, ty, ws, v.skin === 'master' || vipIds.includes(v.id) ? 'gold' : '', avatar(v.avatar), v.state === 'sit' ? h.gap : 0);
    if (v.bubble && now < v.bubble.until) bubbles.push([v.bubble.text, v.x, ty - Math.max(18, 30 * ws / .4), ws]); else v.bubble = null;
  }
  for (const b of bubbles.slice(-8)) bubble(...b);
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i]; f.t += dt; const k = f.t / f.life; if (k >= 1) { fx.splice(i, 1); continue; } const pop = 1 - Math.pow(1 - Math.min(1, f.t * 4), 3);
    ctx.save(); ctx.globalAlpha = k < .75 ? 1 : (1 - k) / .25; sprite(A[f.kind], f.x, f.y - k * 170, f.scale * (.6 + .4 * pop)); ctx.restore();
  }
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i]; p.t += dt; if (p.t > p.life) { petals.splice(i, 1); continue; } p.x += p.vx * dt + Math.sin(p.t * 3 + i) * 20 * dt; p.y += p.vy * dt;
    ctx.save(); ctx.globalAlpha = Math.min(1, p.life - p.t); ctx.translate(p.x, p.y);
    if (p.heart) { ctx.fillStyle = '#ff5a7a'; ctx.font = '34px serif'; ctx.textAlign = 'center'; ctx.fillText('♥', 0, 0); } else { ctx.rotate(Math.sin(p.t * 2 + i) * .6); sprite(A.petal, 0, 0, p.s, .5); }
    ctx.restore();
  }
}
layout(24); renderLunar(); requestAnimationFrame(frame);
// OBS / Live Studio browser sources allow autoplay: try straight away, the button stays for normal browsers.
if (AUDIO) { try { startAudio(true); } catch (e) { console.error(e); AC = master = musicGain = sfx = null; } }
