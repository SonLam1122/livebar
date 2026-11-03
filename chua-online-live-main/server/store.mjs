// Small JSON store for things that should survive a restart (all-time merit board, settings).
// Writes are debounced, atomic (tmp file + rename) and never replace a file that failed to load,
// so a corrupted file is kept for the operator to look at instead of being silently wiped.
import fs from 'node:fs';
import path from 'node:path';

export class JsonStore {
  constructor(file, fallback, { delayMs = 1000 } = {}) {
    this.file = file; this.delayMs = delayMs; this.timer = null; this.readonly = false;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.data = structuredClone(fallback);
    if (fs.existsSync(file)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (loaded && typeof loaded === 'object' && !Array.isArray(loaded)) this.data = { ...this.data, ...loaded };
        else throw new Error('not an object');
      } catch (e) {
        this.readonly = true;
        this.error = `Không đọc được ${path.basename(file)} (${e.message}). File được giữ nguyên, thay đổi mới sẽ không ghi đè.`;
      }
    }
  }

  save() {
    if (this.readonly) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.delayMs);
  }

  flush() {
    clearTimeout(this.timer); this.timer = null;
    if (this.readonly) return;
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }
}
