// =========================================================================
// DASHBOARD RULES MANAGER & SIMULATOR FIRES
// =========================================================================

let lastSimulatedEvent = null;

// =========================================================================
// LIVE BAR — BẢNG QUÀ BẤM-1-NÚT (chọn hiệu ứng cho từng món quà TikTok)
// =========================================================================
const LIVEBAR_EFFECTS = [
  { v: '',          label: '(Mặc định: quà to tự spotlight)' },
  { v: 'floor',     label: '🚶 Chỉ vào sàn (không hiệu ứng)' },
  { v: 'spotlight', label: '⭐ Spotlight VIP + Vương miện' },
  { v: 'wing',      label: '🪽 Cánh thần thoại' },
  { v: 'skin',      label: '👑 Hóa thân skin VIP' },
  { v: 'jump',      label: '💃 Nhảy tưng bừng' },
  { v: 'dj_avatar', label: '🎁 Avatar lên màn LED (2 phút)' },
  // --- Kết hợp với Spotlight ---
  { v: 'spotlight+skin',      label: '⭐➕👑 Spotlight + Hóa thân VIP' },
  { v: 'spotlight+wing',      label: '⭐➕🪽 Spotlight + Cánh' },
  { v: 'spotlight+jump',      label: '⭐➕💃 Spotlight + Nhảy' },
  { v: 'spotlight+dj_avatar', label: '⭐➕🎁 Spotlight + Avatar màn LED' },
  { v: 'spotlight+skin+wing',           label: '⭐➕👑➕🪽 Spotlight + VIP + Cánh' },
  { v: 'spotlight+skin+wing+jump',      label: '⭐➕👑➕🪽➕💃 Spotlight + VIP + Cánh + Nhảy' },
  { v: 'spotlight+skin+wing+jump+dj_avatar', label: '🌟 TẤT CẢ (Spotlight+VIP+Cánh+Nhảy+Avatar LED)' },
];
// Mọi giá trị hiệu ứng (gồm cả combo) để nhận biết & thay thế luật của một món quà
const LIVEBAR_SPECIAL = LIVEBAR_EFFECTS.filter(e => e.v).map(e => e.v);
let _giftPresetCache = null;

// Đặt/huỷ hiệu ứng cho một món quà (upsert vào screenConfig.mappings), tự lưu.
function setLiveBarGiftEffect(giftName, giftId, action) {
  if (!screenConfig.mappings) screenConfig.mappings = [];
  // Bỏ luật cũ của đúng món quà này (chỉ các hiệu ứng đặc biệt), giữ nguyên luật khác
  screenConfig.mappings = screenConfig.mappings.filter(
    m => !(m.trigger === 'gift' && m.giftName === giftName && LIVEBAR_SPECIAL.includes(m.action))
  );
  if (action) {
    screenConfig.mappings.push({ trigger: 'gift', giftName, giftId, action, points: 1, enabled: true });
  }
  saveCurrentConfig();
  if (typeof showSimActionFeedback === 'function') {
    const lbl = (LIVEBAR_EFFECTS.find(e => e.v === action) || {}).label || 'Chỉ vào sàn';
    showSimActionFeedback(`✅ ${giftName} → ${lbl}`);
  }
  renderRulesList();
}

function renderLiveBarGiftTable(container) {
  // Dùng CHUNG danh sách với Phòng thử (GIFT_CATALOG) nên tên quà luôn khớp luật.
  const gifts = (typeof GIFT_CATALOG !== 'undefined' ? GIFT_CATALOG : []).slice()
    .sort((a, b) => (a.diamonds || 0) - (b.diamonds || 0));
  if (gifts.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">Chưa có danh sách quà.</div>';
    return;
  }
  const maps = screenConfig?.mappings || [];
  const curOf = (name) => (maps.find(m => m.trigger === 'gift' && m.giftName === name && LIVEBAR_SPECIAL.includes(m.action)) || {}).action || '';

  const rows = gifts.map((g, idx) => {
    const cur = curOf(g.name);
    const opts = LIVEBAR_EFFECTS.map(e => `<option value="${e.v}" ${e.v === cur ? 'selected' : ''}>${e.label}</option>`).join('');
    const active = cur ? 'border-pink-500/50' : 'border-slate-800/90';
    return `
      <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/80 border ${active} transition-all">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-9 h-9 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-xl">${g.emoji || '🎁'}</span>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-100 truncate">${g.name}</div>
            <div class="text-[10px] font-semibold text-amber-300/90">💎 ${g.diamonds || 1}</div>
          </div>
        </div>
        <select data-idx="${idx}" class="livebar-gift-effect shrink-0 text-xs font-semibold bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-pink-500 cursor-pointer">
          ${opts}
        </select>
      </div>`;
  }).join('');

  const djPassive = screenConfig?.djAvatarPassive !== false;
  container.innerHTML = `
    <label class="mb-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border ${djPassive ? 'border-amber-500/50' : 'border-slate-800/90'} cursor-pointer transition-all">
      <span class="text-xs font-semibold text-slate-200">👑 Bị động — Avatar Đại gia / Ông hoàng / Bà chúa lên màn LED
        <span class="block text-[10px] text-slate-400 font-normal mt-0.5">Khi rảnh (không có lượt donate avatar) hiện người đứng đầu; không có thì về màn mặc định.</span>
      </span>
      <input type="checkbox" id="lb-dj-passive" ${djPassive ? 'checked' : ''} class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 shrink-0">
    </label>
    <div class="mb-3 text-xs text-slate-400">Mỗi món quà chọn <b class="text-slate-200">1 hiệu ứng</b> ở ô bên phải — tự lưu ngay. Muốn donate quà nào hiện avatar lên màn LED thì chọn <b class="text-slate-200">🎁 Avatar lên màn LED</b>.</div>
    <div class="grid sm:grid-cols-2 gap-2.5">${rows}</div>
  `;

  const djToggle = container.querySelector('#lb-dj-passive');
  if (djToggle) djToggle.addEventListener('change', () => {
    screenConfig.djAvatarPassive = djToggle.checked;
    saveCurrentConfig();
    if (typeof showSimActionFeedback === 'function') showSimActionFeedback(djToggle.checked ? '✅ Bật avatar Đại gia/Ông hoàng/Bà chúa' : '⛔ Tắt avatar bị động');
    renderRulesList();
  });

  container.querySelectorAll('.livebar-gift-effect').forEach(sel => {
    sel.addEventListener('change', () => {
      const g = gifts[+sel.dataset.idx];
      if (g) setLiveBarGiftEffect(g.name, '', sel.value);
    });
  });
}

