// The temple: every live event comes through here (real TikTok, simulator or bots), becomes state and
// is pushed to the overlay. No I/O in this file besides the injected `send` and `say`, so it is easy to test.
import fs from 'node:fs';
import { clean, displayName, spokenName, makeFilter, clamp } from './text.mjs';
import { parseComment, SKIN_NAMES } from './rules.mjs';
import { GiftTracker, tier } from './gifts.mjs';
import { CAPS, seatOrder, seatAt, ALTAR_SPOTS } from '../public/seats.js';

const FORTUNES = JSON.parse(fs.readFileSync(new URL('../data/fortunes.json', import.meta.url), 'utf8'));

export const DEFAULT_SETTINGS = {
  title: 'Chánh Điện An Lạc', subtitle: 'Nam Mô A Di Đà Phật',
  voice: 'vi-VN-NamMinhNeural', pitch: -18, rate: 0,
  music: true, mo: true, moBpm: 52, volume: 80,
  autoChant: true, chantEveryMin: 4,
  seatMode: 'auto', joinOnEnter: false,
  readGifts: true, readGiftWish: true,
  fortuneMode: 'all', fortuneMinCoins: 5, fortuneCooldownMin: 10,
  prayerAuto: false, readPrayers: true,
  thankFollow: true, sharePromptMin: 12,
  showAllTime: false, lunar: true,
  fortuneHoldSec: 24, walkSpeed: 100,
  readFortune: true, readChant: true, fortuneVoice: '',
  readGapSec: 0.3,               // khoảng cách giữa 2 câu đọc (giây)
  nameTagMode: 'auto',           // hiện tên: auto (đông thì ẩn bớt) | all (luôn hiện) | topOnly (chỉ top)
  nameTagTopN: 6,                // luôn hiện tên top N người tặng quà nhiều nhất
  requireGiftToJoin: false,      // bật: chỉ người đã tặng quà mới được ngồi vào chánh điện
  ritualsNeedGift: false,        // bật: nghi lễ gõ chat (mõ/chuông/hương/lạy/xin xăm) chỉ chạy sau khi đã tặng quà -> tránh gõ chat lách luật quà
  showGuide: true, guideText: '', // bảng hướng dẫn người xem ('' = dùng mặc định dựng sẵn trong overlay)
  teacherNames: ['Thầy Minh Đạo', 'Sư Trụ Trì', 'Thầy Tâm Từ'], // tên 3 sư thầy (trái · giữa · phải)
  interactionRules: {},          // { like/share/follow/comment: { action, merit, read, text, requireGift, minCount?, keyword? } }
  extraBadWords: '',
  allowMove: true, vipMinCoins: 10, altarOnGiftCoins: 10,
};

// Edge voices, plus VieNeu-TTS presets (local model, see server/tts.mjs)
// Turbo presets (GPU) first, then the Nano-only presets (CPU, scripts/giong_nhe.py); Mai Anh and Trúc Ly exist in both
export const VIENEU_VOICES = ['Thiền Tâm Đức', 'Hải Đăng', 'Thiện Minh', 'Minh Đức', 'Quang Sơn', 'Ngọc Huyền', 'Mai Anh', 'Thùy Dung', 'Ngọc Trân', 'Trúc Ly',
  'Minh Quân', 'Hữu Quân', 'Mạnh Dũng', 'Đức Trí', 'Anh Khôi', 'Adam', 'Ái Hân', 'Mỹ Duyên', 'Xuân Tiên'];
const VOICES = ['vi-VN-NamMinhNeural', 'vi-VN-HoaiMyNeural', ...VIENEU_VOICES.map(v => 'vieneu:' + v)];
const bool = v => v === true || v === 'true' || v === 1;
// Only known keys, right types, sane ranges: the panel is local, but nothing from the socket is trusted blindly.
const SETTING_RULES = {
  title: v => clean(v, 40), subtitle: v => clean(v, 60),
  voice: (v, s) => VOICES.includes(v) ? v : s.voice,
  pitch: v => clamp(v, -50, 50), rate: v => clamp(v, -50, 50),
  music: bool, mo: bool, moBpm: v => clamp(v, 20, 120), volume: v => clamp(v, 0, 100),
  autoChant: bool, chantEveryMin: v => clamp(v, 1, 60),
  seatMode: v => ['auto', '24', '36', '64', '100'].includes(String(v)) ? String(v) : 'auto',
  joinOnEnter: bool, readGifts: bool, readGiftWish: bool,
  fortuneMode: v => ['all', 'gift', 'off'].includes(v) ? v : 'all',
  fortuneMinCoins: v => clamp(v, 1, 10000), fortuneCooldownMin: v => clamp(v, 0, 120),
  prayerAuto: bool, readPrayers: bool, thankFollow: bool, sharePromptMin: v => clamp(v, 0, 120),
  showAllTime: bool, lunar: bool,
  fortuneHoldSec: v => clamp(v, 10, 45), walkSpeed: v => clamp(v, 40, 300),
  readFortune: bool, readChant: bool,
  fortuneVoice: (v, s) => v === '' || VOICES.includes(v) ? v : s.fortuneVoice,
  readGapSec: v => clamp(v, 0, 6),
  nameTagMode: v => ['auto', 'all', 'topOnly'].includes(v) ? v : 'auto',
  nameTagTopN: v => clamp(v, 0, 100),
  requireGiftToJoin: bool,
  ritualsNeedGift: bool,
  showGuide: bool,
  guideText: v => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, '').split('\n').slice(0, 24).map(l => l.trim().slice(0, 90)).join('\n').slice(0, 1600),
  teacherNames: (v, s) => { const d = s.teacherNames || ['Thầy Minh Đạo', 'Sư Trụ Trì', 'Thầy Tâm Từ']; return [0, 1, 2].map(i => clean((Array.isArray(v) ? v[i] : '') || '', 30) || d[i]); },
  interactionRules: v => sanitizeInteractions(v),
  extraBadWords: v => clean(v, 600),
  allowMove: bool, vipMinCoins: v => clamp(v, 1, 100000), altarOnGiftCoins: v => clamp(v, 0, 100000),
};

