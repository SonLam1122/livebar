// Starts the real server on a spare port with voice off and a temp data folder, then probes the security rules.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { WebSocket } from 'ws';

const PORT = 39000 + Math.floor(Math.random() * 900);
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'chua-test-'));
let proc;

function get(p, host = `localhost:${PORT}`) {
  return new Promise((res, rej) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: p, headers: { host } }, r => { r.resume(); r.on('end', () => res(r.statusCode)); });
    req.on('error', rej); req.end();
  });
}
function ws(url, origin) {
  return new Promise(res => {
    const s = new WebSocket(url, origin ? { origin } : {});
    const msgs = [];
    s.on('message', d => msgs.push(JSON.parse(d)));
    s.on('open', () => res({ s, msgs, ok: true }));
    s.on('error', () => res({ s, msgs, ok: false }));
    s.on('close', code => res({ s, msgs, ok: false, code }));
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));

before(async () => {
  proc = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, DISABLE_TTS: '1', HOST: '' }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) { try { if (await get('/health') === 200) return; } catch {} await wait(100); }
  throw new Error('server did not start');
});
after(() => { proc?.kill(); fs.rmSync(DATA, { recursive: true, force: true }); });

test('static files: allow-list only, no escapes, no source', async () => {
  assert.equal(await get('/overlay.html'), 200);
  assert.equal(await get('/assets/hall.jpg'), 200);
  for (const p of ['/../server/index.mjs', '/%2e%2e/package.json', '/server/index.mjs', '/package.json', '/.git/config', '/tts/../state.json', '/tts/x.mp3'])
    assert.equal(await get(p), 404, p);
});

test('unexpected Host header is refused (DNS rebinding)', async () => {
  assert.equal(await get('/overlay.html', 'evil.example:80'), 421);
});

test('WebSocket from a foreign page is refused, same origin is accepted', async () => {
  const bad = await ws(`ws://localhost:${PORT}/ws?role=control`, 'https://evil.example');
  assert.equal(bad.ok, false);
  const good = await ws(`ws://localhost:${PORT}/ws?role=control`, `http://localhost:${PORT}`);
  assert.equal(good.ok, true); good.s.close();
});

test('overlay sockets cannot send commands; control sockets can', async () => {
  const ov = await ws(`ws://localhost:${PORT}/ws?role=overlay`);
  const ctl = await ws(`ws://localhost:${PORT}/ws?role=control`);
  await wait(150);
  ov.s.send(JSON.stringify({ t: 'ctl', cmd: 'sim', kind: 'chat', name: 'Hacker', text: 'xin chào' }));
  await wait(300);
  assert.ok(!ov.msgs.some(m => m.t === 'join' && m.v.name === 'Hacker'));
  ctl.s.send(JSON.stringify({ t: 'ctl', cmd: 'sim', kind: 'chat', name: 'Minh', text: 'xin chào' }));
  await wait(300);
  assert.ok(ov.msgs.some(m => m.t === 'join' && m.v.name === 'Minh ·thử'));
  ov.s.close(); ctl.s.close();
});

test('test characters from the simulator and the fill button are tagged ·thử', async () => {
  const ov = await ws(`ws://localhost:${PORT}/ws?role=overlay`);
  const ctl = await ws(`ws://localhost:${PORT}/ws?role=control`);
  await wait(150);
  ctl.s.send(JSON.stringify({ t: 'ctl', cmd: 'fill', n: 3 }));
  ctl.s.send(JSON.stringify({ t: 'ctl', cmd: 'sim', kind: 'gift', name: 'Một Cái Tên Rất Dài Để Thử Cắt', gift: 'Hoa hồng', count: 1, diamonds: 1 }));
  await wait(400);
  const names = ov.msgs.filter(m => m.t === 'join').map(m => m.v.name);
  assert.ok(names.length >= 4, names.join());
  for (const n of names) assert.match(n, / ·thử$/, n);
  ctl.s.send(JSON.stringify({ t: 'ctl', cmd: 'clear' }));
  ov.s.close(); ctl.s.close();
});

test('refuses to listen on the LAN without an admin token', async () => {
  const p = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: String(PORT + 1), DATA_DIR: DATA, HOST: '0.0.0.0', ADMIN_TOKEN: '' }, stdio: 'pipe' });
  const code = await new Promise(r => p.on('exit', r));
  assert.equal(code, 1);
});
