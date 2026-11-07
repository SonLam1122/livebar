// Gift streaks. A streakable TikTok gift (gift.type === 1) arrives as a run of messages whose repeatCount
// grows 1, 2, 3 … and ends with repeatEnd = 1. Counting each message would multiply the value, counting only
// the last one feels laggy. We count the delta of every message right away (exactly once) and report the
// streak "finished" on repeatEnd, or when it has gone quiet for `idleMs` in case the end message is lost.

export function tier(coins) {
  return coins >= 99 ? 3 : coins >= 10 ? 2 : 1;
}

export class GiftTracker {
  constructor({ idleMs = 6000, now = Date.now } = {}) {
    this.idleMs = idleMs; this.now = now;
    this.open = new Map();      // key -> { count, diamonds, last, info }
    this.done = new Map();      // key -> finished at (late duplicates are ignored)
  }

  /**
   * @param {{ userId:string, giftId:string, groupId?:string, streakable:boolean, repeatCount:number, repeatEnd:boolean, diamonds:number, info:any }} g
   * @returns {{ added:number, coinsAdded:number, finished?: { count:number, coins:number, info:any } }}
   */
  push(g) {
    const t = this.now();
    const count = Math.max(1, Math.min(9999, Math.floor(+g.repeatCount || 1)));
    const diamonds = Math.max(1, Math.min(100000, Math.floor(+g.diamonds || 1)));
    if (!g.streakable) {
      return { added: count, coinsAdded: count * diamonds, finished: { count, coins: count * diamonds, info: g.info } };
    }
    const key = `${g.userId}|${g.giftId}|${g.groupId || ''}`;
    if (this.done.has(key)) return { added: 0, coinsAdded: 0 };
    let s = this.open.get(key);
    if (!s) { s = { count: 0, diamonds, last: t, info: g.info }; this.open.set(key, s); }
    const added = Math.max(0, count - s.count);
    s.count = Math.max(s.count, count); s.last = t; s.info = g.info;
    const out = { added, coinsAdded: added * diamonds };
    if (g.repeatEnd) out.finished = this.#finish(key, s);
    return out;
  }

  /** Close streaks that went quiet. Returns the ones finished now. */
  sweep() {
    const t = this.now(), out = [];
    for (const [key, s] of this.open) if (t - s.last >= this.idleMs) out.push(this.#finish(key, s));
    for (const [key, at] of this.done) if (t - at > 60_000) this.done.delete(key);
    return out;
  }

  #finish(key, s) {
    this.open.delete(key); this.done.set(key, this.now());
    return { count: s.count, coins: s.count * s.diamonds, info: s.info };
  }
}