// Luật tương tác (tim/chia sẻ/theo dõi/bình luận → hành động) — chỉ nhận đúng khoá, đúng kiểu.
const INTERACTION_ACTS = ['', 'mo', 'bell', 'incense', 'bow', 'fortune'];
function sanitizeInteractions(v) {
  const out = {};
  if (!v || typeof v !== 'object') return out;
  for (const k of ['like', 'share', 'follow', 'comment']) {
    const r = v[k];
    if (!r || typeof r !== 'object') continue;
    const o = {
      action: INTERACTION_ACTS.includes(r.action) ? r.action : '',
      merit: clamp(+r.merit || 0, 0, 100000),
      read: r.read === true || r.read === 'true',
      text: clean(r.text || '', 160),
      requireGift: r.requireGift === true || r.requireGift === 'true',
    };
    if (k === 'like') o.minCount = clamp(+r.minCount || 15, 1, 10000);
    if (k === 'comment') o.keyword = clean(r.keyword || '', 40);
    out[k] = o;
  }
  return out;
}

const WALK_MS = { kinh: 16_000, altar: 13_000 };
const MAX_WALKERS = 6;
const DEFAULT_SKINS = ['man', 'woman', 'woman', 'man', 'granny'];
const MILESTONES = {
  merit: [100, 300, 500, 1000, 2000, 3000, 5000, 7500, 10000],
  likes: [1000, 3000, 5000, 10000, 20000, 30000, 50000, 100000],
  viewers: [20, 50, 100, 200, 300, 500, 1000],
};
const MERIT = { chat: 1, ritual: 3, like: 1, follow: 10, share: 5, perCoin: 10 };

export const CHANTS = [
  'Nam mô Bổn Sư Thích Ca Mâu Ni Phật. Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sinh, đều trọn thành Phật đạo.',
  'Nam mô A Di Đà Phật. Nguyện sanh Tây Phương Tịnh Độ trung, cửu phẩm liên hoa vi phụ mẫu.',
  'Nam mô Đại Bi Quán Thế Âm Bồ Tát. Nguyện cho tất cả chúng sinh thân tâm an lạc, tai qua nạn khỏi.',
  'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
  'Nam mô Dược Sư Lưu Ly Quang Vương Phật. Nguyện cho đại chúng thân không bệnh khổ, tâm không phiền não.',
];
const WISHES = [
  'Nguyện cầu gia đạo bình an, vạn sự cát tường', 'Nguyện cầu cha mẹ mạnh khỏe, sống lâu',
  'Nguyện hồi hướng công đức cho khắp pháp giới chúng sinh', 'Nguyện cầu thân tâm an lạc, phiền não tiêu trừ',
  'Nguyện cầu công việc hanh thông, gia đình hạnh phúc', 'Nguyện cầu học hành tấn tới, trí tuệ sáng suốt',
];
const SHARE_LINES = [
  'Nam mô A Di Đà Phật. Đạo tràng xin mời đại chúng chia sẻ buổi tụng niệm này đến người thân, để cùng nhau gieo duyên lành.',
  'Kính mời quý Phật tử chia sẻ phiên live, để thêm nhiều người cùng ngồi tĩnh tâm với đạo tràng.',
];

export class Temple {
  /**
   * @param {{ send:(msg:object, role?:string)=>void, say:(text:string, opts?:object)=>string|null, log?:(s:string)=>void,
   *           now?:()=>number, random?:()=>number, settings?:object, allTime?:object, onPersist?:()=>void }} io
   */
  constructor(io) {
    this.send = io.send; this.say = io.say; this.log = io.log || (() => {});
    this.clearVoice = io.clearVoice || (() => {});   // xoá hàng đợi giọng đọc khi dọn dữ liệu
    this.now = io.now || Date.now; this.random = io.random || Math.random;
    this.onPersist = io.onPersist || (() => {});
    this.settings = { ...DEFAULT_SETTINGS };
    this.applySettings(io.settings || {});
    this.allTime = io.allTime || {};                // id -> { name, merit, coins }, real viewers only
    this.gifts = new GiftTracker({ now: this.now });
    this.newSession();
  }

