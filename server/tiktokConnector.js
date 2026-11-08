// =========================================================================
// TIKTOK LIVE CONNECTOR SERVICE
// Tu dong trich xuat username tu link live (vt.tiktok.com hoac tiktok.com/@...)
// Ket noi truc tiep may chu Webcast TikTok ma khong can bat ky ben thu ba nao
// =========================================================================

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const {
  TikTokLiveConnection,
  RoomIdRouteConfig
} = require('tiktok-live-connector');

const { getScreenById } = require('./screens');
const { getMatchState } = require('./matchState');
const { handleSimulation } = require('./simulator');

// Khong su dung EulerStream de lay Room ID
if (RoomIdRouteConfig) {
  RoomIdRouteConfig.skipFetchRoomIdFromEulerRoute = true;
}

let connectionInstance = null;
let currentUsername = '';
let currentInputUrl = '';
let currentScreenId = 'cmta2zkpq00aokx08uyc7iys2';
let currentRoomId = '';
let connectionStatus = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, ERROR
let lastErrorMessage = '';
let liveStats = {
  viewerCount: 0,
  likeCount: 0,
  totalGifts: 0,
  totalComments: 0
};

// Đi chùa: map hành động nghi lễ (từ bảng quà) -> từ khoá bình luận mà temple.onChat hiểu
const TEMPLE_RITUAL_KEYWORD = {
  ritual_fortune: 'xin xăm',
  ritual_mo: 'gõ mõ',
  ritual_bell: 'thỉnh chuông',
  ritual_incense: 'thắp hương',
  ritual_bow: 'lạy Phật',
};

// Map qua tang de tra cuu ten va kim cuong
const giftsMap = new Map();
try {
  const giftsPath = path.join(__dirname, '..', 'gifts_data.json');
  if (fs.existsSync(giftsPath)) {
    const list = JSON.parse(fs.readFileSync(giftsPath, 'utf8'));
    list.forEach(g => {
      if (g.giftId) giftsMap.set(Number(g.giftId), g);
    });
  }
} catch (e) {
  console.error('Khong the tai gifts_data.json:', e.message);
}

// Chuyen doi link live thanh username TikTok chuan
function resolveTikTokUrl(inputUrl) {
  return new Promise((resolve, reject) => {
    const current = (inputUrl || '').trim();
    if (!current) {
      return reject(new Error('Vui long dan duong link hoac username TikTok'));
    }

    // Neu nguoi dung nhap truc tiep username
    if (!current.startsWith('http://') && !current.startsWith('https://')) {
      const clean = current.replace(/^@/, '').split('/')[0].split('?')[0];
      return resolve(clean);
    }

    let redirectCount = 0;
    function follow(urlStr) {
      if (redirectCount > 5) {
        return reject(new Error('Duong link chuyen huong qua nhieu lan'));
      }
      redirectCount++;

      let urlObj;
      try {
        urlObj = new URL(urlStr);
      } catch (err) {
        return reject(new Error('Duong link khong hop le'));
      }

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(urlStr, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, res => {
        // Xu ly chuyen huong 301, 302
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let nextUrl = res.headers.location;
          if (!nextUrl.startsWith('http')) {
            nextUrl = new URL(nextUrl, urlStr).toString();
          }
          return follow(nextUrl);
        }

        // Kiem tra username co san tren URL sau khi chuyen huong
        const userMatch = urlStr.match(/@([a-zA-Z0-9_.-]+)/);
        if (userMatch && userMatch[1]) {
          return resolve(userMatch[1]);
        }

        // Doc mot phan body neu can
        let body = '';
        res.on('data', chunk => {
          body += chunk;
          if (body.length > 50000) req.destroy();
        });
        res.on('close', () => {
          const bodyMatch = body.match(/@([a-zA-Z0-9_.-]+)/);
          if (bodyMatch && bodyMatch[1]) {
            return resolve(bodyMatch[1]);
          }
          reject(new Error('Khong the tim thay username tu duong link'));
        });
      });

      req.on('error', reject);
    }

    follow(current);
  });
}

