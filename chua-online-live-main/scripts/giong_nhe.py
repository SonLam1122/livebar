"""Small voice server for VieNeu-TTS v3 Nano (CPU only, no GPU needed).

Speaks the same subset of the OpenAI-style API that server/tts.mjs uses, so the app does not care which
model answers: GET /health, GET /v1/voices, POST /v1/audio/speech (response_format "pcm", 16-bit mono).
chay-giong-vieneu.bat starts this one on PCs without an NVIDIA card, and VieNeu's own v3 Turbo server
(apps/openai_speech.py) on PCs with one.

Run from the VieNeu-TTS folder with its venv:  .venv\\Scripts\\python.exe ..\\..\\scripts\\giong_nhe.py
Env: HOST (127.0.0.1), PORT (8000), VIENEU_NANO_STEPS (16; 8 is about 2x faster, a little rougher).
"""
import json
import logging
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import soxr
from vieneu import Vieneu

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s giong-nhe: %(message)s")
log = logging.getLogger("giong-nhe")

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
STEPS = int(os.environ.get("VIENEU_NANO_STEPS", "16"))

log.info("loading VieNeu-TTS v3 Nano (CPU)…")
t0 = time.time()
TTS = Vieneu(mode="v3nano", steps=STEPS)
VOICES = [vid for _label, vid in TTS.list_preset_voices()]
DEFAULT = getattr(TTS, "_default_voice", None) or VOICES[0]   # Minh Quân
LOCK = threading.Lock()                       # one line at a time: the CPU is shared with the live encoder
TTS.infer("Xin chào.", voice=DEFAULT, apply_watermark=False)   # warm up
log.info("ready in %.1fs, %d voices: %s", time.time() - t0, len(VOICES), ", ".join(VOICES))
unknown_logged = set()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            self.reply(200, {"status": "ok", "model": "v3nano"})
        elif self.path == "/v1/voices":
            self.reply(200, {"object": "list", "data": [{"id": v, "name": v} for v in VOICES]})
        else:
            self.reply(404, {"detail": "not found"})

    def do_POST(self):
        if self.path != "/v1/audio/speech":
            self.reply(404, {"detail": "not found"})
            return
        try:
            req = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            text = str(req.get("input", "")).strip()[:2000]
            rate = int(req.get("sample_rate", 24000))
            if not text or rate not in (8000, 16000, 24000, 48000):
                self.reply(400, {"detail": "input and sample_rate (8000/16000/24000/48000) are required"})
                return
            voice = req.get("voice") or DEFAULT
            if voice not in VOICES:
                # a v3 Turbo voice picked in the panel: speak it with the Nano default instead of failing
                if voice not in unknown_logged:
                    unknown_logged.add(voice)
                    log.warning("voice %r is not a Nano voice, using %r", voice, DEFAULT)
                voice = DEFAULT
            t = time.time()
            with LOCK:
                wav = TTS.infer(text, voice=voice)
            if rate != TTS.sample_rate:
                wav = soxr.resample(wav, TTS.sample_rate, rate)
            pcm = (np.clip(wav, -1.0, 1.0) * 32767).astype("<i2").tobytes()
            log.info("%s: %.2fs for %.2fs of audio", voice, time.time() - t, len(wav) / rate)
            self.reply(200, pcm, "application/octet-stream")
        except Exception as e:                # keep serving; the app falls back to Edge on an error
            log.exception("speech failed")
            self.reply(500, {"detail": str(e)[:300]})


log.info("listening on http://%s:%d", HOST, PORT)
ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