  /* ------------------------------------------------------------ session */
  newSession() {
    this.viewers = new Map();                       // seated: id -> viewer
    this.slots = new Map();                         // seat index -> viewer id
    this.capHigh = 24;                              // auto capacity only grows within a session, so seats never jump back
    this.walking = new Map();                       // id -> { kind, until } for viewers away from their cushion
    this.vip = [];                                  // ids on the golden cushions, best donor first
    this.lastCap = 0;
    this.board = new Map();                         // session merit: id -> { name, merit, coins, demo }
    this.stats = { likes: 0, merit: 0, viewers: 0, viewersAt: 0, gifts: 0 };
    this.fired = { merit: 0, likes: 0, viewers: 0 };
    this.cool = new Map();                          // `${kind}:${id}` -> until
    this.thanked = new Set();
    this.fortuneQ = []; this.fortuneBusyUntil = 0; this.fortuneTimer = null;
    this.prayers = [];                              // pending moderation
    this.prayerSeq = 0;
    this.likeBuf = new Map();
    this.likeAcc = new Map();                        // id -> tim cộng dồn, để kích luật tương tác khi đủ ngưỡng
    this.gifted = new Set();                          // id những người đã tặng quà (cho option "phải tặng quà mới vào phòng")
    this.giftCount = new Map();                     // id -> how many times this session (for "lần thứ n")
    this.startedAt = this.now();
    this.lastShareAt = this.now();
    this.lastCelebrateAt = 0;
    this.stopAllOutput();                             // buổi mới -> dừng mọi thứ đang đọc/hiện
  }

  /* ----------------------------------------------------------- settings */
  applySettings(o) {
    for (const [k, fn] of Object.entries(SETTING_RULES)) if (o && k in o) this.settings[k] = fn(o[k], this.settings);
    this.filter = makeFilter(this.settings.extraBadWords.split(/[,;\n]/));
    if (this.viewers) { this.relayout(); this.reseatByMerit(); this.updateVip(); }
  }

  capacity(size = this.viewers.size) {
    if (this.settings.seatMode !== 'auto') return +this.settings.seatMode;
    this.capHigh = Math.max(this.capHigh, CAPS.find(c => size <= c) || 100);
    return this.capHigh;
  }

  /* -------------------------------------------------------------- slots */
  // The server decides who sits on which cushion, so a viewer keeps their seat when others leave and can move.
  takeSlot(v) {
    const cap = this.capacity();
    if (cap !== this.lastCap) {
      if (this.lastCap) { this.relayout(); if (v.slot >= 0) return; }   // the re-pack already gave v a cushion
      else this.lastCap = cap;
    }
    for (let i = 0; i < cap; i++) if (!this.slots.has(i)) { v.slot = i; this.slots.set(i, v.id); return; }
    v.slot = -1;
  }

  _meritOf(id) { const b = this.board.get(id); return b ? b.merit : 0; }

  /** Xếp chỗ theo CÔNG ĐỨC: nhiều nhất ngồi đầu (slot 0 = gần bàn thờ), kém hơn lùi dần ra sau.
   *  Gọi khi công đức đổi (tặng quà). Trả về true nếu có người đổi chỗ. */
  reseatByMerit() {
    const cap = this.capacity();
    const list = [...this.viewers.values()].sort((a, b) =>
      (this._meritOf(b.id) - this._meritOf(a.id)) || (a.joinedAt - b.joinedAt));
    let changed = false;
    this.slots.clear();
    list.forEach((v, i) => {
      const slot = i < cap ? i : -1;
      if (v.slot !== slot) changed = true;
      v.slot = slot;
      if (slot >= 0) this.slots.set(slot, v.id);
    });
    this.lastCap = cap;
    if (changed) this.send({ t: 'slots', cap, slots: list.map(v => [v.id, v.slot]) });
    return changed;
  }

  /** Grid changed size: keep everyone's relative order, pack them into the new grid's fill order. */
  relayout() {
    const cap = this.capacity();
    if (cap === this.lastCap) return;
    this.lastCap = cap;
    const list = [...this.viewers.values()].sort((a, b) => (a.slot < 0) - (b.slot < 0) || a.slot - b.slot);
    this.slots.clear();
    list.forEach((v, i) => { v.slot = i < cap ? i : -1; if (v.slot >= 0) this.slots.set(i, v.id); });
    this.send({ t: 'slots', cap, slots: list.map(v => [v.id, v.slot]) });
  }

  /** Move to the nearest free cushion in a direction (left / right / up = towards the altar / down). */
  moveSeat(v, dir) {
    const cap = this.capacity(), seats = seatOrder(cap), cur = seats[v.slot];
    if (!cur) return false;
    const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0, dk = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    for (let r = cur.r + dr, k = cur.k + dk; r >= 0 && r < cur.rows && k >= 0 && k < cur.cols; r += dr, k += dk) {
      const i = seatAt(cap, r, k);
      if (i >= 0 && i < cap && !this.slots.has(i)) {
        this.slots.delete(v.slot); v.slot = i; this.slots.set(i, v.id);
        this.send({ t: 'seat', id: v.id, slot: i });
        return true;
      }
    }
    return false;
  }

