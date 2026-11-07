// Voice engines without the network: a stand-in VieNeu server on a spare port, Edge stubbed out.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Voice, wavFile } from '../server/tts.mjs';

const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'chua-tts-'));
const asked = [];
let fake, url;

before(async () => {
  fake = http.createServer((req, res) => {
    if (req.url === '/health') { res.end('{"ok":true}'); return; }
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => { asked.push(JSON.parse(body)); res.end(Buffer.alloc(24000 * 2)); });   // one second of silence
  });
  await new Promise(r => fake.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${fake.address().port}`;
});
after(() => { fake.close(); fs.rmSync(DIR, { recursive: true, force: true }); });

function voice(settings, extra = {}) {
  const sent = [], logs = [];
  const v = new Voice({ dir: DIR, urlPrefix: '/tts/', send: m => sent.push(m), log: s => logs.push(s), settings: () => settings, vieneuUrl: url, ...extra });
  return { v, sent, logs };
}
const until = async (f, ms = 3000) => { for (let t = 0; t < ms; t += 20) { if (f()) return; await new Promise(r => setTimeout(r, 20)); } throw new Error('timeout'); };

test('wavFile writes a correct header around raw PCM', () => {
  const w = wavFile(Buffer.alloc(100), 24000);
  assert.equal(w.toString('ascii', 0, 4), 'RIFF'); assert.equal(w.toString('ascii', 8, 12), 'WAVE');
  assert.equal(w.readUInt32LE(4), 136); assert.equal(w.readUInt32LE(24), 24000); assert.equal(w.readUInt32LE(40), 100);
});

test('a VieNeu voice is rendered by the local VieNeu server into a cached .wav', async () => {
  const { v, sent } = voice({ voice: 'vieneu:Thiền Tâm Đức', pitch: 0, rate: 0 });
  v.say('Nam mô A Di Đà Phật', { prio: 2 });
  await until(() => sent.length);
  assert.equal(sent[0].t, 'tts'); assert.match(sent[0].url, /^\/tts\/[a-f0-9]{20}\.wav$/);
  assert.equal(asked.at(-1).voice, 'Thiền Tâm Đức'); assert.equal(asked.at(-1).response_format, 'pcm');
  const file = path.join(DIR, path.basename(sent[0].url));
  assert.equal(fs.readFileSync(file).toString('ascii', 0, 4), 'RIFF');
  const n = asked.length;
  v.say('Nam mô A Di Đà Phật', { prio: 2 });                      // same line again comes from the cache
  await until(() => sent.length === 2);
  assert.equal(asked.length, n);
});

test('when Edge fails, a running VieNeu server takes over', async () => {
  const { v, sent, logs } = voice({ voice: 'vi-VN-NamMinhNeural', pitch: -18, rate: -20 });
  v.edgeWithRetry = async () => { throw new Error('no turn.end received'); };
  v.say('Cầu cho gia đình bình an', { prio: 2 });
  await until(() => sent.length);
  assert.equal(sent[0].t, 'tts'); assert.match(sent[0].url, /\.wav$/);
  assert.equal(asked.at(-1).voice, 'Thiền Tâm Đức');
  assert.ok(logs.some(l => /chuyển sang giọng VieNeu/.test(l)));
});

test('when neither engine works, the overlay is told to use the browser voice', async () => {
  const { v, sent } = voice({ voice: 'vi-VN-NamMinhNeural', pitch: 0, rate: 0 }, { vieneuUrl: 'http://127.0.0.1:1' });
  v.edgeWithRetry = async () => { throw new Error('offline'); };
  v.say('Một câu thử', { prio: 2 });
  await until(() => sent.length);
  assert.equal(sent[0].t, 'speak');
});
