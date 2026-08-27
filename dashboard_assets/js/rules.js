// =========================================================================
// DASHBOARD RULES MANAGER & SIMULATOR FIRES
// =========================================================================

let lastSimulatedEvent = null;

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
  return act;
}

function renderRulesList() {
  const container = document.getElementById('rules-list-container');
  if (!container) return;

  const gType = screenData?.gameType;
  renderRulesAddButtons(gType);

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