  /** Kinh hành (a walk around the hall) or going up to bow at the altar. At most 6 people walk at once. */
  startWalk(v, kind, force = false) {
    const t = this.now();
    for (const [id, w] of this.walking) if (w.until < t) this.walking.delete(id);
    if (this.walking.has(v.id) || this.vip.includes(v.id)) return false;
    if (this.walking.size >= MAX_WALKERS) return false;
    if (!force && !this.cooldown('walk:' + kind, v.id, kind === 'altar' ? 180_000 : 120_000)) return false;
    const used = new Set([...this.walking.values()].map(w => w.spot));
    const spot = kind === 'altar' ? ALTAR_SPOTS.findIndex((_, i) => !used.has(i)) : -1;
    this.walking.set(v.id, { kind, until: t + WALK_MS[kind], spot });
    this.send({ t: 'walk', id: v.id, kind, spot, ms: WALK_MS[kind] });
    return true;
  }

  /** Top donors (seated, at least vipMinCoins) sit on the golden cushions in front of the altar. */
  updateVip() {
    const ids = [...this.viewers.values()].filter(v => v.coins >= this.settings.vipMinCoins)
      .sort((a, b) => (this._meritOf(b.id) - this._meritOf(a.id)) || (b.coins - a.coins)).slice(0, 3).map(v => v.id);
    if (ids.join('|') === this.vip.join('|')) return;
    for (const id of ids) this.walking.delete(id);
    this.vip = ids;
    this.send({ t: 'vip', ids });
  }

  /* -------------------------------------------------------------- views */
  pub(v) { return { id: v.id, name: v.name, skin: v.skin, avatar: v.avatar || '', coins: v.coins, demo: !!v.demo, slot: v.slot }; }

  boards() {
    const session = [...this.board.entries()].map(([id, b]) => ({ id, ...b }))
      .sort((a, b) => b.merit - a.merit).slice(0, 6).map(({ id, name, merit, coins }) => ({ id, name, merit, coins }));
    const allTime = Object.entries(this.allTime).map(([id, b]) => ({ id, ...b }))
      .sort((a, b) => b.merit - a.merit).slice(0, 6).map(({ id, name, merit, coins }) => ({ id, name, merit, coins }));
    return { session, allTime };
  }

  snapshot() {
    return {
      t: 'state', settings: this.settings, viewers: [...this.viewers.values()].map(v => this.pub(v)),
      cap: this.capacity(), startedAt: this.startedAt, stats: this.stats, boards: this.boards(),
      next: this.nextMilestones(), vip: this.vip,
    };
  }

  controlSnapshot() {
    return { t: 'moderation', prayers: this.prayers.map(p => ({ id: p.id, name: p.name, wish: p.wish, at: p.at, demo: p.demo })) };
  }

  /* -------------------------------------------------------------- seats */
  seat(id, name, opts = {}) {
    let v = this.viewers.get(id);
    if (v) { v.lastAt = this.now(); if (opts.avatar) v.avatar = opts.avatar; return { v, isNew: false }; }
    // Option "phải tặng quà mới vào phòng": chặn người mới chưa tặng (trừ chính lượt tặng quà & nhân vật giả lập)
    if (this.settings.requireGiftToJoin && !opts.gift && !opts.demo && !this.gifted.has(String(id))) return { v: null, isNew: false };
    const max = this.settings.seatMode === 'auto' ? 100 : +this.settings.seatMode;
    if (this.viewers.size >= max) {
      // full: demo first, then the longest-quiet viewer who has not offered a gift
      const pool = [...this.viewers.values()].filter(x => x.coins === 0);
      const quiet = pool.sort((a, b) => (b.demo - a.demo) || (a.lastAt - b.lastAt))[0];
      if (!quiet) return { v: null, isNew: false };
      this.unseat(quiet.id);
    }
    v = {
      id, name: displayName(name || id), skin: opts.skin || DEFAULT_SKINS[this.viewers.size % DEFAULT_SKINS.length],
      avatar: opts.avatar || '', coins: 0, joinedAt: this.now(), lastAt: this.now(), demo: !!opts.demo,
      lastText: '', lastTextAt: 0, slot: -1,
    };
    this.viewers.set(id, v);
    this.takeSlot(v);
    this.send({ t: 'join', v: this.pub(v), cap: this.capacity() });
    return { v, isNew: true };
  }

  unseat(id, quiet = false) {
    const v = this.viewers.get(id); if (!v) return;
    if (this.slots.get(v.slot) === id) this.slots.delete(v.slot);
    this.viewers.delete(id); this.walking.delete(id);
    if (!quiet) this.send({ t: 'leave', id });
  }

  clearSeats(demoOnly = false) {
    for (const [id, v] of [...this.viewers]) if (!demoOnly || v.demo) this.unseat(id, true);
    if (!this.viewers.size && this.settings.seatMode === 'auto') { this.capHigh = 24; this.lastCap = 0; }
    if (!demoOnly) this.stopAllOutput();             // dọn sạch -> dừng đọc + tắt thẻ quẻ đang chờ
    this.updateVip();
    this.send(this.snapshot());
  }