// Chuan hoa thong tin nguoi dung tu su kien TikTok
function extractTikTokUser(data) {
  const u = data?.user || data || {};
  const username = u.displayId || data?.uniqueId || u.uniqueId || (u.id ? `user_${u.id}` : (u.username || 'nguoi_xem'));
  const nickname = u.nickname || data?.nickname || u.name || username;
  const avatarUrl = u.avatarThumb?.urlList?.[0] || u.avatarMedium?.urlList?.[0] || data?.profilePictureUrl || u.avatarUrl || u.avatar || `/api/avatars/${username}.svg`;

  return {
    username: String(username),
    name: String(nickname),
    nickname: String(nickname),
    avatar: String(avatarUrl),
    avatarUrl: String(avatarUrl)
  };
}

// --- Dinh tuyen rieng cho man hinh Di Chua (di_chua): su kien phai vao engine
//     Temple cua chuaBridge, KHONG di qua handleSimulation (vi handleSimulation
//     khong co nhanh di_chua -> roi vao nhanh Live Bar -> mState.guests.find() loi). ---
function currentScreenIsTemple(screenId) {
  const sc = getScreenById(screenId);
  return !!(sc && sc.gameType === 'di_chua');
}

function getTempleEngine() {
  try {
    return require('./chuaBridge').getTemple();
  } catch (e) {
    return null;
  }
}

function templeUser(data) {
  const u = extractTikTokUser(data);
  const avatar = /^https?:\/\//.test(u.avatarUrl) ? u.avatarUrl : '';
  return { id: u.username, name: u.nickname, avatar };
}

// Tra ve true neu da route su kien vao engine Temple (man dang la di_chua).
function routeToTempleIfNeeded(kind, data, screenId) {
  if (!currentScreenIsTemple(screenId)) return false;
  const temple = getTempleEngine();
  if (!temple) {
    console.error('[Di Chua] Engine Temple chua san sang, bo qua su kien', kind);
    return true; // van coi la da xu ly de khong roi xuong handleSimulation gay loi
  }
  try {
    const who = templeUser(data);
    if (!who.id) return true;
    switch (kind) {
      case 'chat':
        temple.onChat(who, data.content || data.comment || '');
        break;
      case 'gift': {
        const giftId = Number(data.giftId);
        const known = giftsMap.get(giftId);
        const giftName = data.giftName || data.extendedGiftInfo?.name || known?.name || 'le vat';
        const single = Number(data.diamondCount || data.extendedGiftInfo?.diamondCount || known?.diamonds || 1);
        const type = data.giftType ?? data.gift?.type ?? data.extendedGiftInfo?.type;
        temple.onGift({
          userId: who.id, name: who.name, avatar: who.avatar,
          giftId: String(giftId || giftName), giftName,
          groupId: String(data.groupId || ''),
          streakable: type === 1,
          repeatCount: Number(data.repeatCount || data.comboCount || 1),
          repeatEnd: !!data.repeatEnd,
          diamonds: single
        });
        // Đi chùa: quà có gắn nghi lễ (bảng quà) -> kích nghi lễ bằng từ khoá (dùng onChat sẵn có)
        try {
          const sc = getScreenById(screenId);
          const rule = (sc && sc.config && Array.isArray(sc.config.mappings) ? sc.config.mappings : [])
            .find(mm => mm.trigger === 'gift' && mm.giftName === giftName && /^ritual_/.test(mm.action || ''));
          const kw = rule && TEMPLE_RITUAL_KEYWORD[rule.action];
          if (kw) temple.onChat(who, kw);
        } catch (e) {}
        break;
      }
      case 'like':
        temple.onLike(who, Number(data.likeCount || data.count || 1));
        break;
      case 'follow':
        temple.onFollow(who);
        break;
      case 'share':
        temple.onShare(who);
        break;
      case 'member':
        temple.onJoin(who);
        break;
      case 'roomUser':
        if (data?.viewerCount !== undefined) temple.onViewerCount(Number(data.viewerCount));
        break;
    }
  } catch (e) {
    console.error('[Di Chua] Loi dua su kien vao Temple:', e.message);
  }
  return true;
}

