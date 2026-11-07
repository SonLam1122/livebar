// =========================================================================
// TIKTOK LIVE CONNECTOR SERVICE (100% TRUC TIEP - KHONG QUA BEN THU 3)
// Ket noi truc tiep toi may chu Webcast cua TikTok, khong qua Euler Stream
// =========================================================================

const path = require('path');
const fs = require('fs');
const {
  WebcastHttpClient,
  getWebConfig,
  getRandomPresets,
  deserializeMessage
} = require('tiktok-live-connector');

const { getScreenById } = require('./screens');
const { getMatchState } = require('./matchState');
const { handleSimulation } = require('./simulator');

let isPolling = false;
let pollingTimer = null;
let currentUsername = '';
let currentScreenId = 'cmta2zkpq00aokx08uyc7iys2';
let currentRoomId = '';
let currentCursor = '';
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
    roomId: currentRoomId,
    screenId: currentScreenId,
    error: lastErrorMessage,
    stats: liveStats,
    isConnected: connectionStatus === 'CONNECTED'
  };
}

// Lay Room ID truc tiep tu may chu TikTok
async function fetchRoomIdDirectly(client, username) {
  // Cach 1: Goi truc tiep API Live cua TikTok
  try {
    const apiRes = await client.getJsonObjectFromTikTokApi("api-live/user/room/", {
      ...client.clientParams,
      uniqueId: username,
      sourceType: "54"
    });

    const roomId = apiRes?.data?.user?.roomId;
    if (roomId) return roomId;
  } catch (err) {
    console.warn(`[TikTok Direct] API live loi, thu scrape HTML: ${err.message}`);
  }

  // Cach 2: Scrape HTML trang live truc tiep tu TikTok
  try {
    const html = await client.getHtmlFromTikTokWebsite(`@${username}/live`);
    const match = html.match(/<script id="SIGI_STATE"[^>]*>([^<]+)<\/script>/) ||
                  html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);

    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      const roomId = parsed?.LiveRoom?.liveRoomUserInfo?.user?.roomId ||
                     parsed?.__DEFAULT_SCOPE__?.['webapp.live-detail']?.liveRoom?.liveRoomUserInfo?.user?.roomId;
      if (roomId) return roomId;
    }
  } catch (err) {
    console.warn(`[TikTok Direct] Scrape HTML loi: ${err.message}`);
  }

  throw new Error(`Khong the lay Room ID cua @${username}. Hay kiem tra kenh da phat truc tiep chua.`);
}

// Vong lap lang nghe tin nhan truc tiep tu TikTok Webcast qua HTTP Fetch
async function pollWebcast(client, roomId, overlayIo) {
  if (!isPolling) return;

  try {
    const params = {
      ...client.clientParams,
      room_id: roomId
    };
    if (currentCursor) {
      params.cursor = currentCursor;
    }

    const fetchResult = await client.getDeserializedObjectFromWebcastApi(
      'im/fetch/',
      params,
      'ProtoMessageFetchResult',
      false
    );

    if (fetchResult?.cursor) {
      currentCursor = fetchResult.cursor;
    }

    // Xu ly tung tin nhan trong danh sach tra ve
    if (Array.isArray(fetchResult?.messages) && fetchResult.messages.length > 0) {
      for (const msg of fetchResult.messages) {
        if (!msg.method || !msg.payload) continue;

        try {
          const decoded = deserializeMessage(msg.method, msg.payload);
          processDecodedMessage(msg.method, decoded, overlayIo);
        } catch (decErr) {
          // Bo qua cac goi tin khong quan trong hoac chua co schema
        }
      }
    }
  } catch (err) {
    console.warn(`[TikTok Direct] Loi poll Webcast: ${err.message}`);
  }

  // Lap lai sau 1000ms
  if (isPolling) {
    pollingTimer = setTimeout(() => pollWebcast(client, roomId, overlayIo), 1000);
  }
}

