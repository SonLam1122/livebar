// =========================================================================
// TIKTOK LIVE CONNECTOR SERVICE
// Lang nghe su kien truc tiep tu Webcast WebSocket cua TikTok
// =========================================================================

const { WebcastPushConnection } = require('tiktok-live-connector');
const { getScreenById } = require('./screens');
const { getMatchState } = require('./matchState');
const { handleSimulation } = require('./simulator');

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

  // Neu dang co ket noi truoc do thi ngat truoc khi tao ket noi moi
  if (connectionInstance) {
    disconnectFromTikTok();
  }

  currentUsername = username;
  currentScreenId = screenId || 'cmta2zkpq00aokx08uyc7iys2';
  connectionStatus = 'CONNECTING';
  lastErrorMessage = '';
  liveStats = { viewerCount: 0, likeCount: 0, totalGifts: 0, totalComments: 0 };

  const connection = new WebcastPushConnection(username, {
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
    console.log(`[TikTok Live] Da ket noi thanh cong toi phong live cua: @${username} (Room ID: ${state.roomId})`);
  });

  connection.on('disconnected', () => {
    connectionStatus = 'DISCONNECTED';
    console.log(`[TikTok Live] Da ngat ket noi khoi phong live cua: @${username}`);
  });

  connection.on('streamEnd', () => {
    connectionStatus = 'DISCONNECTED';
    console.log(`[TikTok Live] Phong live cua @${username} da ket thuc.`);
  });

  connection.on('error', (err) => {
    lastErrorMessage = err.message || 'Loi ket noi TikTok Webcast';
    console.error(`[TikTok Live] Loi: ${lastErrorMessage}`);
  });

  // 1. Su kien Binh luan (Chat)
  connection.on('chat', (data) => {
    liveStats.totalComments++;
    const payload = {
      screenId: currentScreenId,
      comment: data.comment,
      user: {
        username: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      }
    };
    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 2. Su kien Tang qua (Gift)
  connection.on('gift', (data) => {
    // Chi xu ly khi ket thuc chuoi combo hoac qua khong phai dang combo
    if (data.giftType === 1 && !data.repeatEnd) {
      return;
    }

    const repeat = data.repeatCount || 1;
    const singleDiamonds = data.diamondCount || 1;
    const totalDiamonds = singleDiamonds * repeat;
    liveStats.totalGifts += repeat;

    const payload = {
      screenId: currentScreenId,
      gift: data.giftName,
      diamonds: totalDiamonds,
      points: totalDiamonds >= 50 ? totalDiamonds * 2 : totalDiamonds * 5,
      user: {
        username: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      }
    };

    if (totalDiamonds >= 50) {
      payload.action = 'spotlight';
    }

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 3. Su kien Tha tim (Like)
  connection.on('like', (data) => {
    const count = data.likeCount || 1;
    liveStats.likeCount += count;

    const payload = {
      screenId: currentScreenId,
      type: 'like',
      likes: count,
      points: Math.max(1, Math.floor(count / 10)),
      user: {
        username: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      }
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 4. Su kien Chia se (Share)
  connection.on('share', (data) => {
    const payload = {
      screenId: currentScreenId,
      type: 'share',
      points: 5,
      user: {
        username: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      }
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 5. Su kien Nguoi xem tham gia (Member)
  connection.on('member', (data) => {
    const payload = {
      screenId: currentScreenId,
      type: 'join',
      user: {
        username: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      }
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  });

  // 6. Cap nhat so luong nguoi xem trong phong
  connection.on('roomUser', (data) => {
    if (data.viewerCount !== undefined) {
      liveStats.viewerCount = data.viewerCount;
    }
  });

  try {
    await connection.connect();
    connectionInstance = connection;
    return { success: true, message: `Dang ket noi toi @${username}...` };
  } catch (err) {
    connectionStatus = 'ERROR';
    lastErrorMessage = err.message || 'Khong the ket noi toi phong live';
    throw err;
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

