import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseComment, skinFromText } from '../server/rules.mjs';
import { makeFilter, spokenName, fold } from '../server/text.mjs';
import { GiftTracker, tier } from '../server/gifts.mjs';
import { Temple } from '../server/temple.mjs';
import { toLunar } from '../public/lunar.js';
import { seatOrder, seatAt } from '../public/seats.js';

test('comment intents match whole words, with or without diacritics', () => {
  assert.equal(parseComment('xin xăm').intent, 'fortune');
  assert.equal(parseComment('xin xam di thay').intent, 'fortune');
  assert.equal(parseComment('Gõ mõ').intent, 'mo');
  assert.equal(parseComment('thỉnh chuông').intent, 'bell');
  assert.equal(parseComment('thắp hương').intent, 'incense');
  assert.equal(parseComment('quen bạn mới').intent, 'chat');            // "que" inside a word is not a fortune
  assert.equal(parseComment('về quê ăn tết').intent, 'chat');
  assert.equal(parseComment('hôm nay chuông chùa ngân vang thật là hay').intent, 'chat'); // long sentence, single word
  const p = parseComment('Cầu cho cha mẹ mạnh khỏe');
  assert.equal(p.intent, 'prayer'); assert.match(p.wish, /cha mẹ/);
  assert.equal(parseComment('cầu').intent, 'chat');                    // too short to be a prayer
});

test('outfit words only when the comment is the word itself', () => {
  assert.equal(skinFromText('nữ'), 'woman');
  assert.equal(skinFromText('sư cô'), 'nun');
  assert.equal(skinFromText('Nam mô A Di Đà Phật'), null);
  assert.equal(parseComment('bà').intent, 'skin');
});

test('profanity filter: whole words, no false alarms on everyday words', () => {
  const f = makeFilter(['kenh doi thu']);
  assert.ok(f.isBad('dm may'));
  assert.ok(f.isBad('vcl'));
  assert.ok(f.isBad('xem Kênh Đối Thủ đi'));
  assert.ok(f.isBad('ngu'));
  for (const ok of ['đi cưới', 'buổi live hay quá', 'các bạn ơi', 'đi ngủ thôi', 'con lớn rồi', 'cúp điện']) assert.ok(!f.isBad(ok), ok);
});

test('spoken names drop emoji, handles and number runs', () => {
  assert.equal(spokenName('🌸Minh_An🌸'), 'Minh An');
  assert.equal(spokenName('user8237461'), 'một Phật tử');
  assert.equal(spokenName('Lan 2003'), 'Lan');
  assert.equal(fold('Đà Lạt'), 'da lat');
});

test('gift streaks count every unit exactly once', () => {
  let t = 0; const g = new GiftTracker({ now: () => t, idleMs: 5000 });
  const base = { userId: 'u', giftId: 'rose', groupId: 'g1', streakable: true, diamonds: 1, info: {} };
  assert.equal(g.push({ ...base, repeatCount: 1 }).coinsAdded, 1);
  assert.equal(g.push({ ...base, repeatCount: 3 }).coinsAdded, 2);
  assert.equal(g.push({ ...base, repeatCount: 3 }).coinsAdded, 0);     // duplicate message
  const end = g.push({ ...base, repeatCount: 5, repeatEnd: true });
  assert.equal(end.coinsAdded, 2); assert.equal(end.finished.count, 5);
  assert.equal(g.push({ ...base, repeatCount: 5, repeatEnd: true }).coinsAdded, 0);  // late duplicate end
  // a streak whose end message never arrives is closed by the sweep
  g.push({ ...base, groupId: 'g2', repeatCount: 2 }); t = 6000;
  assert.equal(g.sweep()[0].count, 2);
  assert.deepEqual([tier(1), tier(10), tier(99)], [1, 2, 3]);
});

