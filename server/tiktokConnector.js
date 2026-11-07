// =========================================================================
// TIKTOK LIVE CONNECTOR SERVICE
// Ho tro ca hai phuong thuc dong bo su kien:
// 1. Browser Bridge / Webhook truc tiep (100% khong qua ben thu 3)
// 2. Ket noi WebSocket ngam qua TikTokLiveConnection (tuy chon Euler API Key)
// =========================================================================

const path = require('path');
const fs = require('fs');
const {
  TikTokLiveConnection,
  RoomIdRouteConfig,
  SignConfig
} = require('tiktok-live-connector');

const { getScreenById } = require('./screens');
const { getMatchState } = require('./matchState');
const { handleSimulation } = require('./simulator');

// Bat buoc khong goi EulerStream de lay Room ID (tranh loi 403 lack of permission)
if (RoomIdRouteConfig) {
  RoomIdRouteConfig.skipFetchRoomIdFromEulerRoute = true;
}

let connectionInstance = null;
let currentUsername = '';
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

// Map qua tang de tra cuu ten va kim cuong neu thieu tu goi tin
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

// Chuan hoa thong tin nguoi dung tu su kien TikTok
function extractTikTokUser(data) {
  const u = data?.user || data || {};
  const username = data?.uniqueId || u.uniqueId || u.displayId || (u.id ? `user_${u.id}` : (u.username || 'nguoi_xem'));
  const nickname = data?.nickname || u.nickname || u.name || username;
  const avatarUrl = data?.profilePictureUrl || u.profilePictureUrl || u.avatarThumb?.urlList?.[0] || u.avatarMedium?.urlList?.[0] || u.avatarUrl || u.avatar || `/api/avatars/${username}.svg`;

  return {
    username: String(username),
    name: String(nickname),
    nickname: String(nickname),
    avatar: String(avatarUrl),
    avatarUrl: String(avatarUrl)
  };
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

// Tiep nhan va xu ly su kien TikTok truc tiep (tu Webhook, Browser Bridge hoac WebSocket)
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
    roomId: currentRoomId,
    screenId: currentScreenId,
    error: lastErrorMessage,
    stats: liveStats,
    isConnected: connectionStatus === 'CONNECTED'
  };
}

// Khoi tao ket noi WebSocket vao TikTok Live
async function connectToTikTok(rawUsername, screenId, overlayIo, apiKey) {
  if (!rawUsername) {
    throw new Error('Vui long cung cap username TikTok');
  }

  const username = rawUsername.replace(/^@/, '').trim();

  // Ngat ket noi cu neu dang chay
  disconnectFromTikTok();

  currentUsername = username;
  currentScreenId = screenId || 'cmta2zkpq00aokx08uyc7iys2';
  connectionStatus = 'CONNECTING';
  lastErrorMessage = '';
  liveStats = { viewerCount: 0, likeCount: 0, totalGifts: 0, totalComments: 0 };

  const effectiveApiKey = apiKey || process.env.EULER_API_KEY || '';
  if (effectiveApiKey && SignConfig) {
    SignConfig.apiKey = effectiveApiKey;
  }

  try {
    const connection = new TikTokLiveConnection(username, {
      processInitialData: false,
      enableExtendedGiftInfo: true,
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
      console.log(`[TikTok Live] Da ket noi toi @${username} (Room ID: ${currentRoomId})`);
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

    // 1. Su kien Binh luan (Chat)
    connection.on('chat', (data) => {
      const comment = data.comment || data.content || '';
      if (!comment) return;

      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'comment',
        comment,
        action: 'jump',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 2. Su kien Tang qua (Gift)
    connection.on('gift', (data) => {
      const giftId = Number(data.giftId);
      const known = giftsMap.get(giftId);
      const giftName = data.giftName || data.extendedGiftInfo?.name || known?.name || 'Hoa Hong';
      const singleDiamonds = Number(data.diamondCount || data.extendedGiftInfo?.diamondCount || known?.diamonds || 1);
      const repeat = Number(data.repeatCount || 1);
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

    // 3. Su kien Tha tim (Like)
    connection.on('like', (data) => {
      const count = Number(data.count || data.likeCount || 1);
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'like',
        likes: count,
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 4. Su kien Nguoi xem vao phong (Member)
    connection.on('member', (data) => {
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'join',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 5. Su kien Chia se (Share)
    connection.on('share', (data) => {
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'share',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 6. Su kien Theo doi (Follow)
    connection.on('follow', (data) => {
      injectTikTokEvent({
        screenId: currentScreenId,
        type: 'follow',
        user: extractTikTokUser(data)
      }, overlayIo);
    });

    // 7. Cap nhat so luong nguoi xem
    connection.on('roomUser', (data) => {
      if (data?.viewerCount !== undefined) {
        liveStats.viewerCount = Number(data.viewerCount);
      }
    });

    await connection.connect();
    connectionInstance = connection;

    return {
      success: true,
      message: `Dang ket noi toi @${username}...`,
      roomId: connection.roomId
    };
  } catch (err) {
    connectionStatus = 'ERROR';
    lastErrorMessage = err?.info || err?.message || 'Khong the ket noi toi phong live';
    console.error(`[TikTok Live] Loi: ${lastErrorMessage}`);

    let userFacingError = lastErrorMessage;
    if (lastErrorMessage.includes('lack of permission') || lastErrorMessage.includes('Euler Stream')) {
      userFacingError = 'May chu can Euler API Key (mien phi tren eulerstream.com) de ket noi WebSocket. Hoac su dung Cau noi Trinh duyet (Browser Bridge) de dong bo 100% khong can ben thu 3.';
    }

    throw new Error(userFacingError);
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
  connectToTikTok,
  disconnectFromTikTok,
  getTikTokStatus,
  injectTikTokEvent
};