// Xu ly goi tin tuong tac cu the sau khi giai ma
function processDecodedMessage(method, decoded, overlayIo) {
  if (!decoded) return;

  // 1. Binh luan (Chat)
  if (method === 'WebcastChatMessage') {
    liveStats.totalComments++;
    const user = extractTikTokUser(decoded);
    const comment = decoded.content || decoded.comment || '';
    if (!comment) return;

    const payload = {
      screenId: currentScreenId,
      comment,
      action: 'jump',
      user
    };
    dispatchToGame(payload, currentScreenId, overlayIo);
  }

  // 2. Tang qua (Gift)
  else if (method === 'WebcastGiftMessage') {
    const giftId = Number(decoded.giftId);
    const known = giftsMap.get(giftId);
    const giftName = decoded.giftName || decoded.extendedGiftInfo?.name || known?.name || 'Hoa Hong';
    const singleDiamonds = Number(decoded.diamondCount || decoded.extendedGiftInfo?.diamondCount || known?.diamonds || 1);
    const repeat = Number(decoded.repeatCount || 1);
    const totalDiamonds = singleDiamonds * repeat;
    liveStats.totalGifts += repeat;

    const payload = {
      screenId: currentScreenId,
      gift: giftName,
      diamonds: totalDiamonds,
      points: totalDiamonds >= 50 ? totalDiamonds * 2 : totalDiamonds * 5,
      user: extractTikTokUser(decoded)
    };

    if (totalDiamonds >= 50) {
      payload.action = 'spotlight';
    }

    dispatchToGame(payload, currentScreenId, overlayIo);
  }

  // 3. Tha tim (Like)
  else if (method === 'WebcastLikeMessage') {
    const count = Number(decoded.count || 1);
    liveStats.likeCount += count;

    const payload = {
      screenId: currentScreenId,
      type: 'like',
      likes: count,
      points: Math.max(1, Math.floor(count / 10)),
      user: extractTikTokUser(decoded)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  }

  // 4. Nguoi xem vao phong (Member)
  else if (method === 'WebcastMemberMessage') {
    const payload = {
      screenId: currentScreenId,
      type: 'join',
      user: extractTikTokUser(decoded)
    };

    dispatchToGame(payload, currentScreenId, overlayIo);
  }

  // 5. Chia se hoac Theo doi (Social)
  else if (method === 'WebcastSocialMessage') {
    const key = decoded.common?.displayText?.key || '';
    const user = extractTikTokUser(decoded);

    if (key.includes('share')) {
      dispatchToGame({ screenId: currentScreenId, type: 'share', points: 5, user }, currentScreenId, overlayIo);
    } else if (key.includes('follow')) {
      dispatchToGame({ screenId: currentScreenId, type: 'follow', points: 10, user }, currentScreenId, overlayIo);
    }
  }

  // 6. Cap nhat so luong mat xem
  else if (method === 'WebcastRoomUserSeqMessage') {
    if (decoded.total !== undefined || decoded.viewerCount !== undefined) {
      liveStats.viewerCount = Number(decoded.total || decoded.viewerCount || 0);
    }
  }
}

// Khoi tao ket noi truc tiep vao TikTok Live
async function connectToTikTok(rawUsername, screenId, overlayIo) {
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
  currentCursor = '';
  liveStats = { viewerCount: 0, likeCount: 0, totalGifts: 0, totalComments: 0 };

  const client = new WebcastHttpClient(getWebConfig(getRandomPresets()));

  try {
    const roomId = await fetchRoomIdDirectly(client, username);
    currentRoomId = String(roomId);
    connectionStatus = 'CONNECTED';
    isPolling = true;

    console.log(`[TikTok Direct] Da ket noi truc tiep toi phong live @${username} (Room ID: ${roomId})`);

    // Bat dau vong lap doc su kien truc tiep
    pollWebcast(client, roomId, overlayIo);

    return {
      success: true,
      message: `Da ket noi truc tiep toi @${username}`,
      roomId
    };
  } catch (err) {
    connectionStatus = 'ERROR';
    lastErrorMessage = err.message || 'Khong the ket noi truc tiep toi TikTok';
    console.error(`[TikTok Direct] Loi: ${lastErrorMessage}`);
    throw new Error(lastErrorMessage);
  }
}

// Ngat ket noi
function disconnectFromTikTok() {
  isPolling = false;
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
  connectionStatus = 'DISCONNECTED';
  currentRoomId = '';
  currentCursor = '';
  return { success: true, message: 'Da ngat ket noi TikTok' };
}

module.exports = {
  connectToTikTok,
  disconnectFromTikTok,
  getTikTokStatus
};