function getRuleTriggerDetails(r) {
  const trig = r.trigger || '';
  if ((trig === 'comment' || trig === 'chat') && r.keyword && r.keyword !== 'all') {
    return { icon: '💬', title: `Gõ "${r.keyword}"`, badge: `💬 Gõ "${r.keyword}"` };
  }
  if (trig === 'comment' || trig === 'comment_any' || trig === 'chat_any') {
    return { icon: '💬', title: 'Mọi bình luận', badge: '💬 Mọi bình luận' };
  }
  if (trig === 'like') {
    return { icon: '❤️', title: `Thả ${r.minCount || 10} tim`, badge: `❤️ Thả ${r.minCount || 10} tim` };
  }
  if (trig === 'like_any') {
    return { icon: '❤️', title: 'Thả tim', badge: '❤️ Thả tim' };
  }
  if (trig === 'share') {
    return { icon: '↗', title: 'Chia sẻ live', badge: '↗ Chia sẻ live' };
  }
  if (trig === 'follow') {
    return { icon: '➕', title: 'Follow kênh', badge: '➕ Follow kênh' };
  }
  if (trig === 'join' || trig === 'user_join' || trig === 'enter') {
    return { icon: '👋', title: 'Tham gia live', badge: '👋 Tham gia live' };
  }
  if (trig === 'gift' || trig === 'gift_any') {
    if (!r.giftName && (!r.gift || r.gift === 'all' || r.giftId === 'all')) {
      return { icon: '🎁', title: 'Mọi loại quà', badge: '🎁 Mọi loại quà' };
    }
    const gName = r.giftName || r.gift || 'Mọi loại quà';
    return { icon: '🎁', title: `Tặng ${gName}`, badge: `🎁 Tặng ${gName}` };
  }
  return { icon: '⚡', title: trig || 'Sự kiện', badge: `⚡ ${trig || 'Sự kiện'}` };
}

function renderRulesAddButtons(gType) {
  const container = document.getElementById('rules-add-buttons-container');
  if (!container) return;

  if (gType === 'video_react') {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Thêm luật</span>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="gift" data-action="play_video">
        <span>🎁</span> <span>Theo món quà</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="gift_any" data-action="play_video">
        <span>🎁</span> <span>Mọi món quà</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment" data-action="play_video">
        <span>💬</span> <span>Theo bình luận</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="like" data-action="play_video">
        <span>❤️</span> <span>Theo thả tim</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="follow" data-action="play_video">
        <span>➕</span> <span>Khi follow</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="share" data-action="play_video">
        <span>🔁</span> <span>Khi chia sẻ</span>
      </button>
    `;

    container.querySelectorAll('.btn-add-rule-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const trig = btn.getAttribute('data-trigger');
        const act = btn.getAttribute('data-action');
        if (!screenConfig.mappings) screenConfig.mappings = [];
        const firstKey = screenConfig?.template?.actions?.[0]?.key || 'cat_1';
        let newRule = { trigger: trig, giftId: 'all', action: act, videoKey: firstKey, points: 1, enabled: true };
        if (trig === 'gift') { newRule.giftName = 'Hoa Hồng'; newRule.giftId = 5655; }
        if (trig === 'comment') { newRule.keyword = '1'; }
        if (trig === 'like') { newRule.minCount = 15; }
        screenConfig.mappings.push(newRule);
        renderRulesList();
        renderSimRulesButtons();
        if (typeof renderVideoReactClips === 'function') renderVideoReactClips();
        saveCurrentConfig();
        showSimActionFeedback(`✅ Đã thêm luật chuyển động video mới!`);
      });
    });
  } else if (gType === 'receipt_printer') {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Thêm luật</span>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="gift" data-action="print_receipt">
        <span>🎁</span> <span>In theo món quà</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="gift_any" data-action="print_receipt">
        <span>🧾</span> <span>In mọi món quà</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="join" data-action="print_receipt">
        <span>👋</span> <span>In khi vào live</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment_any" data-action="print_receipt">
        <span>💬</span> <span>In mọi bình luận</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="like" data-action="print_receipt">
        <span>❤️</span> <span>In theo mốc tim</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="follow" data-action="print_receipt">
        <span>➕</span> <span>In khi follow</span>
      </button>
      <button class="btn-add-rule-action px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="share" data-action="print_receipt">
        <span>↗</span> <span>In khi chia sẻ</span>
      </button>
    `;

    container.querySelectorAll('.btn-add-rule-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const trig = btn.getAttribute('data-trigger');
        const act = btn.getAttribute('data-action');
        if (!screenConfig.mappings) screenConfig.mappings = [];
        let newRule = { trigger: trig, giftId: 'all', action: act, style: 'classic', label: '🧾 In bảng tên kiểu Cổ điển', points: 1, enabled: true };
        screenConfig.mappings.push(newRule);
        renderRulesList();
        renderSimRulesButtons();
        saveCurrentConfig();
        showSimActionFeedback(`✅ Đã thêm luật in phiếu mới!`);
      });
    });
  } else if (gType === 'chainsaw_clash') {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Thêm luật</span>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="spawn">
        <span>🪚</span> <span>Thả lưỡi cưa</span>
      </button>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="heal">
        <span>❤️</span> <span>Cộng máu</span>
      </button>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="shield">
        <span>🛡️</span> <span>Cho khiên</span>
      </button>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="glow">
        <span>✨</span> <span>Phát sáng</span>
      </button>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="chaos">
        <span>🌀</span> <span>Biến cố</span>
      </button>
      <button class="btn-add-rule-action px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-action="score">
        <span>⭐</span> <span>Cộng điểm</span>
      </button>
    `;

    container.querySelectorAll('.btn-add-rule-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.getAttribute('data-action');
        openAddRuleModalWithAction(act);
      });
    });
  } else if (gType === 'di_chua') {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Thêm luật</span>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="gift" data-action="speak_dedication" data-label="Xướng tên hồi hướng công đức" data-merit="10">
        <span>🎁</span> <span>Tặng quà hồi hướng</span>
      </button>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment" data-keyword="xin xăm" data-action="draw_fortune" data-label="Rút thẻ xăm an lạc" data-merit="5">
        <span>📜</span> <span>Gõ xin xăm</span>
      </button>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment" data-keyword="gõ mõ" data-action="ritual_mo" data-label="Gõ mõ tụng kinh" data-merit="3">
        <span>🪵</span> <span>Gõ mõ</span>
      </button>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment" data-keyword="thỉnh chuông" data-action="ritual_bell" data-label="Thỉnh chuông thanh tịnh" data-merit="3">
        <span>🔔</span> <span>Thỉnh chuông</span>
      </button>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="comment" data-keyword="lạy Phật" data-action="ritual_bow" data-label="Quỳ lạy sám hối" data-merit="3">
        <span>🙏</span> <span>Lạy Phật</span>
      </button>
      <button class="btn-add-rule-chua px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer" data-trigger="like" data-action="like_merit" data-label="Thả tim tích công đức" data-merit="1">
        <span>💗</span> <span>Thả tim</span>
      </button>
    `;

    container.querySelectorAll('.btn-add-rule-chua').forEach(btn => {
      btn.addEventListener('click', () => {
        const trig = btn.getAttribute('data-trigger');
        const act = btn.getAttribute('data-action');
        const lbl = btn.getAttribute('data-label');
        const merit = Number(btn.getAttribute('data-merit') || 1);
        const kw = btn.getAttribute('data-keyword');
        if (!screenConfig.rules) screenConfig.rules = [];
        const newRule = { trigger: trig, action: act, label: lbl, merit, enabled: true };
        if (kw) newRule.keyword = kw;
        if (trig === 'gift') { newRule.giftId = 'all'; newRule.giftName = 'Mọi loại quà'; }
        screenConfig.rules.push(newRule);
        renderRulesList();
        saveCurrentConfig();
        showSimActionFeedback(`✅ Đã thêm luật: ${lbl}`);
      });
    });
  } else if (gType === 'live_bar') {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-pink-300">🎁 Bảng quà → hiệu ứng</span>
      <span class="text-xs text-slate-400">Chọn hiệu ứng cho từng món quà ở bảng bên dưới. Tự lưu ngay, không cần mở bảng phụ.</span>
    `;
  } else {
    container.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">THÊM LUẬT</span>
      <button id="btn-add-rule-gift" class="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer">
        <span>+</span> <span>🎁</span> <span>Theo món quà</span>
      </button>
      <button id="btn-add-rule-comment" class="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer">
        <span>+</span> <span>💬</span> <span>Theo bình luận</span>
      </button>
      <button id="btn-add-rule-like" class="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer">
        <span>+</span> <span>💗</span> <span>Theo thả tim</span>
      </button>
    `;

    document.getElementById('btn-add-rule-gift')?.addEventListener('click', () => openAddRuleModal('gift'));
    document.getElementById('btn-add-rule-comment')?.addEventListener('click', () => openAddRuleModal('comment'));
    document.getElementById('btn-add-rule-like')?.addEventListener('click', () => openAddRuleModal('like'));
  }
}

