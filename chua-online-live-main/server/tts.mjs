// Vietnamese voice lines from two engines:
//  • VieNeu-TTS (github.com/pnnbao97/VieNeu-TTS), a local model served on this PC by its OpenAI-style API
//    (cai-giong-vieneu.bat installs it, start.bat runs it). Voices are stored as "vieneu:<preset name>".
//  • Microsoft Edge "Read Aloud" voices (msedge-tts, needs Internet).
// One line at a time, a priority queue (gifts / fortunes / milestones first), a hash cache for lines that repeat
// (chants, prompts) and fallbacks: the chosen engine, then the other one, then the overlay's browser voice.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { xmlEscape } from './text.mjs';

const VIENEU_FALLBACK = 'Thiền Tâm Đức';           // used when Edge fails and VieNeu is running
const EDGE_FALLBACK = 'vi-VN-NamMinhNeural';        // used when VieNeu fails
const PCM_RATE = 24000;

/** A playable WAV around raw 16-bit mono PCM. */
export function wavFile(pcm, rate = PCM_RATE) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export class Voice {
  /**
   * @param {{ dir:string, urlPrefix:string, send:(msg:object)=>void, log:(s:string)=>void, settings:()=>object, disabled?:boolean, vieneuUrl?:string }} o
   */
  constructor(o) {
    Object.assign(this, o);
    this.vieneuUrl = (o.vieneuUrl || 'http://127.0.0.1:8000').replace(/\/$/, '');
    this.vieneuSeen = { at: 0, ok: false };
    this.queue = []; this.busy = false; this.seq = 0; this.fails = 0;
    fs.mkdirSync(this.dir, { recursive: true });
    this.prune(0);
  }

  /** Queue a line. prio: 2 = gift / fortune / milestone / operator, 1 = everything else. Returns a key the overlay echoes. */
  say(text, { prio = 1, tag = '', voice = '' } = {}) {
    text = String(text).replace(/\s+/g, ' ').trim().slice(0, 600);
    if (!text) return null;
    const key = `v${++this.seq}`;
    // keep the queue short: drop the oldest low-priority line first; never let it grow past 15
    if (this.queue.length >= 15) {
      const i = this.queue.findIndex(q => q.prio < 2);
      if (i < 0 && prio < 2) { this.log('Hàng đợi giọng đọc đầy, bỏ qua 1 câu'); return null; }
      this.queue.splice(i < 0 ? 0 : i, 1);
    }
    const item = { key, text, prio, tag, voice, at: Date.now() };
    const pos = this.queue.findIndex(q => q.prio < prio);
    pos < 0 ? this.queue.push(item) : this.queue.splice(pos, 0, item);
    this.pump();
    return key;
  }

  /** Xoá sạch hàng đợi giọng đọc (khi dọn dữ liệu / buổi mới). Câu đang render dở sẽ bị bỏ khi xong. */
  clear() { this.queue = []; this.busy = false; }

  async pump() {
    if (this.busy || !this.queue.length) return;
    this.busy = true;
    const item = this.queue.shift();
    let hold = 40;
    try {
      // low-priority lines that waited too long are no longer relevant
      if (item.prio < 2 && Date.now() - item.at > 60_000) throw Object.assign(new Error('stale'), { stale: true });
      if (this.disabled) throw new Error('TTS tắt (DISABLE_TTS)');
      const url = await this.render(item.text, item.voice);
      this.fails = 0;
      this.send({ t: 'tts', key: item.key, url, text: item.text, tag: item.tag });
      hold = this.speakMs(item.text);
    } catch (e) {
      if (!e.stale) {
        this.fails++;
        if (this.fails <= 3 || this.fails % 20 === 0) this.log('Giọng đọc lỗi, dùng giọng trình duyệt: ' + (e?.message || e));
        this.send({ t: 'speak', key: item.key, text: item.text, tag: item.tag });
        hold = this.speakMs(item.text);
      }
    }
    // Phát LẦN LƯỢT: giữ hàng đợi tới khi câu hiện tại đọc gần xong mới gửi câu kế (tránh đọc chồng nhau)
    setTimeout(() => { this.busy = false; this.pump(); }, hold);
  }

  /** Ước lượng thời gian giữ hàng đợi sau 1 câu (ms): thời lượng đọc + khoảng cách readGapSec. */
  speakMs(text) {
    let rate = 0, gap = 300;
    try { const s = this.settings(); rate = +s.rate || 0; if (s.readGapSec != null) gap = Math.max(0, Math.min(6000, s.readGapSec * 1000)); } catch {}
    const spoke = String(text).length * 62 + 250;           // ~ tốc độ đọc tiếng Việt (siết lại cho đỡ lặng)
    const adj = spoke / (1 + Math.max(-40, Math.min(200, rate)) / 100);   // đọc nhanh hơn -> ngắn hơn
    return Math.max(600 + gap, Math.min(16000, Math.round(adj) + gap));
  }

  async render(text, voiceOverride = '') {
    const s = this.settings();
    // Giọng riêng cho từng loại (vd đọc quẻ) — rỗng thì dùng giọng chính
    const chosen = voiceOverride || s.voice;
    const vieneu = String(chosen).startsWith('vieneu:');
    const tryVieneu = name => this.cached(`vieneu|${name}|${text}`, 'wav', () => this.synthVieneu(text, name));
    const tryEdge = voice => {
      const pitch = `${s.pitch >= 0 ? '+' : ''}${s.pitch}Hz`, rate = `${s.rate >= 0 ? '+' : ''}${s.rate}%`;
      return this.cached(`${voice}|${pitch}|${rate}|${text}`, 'mp3', () => this.edgeWithRetry(text, voice, pitch, rate));
    };
    try {
      return vieneu ? await tryVieneu(chosen.slice(7)) : await tryEdge(chosen);
    } catch (first) {
      // the other engine, if it can help right now
      if (vieneu) { this.log('Giọng VieNeu lỗi, chuyển sang giọng Edge: ' + first.message); return tryEdge(EDGE_FALLBACK); }
      if (await this.vieneuUp()) { this.log('Giọng Edge lỗi, chuyển sang giọng VieNeu: ' + first.message); return tryVieneu(VIENEU_FALLBACK); }
      throw first;
    }
  }

  /** Serve a line from the cache, or make it once and keep it. */
  async cached(key, ext, make) {
    const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 20);
    const file = path.join(this.dir, `${hash}.${ext}`);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) { fs.utimesSync(file, new Date(), new Date()); return `${this.urlPrefix}${hash}.${ext}`; }
    const buf = await make();
    fs.writeFileSync(file + '.tmp', buf); fs.renameSync(file + '.tmp', file);
    this.prune(300);
    return `${this.urlPrefix}${hash}.${ext}`;
  }

  async edgeWithRetry(text, voice, pitch, rate) {
    // One warm connection is fast (~0.4 s a line). The service sometimes drops a socket or stalls, so on any
    // error the connection is thrown away and the line retried on a new one after a short pause.
    let err;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { return await this.synth(text, voice, pitch, rate); } catch (e) {
        err = e; this.resetClient();
        if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
      }
    }
    throw err;
  }

  /** Is the local VieNeu server answering? Checked at most every 30 s. */
  async vieneuUp() {
    if (Date.now() - this.vieneuSeen.at < 30_000) return this.vieneuSeen.ok;
    let ok = false;
    try { ok = (await fetch(this.vieneuUrl + '/health', { signal: AbortSignal.timeout(1500) })).ok; } catch {}
    this.vieneuSeen = { at: Date.now(), ok };
    return ok;
  }

  async synthVieneu(text, voice) {
    let r;
    try {
      r = await fetch(this.vieneuUrl + '/v1/audio/speech', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'vieneu-v3-turbo', input: text, voice, response_format: 'pcm', sample_rate: PCM_RATE }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (e) {
      this.vieneuSeen = { at: Date.now(), ok: false };
      throw new Error(e?.name === 'TimeoutError' ? 'VieNeu quá 30 giây' : 'chưa chạy server VieNeu (mở start.bat hoặc chay-giong-vieneu.bat)');
    }
    if (!r.ok) throw new Error(`VieNeu trả lỗi ${r.status}: ${(await r.text()).slice(0, 120)}`);
    const pcm = Buffer.from(await r.arrayBuffer());
    if (pcm.length < 2000) throw new Error('âm thanh rỗng');
    return wavFile(pcm);
  }

  async client(voice) {
    if (this.tts && this.ttsVoice === voice) return this.tts;
    this.resetClient();
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    this.tts = tts; this.ttsVoice = voice;
    return tts;
  }

  resetClient() { try { this.tts?.close(); } catch {} this.tts = null; }

  async synth(text, voice, pitch, rate) {
    const tts = await this.client(voice);
    let timer;
    try {
      const { audioStream } = tts.toStream(xmlEscape(text), { pitch, rate });
      const chunks = [];
      await Promise.race([
        new Promise((res, rej) => { audioStream.on('data', c => chunks.push(c)); audioStream.on('close', res); audioStream.on('error', rej); }),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('quá 25 giây')), 25_000); }),
      ]);
      const buf = Buffer.concat(chunks);
      if (buf.length < 1000) throw new Error('âm thanh rỗng');
      return buf;
    } finally { clearTimeout(timer); }
  }

  /** keep the cache folder small: newest `keep` files stay */
  prune(keep) {
    try {
      const files = fs.readdirSync(this.dir).map(f => ({ f, t: fs.statSync(path.join(this.dir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
      for (const { f } of files.slice(keep)) if (keep > 0 || f.endsWith('.tmp')) fs.unlinkSync(path.join(this.dir, f));
    } catch {}
  }
}