// Dieu phoi su kien TikTok vao vung nho game va broadcast cho Overlay qua Socket.IO
function dispatchToGame(payload, screenId, overlayIo) {
  try {
    const targetScreen = getScreenById(screenId);
    const mState = getMatchState(screenId);
    if (!targetScreen || !mState) return;

    const { fxList } = handleSimulation(mState, payload, targetScreen, overlayIo);

    if (overlayIo) {
      overlayIo.emit('match:state', mState);
      if (fxList && fxList.length > 0) {
        overlayIo.emit('match:fx', fxList);
      }
    }
  } catch (err) {
    console.error('Loi dieu phoi su kien TikTok vao game:', err.message);
  }
}

// Tiep nhan va xu ly su kien TikTok
function injectTikTokEvent(rawPayload, overlayIo) {
  const screenId = rawPayload.screenId || currentScreenId || 'cmta2zkpq00aokx08uyc7iys2';
  const type = rawPayload.type || (rawPayload.gift ? 'gift' : rawPayload.comment ? 'comment' : rawPayload.likes ? 'like' : 'join');
  const user = extractTikTokUser(rawPayload.user || rawPayload);

  // Cap nhat thong ke tong
  if (type === 'comment' || rawPayload.comment) {
    liveStats.totalComments++;
  } else if (type === 'gift' || rawPayload.gift) {
    const repeat = Number(rawPayload.count || rawPayload.repeatCount || 1);
    liveStats.totalGifts += repeat;
  } else if (type === 'like' || rawPayload.likes) {
    const count = Number(rawPayload.likes || rawPayload.count || 1);
    liveStats.likeCount += count;
  } else if (rawPayload.viewerCount !== undefined) {
    liveStats.viewerCount = Number(rawPayload.viewerCount);
  }

  connectionStatus = 'CONNECTED';

  const diamonds = Number(rawPayload.diamonds || 0);
  const payload = {
    screenId,
    type,
    user,
    action: rawPayload.action || (type === 'comment' ? 'jump' : (diamonds >= 50 ? 'spotlight' : undefined)),
    comment: rawPayload.comment || '',
    gift: rawPayload.gift || '',
    diamonds,
    likes: Number(rawPayload.likes || rawPayload.count || 1),
    points: rawPayload.points || (diamonds ? (diamonds >= 50 ? diamonds * 2 : diamonds * 5) : 10)
  };

  dispatchToGame(payload, screenId, overlayIo);

  return {
    success: true,
    message: 'Da dong bo su kien vao game',
    stats: liveStats
  };
}

// Lay trang thai ket noi hien tai
function getTikTokStatus() {
  return {
    status: connectionStatus,
    username: currentUsername,
    inputUrl: currentInputUrl,
    roomId: currentRoomId,
    screenId: currentScreenId,
    error: lastErrorMessage,
    stats: liveStats,
    isConnected: connectionStatus === 'CONNECTED'
  };
}

