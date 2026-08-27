// =========================================================================
// TAOLIVETUONGTAC - LOCAL OFFLINE SERVER (CLEAN MODULAR ARCHITECTURE)
// =========================================================================

const http = require('http');
const { PORT } = require('./server/config');
const { handleApiRoutes } = require('./server/routes');
const { serveStatic } = require('./server/staticServer');
const { setupSocketIO } = require('./server/socket');
const { startGameLoop } = require('./server/gameLoop');

// Create HTTP server
const httpServer = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. Check API Routes
    const handled = handleApiRoutes(req, res, pathname, overlayIo);
    if (handled) return;

    // 2. Serve Static Files
    serveStatic(req, res, pathname);
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

// Graceful error handling for Port in Use (EADDRINUSE)
httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [LỖI]: Cổng ${PORT} đang bị một tiến trình Node.js khác chiếm giữ!`);
    console.error(`👉 Để giải phóng cổng ${PORT}, hãy chạy lệnh:`);
    console.error(`   Get-Process node | Stop-Process -Force\n`);
    process.exit(1);
  } else {
    console.error('Lỗi khởi động Server:', err);
  }
});

// Setup Socket.IO
const { overlayIo } = setupSocketIO(httpServer);

// Start Continuous Game Loop & Physics Ticker
startGameLoop(overlayIo);

// Start listening
httpServer.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 TAOLIVETUONGTAC (100% OFFLINE) IS RUNNING AT: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎮 6 Games Ready: Live Bar, Vote Tank, Fish Tank, Football Duel, Army Clash, Chainsaw Clash`);
  console.log(`=============================================================\n`);
});