function rig(extra = {}) {
  let t = 1_000_000; const sent = [], said = [], persisted = { n: 0 };
  const temple = new Temple({ send: m => sent.push(m), say: (s, o) => { said.push(s); return 'k' + said.length; }, now: () => t, random: () => 0,
    onPersist: () => persisted.n++, ...extra });
  return { temple, sent, said, persisted, tick: ms => { t += ms; } };
}

test('demo and simulator activity never reaches the all-time board', () => {
  const { temple, persisted } = rig();
  temple.onChat({ id: 'demo_1', name: 'Bot', demo: true }, 'Nam mô A Di Đà Phật');
  temple.onGift({ userId: 'demo_1', name: 'Bot', demo: true, giftName: 'Hoa', diamonds: 30, repeatCount: 1 });
  assert.equal(Object.keys(temple.allTime).length, 0); assert.equal(persisted.n, 0);
  temple.onGift({ userId: 'real', name: 'An', giftName: 'Hoa', diamonds: 30, repeatCount: 1 });
  assert.equal(temple.allTime.real.coins, 30); assert.ok(persisted.n > 0);
});

test('comment merit has a cooldown, likes are capped per minute', () => {
  const { temple, tick } = rig();
  const w = { id: 'a', name: 'An' };
  temple.onChat(w, 'chào'); temple.onChat(w, 'chào'); temple.onChat(w, 'chào');
  assert.equal(temple.board.get('a').merit, 1);
  tick(11_000); temple.onChat(w, 'chào'); assert.equal(temple.board.get('a').merit, 2);
  temple.onLike(w, 50); temple.flushLikes();
  assert.equal(temple.board.get('a').merit, 2 + 15);
});

test('milestones: a burst fires once, at the highest step crossed', () => {
  const { temple, sent } = rig();
  temple.onGift({ userId: 'r', name: 'R', giftName: 'Lớn', diamonds: 120, repeatCount: 1 });   // 1200 merit
  const ms = sent.filter(m => m.t === 'milestone');
  assert.equal(ms.length, 1); assert.equal(ms[0].value, 1000);
  temple.onGift({ userId: 'r', name: 'R', giftName: 'Nhỏ', diamonds: 1, repeatCount: 1 });
  assert.equal(sent.filter(m => m.t === 'milestone').length, 1);
});

test('fortune: free draws have a per-person cooldown, gift draws jump the queue', () => {
  const { temple, sent, tick } = rig();
  temple.onChat({ id: 'a', name: 'A' }, 'xin xăm');      // drawn now
  temple.onChat({ id: 'b', name: 'B' }, 'xin xăm');      // queued
  temple.onChat({ id: 'a', name: 'A' }, 'xin xăm');      // cooldown: ignored
  temple.onGift({ userId: 'c', name: 'C', giftName: 'Sen', diamonds: 30, repeatCount: 1 });   // queued ahead of B
  assert.deepEqual(temple.fortuneQ.map(q => q.id), ['c', 'b']);
  assert.equal(sent.filter(m => m.t === 'fortune').length, 1);
  tick(60_000); temple.pumpFortune();
  assert.equal(sent.filter(m => m.t === 'fortune').at(-1).id, 'c');
  clearTimeout(temple.fortuneTimer);
});

test('fortune mode "gift" ignores free comments', () => {
  const { temple, sent } = rig({ settings: { fortuneMode: 'gift' } });
  temple.onChat({ id: 'a', name: 'A' }, 'xin xăm');
  assert.equal(sent.filter(m => m.t === 'fortune').length, 0);
  assert.ok(sent.some(m => m.t === 'notice'));
});

test('prayers wait for approval; bad words are never shown or read', () => {
  const { temple, sent, said } = rig();
  temple.onChat({ id: 'a', name: 'An' }, 'cầu cho bà ngoại mau khỏe');
  assert.equal(temple.prayers.length, 1); assert.ok(!sent.some(m => m.t === 'prayer'));
  temple.moderate(temple.prayers[0].id, true);
  assert.ok(sent.some(m => m.t === 'prayer' && m.wish.includes('bà ngoại')));
  assert.ok(said.some(s => s.includes('bà ngoại')));
  const before = sent.length;
  temple.onChat({ id: 'b', name: 'Bình' }, 'dm vcl');
  assert.ok(!sent.slice(before).some(m => m.t === 'chat'));
});