  /** Dừng mọi thứ đang/ chờ phát ra: hàng đợi giọng đọc, thẻ quẻ, banner — và báo overlay tắt theo. */
  stopAllOutput() {
    this.fortuneQ = [];
    clearTimeout(this.fortuneTimer); this.fortuneTimer = null; this.fortuneBusyUntil = 0;
    // xoá combo quà đang mở -> không để banner "dâng quà" bật lên SAU khi đã dọn
    try { this.gifts?.open?.clear?.(); this.gifts?.done?.clear?.(); } catch (e) {}
    try { this.clearVoice(); } catch (e) {}          // xoá hàng đợi TTS trên server
    this.send({ t: 'hush' });                        // overlay: dừng đọc, ẩn thẻ quẻ, xoá banner
  }

  /* -------------------------------------------------------------- merit */
  addMerit(id, name, points, { coins = 0, demo = false } = {}) {
    if (points <= 0) return;
    const b = this.board.get(id) || { name, merit: 0, coins: 0, demo };
    b.name = name; b.merit += points; b.coins += coins; this.board.set(id, b);
    this.stats.merit += points;
    if (!demo) {
      const a = this.allTime[id] || { name, merit: 0, coins: 0 };
      a.name = name; a.merit += points; a.coins += coins; a.lastAt = this.now(); this.allTime[id] = a;
      this.onPersist();
    }
    this.boardDirty = true;
    this.checkMilestone('merit', this.stats.merit);
  }

  cooldown(kind, id, ms) {
    const key = `${kind}:${id}`, t = this.now(), until = this.cool.get(key) || 0;
    if (t < until) return false;
    this.cool.set(key, t + ms);
    if (this.cool.size > 5000) for (const [k, u] of this.cool) if (u < t) this.cool.delete(k);
    return true;
  }

  /* ------------------------------------------------- luật tương tác */
  // Kích một nghi lễ theo tên hành động của luật tương tác (dùng lại cùng cooldown với onChat).
  _ritual(action, id, v) {
    switch (action) {
      case 'mo': if (this.cooldown('mo', id, 15_000)) this.send({ t: 'mo', id, n: 3 }); break;
      case 'bell': if (this.cooldown('bell', id, 30_000) && this.cooldown('bell', '*', 6_000)) this.send({ t: 'bell', id }); break;
      case 'incense': if (this.cooldown('incense', id, 20_000)) this.send({ t: 'incense', id }); break;
      case 'bow': this.send({ t: 'bow', id }); break;
      case 'fortune': if (v) this.requestFortune(v, 'interaction'); break;
    }
  }
  // Lấy luật tương tác của 1 loại nếu nó ÁP DỤNG (qua được điều kiện "chỉ khi đã tặng quà").
  _ruleFor(kind, id) {
    const r = this.settings.interactionRules && this.settings.interactionRules[kind];
    if (!r) return null;
    if (r.requireGift && !this.gifted.has(String(id))) return null;
    return r;
  }
  // Áp dụng luật tương tác cho 1 loại (hiệu ứng + cộng công đức + đọc câu tuỳ chỉnh). Trả về true nếu có luật.
  _applyInteraction(kind, who, v, { skipMerit = false } = {}) {
    const r = this._ruleFor(kind, who.id);
    if (!r) return false;
    const id = String(who.id), name = displayName(who.name);
    if (r.action) this._ritual(r.action, id, v);
    if (!skipMerit && r.merit) this.addMerit(id, name, r.merit, { demo: who.demo });
    if (r.read && r.text && this.cooldown('say:' + kind, '*', 5_000))
      this.say(r.text.replace(/\{name\}|\{tên\}/gi, spokenName(name)), { prio: 1 });
    return true;
  }