function openAddRuleModalWithAction(action) {
  if (!screenConfig.mappings) screenConfig.mappings = [];
  let newRule = { trigger: 'gift_any', giftId: 'all', action: action, points: 1, enabled: true };
  if (action === 'heal') newRule.points = 60;
  screenConfig.mappings.push(newRule);
  renderRulesList();
  renderSimRulesButtons();
  saveCurrentConfig();
  showSimActionFeedback(`✅ Đã thêm luật mới: ${action}`);
}

function getRuleActionTarget(r, sCfg, gType) {
  const act = r.action || '';
  if (gType === 'football_duel' || gType === 'army_clash' || gType === 'team_battle') {
    const isTeam2 = act.includes('1') || act.includes('2') || act === 'boost_team_1' || act === 'boost_team_2' || act === 'join_army_2';
    const teamIdx = act === 'boost_team_1' || act === 'boost_team_2' || act === 'join_army_2' ? 1 : 0;
    const team = sCfg?.teams?.[teamIdx];
    const teamName = team?.name || (teamIdx === 1 ? 'PHE HỒNG' : 'PHE XANH');
    const teamEmoji = team?.emoji || (teamIdx === 1 ? '💖' : '💙');
    if (act === 'summon_hero' || act === 'army_hero') return `🐉 Triệu hồi Tướng ${teamName}`;
    return `${teamEmoji} ${teamName}`;
  }
  if (gType === 'vote_tank') {
    const isTank2 = act.includes('2') || act === 'boost_team_2';
    return `🗳️ Bình chọn ${isTank2 ? 'Bình 2' : 'Bình 1'}`;
  }
  if (gType === 'fish_tank') {
    if (act === 'spawn_fish' || act === 'spawn') return '🐟 Thả cá mới';
    if (act === 'feed_fish' || act === 'feed') return '🍤 Thả thức ăn';
    if (act === 'grow_fish' || act === 'grow') return '✨ Phát sáng & lớn nhanh';
    return '🐟 Chăm sóc hồ cá';
  }
  if (gType === 'chainsaw_clash') {
    if (act === 'saw_join' || act === 'spawn') return '🪚 Thả lưỡi cưa';
    if (act === 'saw_grow' || act === 'grow' || act === 'heal') return '❤️ Cộng máu';
    if (act === 'shield' || act === 'saw_shield') return '🛡️ Cho khiên';
    if (act === 'glow' || act === 'saw_glow') return '✨ Phát sáng';
    if (act === 'saw_chaos' || act === 'chaos') return '🌀 Biến cố';
    if (act === 'score' || act === 'add_points') return '⭐ Cộng điểm';
    return '🪚 Đấu trường cưa';
  }
  if (gType === 'video_react') {
    const actItem = sCfg?.template?.actions?.find(a => a.key === r.videoKey);
    const customName = sCfg?.videoNames?.[r.videoKey] || {};
    const label = customName.label || actItem?.label || 'Clip chuyển động';
    const emoji = customName.emoji || actItem?.emoji || '🎬';
    return `${emoji} ${label}`;
  }
  if (gType === 'live_bar') {
    if (act === 'spotlight') return '⭐ Spotlight VIP & Vương miện';
    if (act === 'jump') return '💃 Vũ công nhảy tưng bừng';
    if (act === 'join_bar' || act === 'join') return '🕺 Vào sàn nhảy';
    return '🎉 Sàn nhảy 3D';
  }
  if (gType === 'di_chua') {
    if (act === 'draw_fortune') return '📜 Rút thẻ xăm an lạc';
    if (act === 'ritual_mo') return '🪵 Gõ mõ tụng kinh';
    if (act === 'ritual_bell') return '🔔 Thỉnh chuông thanh tịnh';
    if (act === 'ritual_incense') return '🪷 Dâng hương bàn thờ';
    if (act === 'ritual_bow') return '🙏 Quỳ lạy sám hối';
    if (act === 'pray_lantern') return '🏮 Thả đèn lồng cầu an';
    if (act === 'walk_altar') return '🚶 Đi kinh hành quanh điện';
    if (act === 'join_seat') return '🧎 Ngồi bồ đoàn thiền định';
    if (act === 'like_merit') return '💗 Thả tim tích công đức';
    if (act === 'speak_dedication') return '🎙️ Xướng tên hồi hướng công đức';
    if (act === 'golden_cushion') return '✨ Lên bồ đoàn vàng danh dự';
    if (act === 'thank_follow') return '➕ Tri ân thí chủ theo dõi';
    if (act === 'thank_share') return '↗ Tri ân chia sẻ đạo tràng';
    return r.label || '🛕 Nghi lễ Chánh Điện';
  }
  return act;
}