test('a gift reads the giver\'s recent wish only if it is clean', () => {
  const { temple, said } = rig();
  temple.onChat({ id: 'a', name: 'An' }, 'mong mẹ con mạnh khỏe');
  temple.onGift({ userId: 'a', name: 'An', giftName: 'Hoa hồng', diamonds: 1, repeatCount: 1 });
  assert.ok(said.at(-1).includes('mong mẹ con mạnh khỏe'));
  assert.ok(said.at(-1).includes('An thành tâm dâng Hoa hồng'));
});

test('a full hall frees the seat of a quiet non-donor, never a donor', () => {
  const { temple, tick } = rig({ settings: { seatMode: '24' } });
  temple.onGift({ userId: 'donor', name: 'D', giftName: 'Hoa', diamonds: 1, repeatCount: 1 });
  for (let i = 0; i < 23; i++) { tick(10); temple.onChat({ id: 'v' + i, name: 'V' + i }, 'chào'); }
  tick(10); temple.onChat({ id: 'new', name: 'New' }, 'chào');
  assert.equal(temple.viewers.size, 24);
  assert.ok(temple.viewers.has('donor')); assert.ok(temple.viewers.has('new')); assert.ok(!temple.viewers.has('v0'));
});

test('settings only accept known keys and sane values', () => {
  const { temple } = rig();
  temple.applySettings({ pitch: 999, voice: 'evil', fortuneMode: 'x', __proto__: { polluted: 1 }, unknown: 1, title: '<b>Chùa</b>' });
  assert.equal(temple.settings.pitch, 50);
  assert.equal(temple.settings.voice, 'vi-VN-NamMinhNeural');
  assert.equal(temple.settings.fortuneMode, 'all');
  assert.equal(temple.settings.unknown, undefined);
  assert.equal(({}).polluted, undefined);
});

test('moving commands, and words they must not be confused with', () => {
  assert.deepEqual(parseComment('sang trái'), { intent: 'move', dir: 'left' });
  assert.deepEqual(parseComment('qua phai di'), { intent: 'move', dir: 'right' });
  assert.deepEqual(parseComment('lên'), { intent: 'move', dir: 'up' });
  assert.deepEqual(parseComment('xuống dưới'), { intent: 'move', dir: 'down' });
  assert.equal(parseComment('kinh hành').intent, 'walk');
  assert.equal(parseComment('đi dạo một vòng').intent, 'walk');
  assert.equal(parseComment('lên lạy Phật').intent, 'altar');
  assert.equal(parseComment('lạy Phật').intent, 'bow');
  assert.equal(parseComment('trai').intent, 'skin');                 // outfit word, not "trái"
  assert.equal(parseComment('phải không').intent, 'chat');
  assert.equal(parseComment('hôm qua mình đi sang trái đường bị lạc').intent, 'chat');
});

test('seats belong to the server: stable when others leave, freed seats are reused', () => {
  const { temple } = rig();
  for (const id of ['a', 'b', 'c']) temple.onChat({ id, name: id }, 'chào');
  assert.deepEqual(['a', 'b', 'c'].map(id => temple.viewers.get(id).slot), [0, 1, 2]);
  temple.unseat('b');
  assert.equal(temple.viewers.get('c').slot, 2);
  temple.onChat({ id: 'd', name: 'd' }, 'chào');
  assert.equal(temple.viewers.get('d').slot, 1);
});

