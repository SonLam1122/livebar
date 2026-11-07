// =========================================================================
// TIKTOK LIVE BRIDGE
// -------------------------------------------------------------------------
// Kết nối tới một phiên TikTok LIVE công khai (qua thư viện cộng đồng
// tiktok-live-connector) và chuyển mỗi sự kiện thật (quà, bình luận, tim,
// theo dõi, chia sẻ) thành payload "giả lập" đúng định dạng mà
// handleSimulation() của livebar đã hiểu, rồi phát qua socket.io overlay.
//
// Nhờ đi qua đúng đường handleSimulation + emit match:state/match:fx như nút
// "Thử tương tác", mọi game (Live Bar, Bóng đá, Quân đoàn, Cưa xích, Bể
// bình chọn, Hồ cá, Máy in...) chạy y hệt nhưng bằng DỮ LIỆU THẬT.
// Không dùng mật khẩu/cookie — chỉ đọc phòng live công khai theo @tênkênh.
// =========================================================================

const { getMatchState } = require('./matchState');
const { getScreenById } = require('./screens');
const { handleSimulation } = require('./simulator');

// --- Chuẩn hoá tên kênh: chấp nhận @ten, link tiktok.com/@ten, ... ---
function normalizeUniqueId(s) {
  return String(s || '')
    .trim()
    .replace(/^.*tiktok\.com\/@?/i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
    .slice(0, 40);
}

// --- Rút thông tin người dùng từ payload của thư viện ---
const avatarOf = (u) =>
  u?.avatarThumb?.urlList?.[0] ||
  u?.avatarThumb?.url?.[0] ||
  u?.profilePicture?.urls?.[0] ||
  u?.profilePictureUrl ||
  '';

function whoUser(u) {
  const username = String(u?.uniqueId || u?.displayId || u?.id || u?.userId || '').trim();
  const nickname = (u?.nickname || u?.displayId || u?.uniqueId || username || 'Khán giả').trim();
  const avatar = avatarOf(u);
  const avatarUrl = /^https:\/\//.test(avatar) ? avatar : `/api/avatars/${username || 'guest'}.svg`;
  return { username: username || 'guest', nickname, name: nickname, avatar: avatarUrl, avatarUrl };
}

// --- Chia phe ổn định theo username (cho các game 2 đội) ---
// Cùng một người luôn vào cùng một phe trong suốt buổi live.
function teamOf(username) {
  let h = 0;
  const s = String(username || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 2; // 0 hoặc 1
}

// Một vài game dùng action riêng; map theo "độ lớn" của sự kiện.
function giftAction(gameType, diamonds) {
  switch (gameType) {
    case 'army_clash':
      return diamonds >= 50 ? 'summon' : undefined;
    case 'chainsaw_clash':
      return diamonds >= 30 ? 'grow' : 'spawn';
    case 'fish_tank':
      return 'feed';
    case 'live_bar':
    default:
      return diamonds >= 50 ? 'spotlight' : undefined;
  }
}

class TikTokBridge {
  constructor() {
    this.overlayIo = null;
    this.conn = null;
    this.gen = 0;         // chặn sự kiện của kết nối cũ rò sang kết nối mới
    this.retry = 0;
    this.retryTimer = null;
    this.wanted = '';
    this.screenId = 'cmta2zkpq00aokx08uyc7iys2';
    this.logLines = [];
    this.stats = { gifts: 0, chats: 0, likes: 0, follows: 0, shares: 0 };
    this.state = { status: 'idle', uniqueId: '', error: '', roomId: '', viewers: 0 };
  }

  setOverlayIo(io) {
    this.overlayIo = io;
  }

  log(line) {
    const stamped = `[${new Date().toLocaleTimeString('vi-VN')}] ${line}`;
    this.logLines.push(stamped);
    if (this.logLines.length > 200) this.logLines.shift();
    console.log('🎥 [TikTok]', line);
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
  }

  getStatus() {
    return {
      ...this.state,
      screenId: this.screenId,
      stats: this.stats,
      logs: this.logLines.slice(-60),
    };
  }

  // --- Đẩy một payload qua đúng đường như nút "Thử tương tác" ---
  feed(payload) {
    const screenId = payload.screenId || this.screenId;
    const targetScreen = getScreenById(screenId);
    const mState = getMatchState(screenId);
    try {
      const result = handleSimulation(mState, payload, targetScreen, this.overlayIo) || {};
      const fxList = result.fxList;
      if (this.overlayIo) {
        this.overlayIo.emit('match:state', mState);
        if (fxList && fxList.length > 0) this.overlayIo.emit('match:fx', fxList);
      }
    } catch (e) {
      this.log('Lỗi xử lý sự kiện: ' + e.message);
    }
  }

  // ---------------- Các bộ chuyển đổi sự kiện ----------------
  onChat(user, text) {
    this.stats.chats++;
    const gameType = getScreenById(this.screenId)?.gameType;
    this.feed({
      screenId: this.screenId,
      user,
      comment: String(text || ''),
      type: 'comment',
      boostTeam: teamOf(user.username),
      points: 1,
    });
  }

  onGift(g) {
    this.stats.gifts++;
    const user = { username: g.username, nickname: g.nickname, name: g.nickname, avatar: g.avatar, avatarUrl: g.avatar };
    const totalDiamonds = (g.diamonds || 1) * (g.repeatCount || 1);
    const gameType = getScreenById(this.screenId)?.gameType;
    this.feed({
      screenId: this.screenId,
      user,
      gift: g.giftName || 'Quà',
      giftName: g.giftName || 'Quà',
      diamonds: totalDiamonds,
      count: g.repeatCount || 1,
      points: totalDiamonds,
      boostTeam: teamOf(g.username),
      action: giftAction(gameType, totalDiamonds),
      type: 'gift',
    });
  }

  onLike(user, count) {
    this.stats.likes++;
    this.feed({
      screenId: this.screenId,
      user,
      type: 'like',
      likes: count || 1,
      count: count || 1,
      boostTeam: teamOf(user.username),
      points: 1,
    });
  }

  onFollow(user) {
    this.stats.follows++;
    this.feed({ screenId: this.screenId, user, type: 'follow', boostTeam: teamOf(user.username), points: 5 });
  }

  onShare(user) {
    this.stats.shares++;
    this.feed({ screenId: this.screenId, user, type: 'share', boostTeam: teamOf(user.username), points: 5 });
  }

  onViewerCount(n) {
    this.setState({ viewers: n || 0 });
  }

  // ---------------- Vòng đời kết nối ----------------
  async connect(uniqueId, screenId) {
    uniqueId = normalizeUniqueId(uniqueId);
    if (!/^[\w.]{2,40}$/.test(uniqueId)) {
      this.setState({ status: 'error', error: 'Tên kênh không hợp lệ (ví dụ: @tenkenh)' });
      return this.getStatus();
    }
    if (screenId && getScreenById(screenId)) this.screenId = screenId;
    await this.disconnect(true);
    this.wanted = uniqueId;
    this.retry = 0;
    this.stats = { gifts: 0, chats: 0, likes: 0, follows: 0, shares: 0 };
    this.open();
    return this.getStatus();
  }

  async open() {
    const gen = ++this.gen;
    const uniqueId = this.wanted;
    this.setState({ status: 'connecting', uniqueId, error: '', roomId: '' });
    this.log(`Đang kết nối @${uniqueId} → màn hình "${this.screenId}"...`);
    try {
      const { TikTokLiveConnection, WebcastEvent, ControlEvent } = require('tiktok-live-connector');
      const signApiKey = process.env.SIGN_API_KEY;
      const conn = new TikTokLiveConnection(uniqueId, {
        processInitialData: false,
        enableExtendedGiftInfo: false,
        fetchRoomInfoOnConnect: true,
        ...(signApiKey ? { signApiKey } : {}),
      });

      // Chỉ xử lý sự kiện của thế hệ kết nối hiện tại
      const live = (fn) => (...a) => {
        if (gen !== this.gen) return;
        try { fn(...a); } catch (e) { this.log('Lỗi sự kiện: ' + e.message); }
      };

      conn.on(WebcastEvent.CHAT, live((d) => {
        const u = whoUser(d.user);
        if (u.username) this.onChat(u, d.comment ?? d.content ?? '');
      }));
      conn.on(WebcastEvent.LIKE, live((d) => {
        const u = whoUser(d.user);
        if (u.username) this.onLike(u, d.likeCount ?? d.count ?? 1);
      }));
      conn.on(WebcastEvent.FOLLOW, live((d) => {
        const u = whoUser(d.user);
        if (u.username) this.onFollow(u);
      }));
      conn.on(WebcastEvent.SHARE, live((d) => {
        const u = whoUser(d.user);
        if (u.username) this.onShare(u);
      }));
      conn.on(WebcastEvent.ROOM_USER, live((d) => this.onViewerCount(+(d.viewerCount ?? d.total ?? 0))));
      conn.on(WebcastEvent.GIFT, live((d) => {
        const u = whoUser(d.user);
        if (!u.username) return;
        const g = d.gift || {};
        const gd = d.giftDetails || {};
        const x = d.extendedGiftInfo || {};
        const type = g.type ?? gd.giftType ?? x.type;
        // Với quà kiểu "streak" (type===1) chỉ tính khi chuỗi kết thúc,
        // tránh cộng trùng từng nhịp.
        if (type === 1 && d.repeatEnd === false) return;
        this.onGift({
          username: u.username,
          nickname: u.nickname,
          avatar: u.avatarUrl,
          giftName: g.name || gd.giftName || x.name || 'Quà',
          repeatCount: d.repeatCount || 1,
          diamonds: g.diamondCount ?? gd.diamondCount ?? x.diamond_count ?? 1,
        });
      }));

      conn.on(WebcastEvent.STREAM_END, live(() => {
        this.log('Buổi live đã kết thúc.');
        this.wanted = '';
        this.setState({ status: 'ended' });
      }));
      conn.on(ControlEvent.DISCONNECTED, live(() => {
        if (this.conn !== conn) return;
        this.conn = null;
        if (this.wanted) this.scheduleRetry('mất kết nối'); else this.setState({ status: 'idle' });
      }));
      conn.on(ControlEvent.ERROR, live((e) => {
        if (this.conn === conn) this.log('TikTok báo lỗi: ' + (e?.info || e?.exception?.message || e?.message || e));
      }));

      const st = await conn.connect();
      if (gen !== this.gen) { try { await conn.disconnect(); } catch (_) {} return; }
      this.conn = conn;
      this.retry = 0;
      this.setState({ status: 'connected', error: '', roomId: String(st?.roomId || '') });
      this.log(`✅ Đã kết nối live @${uniqueId}. Quà/bình luận thật giờ sẽ chảy vào overlay.`);
    } catch (e) {
      if (gen !== this.gen) return;
      const msg = friendly(String(e?.message || e), uniqueId);
      this.log(`❌ @${uniqueId}: ${msg}`);
      if (/offline|chưa phát|không tồn tại/i.test(msg) && this.retry >= 2) {
        this.setState({ status: 'error', error: msg });
        this.wanted = '';
        return;
      }
      this.scheduleRetry(msg);
    }
  }

  scheduleRetry(why) {
    clearTimeout(this.retryTimer);
    if (this.retry >= 8) {
      this.setState({ status: 'error', error: `Không kết nối lại được (${why})` });
      this.wanted = '';
      return;
    }
    const wait = Math.min(60, Math.pow(2, this.retry) * 2);
    this.retry++;
    this.setState({ status: 'retrying', error: `${why} — thử lại sau ${wait}s (lần ${this.retry}/8)` });
    this.log(`↻ ${why} — thử lại sau ${wait}s (lần ${this.retry}/8)`);
    this.retryTimer = setTimeout(() => { if (this.wanted) this.open(); }, wait * 1000);
  }

  async disconnect(silent) {
    clearTimeout(this.retryTimer);
    this.wanted = '';
    this.gen++;
    const c = this.conn;
    this.conn = null;
    if (c) { try { await c.disconnect(); } catch (_) {} }
    if (!silent) {
      this.setState({ status: 'idle', uniqueId: '', error: '', roomId: '', viewers: 0 });
      this.log('Đã ngắt kết nối TikTok.');
    }
    return this.getStatus();
  }
}

function friendly(m, id) {
  if (/isn't online|not online|offline|UserOfflineError|LIVE has ended/i.test(m))
    return `Kênh @${id} chưa phát trực tiếp (offline). Bật LIVE trên TikTok trước rồi kết nối lại.`;
  if (/rate ?limit|429/i.test(m))
    return 'Máy chủ ký (Euler Stream) đang giới hạn lượt — đợi vài phút hoặc đặt biến môi trường SIGN_API_KEY.';
  if (/premium|business|euler/i.test(m))
    return 'Máy chủ ký Euler Stream từ chối yêu cầu. Thử lại sau hoặc đặt SIGN_API_KEY.';
  if (/Room ID/i.test(m))
    return 'Chưa lấy được mã phòng live (TikTok trả lời chậm), đang thử lại.';
  if (/not found|does not exist|user_not_found/i.test(m))
    return `Kênh @${id} không tồn tại.`;
  return m.slice(0, 200);
}

// Singleton
const bridge = new TikTokBridge();

module.exports = { bridge, normalizeUniqueId };