// ===== BẢNG QUÀ BẤM-1-NÚT DÙNG CHUNG cho các game khác (giống Live Bar) =====
// Upsert 1 luật quà->hành động, bỏ các luật cũ (trong tập managed) của món quà đó.
function setGiftMapping(giftName, action, managed) {
  if (!screenConfig.mappings) screenConfig.mappings = [];
  screenConfig.mappings = screenConfig.mappings.filter(
    m => !(m.trigger === 'gift' && m.giftName === giftName && managed.includes(m.action))
  );
  if (action) screenConfig.mappings.push({ trigger: 'gift', giftName, action, points: 1, enabled: true });
  saveCurrentConfig();
  if (typeof showSimActionFeedback === 'function') showSimActionFeedback('✅ Đã cập nhật luật quà: ' + giftName);
  renderRulesList();
}

// Danh sách hiệu ứng theo từng game (null nếu game chưa hỗ trợ bảng quà)
function giftEffectsFor(gType) {
  const tName = (i, fb) => (screenConfig?.teams?.[i]?.name) || fb;
  if (gType === 'football_duel' || gType === 'army_clash' || gType === 'team_battle') {
    return [
      { v: '',       label: '— Không tính —' },
      { v: 'team_0', label: '🔵 ' + tName(0, 'Đội 1') },
      { v: 'team_1', label: '🔴 ' + tName(1, 'Đội 2') },
    ];
  }
  if (gType === 'vote_tank') {
    return [
      { v: '',       label: '— Không tính —' },
      { v: 'team_0', label: '🅰️ ' + tName(0, 'Bình 1') },
      { v: 'team_1', label: '🅱️ ' + tName(1, 'Bình 2') },
    ];
  }
  if (gType === 'fish_tank') {
    return [
      { v: '',           label: '— Không tính —' },
      { v: 'spawn_fish', label: '🐟 Thả cá mới' },
      { v: 'feed',       label: '🍤 Cho cá ăn (lớn nhanh)' },
      { v: 'spawn_shark', label: '🦈 Triệu hồi cá mập' },
    ];
  }
  if (gType === 'chainsaw_clash') {
    return [
      { v: '',      label: '— Không tính —' },
      { v: 'spawn', label: '🪚 Thả lưỡi cưa' },
      { v: 'grow',  label: '❤️ Cộng máu lưỡi cưa' },
      { v: 'chaos', label: '🌀 Biến cố hỗn loạn' },
    ];
  }
  if (gType === 'receipt_printer') {
    return [
      { v: '',             label: '🧾 In hóa đơn (mặc định)' },
      { v: 'skip_receipt', label: '🚫 Bỏ qua (không in)' },
    ];
  }
  return null;
}

function renderGameGiftTable(container, effects, note) {
  const gifts = (typeof GIFT_CATALOG !== 'undefined' ? GIFT_CATALOG : []).slice()
    .sort((a, b) => (a.diamonds || 0) - (b.diamonds || 0));
  const managed = effects.filter(e => e.v).map(e => e.v);
  const maps = screenConfig?.mappings || [];
  const curOf = (name) => (maps.find(m => m.trigger === 'gift' && m.giftName === name && managed.includes(m.action)) || {}).action || '';
  const rows = gifts.map((g, idx) => {
    const cur = curOf(g.name);
    const opts = effects.map(e => `<option value="${e.v}" ${e.v === cur ? 'selected' : ''}>${e.label}</option>`).join('');
    const active = cur ? 'border-pink-500/50' : 'border-slate-800/90';
    return `
      <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/80 border ${active} transition-all">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-9 h-9 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-xl">${g.emoji || '🎁'}</span>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-100 truncate">${g.name}</div>
            <div class="text-[10px] font-semibold text-amber-300/90">💎 ${g.diamonds || 1}</div>
          </div>
        </div>
        <select data-idx="${idx}" class="game-gift-effect shrink-0 text-xs font-semibold bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-pink-500 cursor-pointer">${opts}</select>
      </div>`;
  }).join('');
  container.innerHTML = `
    <div class="mb-3 text-xs text-slate-400">${note || 'Chọn hiệu ứng cho từng món quà — tự lưu ngay. Danh sách này <b class="text-slate-200">khớp đúng</b> các quà trong Phòng thử.'}</div>
    <div class="grid sm:grid-cols-2 gap-2.5">${rows}</div>`;
  container.querySelectorAll('.game-gift-effect').forEach(sel => {
    sel.addEventListener('change', () => { const g = gifts[+sel.dataset.idx]; if (g) setGiftMapping(g.name, sel.value, managed); });
  });
}

// ===== VIDEO REACT: bảng quà -> clip =====
function setVideoGiftClip(giftName, videoKey) {
  if (!screenConfig.mappings) screenConfig.mappings = [];
  screenConfig.mappings = screenConfig.mappings.filter(m => !(m.trigger === 'gift' && m.giftName === giftName && m.action === 'play_video'));
  if (videoKey) screenConfig.mappings.push({ trigger: 'gift', giftName, action: 'play_video', videoKey, points: 1, enabled: true });
  saveCurrentConfig();
  if (typeof showSimActionFeedback === 'function') showSimActionFeedback('✅ Đã gán clip cho ' + giftName);
  renderRulesList();
}

function renderVideoReactGiftTable(container) {
  const clips = (screenConfig && screenConfig.template && screenConfig.template.actions) || [];
  if (clips.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">Chưa có clip nào — thêm clip ở tab Cấu hình Game trước.</div>';
    return;
  }
  const names = screenConfig?.videoNames || {};
  const effects = [{ v: '', label: '— Không phát —' }].concat(clips.map(c => {
    const cn = names[c.key] || {};
    return { v: c.key, label: (cn.emoji || c.emoji || '🎬') + ' ' + (cn.label || c.label || c.key) };
  }));
  const gifts = (typeof GIFT_CATALOG !== 'undefined' ? GIFT_CATALOG : []).slice().sort((a, b) => (a.diamonds || 0) - (b.diamonds || 0));
  const maps = screenConfig?.mappings || [];
  const curOf = (name) => { const m = maps.find(x => x.trigger === 'gift' && x.giftName === name && x.action === 'play_video'); return m ? (m.videoKey || '') : ''; };
  const rows = gifts.map((g, idx) => {
    const cur = curOf(g.name);
    const opts = effects.map(e => `<option value="${e.v}" ${e.v === cur ? 'selected' : ''}>${e.label}</option>`).join('');
    const active = cur ? 'border-pink-500/50' : 'border-slate-800/90';
    return `
      <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/80 border ${active} transition-all">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-9 h-9 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-xl">${g.emoji || '🎁'}</span>
          <div class="min-w-0"><div class="text-xs font-bold text-slate-100 truncate">${g.name}</div><div class="text-[10px] font-semibold text-amber-300/90">💎 ${g.diamonds || 1}</div></div>
        </div>
        <select data-idx="${idx}" class="video-gift-clip shrink-0 text-xs font-semibold bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-pink-500 cursor-pointer">${opts}</select>
      </div>`;
  }).join('');
  container.innerHTML = `
    <div class="mb-3 text-xs text-slate-400">Chọn <b class="text-slate-200">clip sẽ phát</b> khi tặng mỗi món quà — tự lưu ngay.</div>
    <div class="grid sm:grid-cols-2 gap-2.5">${rows}</div>`;
  container.querySelectorAll('.video-gift-clip').forEach(sel => sel.addEventListener('change', () => { const g = gifts[+sel.dataset.idx]; if (g) setVideoGiftClip(g.name, sel.value); }));
}

