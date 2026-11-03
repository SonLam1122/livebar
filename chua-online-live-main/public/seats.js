// Seat geometry, shared by the server (who sits where, moves) and the overlay (where to draw).
// Floor trapezoid in the painting: back row just below the altar, front row near the bottom.
// Layout adapted from kentjuno/chanh-dien-online (MIT, © 2026 Kent Juno).
export const FLOOR = { yTop: 1215, yBot: 1845, halfTop: 290, halfBot: 430 };
export const GRID = { 24: [6, 4], 36: [6, 6], 64: [8, 8], 100: [10, 10] };
export const CAPS = [24, 36, 64, 100];
// golden cushions in front of the altar for the top donors
export const VIP_SPOTS = [{ x: 540, y: 1196 }, { x: 405, y: 1188 }, { x: 675, y: 1188 }];
// where people stand to bow at the altar (one spot each, up to 6 at a time)
export const ALTAR_SPOTS = [470, 610, 400, 680, 330, 750].map(x => ({ x, y: 1206 }));

const cache = new Map();
/** Seats of a grid in fill order: front rows first, aisle side first, so a small crowd still looks full on camera. */
export function seatOrder(cap) {
  if (!GRID[cap]) cap = 24;
  if (cache.has(cap)) return cache.get(cap);
  const [cols, rows] = GRID[cap], seats = [];
  for (let r = 0; r < rows; r++) {
    const t = rows === 1 ? .5 : r / (rows - 1);                          // 0 = back row (near the altar)
    const y = FLOOR.yTop + (FLOOR.yBot - FLOOR.yTop) * t;
    const half = FLOOR.halfTop + (FLOOR.halfBot - FLOOR.halfTop) * t;
    const scale = (.26 + .24 * t) * (6 / cols) ** .75;
    const gap = 2 * half / (cols - 1) * .93;
    for (let k = 0; k < cols; k++) {                                     // k grows to the right of the screen
      let u = (k - (cols - 1) / 2) / ((cols - 1) / 2); u = Math.sign(u) * (.14 + .86 * Math.abs(u));   // centre aisle
      seats.push({ x: 540 + u * half, y, scale, r, k, rows, cols, gap });
    }
  }
  seats.sort((a, b) => (b.r - a.r) || (Math.abs(a.x - 540) - Math.abs(b.x - 540)));
  cache.set(cap, seats);
  return seats;
}

/** Index of the seat at row r, column k (or -1). */
export function seatAt(cap, r, k) {
  return seatOrder(cap).findIndex(s => s.r === r && s.k === k);
}