  /* ------------------------------------------------------------- events */
  /** A comment. `who` = { id, name, avatar, demo } */
  onChat(who, rawText) {
    const id = String(who.id); if (!id) return;
    const text = clean(rawText, 150);
    const bad = this.filter.isBad(text) || this.filter.isBad(who.name);
    const cmd = bad ? { intent: 'chat' } : parseComment(text);
    const { v, isNew } = this.seat(id, who.name, { avatar: who.avatar, demo: who.demo, skin: cmd.intent === 'skin' ? cmd.skin : undefined });
    if (!v) return;
    if (!isNew && cmd.intent === 'skin' && cmd.skin !== v.skin) { v.skin = cmd.skin; this.send({ t: 'skin', id, skin: v.skin }); }
    if (bad) return;                                // seated, but nothing shown or said
    v.lastText = text; v.lastTextAt = this.now();
    if (!['prayer', 'move'].includes(cmd.intent)) this.send({ t: 'chat', id, name: v.name, text });
    const ritual = ['bell', 'mo', 'incense', 'bow', 'walk', 'altar'].includes(cmd.intent);
    if (this.cooldown('chat', id, 10_000)) this.addMerit(id, v.name, ritual ? MERIT.ritual : MERIT.chat, { demo: v.demo });
    const free = this.settings.allowMove && !this.vip.includes(id) && !((this.walking.get(id)?.until || 0) > this.now());
    // Chống lách luật quà: khi bật "nghi lễ chỉ khi đã tặng quà", các nghi lễ gõ chat miễn phí
    // (gõ mõ/thỉnh chuông/dâng hương/lạy/xin xăm) bị chặn với người chưa tặng quà — đúng các hiệu ứng có thể gán cho quà.
    const ritualGated = this.settings.ritualsNeedGift && !v.demo && !this.gifted.has(id);
    if (ritualGated && ['bell', 'mo', 'incense', 'bow', 'fortune'].includes(cmd.intent)) return; // chặn im lặng, không hiện lời nhắc
    switch (cmd.intent) {
      case 'move': if (free && (isNew || this.cooldown('move', id, 3_000))) this.moveSeat(v, cmd.dir); break;
      case 'walk': if (this.settings.allowMove) this.startWalk(v, 'kinh'); break;
      case 'altar': if (this.settings.allowMove) this.startWalk(v, 'altar'); break;
      case 'bell': if (this.cooldown('bell', id, 30_000) && this.cooldown('bell', '*', 6_000)) this.send({ t: 'bell', id }); break;
      case 'mo': if (this.cooldown('mo', id, 15_000)) this.send({ t: 'mo', id, n: 3 }); break;
      case 'incense': if (this.cooldown('incense', id, 20_000)) this.send({ t: 'incense', id }); break;
      case 'bow': this.send({ t: 'bow', id }); break;
      case 'fortune': this.requestFortune(v, 'comment'); break;
      case 'prayer': this.submitPrayer(v, cmd.wish); break;
    }
    // Luật tương tác: bình luận chứa từ khoá tuỳ chỉnh -> hành động riêng
    const cr = this._ruleFor('comment', id);
    if (cr && cr.keyword && text.toLowerCase().includes(cr.keyword.toLowerCase()) && this.cooldown('cmtrule:' + id, 8_000))
      this._applyInteraction('comment', who, v);
  }

  onLike(who, n = 1) {
    const id = String(who.id); n = clamp(n, 1, 50);
    this.stats.likes += n;
    const cur = this.likeBuf.get(id) || { n: 0, name: displayName(who.name), demo: !!who.demo };
    cur.n += n; this.likeBuf.set(id, cur);
    this.checkMilestone('likes', this.stats.likes);
    // Luật tương tác cho Thả tim: cộng dồn đủ ngưỡng (minCount) mới kích 1 lần
    const r = this._ruleFor('like', id);
    if (r && (r.action || r.read || r.merit)) {
      const min = r.minCount || 15;
      const acc = (this.likeAcc.get(id) || 0) + n;
      if (acc >= min) {
        this.likeAcc.set(id, acc % min);
        if (this.cooldown('likefire:' + id, 8_000)) this._applyInteraction('like', who, this.viewers.get(id));
      } else this.likeAcc.set(id, acc);
    }
  }

  /** Called every second: one message for all likes in that window instead of one per tap. */
  flushLikes() {
    if (!this.likeBuf.size) return;
    const items = [];
    for (const [id, l] of this.likeBuf) {
      items.push({ id, n: l.n });
      // merit for likes: at most 15 per user per minute, so autoclickers cannot top the board
      const used = this.cool.get('likecap:' + id + ':' + Math.floor(this.now() / 60_000)) || 0;
      const pts = Math.min(l.n, Math.max(0, 15 - used));
      if (pts) { this.cool.set('likecap:' + id + ':' + Math.floor(this.now() / 60_000), used + pts); this.addMerit(id, l.name, pts * MERIT.like, { demo: l.demo }); }
    }
    this.likeBuf.clear();
    this.send({ t: 'like', items: items.slice(0, 40), total: this.stats.likes });
  }

  onFollow(who) {
    const id = String(who.id), name = displayName(who.name);
    if (this.thanked.has('f:' + id)) return;
    this.thanked.add('f:' + id);
    const r = this._ruleFor('follow', id);
    this.addMerit(id, name, (r && r.merit) ? r.merit : MERIT.follow, { demo: who.demo });
    this.send({ t: 'follow', id, name });
    if (r) this._applyInteraction('follow', who, this.viewers.get(id), { skipMerit: true });
    else if (this.settings.thankFollow && this.cooldown('thank', '*', 8_000)) this.say(`Cảm ơn ${spokenName(name)} đã theo dõi đạo tràng.`, { prio: 1 });
  }

  onShare(who) {
    const id = String(who.id), name = displayName(who.name);
    if (!this.cooldown('share', id, 60_000)) return;
    const r = this._ruleFor('share', id);
    this.addMerit(id, name, (r && r.merit) ? r.merit : MERIT.share, { demo: who.demo });
    this.send({ t: 'share', id, name });
    if (r) this._applyInteraction('share', who, this.viewers.get(id), { skipMerit: true });
  }

  onJoin(who) {
    if (this.settings.joinOnEnter && !this.filter.isBad(who.name)) this.seat(String(who.id), who.name, { avatar: who.avatar, demo: who.demo });
  }