// ====== ĐI CHÙA: Bảng tương tác (tim/chia sẻ/theo dõi/bình luận → hành động) ======
const INTERACT_EFFECTS = [
  { v: '', label: '— Không hiệu ứng —' },
  { v: 'mo', label: '🪵 Gõ mõ' },
  { v: 'bell', label: '🔔 Thỉnh chuông' },
  { v: 'incense', label: '🪷 Thắp hương' },
  { v: 'bow', label: '🙇 Quỳ lạy' },
  { v: 'fortune', label: '📜 Rút thẻ xăm' },
];
const INTERACT_ROWS = [
  { kind: 'comment', icon: '💬', name: 'Bình luận chứa từ khoá', extra: 'keyword' },
  { kind: 'like',    icon: '💖', name: 'Thả tim',               extra: 'minCount' },
  { kind: 'share',   icon: '🔁', name: 'Chia sẻ Live',          extra: null },
  { kind: 'follow',  icon: '➕', name: 'Theo dõi kênh',          extra: null },
];
function setDichuaInteraction(kind, patch) {
  if (!screenConfig.templeSettings) screenConfig.templeSettings = {};
  const ir = screenConfig.templeSettings.interactionRules || (screenConfig.templeSettings.interactionRules = {});
  ir[kind] = { action: '', merit: 0, read: false, text: '', requireGift: false, ...(ir[kind] || {}), ...patch };
  saveCurrentConfig();
}
function renderDichuaInteractionTable(container) {
  const ir = (screenConfig && screenConfig.templeSettings && screenConfig.templeSettings.interactionRules) || {};
  const esc = s => String(s || '').replace(/"/g, '&quot;');
  const INP = 'bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500';
  const opts = sel => INTERACT_EFFECTS.map(e => `<option value="${e.v}"${e.v === (sel || '') ? ' selected' : ''}>${e.label}</option>`).join('');
  const rows = INTERACT_ROWS.map(row => {
    const r = ir[row.kind] || {};
    const extra = row.extra === 'keyword'
      ? `<input type="text" data-ir-kind="${row.kind}" data-ir-field="keyword" value="${esc(r.keyword)}" placeholder="từ khoá, vd: a di đà" class="${INP} w-40">`
      : row.extra === 'minCount'
        ? `<div class="flex items-center gap-1"><span class="text-[11px] text-slate-400">đủ</span><input type="number" min="1" data-ir-kind="${row.kind}" data-ir-field="minCount" value="${r.minCount || 15}" class="${INP} w-16 text-right"><span class="text-[11px] text-slate-400">tim</span></div>`
        : `<span class="text-[11px] text-slate-600">tức thì</span>`;
    return `
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-200">${row.icon} ${row.name}</span>
          ${extra}
        </div>
        <div class="grid grid-cols-2 gap-2">
          <select data-ir-kind="${row.kind}" data-ir-field="action" class="${INP}">${opts(r.action)}</select>
          <div class="flex items-center gap-1"><span class="text-[11px] text-slate-400 whitespace-nowrap">+ công đức</span><input type="number" min="0" data-ir-kind="${row.kind}" data-ir-field="merit" value="${r.merit || 0}" class="${INP} w-full text-right"></div>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1.5 text-[11px] text-slate-300 whitespace-nowrap"><input type="checkbox" data-ir-kind="${row.kind}" data-ir-field="read" ${r.read ? 'checked' : ''} class="accent-amber-500"> Đọc câu</label>
          <input type="text" data-ir-kind="${row.kind}" data-ir-field="text" value="${esc(r.text)}" placeholder="vd: Cảm ơn {name} đã ${row.name.toLowerCase()}" class="${INP} flex-1">
        </div>
        <label class="flex items-center gap-1.5 text-[11px] text-amber-300 whitespace-nowrap"><input type="checkbox" data-ir-kind="${row.kind}" data-ir-field="requireGift" ${r.requireGift ? 'checked' : ''} class="accent-amber-500"> 🎁 Chỉ khi đã tặng quà</label>
      </div>`;
  }).join('');
  const wrap = document.createElement('div');
  wrap.className = 'mt-7 pt-6 border-t border-slate-800';
  wrap.innerHTML = `
    <div class="mb-3">
      <span class="text-xs font-bold uppercase tracking-wider text-sky-300">💬 Bảng tương tác → hành động</span>
      <p class="text-xs text-slate-400 mt-1">Tùy chỉnh <b class="text-slate-200">bình luận · thả tim · chia sẻ · theo dõi</b>: chọn nghi lễ, cộng công đức, đọc câu riêng (<code class="text-amber-300">{name}</code> = tên thí chủ), đặt ngưỡng. Tự lưu ngay.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${rows}</div>`;
  container.appendChild(wrap);
  wrap.querySelectorAll('[data-ir-kind]').forEach(el => {
    el.addEventListener('change', () => {
      const kind = el.getAttribute('data-ir-kind'), field = el.getAttribute('data-ir-field');
      let val;
      if (el.type === 'checkbox') val = el.checked;
      else if (el.type === 'number') val = Number(el.value) || 0;
      else val = el.value;
      setDichuaInteraction(kind, { [field]: val });
    });
  });
}

function renderRulesList() {
  const container = document.getElementById('rules-list-container');
  if (!container) return;

  const gType = screenData?.gameType;
  renderRulesAddButtons(gType);

  // Live Bar: dùng bảng quà bấm-1-nút thay cho danh sách luật khó dùng
  if (gType === 'live_bar') { renderLiveBarGiftTable(container); return; }

  // Video React: bảng quà -> clip
  if (gType === 'video_react') {
    const ab = document.getElementById('rules-add-buttons-container');
    if (ab) ab.innerHTML = '<span class="text-xs font-bold uppercase tracking-wider text-pink-300">🎬 Bảng quà → clip</span><span class="text-xs text-slate-400">Chọn clip phát theo từng món quà ở bảng bên dưới. Tự lưu ngay.</span>';
    renderVideoReactGiftTable(container);
    return;
  }

  // Đi chùa: bảng quà -> nghi lễ (bình luận gõ mõ/xin xăm... đã tự hoạt động)
  if (gType === 'di_chua') {
    const ab = document.getElementById('rules-add-buttons-container');
    if (ab) ab.innerHTML = '<span class="text-xs font-bold uppercase tracking-wider text-amber-300">🎁 Bảng quà → nghi lễ</span><span class="text-xs text-slate-400">Bình luận (gõ mõ, xin xăm, thỉnh chuông, lạy Phật…) đã TỰ hoạt động trong chánh điện.</span>';
    const DICHUA_GIFT_EFFECTS = [
      { v: '',               label: '🙏 Chỉ xướng tên hồi hướng (mặc định)' },
      { v: 'ritual_fortune', label: '📜 + Rút thẻ xăm an lạc' },
      { v: 'ritual_mo',      label: '🪵 + Gõ mõ tụng kinh' },
      { v: 'ritual_bell',    label: '🔔 + Thỉnh chuông' },
      { v: 'ritual_incense', label: '🪷 + Thắp hương' },
      { v: 'ritual_bow',     label: '🙇 + Quỳ lạy Phật' },
    ];
    renderGameGiftTable(container, DICHUA_GIFT_EFFECTS, 'Mọi quà vẫn <b class="text-slate-200">xướng tên hồi hướng + cộng công đức</b>. Chọn thêm nghi lễ cho từng món quà (nếu muốn) — tự lưu ngay.');
    renderDichuaInteractionTable(container);
    return;
  }

  // Các game khác có bảng quà (đội/bình...): dùng chung bảng quà bấm-1-nút
  const giftEffects = giftEffectsFor(gType);
  if (giftEffects) {
    const ab = document.getElementById('rules-add-buttons-container');
    if (ab) ab.innerHTML = '<span class="text-xs font-bold uppercase tracking-wider text-pink-300">🎁 Bảng quà → hiệu ứng</span><span class="text-xs text-slate-400">Chọn hiệu ứng cho từng món quà ở bảng bên dưới. Tự lưu ngay.</span>';
    renderGameGiftTable(container, giftEffects);
    return;
  }

  const rules = (screenConfig?.mappings && screenConfig.mappings.length > 0) ? screenConfig.mappings : (screenConfig?.rules || []);
  if (rules.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">Chưa có luật nào. Bấm một trong các nút thêm luật bên trên để bắt đầu.</div>';
    return;
  }

  container.innerHTML = rules.map((r, idx) => {
    const trig = getRuleTriggerDetails(r);
    const isHidden = r.hiddenOnHud === true;

    if (gType === 'video_react') {
      const actItem = screenConfig?.template?.actions?.find(a => a.key === r.videoKey);
      const customName = screenConfig?.videoNames?.[r.videoKey] || {};
      const label = customName.label || actItem?.label || 'Clip chuyển động';
      const emoji = customName.emoji || actItem?.emoji || '🎬';

      const thenBadge = `
        <span class="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <span>${emoji}</span> <span>Phát clip: ${label}</span>
        </span>
      `;
      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
          <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
            <span class="text-slate-500 text-xs font-bold select-none cursor-pointer hover:text-slate-300">⌵</span>
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
            
            <!-- Trigger badge -->
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span>${trig.badge || trig.title}</span>
            </span>
            
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
            
            <!-- Action badge -->
            ${thenBadge}
          </div>

          <!-- Actions right -->
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-toggle-rule-hud p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-all ${isHidden ? 'opacity-40' : ''}" data-rule-idx="${idx}" title="${isHidden ? 'Bị ẩn trên bảng hướng dẫn overlay' : 'Hiện trên bảng hướng dẫn overlay'}">
              ${isHidden ? '👁️‍🗨️' : '👁️'}
            </button>
            <button class="btn-edit-rule px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all cursor-pointer" data-rule-idx="${idx}">
              Sửa
            </button>
            <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    if (gType === 'receipt_printer') {
      const thenBadge = `
        <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <span>🧾</span> <span>In bảng tên kiểu Cổ điển</span>
        </span>
      `;
      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
          <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
            <span class="text-slate-500 text-xs font-bold select-none cursor-pointer hover:text-slate-300">⌵</span>
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
            
            <!-- Trigger badge -->
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span>${trig.badge || trig.title}</span>
            </span>
            
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
            
            <!-- Action badge -->
            ${thenBadge}
          </div>

          <!-- Actions right -->
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-toggle-rule-hud p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-all ${isHidden ? 'opacity-40' : ''}" data-rule-idx="${idx}" title="${isHidden ? 'Bị ẩn trên bảng hướng dẫn overlay' : 'Hiện trên bảng hướng dẫn overlay'}">
              ${isHidden ? '👁️‍🗨️' : '👁️'}
            </button>
            <button class="btn-edit-rule px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all cursor-pointer" data-rule-idx="${idx}">
              Sửa
            </button>
            <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    if (gType === 'chainsaw_clash') {
      let thenBadge = '';
      let pointsExtra = '';

      if (r.action === 'spawn' || r.action === 'saw_spawn') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🪚</span> <span>Thả lưỡi cưa của người đó vào sân</span>
          </span>
        `;
      } else if (r.action === 'heal' || r.action === 'saw_hp' || r.action === 'grow') {
        const hpVal = r.hp || r.points || (trig.title.includes('quà') ? 250 : 60);
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>❤️</span> <span>Cộng ${hpVal} máu cho lưỡi cưa của người đó</span>
          </span>
        `;
      } else if (r.action === 'shield' || r.action === 'saw_shield') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🛡️</span> <span>Cho khiên ${r.seconds || 8}s cho lưỡi cưa</span>
          </span>
        `;
      } else if (r.action === 'glow' || r.action === 'saw_glow') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>✨</span> <span>Phát sáng lưỡi cưa</span>
          </span>
        `;
      } else if (r.action === 'chaos' || r.action === 'saw_chaos') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🌀</span> <span>Biến cố hỗn loạn</span>
          </span>
        `;
      } else if (r.action === 'score' || r.action === 'add_points') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> <span>Cộng điểm cho người đó</span>
          </span>
        `;
        pointsExtra = `<span class="text-xs text-slate-400 font-medium">· mỗi món quà = ${r.points || 1} điểm</span>`;
      } else {
        thenBadge = `<span class="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold">${r.action}</span>`;
      }

      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
          <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
            <span class="text-slate-500 text-xs font-bold select-none cursor-pointer hover:text-slate-300">⌵</span>
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
            
            <!-- Trigger badge -->
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span>${trig.badge || trig.title}</span>
            </span>
            
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
            
            <!-- Action badge -->
            ${thenBadge}
            ${pointsExtra}
          </div>

          <!-- Actions right -->
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-toggle-rule-hud p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-all ${isHidden ? 'opacity-40' : ''}" data-rule-idx="${idx}" title="${isHidden ? 'Bị ẩn trên bảng hướng dẫn overlay' : 'Hiện trên bảng hướng dẫn overlay'}">
              ${isHidden ? '👁️‍🗨️' : '👁️'}
            </button>
            <button class="btn-edit-rule px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all cursor-pointer" data-rule-idx="${idx}">
              Sửa
            </button>
            <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    if (gType === 'di_chua') {
      const thenBadge = `
        <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <span>🛕</span> <span>${r.label || r.action} (+${r.merit || 1} công đức)</span>
        </span>
      `;
      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
          <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span>${trig.badge || trig.title}</span>
            </span>
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
            ${thenBadge}
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    if (gType === 'army_clash') {
      let thenBadge = '';
      let pointsExtra = '';

      const act = r.action || '';
      if (act === 'join_team_1' || act === 'join_army_1') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🔵</span> <span>Vào PHE XANH</span>
          </span>
        `;
      } else if (act === 'join_team_2' || act === 'join_army_2') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🔴</span> <span>Vào PHE ĐỎ</span>
          </span>
        `;
      } else if (act === 'join_least' || act === 'balance') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>⚖️</span> <span>Vào phe đang ít quân hơn</span>
          </span>
        `;
      } else if (act === 'boost_team' || act === 'boost' || act === 'army_power') {
        const pts = r.points || 100;
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>💪</span> <span>Cộng ${pts} sức đẩy cho phe của người đó</span>
          </span>
        `;
      } else if (act === 'glow' || act === 'soldier_glow') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>✨</span> <span>Lính của người đó phát sáng</span>
          </span>
        `;
      } else if (act === 'score' || act === 'add_points') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> <span>Cộng điểm cho người đó</span>
          </span>
        `;
        pointsExtra = `<span class="text-xs text-slate-400 font-medium">· mỗi món quà = ${r.points || 1} điểm</span>`;
      } else if (act === 'summon_hero' || act === 'hero') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>🐉</span> <span>Triệu hồi Tướng</span>
          </span>
        `;
      } else if (act === 'buff') {
        thenBadge = `
          <span class="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>✨</span> <span>Bùa tăng sức đẩy</span>
          </span>
        `;
      } else {
        thenBadge = `<span class="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold">${act}</span>`;
      }

      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
          <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
            <span class="text-slate-500 text-xs font-bold select-none cursor-pointer hover:text-slate-300">⌵</span>
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
            
            <!-- Trigger badge -->
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span>${trig.badge || trig.title}</span>
            </span>
            
            <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
            
            <!-- Action badge -->
            ${thenBadge}
            ${pointsExtra}
          </div>

          <!-- Actions right -->
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-toggle-rule-hud p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-all ${isHidden ? 'opacity-40' : ''}" data-rule-idx="${idx}" title="${isHidden ? 'Bị ẩn trên bảng hướng dẫn overlay' : 'Hiện trên bảng hướng dẫn overlay'}">
              ${isHidden ? '👁️‍🗨️' : '👁️'}
            </button>
            <button class="btn-edit-rule px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all cursor-pointer" data-rule-idx="${idx}">
              Sửa
            </button>
            <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
              🗑️
            </button>
          </div>
        </div>
      `;
    }

    // Default Team Games
    const isTeam2 = r.action?.includes('1') || r.action?.includes('2') || r.action === 'boost_team_1' || r.action === 'boost_team_2' || r.action === 'join_army_2';
    const teamIdx = isTeam2 ? 1 : 0;
    const team = screenConfig?.teams?.[teamIdx];
    const defaultColor = teamIdx === 1 ? '#f472b6' : '#38bdf8';
    const defaultEmoji = teamIdx === 1 ? '💖' : '💙';
    const defaultName = teamIdx === 1 ? 'PHE HỒNG' : 'PHE XANH';
    
    const teamColor = team?.color || defaultColor;
    const teamEmoji = team?.emoji || defaultEmoji;
    const teamName = team?.name || defaultName;

    return `
      <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all group">
        <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap min-w-0">
          <span class="text-slate-500 text-xs font-bold select-none cursor-pointer hover:text-slate-300">⌵</span>
          <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHI</span>
          
          <!-- Trigger badge -->
          <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
            <span>${trig.badge || trig.title}</span>
          </span>
          
          <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">THÌ</span>
          
          <!-- Target team badge -->
          <span class="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border" style="background-color: ${teamColor}1a; color: ${teamColor}; border-color: ${teamColor}40">
            <span>${teamEmoji}</span> <span>${teamName}</span>
          </span>
          
          <!-- Points text -->
          <span class="text-xs text-slate-400 font-medium">
            · <strong class="text-slate-200 font-bold">${r.points || 1} điểm</strong> mỗi lần
          </span>
        </div>

        <!-- Actions right -->
        <div class="flex items-center gap-2 shrink-0">
          <button class="btn-toggle-rule-hud p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-all ${isHidden ? 'opacity-40' : ''}" data-rule-idx="${idx}" title="${isHidden ? 'Bị ẩn trên bảng hướng dẫn overlay' : 'Hiện trên bảng hướng dẫn overlay'}">
            ${isHidden ? '👁️‍🗨️' : '👁️'}
          </button>
          <button class="btn-edit-rule px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all cursor-pointer" data-rule-idx="${idx}">
            Sửa
          </button>
          <button class="btn-delete-rule p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer" data-rule-idx="${idx}" title="Xoá luật">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Toggle HUD visibility
  container.querySelectorAll('.btn-toggle-rule-hud').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-rule-idx'));
      if (screenConfig.mappings[idx]) {
        screenConfig.mappings[idx].hiddenOnHud = !screenConfig.mappings[idx].hiddenOnHud;
        renderRulesList();
        saveCurrentConfig();
      }
    });
  });

  // Edit rule
  container.querySelectorAll('.btn-edit-rule').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-rule-idx'));
      openEditRuleModal(idx);
    });
  });

  // Delete rule
  container.querySelectorAll('.btn-delete-rule').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-rule-idx'));
      screenConfig.mappings.splice(idx, 1);
      renderRulesList();
      renderSimRulesButtons();
      saveCurrentConfig();
    });
  });
}

function renderSimRulesButtons() {
  const container = document.getElementById('sim-rules-buttons-container');
  if (!container) return;

  const rules = screenConfig?.mappings || [];
  const gType = screenData?.gameType;

  // Update sub-tab badge count
  const countSpan = document.getElementById('sim-rules-tab-count');
  if (countSpan) countSpan.textContent = rules.length;

  if (rules.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">Chưa có luật nào cho màn hình này.</div>';
    return;
  }

  container.innerHTML = rules.map((r, idx) => {
    const trig = getRuleTriggerDetails(r);
    const target = getRuleActionTarget(r, screenConfig, gType);
    return `
      <button type="button" class="sim-rule-card w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-rose-500/60 hover:bg-slate-900 transition-all flex items-center justify-between gap-3 text-left group shadow-sm cursor-pointer" data-rule-idx="${idx}">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-rose-400 group-hover:border-rose-500/40 font-mono text-xs flex items-center justify-center font-bold shrink-0">${idx + 1}</span>
          <span class="text-base shrink-0">${trig.icon}</span>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-200 group-hover:text-white truncate">${trig.title}</p>
            <p class="text-[11px] text-slate-400 truncate">→ <strong class="text-slate-300 font-semibold">${target}</strong></p>
          </div>
        </div>
        <span class="text-xs font-bold text-amber-400 shrink-0 font-mono">+${r.points || 1}đ</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.sim-rule-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-rule-idx'));
      fireRule(idx);
    });
  });
}

