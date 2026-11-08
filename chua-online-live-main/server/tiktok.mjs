// Reads a public TikTok LIVE room by @username with the community library tiktok-live-connector
// (not an official TikTok API). No password, cookie or session is used.
// Adds what the library leaves to us: auto-reconnect with backoff, stream-end handling, and a generation
// counter so late events from an old connection never leak into a new one.

export function normalizeUniqueId(s) {
  return String(s || '').trim().replace(/^.*tiktok\.com\/@?/i, '').replace(/^@/, '').replace(/[/?#].*$/, '').slice(0, 40);
}

const av = u => u?.avatarThumb?.urlList?.[0] || u?.avatarThumb?.url?.[0] || u?.profilePicture?.urls?.[0] || u?.profilePictureUrl || '';
const who = u => ({
  id: String(u?.displayId || u?.uniqueId || u?.id || u?.userId || ''),
  name: u?.nickname || u?.displayId || u?.uniqueId || '',
  avatar: /^https:\/\//.test(av(u)) ? av(u) : '',
});

export class TikTokLink {
  /**
   * @param {{ temple:any, log:(s:string)=>void, onState:(st:object)=>void, signApiKey?:string }} o
   */
  constructor(o) {
    Object.assign(this, o);
    this.conn = null; this.gen = 0; this.retry = 0; this.retryTimer = null;
    this.state = { status: 'idle', uniqueId: '', error: '', roomId: '' };
    // [DEBUG ĐO EVENT THÔ] đếm mọi sự kiện nhận trực tiếp từ TikTok (trước khi engine throttle).
    // So số này với hiệu ứng hiển thị để biết đang mất ở đường truyền hay bị throttle.
    // Bật/tắt bằng biến môi trường: DEBUG_RAW=0 để tắt hẳn.
    this.raw = { chat: 0, gift: 0, like: 0, follow: 0, share: 0, member: 0 };
    if (process.env.DEBUG_RAW !== '0') {
      this._rawTimer = setInterval(() => {
        const r = this.raw;
        if (r.chat || r.gift || r.like || r.follow || r.share || r.member) {
          this.log(`📊 [THÔ 15s] chat=${r.chat} gift=${r.gift} like=${r.like} follow=${r.follow} share=${r.share} join=${r.member}`);
          this.raw = { chat: 0, gift: 0, like: 0, follow: 0, share: 0, member: 0 };
        }
      }, 15000);
      if (this._rawTimer.unref) this._rawTimer.unref();
    }
  }

  set(st) { this.state = { ...this.state, ...st }; this.onState(this.state); }

  async connect(uniqueId) {
    uniqueId = normalizeUniqueId(uniqueId);
    if (!/^[\w.]{2,40}$/.test(uniqueId)) { this.set({ status: 'error', error: 'Tên kênh không hợp lệ' }); return; }
    await this.disconnect(true);
    this.wanted = uniqueId; this.retry = 0;
    this.open();
  }

  async open() {
    const gen = ++this.gen, uniqueId = this.wanted;
    this.set({ status: 'connecting', uniqueId, error: '', roomId: '' });
    try {
      const lib = await import('tiktok-live-connector');
      const { TikTokLiveConnection, WebcastEvent, ControlEvent } = lib;
      const conn = new TikTokLiveConnection(uniqueId, {
        processInitialData: false,              // do not replay old comments / gifts when joining
        enableExtendedGiftInfo: false,          // gift name + value already come with each gift message
        fetchRoomInfoOnConnect: true,
        ...(this.signApiKey ? { signApiKey: this.signApiKey } : {}),
      });
      const T = this.temple;
      const live = fn => (...a) => { if (gen === this.gen) { try { fn(...a); } catch (e) { this.log('Lỗi xử lý sự kiện: ' + e.message); } } };
      conn.on(WebcastEvent.CHAT, live(d => { this.raw.chat++; const u = who(d.user); if (u.id) T.onChat(u, d.content ?? d.comment ?? ''); }));
      conn.on(WebcastEvent.LIKE, live(d => { this.raw.like += (d.count ?? d.likeCount ?? 1); const u = who(d.user); if (u.id) T.onLike(u, d.count ?? d.likeCount ?? 1); }));
      conn.on(WebcastEvent.FOLLOW, live(d => { this.raw.follow++; const u = who(d.user); if (u.id) T.onFollow(u); }));
      conn.on(WebcastEvent.SHARE, live(d => { this.raw.share++; const u = who(d.user); if (u.id) T.onShare(u); }));
      conn.on(WebcastEvent.MEMBER, live(d => { this.raw.member++; const u = who(d.user); if (u.id) T.onJoin(u); }));
      conn.on(WebcastEvent.ROOM_USER, live(d => T.onViewerCount(+(d.total ?? d.viewerCount ?? 0))));
      conn.on(WebcastEvent.GIFT, live(d => {
        this.raw.gift++;
        const u = who(d.user); if (!u.id) return;
        const g = d.gift || {}, x = d.extendedGiftInfo || {}, gd = d.giftDetails || {};
        const type = g.type ?? gd.giftType ?? x.type;
        if (process.env.DEBUG_RAW !== '0')
          this.log(`🎁 [THÔ quà] ${u.name}: ${g.name || gd.giftName || x.name || '?'} x${d.repeatCount || 1} (${g.diamondCount ?? gd.diamondCount ?? x.diamond_count ?? 1} xu) streak=${type === 1 ? 'Y' : 'N'} end=${d.repeatEnd ? 'Y' : 'N'}`);
        T.onGift({
          userId: u.id, name: u.name, avatar: u.avatar,
          giftId: String(d.giftId || g.id || gd.id || ''), giftName: g.name || gd.giftName || x.name || 'lễ vật',
          groupId: String(d.groupId || ''), streakable: type === 1,
          repeatCount: d.repeatCount || 1, repeatEnd: !!d.repeatEnd,
          diamonds: g.diamondCount ?? gd.diamondCount ?? x.diamond_count ?? 1,
        });
      }));
      conn.on(WebcastEvent.STREAM_END, live(() => { this.log('Buổi live đã kết thúc'); this.wanted = ''; this.set({ status: 'ended' }); }));
      conn.on(ControlEvent.DISCONNECTED, live(() => {
        if (this.conn !== conn) return;
        this.conn = null;
        if (this.wanted) this.scheduleRetry('mất kết nối'); else this.set({ status: 'idle' });
      }));
      // while connecting, the failure is already logged once by the catch below
      conn.on(ControlEvent.ERROR, live(e => { if (this.conn === conn) this.log('TikTok báo lỗi: ' + (e?.info || e?.exception?.message || e?.message || e)); }));
      const st = await conn.connect();
      if (gen !== this.gen) { try { await conn.disconnect(); } catch {} return; }
      this.conn = conn; this.retry = 0;
      this.set({ status: 'connected', error: '', roomId: String(st?.roomId || '') });
      this.log(`✅ Đã kết nối live @${uniqueId}`);
    } catch (e) {
      if (gen !== this.gen) return;
      const msg = friendly(String(e?.message || e), uniqueId);
      this.log(`❌ @${uniqueId}: ${msg}`);
      if (/offline|chưa phát|không tồn tại/i.test(msg) && this.retry >= 2) { this.set({ status: 'error', error: msg }); this.wanted = ''; return; }
      this.scheduleRetry(msg);
    }
  }

  scheduleRetry(why) {
    clearTimeout(this.retryTimer);
    if (this.retry >= 8) { this.set({ status: 'error', error: `Không kết nối lại được (${why})` }); this.wanted = ''; return; }
    const wait = Math.min(60, 2 ** this.retry * 2);
    this.retry++;
    this.set({ status: 'retrying', error: `${why} — thử lại sau ${wait}s (lần ${this.retry}/8)` });
    this.retryTimer = setTimeout(() => { if (this.wanted) this.open(); }, wait * 1000);
  }

  async disconnect(silent) {
    clearTimeout(this.retryTimer); this.wanted = ''; this.gen++;
    const c = this.conn; this.conn = null;
    if (c) { try { await c.disconnect(); } catch {} }
    if (!silent) this.set({ status: 'idle', uniqueId: '', error: '', roomId: '' });
  }
}

function friendly(m, id) {
  if (/isn't online|not online|offline|UserOfflineError|LIVE has ended/i.test(m)) return `Kênh @${id} chưa phát trực tiếp (offline). Bật LIVE trên TikTok trước rồi kết nối lại.`;
  if (/rate ?limit|429/i.test(m)) return 'Máy chủ ký (Euler Stream) đang giới hạn lượt, đợi vài phút hoặc đặt SIGN_API_KEY.';
  if (/premium|business|euler/i.test(m)) return 'Máy chủ ký Euler Stream từ chối yêu cầu. Thử lại sau hoặc đặt SIGN_API_KEY.';
  if (/Room ID/i.test(m)) return 'Chưa lấy được mã phòng live (TikTok trả lời chậm), đang thử lại.';
  if (/not found|does not exist|user_not_found/i.test(m)) return `Kênh @${id} không tồn tại.`;
  return m.slice(0, 200);
}
