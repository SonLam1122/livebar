// Checks an install step by step and says what to do next. For people and for AI agents:
//   node scripts/kiem-tra.mjs          → everything that can be checked without the servers running
//   node scripts/kiem-tra.mjs --chay   → also asks the running app (port 3000) and voice server (port 8000),
//                                         and has the voice server read one line
// Exit code 0 = nothing blocking, 1 = something must be fixed first (see the ❌ lines).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNNING = process.argv.includes('--chay');
const APP = `http://127.0.0.1:${process.env.PORT || 3000}`;
const VIENEU = (process.env.VIENEU_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
let blocking = 0;
const ok = (s) => console.log('✅ ' + s);
const warn = (s, fix) => console.log('⚠️  ' + s + (fix ? `\n    → ${fix}` : ''));
const bad = (s, fix) => { blocking++; console.log('❌ ' + s + (fix ? `\n    → ${fix}` : '')); };
const has = (cmd) => { try { execSync(cmd, { stdio: 'ignore', timeout: 10_000 }); return true; } catch { return false; } };
const get = async (url, ms = 3000) => { try { const r = await fetch(url, { signal: AbortSignal.timeout(ms) }); return r.ok ? await r.json() : null; } catch { return null; } };

console.log('Kiểm tra cài đặt Chánh Điện An Lạc\n');

// 1. the app itself
const major = +process.versions.node.split('.')[0];
major >= 20 ? ok(`Node.js ${process.versions.node}`) : bad(`Node.js ${process.versions.node} quá cũ`, 'Cài Node.js 20 trở lên (bản LTS) tại https://nodejs.org');
fs.existsSync(path.join(ROOT, 'node_modules', 'tiktok-live-connector')) ? ok('Thư viện đã cài (node_modules)')
  : bad('Chưa cài thư viện', 'Chạy: npm install   (hoặc nháy đúp start.bat, lần đầu nó tự cài)');

// 2. the optional local voice
const venv = path.join(ROOT, 'tools', 'VieNeu-TTS', '.venv', 'Scripts', 'python.exe');
const gpu = has('nvidia-smi');
console.log(`ℹ️  Card NVIDIA: ${gpu ? 'có → giọng VieNeu v3 Turbo (GPU)' : 'không → giọng VieNeu v3 Nano (CPU)'}`);
if (fs.existsSync(venv)) ok('Giọng VieNeu đã cài (tools/VieNeu-TTS)');
else {
  warn('Chưa cài giọng VieNeu (không bắt buộc: tool vẫn đọc bằng giọng Edge qua Internet)', 'Muốn cài: chạy cai-giong-vieneu.bat. Cần Git và Python 3.10–3.13');
  if (!has('git --version')) warn('Chưa có Git', 'Cài tại https://git-scm.com');
  if (!has('python --version')) warn('Chưa có Python trong PATH', 'Cài Python 3.11 tại https://www.python.org/downloads/ và tick "Add python.exe to PATH"');
}

// 3. the servers, when asked
if (RUNNING) {
  console.log('');
  const app = await get(APP + '/health');
  if (!app) bad(`App chưa chạy ở ${APP}`, 'Nháy đúp start.bat (hoặc: npm start) và giữ cửa sổ đó mở');
  else ok(`App đang chạy · TikTok: ${{ idle: 'chưa kết nối', connecting: 'đang kết nối', connected: 'đang nhận sự kiện', retrying: 'đang thử lại', error: 'lỗi kết nối', ended: 'live đã kết thúc' }[app.tiktok] || app.tiktok}`);
  if (fs.existsSync(venv)) {
    const v = await get(VIENEU + '/health');
    if (!v) warn(`Server giọng VieNeu chưa trả lời ở ${VIENEU}`, 'start.bat tự bật nó trong cửa sổ "Giong doc VieNeu"; lần đầu cần khoảng 1 phút để tải model. Lỗi thì xem cửa sổ đó, hoặc chạy chay-giong-vieneu.bat');
    else {
      const t = Date.now();
      try {
        const r = await fetch(VIENEU + '/v1/audio/speech', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(60_000),
          body: JSON.stringify({ input: 'Nam mô A Di Đà Phật.', response_format: 'pcm', sample_rate: 24000 }),
        });
        const n = r.ok ? (await r.arrayBuffer()).byteLength : 0;
        n > 2000 ? ok(`Giọng VieNeu đọc được (${v.model || v.backend || 'VieNeu'}): ${((n / 48000)).toFixed(1)} giây âm thanh trong ${((Date.now() - t) / 1000).toFixed(1)} giây`)
          : warn(`Server giọng trả lỗi ${r.status}`, 'Xem cửa sổ "Giong doc VieNeu" để biết lỗi');
      } catch (e) { warn('Server giọng không đọc được: ' + e.message); }
    }
  }
}

console.log(blocking ? `\nCòn ${blocking} việc phải sửa (dòng ❌).` : `\nKhông có lỗi chặn.${RUNNING ? '' : ' Chạy thêm với --chay sau khi mở start.bat để kiểm tra server.'}`);
process.exit(blocking ? 1 : 0);