let editingRuleIndex = -1;

function openEditRuleModal(idx = -1, defaultTrigger = 'comment') {
  const modal = document.getElementById('rule-modal');
  if (!modal) return;

  editingRuleIndex = idx;
  const titleEl = document.getElementById('rule-modal-title');
  const triggerSelect = document.getElementById('modal-rule-trigger');
  const actionSelect = document.getElementById('modal-rule-action');
  const pointsInput = document.getElementById('modal-rule-points');

  if (idx >= 0 && screenConfig?.mappings?.[idx]) {
    const r = screenConfig.mappings[idx];
    if (titleEl) titleEl.innerHTML = `<span>✏️</span> Chỉnh Sửa Luật Chơi #${idx + 1}`;
    if (triggerSelect) triggerSelect.value = r.trigger || 'chat_any';
    if (actionSelect) actionSelect.value = r.action || 'boost_team_0';
    if (pointsInput) pointsInput.value = r.points || 1;
  } else {
    if (titleEl) titleEl.innerHTML = `<span>➕</span> Thêm Luật Chơi Mới`;
    if (triggerSelect) triggerSelect.value = defaultTrigger;
    if (actionSelect) actionSelect.value = 'boost_team_0';
    if (pointsInput) pointsInput.value = 1;
  }

  modal.classList.remove('hidden');
}