  onViewerCount(n) {
    this.stats.viewers = clamp(n, 0, 10_000_000); this.stats.viewersAt = this.now();
    this.checkMilestone('viewers', this.stats.viewers);
  }

  /**
   * A gift message. g = { userId, name, avatar, giftId, giftName, groupId, streakable, repeatCount, repeatEnd, diamonds, demo }
   */
  onGift(g) {
    const id = String(g.userId);
    const name = displayName(g.name);
    const r = this.gifts.push({ userId: id, giftId: g.giftId || g.giftName, groupId: g.groupId, streakable: !!g.streakable,
      repeatCount: g.repeatCount, repeatEnd: !!g.repeatEnd, diamonds: g.diamonds, info: { ...g, name } });
    if (r.coinsAdded > 0) {
      this.gifted.add(id);                       // đã tặng quà -> được phép vào phòng
      const { v } = this.seat(id, name, { avatar: g.avatar, demo: g.demo, gift: true });
      if (v) v.coins += r.coinsAdded;
      this.addMerit(id, name, r.coinsAdded * MERIT.perCoin, { coins: r.coinsAdded, demo: !!g.demo });
      this.reseatByMerit();                       // công đức tăng -> xếp lại chỗ, người nhiều công đức lên đầu
      this.updateVip();
      this.stats.gifts += r.coinsAdded;
      this.send({ t: 'giftTick', id, coins: r.coinsAdded, total: v?.coins ?? 0 });
    }
    if (r.finished) this.giftFinished(r.finished);
  }

  sweep() { for (const f of this.gifts.sweep()) this.giftFinished(f); }

  giftFinished({ count, coins, info }) {
    const id = String(info.userId), v = this.viewers.get(id);
    const name = v?.name || info.name;
    const giftName = clean(info.giftName || 'lễ vật', 30);
    const nth = (this.giftCount.get(id) || 0) + 1; this.giftCount.set(id, nth);
    let wish = '';
    if (this.settings.readGiftWish && v && v.lastText && this.now() - v.lastTextAt < 120_000 && v.lastText.length >= 8 && !this.filter.isBad(v.lastText))
      wish = v.lastText.slice(0, 90);
    const prayer = wish || WISHES[Math.floor(this.random() * WISHES.length)];
    const t = tier(coins);
    this.send({ t: 'gift', id, name, giftName, count, coins, total: v?.coins ?? coins, tier: t, prayer, nth });
    if (this.settings.readGifts) {
      const times = nth > 1 ? `, lần thứ ${nth}` : '';
      this.say(`Nam mô A Di Đà Phật. Phật tử ${spokenName(name)} thành tâm dâng ${giftName}${count > 1 ? ' ' + count + ' lần' : ''}${times}. ${prayer}.`, { prio: 2 });
    }
    if (this.settings.fortuneMode !== 'off' && coins >= this.settings.fortuneMinCoins && v) this.requestFortune(v, 'gift');
    // a bigger offering: the giver walks up and bows at the altar (no cooldown), unless already on a golden cushion
    if (v && this.settings.altarOnGiftCoins && coins >= this.settings.altarOnGiftCoins) this.startWalk(v, 'altar', true);
  }

  /* ------------------------------------------------------------ fortune */
  requestFortune(v, via) {
    const mode = this.settings.fortuneMode;
    if (mode === 'off') return;
    // Chế độ "chỉ người tặng quà": gõ chat/luật tương tác của người chưa tặng bị chặn (không lách luật quà).
    if (via !== 'gift' && mode === 'gift' && !this.gifted.has(String(v.id))) {
      if (this.cooldown('fortuneHint', '*', 60_000)) this.send({ t: 'notice', text: `Rút thẻ an lạc: tặng quà từ ${this.settings.fortuneMinCoins} xu` });
      return;
    }
    // Cooldown mỗi người áp dụng cho MỌI đường rút — kể cả tặng quà — để không rút dồn dập gây loạn.
    if (this.settings.fortuneCooldownMin > 0 && !this.cooldown('fortune', v.id, this.settings.fortuneCooldownMin * 60_000)) return;
    if (this.fortuneQ.some(q => q.id === v.id)) return;
    if (this.fortuneQ.length >= 8) {
      const i = this.fortuneQ.findIndex(q => q.via === 'comment');     // gifts are never dropped for a free draw
      if (via === 'comment' || i < 0) return;
      this.fortuneQ.splice(i, 1);
    }
    const item = { id: v.id, name: v.name, via };
    if (via === 'gift') { const k = this.fortuneQ.findIndex(q => q.via === 'comment'); k < 0 ? this.fortuneQ.push(item) : this.fortuneQ.splice(k, 0, item); }
    else this.fortuneQ.push(item);
    this.send({ t: 'fortuneQueue', n: this.fortuneQ.length });
    this.pumpFortune();
  }

