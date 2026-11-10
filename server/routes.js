const { getScreens, getScreenById, updateScreenConfig } = require('./screens');
const { getMatchState, resetMatchState, resetAllMatchStates } = require('./matchState');
const { handleSimulation } = require('./simulator');
const { connectToTikTok, disconnectFromTikTok, getTikTokStatus, injectTikTokEvent, routeSimulateToTemple, resetSimulateTemple } = require('./tiktokConnector');

function handleApiRoutes(req, res, pathname, overlayIo) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return true;
  }

  // 1. GET /api/screens - Return list of screens
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/screens') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(req.method === 'HEAD' ? '' : JSON.stringify(getScreens()));
    return true;
  }

  // 2. GET /api/screens/:id - Return single screen details
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname.startsWith('/api/screens/')) {
    const parts = pathname.split('/');
    const targetId = parts[parts.length - 1];
    const screen = getScreenById(targetId);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(req.method === 'HEAD' ? '' : JSON.stringify(screen || { error: 'Screen not found' }));
    return true;
  }

  // 3. PUT /api/screens/:id - Update screen config
  if (req.method === 'PUT' && pathname.startsWith('/api/screens/')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updated = JSON.parse(body);
        const parts = pathname.split('/');
        const targetId = parts[parts.length - 1];
        const screen = updateScreenConfig(targetId, updated.config || {});

        if (screen && overlayIo) {
          overlayIo.emit('overlay:config', { config: screen.config });
          overlayIo.emit('screen:update', screen);
        }

        if (targetId === 'cmtdichua0001' && updated.config?.templeSettings) {
          try {
            const { updateTempleSettings } = require('./chuaBridge');
            updateTempleSettings(updated.config.templeSettings);
          } catch (e) {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, config: screen?.config }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  // 3b. GET /api/match/:id - Return match state for screen
  if (req.method === 'GET' && pathname.startsWith('/api/match/')) {
    const parts = pathname.split('/');
    const targetId = parts[parts.length - 1];
    const mState = getMatchState(targetId);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(mState || { error: 'Match state not found' }));
    return true;
  }

  // 4. POST /api/reset-all - Reset all match states
  if (req.method === 'POST' && pathname === '/api/reset-all') {
    const cleanStates = resetAllMatchStates();
    if (overlayIo) {
      Object.values(cleanStates).forEach(st => {
        overlayIo.emit('match:state', st);
      });
      overlayIo.emit('match:fx', [{ kind: 'round_reset' }]);
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, message: 'Đã dọn sạch toàn bộ 6 game về 0!' }));
    return true;
  }

  // 5. POST /api/simulate - Live action simulator
  if (req.method === 'POST' && pathname === '/api/simulate') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const screenId = payload.screenId || 'cmta2zkpq00aokx08uyc7iys2';
        const targetScreen = getScreenById(screenId);

        // Reset single match state
        if (payload.reset) {
          // Man Di Chua: don chanh dien thay vi reset match state cua Live Bar
          if (resetSimulateTemple(screenId)) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true, temple: true, message: 'Đã dọn chánh điện!' }));
            return;
          }
          const cleanState = resetMatchState(screenId);
          if (overlayIo) {
            overlayIo.emit('match:state', cleanState);
            overlayIo.emit('match:fx', [{ kind: 'round_reset' }]);
          }
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, message: 'Đã dọn sạch dữ liệu ván đấu về 0!', state: cleanState }));
          return;
        }

        // Man Di Chua: dua su kien phong thu vao engine Temple (KHONG qua handleSimulation,
        // vi handleSimulation khong co nhanh di_chua -> se roi vao Live Bar gay loi).
        if (routeSimulateToTemple(payload, screenId)) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, temple: true }));
          return;
        }

        // Process game-specific simulation
        const mState = getMatchState(screenId);
        const { fxList } = handleSimulation(mState, payload, targetScreen, overlayIo);

        if (overlayIo) {
          overlayIo.emit('match:state', mState);
          if (fxList && fxList.length > 0) {
            overlayIo.emit('match:fx', fxList);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, state: mState, fx: fxList }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  // 6. GET /api/tiktok/status - Lay trang thai ket noi TikTok Live
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/tiktok/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(req.method === 'HEAD' ? '' : JSON.stringify(getTikTokStatus()));
    return true;
  }

  // 7. POST /api/tiktok/connect - Ket noi vao phong TikTok Live
  if (req.method === 'POST' && pathname === '/api/tiktok/connect') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const liveInput = payload.url || payload.username || '';
        const result = await connectToTikTok(liveInput, payload.screenId, overlayIo);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  // 8. POST /api/tiktok/disconnect - Ngat ket noi khoi TikTok Live
  if (req.method === 'POST' && pathname === '/api/tiktok/disconnect') {
    const result = disconnectFromTikTok();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(result));
    return true;
  }

  // 9. POST /api/tiktok/webhook - Nhan su kien tu Browser Bridge hoac Webhook ngoai
  if (req.method === 'POST' && pathname === '/api/tiktok/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const result = injectTikTokEvent(payload, overlayIo);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  return false;
}

module.exports = {
  handleApiRoutes
};