function setupRuleModal() {
  const modal = document.getElementById('rule-modal');
  const closeBtn = document.getElementById('btn-close-rule-modal');
  const cancelBtn = document.getElementById('btn-cancel-rule');
  const saveBtn = document.getElementById('btn-save-rule-modal');

  // 3 Add rule buttons in tab
  document.getElementById('btn-add-rule-gift')?.addEventListener('click', () => {
    openEditRuleModal(-1, 'gift_any');
  });
  document.getElementById('btn-add-rule-comment')?.addEventListener('click', () => {
    openEditRuleModal(-1, 'chat_any');
  });
  document.getElementById('btn-add-rule-like')?.addEventListener('click', () => {
    openEditRuleModal(-1, 'like_any');
  });
  document.getElementById('btn-add-rule')?.addEventListener('click', () => {
    openEditRuleModal(-1, 'chat_any');
  });

  const closeModal = () => modal?.classList.add('hidden');
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  saveBtn?.addEventListener('click', () => {
    const trigger = document.getElementById('modal-rule-trigger')?.value || 'chat_any';
    const action = document.getElementById('modal-rule-action')?.value || 'boost_team_0';
    const points = Number(document.getElementById('modal-rule-points')?.value) || 1;

    if (!screenConfig.mappings) screenConfig.mappings = [];

    if (editingRuleIndex >= 0 && screenConfig.mappings[editingRuleIndex]) {
      screenConfig.mappings[editingRuleIndex] = {
        ...screenConfig.mappings[editingRuleIndex],
        trigger,
        action,
        points
      };
    } else {
      screenConfig.mappings.push({
        trigger,
        action,
        points,
        enabled: true
      });
    }

    renderRulesList();
    renderSimRulesButtons();
    saveCurrentConfig();
    closeModal();
    if (window.showToast) window.showToast('✅ Đã lưu luật chơi thành công!');
  });
}