  pumpFortune() {
    if (this.now() < this.fortuneBusyUntil || !this.fortuneQ.length) return;
    const q = this.fortuneQ.shift();
    const card = FORTUNES[Math.floor(this.random() * FORTUNES.length)];
    const spoken = `${spokenName(q.name)} rút được thẻ số ${card.n}, ${card.grade}, ${card.title}. ${card.poem.join('. ')}. ${card.meaning}`;
    // Thoi gian hien thi the an lac: tu do dai loi doc, nhung bi chan boi "Thẻ an lạc hiển thị tối đa" (fortuneHoldSec)
    const holdMs = (this.settings.fortuneHoldSec || 24) * 1000;
    const duration = Math.max(Math.min(10_000, holdMs), Math.min(holdMs, Math.round(spoken.length / 13 * 1000) + 7000));
    this.fortuneBusyUntil = this.now() + duration;
    // "Đọc thẻ an lạc" tắt -> vẫn hiện thẻ nhưng không đọc (key null -> overlay hiện ngay)
    const key = this.settings.readFortune
      ? this.say(spoken, { prio: 3, tag: 'fortune', voice: this.settings.fortuneVoice || undefined }) // prio 3: quẻ đọc trước, đồng bộ với lúc hiện thẻ
      : null;
    this.send({ t: 'fortune', id: q.id, name: q.name, card, duration, key, queue: this.fortuneQ.length });
    clearTimeout(this.fortuneTimer);
    this.fortuneTimer = setTimeout(() => this.pumpFortune(), duration + 400);
    this.fortuneTimer.unref?.();
  }

  /* ------------------------------------------------------------ prayers */
  submitPrayer(v, wish) {
    wish = clean(wish, 120);
    if (!this.cooldown('prayer', v.id, 45_000)) return;
    const p = { id: ++this.prayerSeq, uid: v.id, name: v.name, wish, at: this.now(), demo: v.demo };
    if (this.settings.prayerAuto) { this.showPrayer(p); return; }
    this.prayers.push(p); if (this.prayers.length > 60) this.prayers.shift();
    this.send(this.controlSnapshot(), 'control');
  }

  moderate(prayerId, approve) {
    const i = this.prayers.findIndex(p => p.id === +prayerId); if (i < 0) return;
    const [p] = this.prayers.splice(i, 1);
    if (approve) this.showPrayer(p);
    this.send(this.controlSnapshot(), 'control');
  }

  showPrayer(p) {
    this.send({ t: 'prayer', id: p.uid, name: p.name, wish: p.wish });
    if (this.settings.readPrayers) this.say(`Phật tử ${spokenName(p.name)} nguyện: ${p.wish}`, { prio: 1 });
  }

  /* --------------------------------------------------------- milestones */
  checkMilestone(kind, value) {
    const steps = MILESTONES[kind];
    let hit = 0;
    for (const s of steps) if (value >= s) hit = s;
    // beyond the table: every last-step interval
    const last = steps[steps.length - 1];
    if (value >= last) hit = Math.floor(value / last) * last;
    if (hit <= this.fired[kind]) return;
    this.fired[kind] = hit;                        // a burst that crosses several steps celebrates only the highest
    const text = kind === 'merit' ? `Đạo tràng đã tích được ${hit.toLocaleString('vi-VN')} công đức`
      : kind === 'likes' ? `Đại chúng đã gửi ${hit.toLocaleString('vi-VN')} tim thành kính`
      : `${hit.toLocaleString('vi-VN')} Phật tử đang cùng ngồi thiền`;
    this.lastCelebrateAt = this.now();
    this.send({ t: 'milestone', kind, value: hit, text, next: this.nextMilestones() });
    this.say(`Nam mô A Di Đà Phật. ${text}. Nguyện hồi hướng công đức này cho khắp pháp giới chúng sinh.`, { prio: 2 });
  }

  nextMilestones() {
    const nx = kind => {
      const steps = MILESTONES[kind], last = steps[steps.length - 1];
      return steps.find(s => s > this.fired[kind]) || (Math.floor(this.fired[kind] / last) + 1) * last;
    };
    return { merit: nx('merit'), likes: nx('likes') };
  }

  /* --------------------------------------------------------- ambience */
  chant(i) {
    const text = CHANTS[(i ?? Math.floor(this.random() * CHANTS.length)) % CHANTS.length];
    this.send({ t: 'chant', text }); if (this.settings.readChant) this.say(text, { prio: 1, tag: 'chant' });
  }

  maybeSharePrompt() {
    const every = this.settings.sharePromptMin * 60_000;
    if (!every || this.now() - this.lastShareAt < every || this.now() - this.lastCelebrateAt < 20_000) return;
    this.lastShareAt = this.now();
    const text = SHARE_LINES[Math.floor(this.random() * SHARE_LINES.length)];
    this.send({ t: 'notice', text: 'Chia sẻ phiên live để cùng gieo duyên lành 🙏' });
    this.say(text, { prio: 1 });
  }

  /** Called every second by the server. */
  tick() {
    this.flushLikes();
    this.sweep();
    this.pumpFortune();
    this.maybeSharePrompt();
    if (this.boardDirty) { this.boardDirty = false; this.send({ t: 'board', boards: this.boards(), stats: this.stats, next: this.nextMilestones() }); }
  }
}

export { SKIN_NAMES, FORTUNES };