// Khoi tao ket noi tu dong tu duong link live TikTok
async function connectToTikTok(rawInput, screenId, overlayIo) {
  if (!rawInput) {
    throw new Error('Vui long dan link live TikTok');
  }

  // Trich xuat username tu duong link nguoi dung dan vao
  const username = await resolveTikTokUrl(rawInput);

  // Ngat ket noi cu neu dang ton tai
  disconnectFromTikTok();

  currentInputUrl = rawInput.trim();
  currentUsername = username;
  currentScreenId = screenId || 'cmta2zkpq00aokx08uyc7iys2';
  connectionStatus = 'CONNECTING';
  lastErrorMessage = '';
  liveStats = { viewerCount: 0, likeCount: 0, totalGifts: 0, totalComments: 0 };

  try {
    const connection = new TikTokLiveConnection(username, {
      processInitialData: false,
      enableExtendedGiftInfo: false,
      requestPollingIntervalMs: 1000,
      clientParams: {
        app_language: 'vi-VN',
        webcast_language: 'vi-VN'
      }
    });

    connection.on('connected', (state) => {
      connectionStatus = 'CONNECTED';
      lastErrorMessage = '';
      currentRoomId = String(state?.roomId || connection.roomId || '');
      console.log(`[TikTok Live] Da ket noi toi phong live @${username} (Room ID: ${currentRoomId})`);
    });

    connection.on('disconnected', () => {
      connectionStatus = 'DISCONNECTED';
      console.log(`[TikTok Live] Da ngat ket noi @${username}`);
    });

    connection.on('error', (err) => {
      connectionStatus = 'ERROR';
      lastErrorMessage = err?.info || err?.message || 'Loi ket noi TikTok';
      console.error(`[TikTok Live] Loi: ${lastErrorMessage}`);
    });

    // 1. Su kien Binh luan
    connection.on('chat', (data) => {
      if (routeToTempleIfNeeded('chat', data, currentScreenId)) return;
      const comment = data.content || data.comment || '';
      if (!comment) return;

      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'comment',
        comment,
        action: 'jump',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 2. Su kien Tang qua
    connection.on('gift', (data) => {
      if (routeToTempleIfNeeded('gift', data, currentScreenId)) return;
      const giftId = Number(data.giftId);
      const known = giftsMap.get(giftId);
      const giftName = data.giftName || data.extendedGiftInfo?.name || known?.name || 'Hoa Hong';
      const singleDiamonds = Number(data.diamondCount || data.extendedGiftInfo?.diamondCount || known?.diamonds || 1);
      const repeat = Number(data.repeatCount || data.comboCount || 1);
      const totalDiamonds = singleDiamonds * repeat;

      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'gift',
        gift: giftName,
        diamonds: totalDiamonds,
        count: repeat,
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 3. Su kien Tha tim
    connection.on('like', (data) => {
      if (routeToTempleIfNeeded('like', data, currentScreenId)) return;
      const count = Number(data.count || data.likeCount || 1);
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'like',
        likes: count,
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 4. Su kien Nguoi xem vao phong
    connection.on('member', (data) => {
      if (routeToTempleIfNeeded('member', data, currentScreenId)) return;
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'join',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 5. Su kien Chia se
    connection.on('share', (data) => {
      if (routeToTempleIfNeeded('share', data, currentScreenId)) return;
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'share',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 6. Su kien Theo doi
    connection.on('follow', (data) => {
      if (routeToTempleIfNeeded('follow', data, currentScreenId)) return;
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'follow',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 7. Cap nhat so luong mat xem
    connection.on('roomUser', (data) => {
      if (routeToTempleIfNeeded('roomUser', data, currentScreenId)) return;
      if (data?.viewerCount !== undefined) {
        liveStats.viewerCount = Number(data.viewerCount);
      }
    });

    await connection.connect();
    connectionInstance = connection;

    return {
      success: true,
      username,
      message: `Da ket noi thanh cong toi phong live @${username}`,
      roomId: connection.roomId
    };
  } catch (err) {
    connectionStatus = 'ERROR';
    lastErrorMessage = err?.info || err?.message || 'Khong the ket noi toi phong live';
    console.error(`[TikTok Live] Loi: ${lastErrorMessage}`);
    throw new Error(lastErrorMessage);
  }
}

// Ngat ket noi
function disconnectFromTikTok() {
  if (connectionInstance) {
    try {
      connectionInstance.disconnect();
    } catch (e) {}
    connectionInstance = null;
  }
  connectionStatus = 'DISCONNECTED';
  currentRoomId = '';
  return { success: true, message: 'Da ngat ket noi TikTok' };
}

module.exports = {
  resolveTikTokUrl,
  connectToTikTok,
  disconnectFromTikTok,
  getTikTokStatus,
  injectTikTokEvent
};
