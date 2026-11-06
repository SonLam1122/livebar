// =========================================================================
// TIKTOK LIVE CONNECTOR SERVICE
// Lang nghe su kien truc tiep tu Webcast WebSocket cua TikTok
// =========================================================================

const path = require('path');
const fs = require('fs');
const tiktokModule = require('tiktok-live-connector');
const { getScreenById } = require('./screens');
const { getMatchState } = require('./matchState');
const { handleSimulation } = require('./simulator');

// Ho tro ca hai ten goi class tuy phien ban thu vien
const ConnectorClass = tiktokModule.TikTokLiveConnection || tiktokModule.WebcastPushConnection;

let connectionInstance = null;
let currentUsername = '';
let currentScreenId = 'cmta2zkpq00aokx08uyc7iys2';
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
  const u = data?.user || {};
  const username = data?.uniqueId || u.displayId || u.uniqueId || (u.id ? `user_${u.id}` : 'nguoi_xem');
  const nickname = data?.nickname || u.nickname || username;
  const avatarUrl = data?.profilePictureUrl || u.avatarThumb?.urlList?.[0] || u.avatarMedium?.urlList?.[0] || `/api/avatars/${username}.svg`;

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

// Lay trang thai ket noi hien tai
function getTikTokStatus() {
  return {
    status: connectionStatus,
    username: currentUsername,
    screenId: currentScreenId,
    error: lastErrorMessage,
    stats: liveStats,
    isConnected: connectionStatus === 'CONNECTED'
  };
}

// Khoi tao ket noi toi phong TikTok Live theo username
async function connectToTikTok(rawUsername, screenId, overlayIo) {
  if (!rawUsername) {
    throw new Error('Vui long cung cap username TikTok');
  }

  const username = rawUsername.replace(/^@/, '').trim();

  // Ngat ket noi cu neu dang ton tai
  if (connectionInstance) {
    disconnectFromTikTok();
  }

  currentUsername = username;
  currentScreenId = screenId || 'cmta2zkpq00aokx08uyc7iys2';
  connectionStatus = 'CONNECTING';
  lastErrorMessage = '';
  liveStats = { viewerCount: 0, likeCount: 0, totalGifts: 0, totalComments: 0 };

  const connection = new ConnectorClass(username, {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 1000,
    clientParams: {
      app_language: 'vi-VN',
      webcast_language: 'vi-VN'
    }
  });

  // Dang ky cac su kien tu Webcast
  connection.on('connected', (state) => {
    connectionStatus = 'CONNECTED';
    lastErrorMessage = '';
    const roomId = state?.roomId || connection.roomId || 'unknown';
    console.log(`[TikTok Live] Da ket noi toi @${username} (Room ID: ${roomId})`);
  });

  connection.on('disconnected', () => {
    connectionStatus = 'DISCONNECTED';
    console.log(`[TikTok Live] Da ngat ket noi @${username}`);
  });

  connection.on('streamEnd', () => {
    connectionStatus = 'DISCONNECTED';
    console.log(`[TikTok Live] Phong live @${username} da ket thuc.`);
  });

  connection.on('error', (err) => {
    lastErrorMessage = err?.info || err?.message || 'Loi ket noi TikTok Webcast';
    console.error(`[TikTok Live] Loi: ${lastErrorMessage}`);
  });

  // 1. Su kien Binh luan (Chat)
  connection.on('chat', (data) => {
    liveStats.totalComments++;
    const user = extractTikTokUser(data);
    const comment = data.content || data.comment || '';
    if (!comment) return;

    const payload = {
      screenId: currentScreenId,
      comment,
      action: 'jump',
      user
    };
    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 2. Su kien Tang qua (Gift)
  connection.on('gift', (data) => {
    if (data.giftType === 1 && !data.repeatEnd) {
      return;
    }

    const giftId = Number(data.giftId);
    const known = giftsMap.get(giftId);
    const giftName = data.giftName || data.extendedGiftInfo?.name || known?.name || 'Hoa Hong';
    const singleDiamonds = Number(data.diamondCount || data.extendedGiftInfo?.diamondCount || known?.diamonds || 1);
    const repeat = Number(data.repeatCount || 1);
    const totalDiamonds = singleDiamonds * repeat;
    liveStats.totalGifts += repeat;

    const payload = {
      screenId: currentScreenId,
      gift: giftName,
      diamonds: totalDiamonds,
      points: totalDiamonds >= 50 ? totalDiamonds * 2 : totalDiamonds * 5,
      user: extractTikTokUser(data)
    };

    if (totalDiamonds >= 50) {
      payload.action = 'spotlight';
    }

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 3. Su kien Tha tim (Like)
  connection.on('like', (data) => {
    const count = Number(data.count || data.likeCount || 1);
    liveStats.likeCount += count;

    const payload = {
      screenId: currentScreenId,
      type: 'like',
      likes: count,
      points: Math.max(1, Math.floor(count / 10)),
      user: extractTikTokUser(data)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 4. Su kien Chia se (Share)
  connection.on('share', (data) => {
    const payload = {
      screenId: currentScreenId,
      type: 'share',
      points: 5,
      user: extractTikTokUser(data)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 5. Su kien Nguoi xem tham gia (Member)
  connection.on('member', (data) => {
    const payload = {
      screenId: currentScreenId,
      type: 'join',
      user: extractTikTokUser(data)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 6. Su kien Theo doi (Follow)
  connection.on('follow', (data) => {
    const payload = {
      screenId: currentScreenId,
      type: 'follow',
      points: 10,
      user: extractTikTokUser(data)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 7. Cap nhat so luong nguoi xem trong phong
  connection.on('roomUser', (data) => {
    if (data?.viewerCount !== undefined) {
      liveStats.viewerCount = data.viewerCount;
    }
  });

  try {
    await connection.connect();
    connectionInstance = connection;
    return { success: true, message: `Dang ket noi toi @${username}...` };
  } catch (err) {
    connectionStatus = 'ERROR';
    lastErrorMessage = err?.info || err?.message || 'Khong the ket noi toi phong live';
    throw new Error(lastErrorMessage);
  }
}

// Ngat ket noi khoi TikTok
function disconnectFromTikTok() {
  if (connectionInstance) {
    try {
      connectionInstance.disconnect();
    } catch (e) {}
    connectionInstance = null;
  }
  connectionStatus = 'DISCONNECTED';
  return { success: true, message: 'Da ngat ket noi TikTok' };
}

module.exports = {
  connectToTikTok,
  disconnectFromTikTok,
  getTikTokStatus
};
