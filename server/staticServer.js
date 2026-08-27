const fs = require('fs');
const path = require('path');
const { ROOT_DIR, MIME_TYPES } = require('./config');
const { compileDashboardHtml } = require('./compiler');

function serveStatic(req, res, pathname) {
  // Dynamic modular dashboard compilation on-the-fly
  if (pathname === '/dashboard' || pathname === '/dashboard.html' || pathname.startsWith('/dashboard/')) {
    const html = compileDashboardHtml();
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(html);
    return;
  }

  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Generate SVG avatar on-the-fly for users
  if (pathname.startsWith('/api/avatars/')) {
    const username = pathname.replace('/api/avatars/', '').replace('.svg', '');
    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    const bg = colors[Math.abs(hash) % colors.length];
    const letter = (username.charAt(0) || 'U').toUpperCase();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="64" fill="${bg}"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="52" font-family="Arial, sans-serif" font-weight="bold">${letter}</text>
    </svg>`;

    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
    res.end(svg);
    return;
  }

  // Handle Gifts data route
  if (pathname === '/api/gifts') {
    const giftsPath = path.join(ROOT_DIR, 'gifts_data.json');
    if (fs.existsSync(giftsPath)) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(fs.readFileSync(giftsPath, 'utf8'));
      return;
    }
  }

  // Normal File Serving with HTTP Range support for media streaming
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}

module.exports = {
  serveStatic
};