async function fireRule(ruleIdx) {
  const rules = screenConfig?.mappings || [];
  const rule = rules[ruleIdx];
  if (!rule) return;

  const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
  const gType = screenData?.gameType;

  // Read current user inputs
  const uInp = document.getElementById('sim-user-username');
  const nInp = document.getElementById('sim-user-nickname');
  if (uInp && nInp) {
    currentUser.username = uInp.value.trim() || currentUser.username;
    currentUser.nickname = nInp.value.trim() || currentUser.nickname;
    currentUser.name = currentUser.nickname;
  }

  let payload = {
    screenId,
    points: rule.points || 1,
    user: currentUser
  };

  const trig = getRuleTriggerDetails(rule);
  const target = getRuleActionTarget(rule, screenConfig, gType);

  if (gType === 'football_duel' || gType === 'army_clash') {
    payload.boostTeam = (rule.action?.includes('2') || rule.action === 'boost_team_2' || rule.action === 'join_army_2') ? 1 : 0;
    if (rule.action === 'summon_hero' || rule.action === 'army_hero') {
      payload.action = 'summon';
      payload.points = 400;
      payload.diamonds = 50;
    }
  } else if (gType === 'vote_tank') {
    payload.boostTeam = (rule.action?.includes('2') || rule.action === 'boost_team_2') ? 1 : 0;
  } else if (gType === 'chainsaw_clash') {
    payload.action = (rule.action?.includes('grow') || rule.action === 'saw_grow') ? 'grow' : 'spawn';
  } else if (gType === 'fish_tank') {
    payload.action = (rule.action === 'feed_fish' || rule.action === 'feed') ? 'feed' : 'spawn_fish';
  } else if (gType === 'receipt_printer') {
    payload.action = 'print_receipt';
    payload.style = rule.style || 'classic';
    payload.trigger = rule.trigger || 'gift_any';
    if (rule.trigger === 'gift' || rule.trigger === 'gift_any') {
      payload.gift = rule.giftName || rule.gift || 'Hoa Hồng';
      payload.diamonds = rule.diamonds || 1;
      payload.count = 1;
    } else if (rule.trigger === 'comment' || rule.trigger === 'comment_any' || rule.trigger === 'chat') {
      payload.comment = rule.keyword || 'Tuyệt vời!';
    } else if (rule.trigger === 'like' || rule.trigger === 'like_any') {
      payload.likeCount = rule.minCount || 15;
    }
  } else if (gType === 'live_bar') {
    if (rule.action === 'spotlight') payload.action = 'spotlight';
    if (rule.action === 'jump') payload.action = 'jump';
  }

  lastSimulatedEvent = { type: 'rule', ruleIdx, payload, label: `${trig.icon} ${trig.title} → ${target}` };

  await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const lastLabel = document.getElementById('sim-last-event-label');
  if (lastLabel) lastLabel.textContent = `Lượt cuối: ${trig.icon} ${trig.title} → ${target}`;
  showSimActionFeedback(`⚡ Đã kích hoạt: ${trig.title} → ${target}`);
}
