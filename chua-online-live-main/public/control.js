// Control panel: talks to the server over the control WebSocket. Everything shown is rendered as text.
const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
// admin key (only needed when the server runs with ADMIN_TOKEN): keep it out of the address bar
if (qs.has('key')) { try { sessionStorage.setItem('key', qs.get('key')); } catch {} qs.delete('key'); history.replaceState(null, '', location.pathname + (qs.size ? '?' + qs : '')); }
let KEY = ''; try { KEY = sessionStorage.getItem('key') || ''; } catch {}

const ovUrl = `${location.origin}/overlay.html`;
$('ovUrl').textContent = ovUrl;
let ws = null, settings = {};
function send(cmd, extra = {}) { if (ws?.readyState === 1) ws.send(JSON.stringify({ t: 'ctl', cmd, ...extra })); }

function connect() {
  ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?role=control${KEY ? '&key=' + encodeURIComponent(KEY) : ''}`);
  ws.onclose = e => {
    if (e.code === 4001) { addLog('Sai hoặc thiếu khóa quản trị. Mở lại trang với ?key=… đúng ADMIN_TOKEN.'); return; }
    setStatus({ status: 'server', error: 'mất kết nối server… đang thử lại' }); setTimeout(connect, 2000);
  };
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    switch (m.t) {
      case 'state': settings = m.settings; fillSettings(); showStats(m.stats, m.viewers.length, m.cap); break;
      case 'settings': settings = m.settings; fillSettings(); break;
      case 'board': showStats(m.stats); break;
      case 'tiktok': setStatus(m); break;
      case 'logs': $('log').textContent = ''; m.lines.forEach(addLog); break;
      case 'log': addLog(m.line); break;
      case 'moderation': renderPrayers(m.prayers); break;
      case 'bots': $('btnBots').textContent = m.on ? 'Tắt bot' : 'Bật bot'; $('btnBots').classList.toggle('on', m.on); $('btnBots').dataset.on = m.on ? '1' : ''; break;
    }
  };
}
connect();

function addLog(line) { const el = $('log'); const stick = el.scrollTop + el.clientHeight >= el.scrollHeight - 20; el.append(line + '\n'); if (el.childNodes.length > 400) el.firstChild.remove(); if (stick) el.scrollTop = el.scrollHeight; }
const STATUS = { idle: 'chưa kết nối TikTok', connecting: 'đang kết nối…', connected: 'đang nhận sự kiện', retrying: 'đang thử lại', error: 'lỗi kết nối', ended: 'buổi live đã kết thúc', server: 'mất server' };
function setStatus(st) {
  const el = $('status'); el.className = st.status || '';
  el.textContent = (st.uniqueId ? '@' + st.uniqueId + ' · ' : '') + (STATUS[st.status] || st.status) + (st.error ? ' — ' + st.error : '');
  // no test characters while a real room is live (the server refuses them too)
  const live = st.status === 'connected';
  document.querySelectorAll('[data-fill], #btnBots').forEach(b => { b.disabled = live; b.title = live ? 'Đang live thật: ngắt kết nối TikTok trước khi thử' : ''; });
}
let lastStats = {};
function showStats(s = lastStats, seated, cap) {
  lastStats = s;
  $('stats').textContent = `♥ ${s.likes?.toLocaleString('vi-VN') ?? 0} · công đức ${s.merit?.toLocaleString('vi-VN') ?? 0} · quà ${s.gifts ?? 0} xu · xem ${s.viewers ?? 0}` + (seated != null ? ` · ngồi ${seated}/${cap}` : '');
}

/* ---- settings form ---- */
const fields = [...document.querySelectorAll('#settings [data-k]')];
let editing = false;
document.getElementById('settings').addEventListener('input', () => { editing = true; $('saved').textContent = 'chưa lưu'; });
function fillSettings() {
  if (editing) return;
  for (const el of fields) { const v = settings[el.dataset.k]; if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? ''; }
}
$('btnSave').onclick = () => {
  const out = {};
  for (const el of fields) out[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? +el.value : el.value;
  editing = false; send('settings', { settings: out }); $('saved').textContent = 'đã lưu';
};

/* ---- prayers ---- */
function renderPrayers(list) {
  const box = $('prayers'); box.replaceChildren();
  $('pCount').textContent = list.length ? `(${list.length} chờ duyệt)` : '';
  if (!list.length) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Chưa có lời nguyện nào chờ duyệt.'; box.append(p); return; }
  for (const p of list.slice().reverse()) {
    const d = document.createElement('div'); d.className = 'prayer';
    const b = document.createElement('b'); b.textContent = p.name + (p.demo ? ' (thử)' : '');
    const t = document.createElement('p'); t.textContent = p.wish;
    const ok = document.createElement('button'); ok.className = 'primary'; ok.textContent = 'Duyệt & thả đèn'; ok.onclick = () => send('prayer', { id: p.id, approve: true });
    const no = document.createElement('button'); no.textContent = 'Ẩn'; no.onclick = () => send('prayer', { id: p.id, approve: false });
    const row = document.createElement('div'); row.className = 'row'; row.append(ok, no);
    d.append(b, t, row); box.append(d);
  }
}

/* ---- buttons ---- */
$('btnConnect').onclick = () => send('connect', { uniqueId: $('uid').value });
$('uid').onkeydown = e => { if (e.key === 'Enter') $('btnConnect').click(); };
$('btnDisconnect').onclick = () => send('disconnect');
$('btnOverlay').onclick = () => window.open('/overlay.html', 'overlay', 'width=540,height=960');
$('btnPreview').onclick = () => window.open('/overlay.html?audio=0', 'preview', 'width=405,height=720');
const simName = () => $('simName').value;
$('btnChat').onclick = () => send('sim', { kind: 'chat', name: simName(), text: $('simText').value });
$('simText').onkeydown = e => { if (e.key === 'Enter') $('btnChat').click(); };
document.querySelectorAll('[data-say]').forEach(b => b.onclick = () => send('sim', { kind: 'chat', name: simName(), text: b.dataset.say }));
document.querySelectorAll('[data-sim]').forEach(b => b.onclick = () => send('sim', { kind: b.dataset.sim, name: simName(), count: 10 }));
document.querySelectorAll('[data-gift]').forEach(b => b.onclick = () => send('sim', { kind: 'gift', name: simName(), gift: b.dataset.gift, diamonds: +b.dataset.dia, count: 1 }));
$('btnViewers').onclick = () => send('sim', { kind: 'viewers', count: +$('simViewers').value });
document.querySelectorAll('[data-fill]').forEach(b => b.onclick = () => send('fill', { n: +b.dataset.fill }));
$('btnClear').onclick = () => send('clear');
$('btnBots').onclick = () => send('bots', { on: !$('btnBots').dataset.on, n: +$('botN').value, pace: $('botPace').value });
$('btnSay').onclick = () => { const text = $('sayText').value.trim(); if (text) { send('say', { text }); $('sayText').value = ''; } };
$('btnChant').onclick = () => send('chant');
$('btnBell').onclick = () => send('bell');
$('btnMo').onclick = () => send('mo');
$('btnNewSession').onclick = () => { if (confirm('Bắt đầu buổi mới? Bảng công đức của buổi và các mốc sẽ đặt lại (công đức trọn đời vẫn giữ).')) send('newSession'); };
$('btnResetAll').onclick = () => { send('resetAllTime', { confirm: $('resetConfirm').value.trim() }); $('resetConfirm').value = ''; };