test('moving: to the nearest free cushion in that direction, never onto someone', () => {
  const { temple, sent, tick } = rig();
  temple.onChat({ id: 'a', name: 'A' }, 'chào');                     // slot 0: front row, next to the aisle
  const s0 = seatOrder(24)[0];
  temple.onChat({ id: 'a', name: 'A' }, 'lên');
  const s1 = seatOrder(24)[temple.viewers.get('a').slot];
  assert.equal(s1.r, s0.r - 1); assert.equal(s1.k, s0.k);
  assert.ok(sent.some(m => m.t === 'seat' && m.id === 'a'));
  // someone sits right above: moving up again skips over them
  const above = seatAt(24, s1.r - 1, s1.k);
  temple.onChat({ id: 'b', name: 'B' }, 'chào');
  temple.slots.delete(temple.viewers.get('b').slot); temple.viewers.get('b').slot = above; temple.slots.set(above, 'b');
  tick(4000); temple.onChat({ id: 'a', name: 'A' }, 'lên');
  const s2 = seatOrder(24)[temple.viewers.get('a').slot];
  assert.equal(s2.r, s1.r - 2);
  // too soon: ignored
  const slot = temple.viewers.get('a').slot; temple.onChat({ id: 'a', name: 'A' }, 'xuống');
  assert.equal(temple.viewers.get('a').slot, slot);
});

test('kinh hành: at most 6 walkers at once, then a cooldown per person', () => {
  const { temple, sent, tick } = rig();
  for (let i = 0; i < 8; i++) temple.onChat({ id: 'w' + i, name: 'W' + i }, 'kinh hành');
  assert.equal(sent.filter(m => m.t === 'walk').length, 6);
  tick(20_000);
  temple.onChat({ id: 'w0', name: 'W0' }, 'kinh hành');               // still cooling down
  temple.onChat({ id: 'w7', name: 'W7' }, 'kinh hành');               // was refused before, can go now
  assert.deepEqual(sent.filter(m => m.t === 'walk').slice(6).map(m => m.id), ['w7']);
});

test('golden cushions: top 3 donors, and a big gift sends the giver to bow at the altar', () => {
  const { temple, sent } = rig();
  const give = (id, d) => temple.onGift({ userId: id, name: id, giftName: 'Quà', diamonds: d, repeatCount: 1 });
  give('a', 10); give('b', 30); give('c', 20); give('d', 15);
  assert.deepEqual(temple.vip, ['b', 'c', 'd']);
  assert.deepEqual(sent.filter(m => m.t === 'vip').at(-1).ids, ['b', 'c', 'd']);
  // a donor on a golden cushion ignores move commands
  const slot = temple.viewers.get('b').slot; temple.onChat({ id: 'b', name: 'b' }, 'sang trái');
  assert.equal(temple.viewers.get('b').slot, slot);
  // 12 coins: not enough for top 3, so 'e' walks up to the altar instead
  give('e', 12);
  assert.ok(sent.some(m => m.t === 'walk' && m.id === 'e' && m.kind === 'altar'));
});

test('the hall grows 24 → 36 and everyone is re-packed in order', () => {
  const { temple, sent } = rig();
  for (let i = 0; i < 25; i++) temple.onChat({ id: 'v' + i, name: 'V' + i }, 'chào');
  const msg = sent.find(m => m.t === 'slots');
  assert.equal(msg.cap, 36);
  assert.equal(temple.viewers.get('v24').slot, 24);
  assert.equal(new Set([...temple.viewers.values()].map(v => v.slot)).size, 25);
});

test('lunar calendar: known Tết days and a leap month', () => {
  assert.deepEqual(toLunar(17, 2, 2026), { day: 1, month: 1, year: 2026, leap: false });
  assert.deepEqual(toLunar(29, 1, 2025), { day: 1, month: 1, year: 2025, leap: false });
  assert.deepEqual(toLunar(22, 3, 2023), { day: 1, month: 2, year: 2023, leap: true });
  assert.deepEqual(toLunar(10, 2, 2024), { day: 1, month: 1, year: 2024, leap: false });
});
