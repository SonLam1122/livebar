// =========================================================================
// DASHBOARD STATE MANAGEMENT & PERSISTENCE
// =========================================================================

let screensList = [];
let screenData = null;
let screenConfig = null;
let currentTab = 'overview';
let currentUser = { ...DEMO_USERS[0] };

async function loadScreensData() {
  try {
    const res = await fetch('/api/screens');
    screensList = await res.json();
  } catch (e) {
    screensList = [];
  }

  const path = window.location.pathname + window.location.search;
  let activeId = 'cmta2zkpq00aokx08uyc7iys2';

  if (path.includes('cmtbk6asa00ehkx089sr0l2qw') || path.includes('threedogs') || path.includes('3tuat') || path.includes('tuat')) {
    activeId = 'cmtbk6asa00ehkx089sr0l2qw';
  } else if (path.includes('cmtbk6dyh00ekkx08xtg4pc3m') || path.includes('videoreact') || path.includes('3meo') || path.includes('meow') || path.includes('video')) {
    activeId = 'cmtbk6dyh00ekkx08xtg4pc3m';
  } else if (path.includes('cmtb39d1d00chkx08sjrxty0e') || path.includes('receipt') || path.includes('printer')) {
    activeId = 'cmtb39d1d00chkx08sjrxty0e';
  } else if (path.includes('cmtabchainsaw001') || path.includes('chainsaw')) {
    activeId = 'cmtabchainsaw001';
  } else if (path.includes('cmtabetgi00blkx08pxprwvdm') || path.includes('teambattle')) {
    activeId = 'cmtabetgi00blkx08pxprwvdm';
  } else if (path.includes('cmtabeza100bokx08q9dm9q2z') || path.includes('army')) {
    activeId = 'cmtabeza100bokx08q9dm9q2z';
  } else if (path.includes('cmtabct2w00bikx08f4zhsfh5') || path.includes('football')) {
    activeId = 'cmtabct2w00bikx08f4zhsfh5';
  } else if (path.includes('cmta8m1mj00b1kx08kjei4jfv') || path.includes('fishtank')) {
    activeId = 'cmta8m1mj00b1kx08kjei4jfv';
  } else if (path.includes('cmta2p19d00alkx08nqke0l1s') || path.includes('votetank')) {
    activeId = 'cmta2p19d00alkx08nqke0l1s';
  } else if (path.includes('cmta2zkpq00aokx08uyc7iys2') || path.includes('livebar')) {
    activeId = 'cmta2zkpq00aokx08uyc7iys2';
  }

  switchScreen(activeId, false);
}

function switchScreen(screenId, updateUrl = false) {
  const target = screensList.find(s => s.id === screenId) || screensList[0];
  if (!target) return;
  screenData = target;
  screenConfig = screenData.config || {};

  const gType = screenData.gameType;
  const isLiveBar = gType === 'live_bar';
  const isVoteTank = gType === 'vote_tank';
  const isFishTank = gType === 'fish_tank';
  const isFootball = gType === 'football_duel';
  const isArmyClash = gType === 'army_clash';
  const isTeamBattle = gType === 'team_battle';
  const isChainsaw = gType === 'chainsaw_clash';
  const isReceiptPrinter = gType === 'receipt_printer';
  const isVidReact = gType === 'video_react';

  if (updateUrl && window.history.pushState) {
    window.history.pushState(null, '', `/dashboard/screens/${screenData.id}`);
  }

  // Update Game Switcher Buttons
  const buttons = [
    { id: 'btn-switch-livebar', active: isLiveBar, color: 'bg-purple-600' },
    { id: 'btn-switch-votetank', active: isVoteTank, color: 'bg-cyan-600' },
    { id: 'btn-switch-fishtank', active: isFishTank, color: 'bg-teal-600' },
    { id: 'btn-switch-football', active: isFootball, color: 'bg-emerald-600' },
    { id: 'btn-switch-armyclash', active: isArmyClash, color: 'bg-amber-600' },
    { id: 'btn-switch-teambattle', active: isTeamBattle, color: 'bg-sky-600' },
    { id: 'btn-switch-chainsaw', active: isChainsaw, color: 'bg-orange-600' },
    { id: 'btn-switch-receiptprinter', active: isReceiptPrinter, color: 'bg-amber-600' },
    { id: 'btn-switch-videoreact', active: isVidReact && screenData?.id === 'cmtbk6dyh00ekkx08xtg4pc3m', color: 'bg-rose-600' },
    { id: 'btn-switch-threedogs', active: isVidReact && screenData?.id === 'cmtbk6asa00ehkx089sr0l2qw', color: 'bg-amber-600' }
  ];

  buttons.forEach(b => {
    const el = document.getElementById(b.id);
    if (el) {
      if (b.active) {
        el.className = `game-switch-btn active px-3 py-1.5 rounded-xl text-xs font-bold ${b.color} text-white flex items-center gap-1.5 shadow-md shadow-black/40 transition-all shrink-0`;
      } else {
        el.className = 'game-switch-btn px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-all shrink-0';
      }
    }
  });

  // Update Header Banner
  const activeTitle = document.getElementById('active-game-title');
  const activeEmoji = document.getElementById('active-game-emoji');
  const activeDesc = document.getElementById('active-game-desc');
  const obsLinkDisplay = document.getElementById('obs-link-display');
  const targetToken = screenData.token || screenData.id;

  if (isLiveBar) {
    if (activeTitle) activeTitle.textContent = 'Live Bar — Sàn Nhảy 3D';
    if (activeEmoji) activeEmoji.textContent = '🍸';
    if (activeDesc) activeDesc.textContent = 'Khách vào sàn nhảy, tặng quà được spotlight zoom và nhận vương miện.';
  } else if (isVoteTank) {
    if (activeTitle) activeTitle.textContent = 'Bình Chọn Đổ Nước (Vote Tank)';
    if (activeEmoji) activeEmoji.textContent = '🗳️';
    if (activeDesc) activeDesc.textContent = 'Mỗi phe một bình nước, người xem thả phiếu là nước dâng lên bình.';
  } else if (isFishTank) {
    if (activeTitle) activeTitle.textContent = 'Cá Lớn Nuốt Cá Bé (Fish Tank)';
    if (activeEmoji) activeEmoji.textContent = '🐟';
    if (activeDesc) activeDesc.textContent = 'Nuôi cá, săn mồi, lên cấp, né Cá Mập Khổng Lồ và bão săn mồi.';
  } else if (isFootball) {
    if (activeTitle) activeTitle.textContent = 'So Tài Sân Cỏ (Football Duel)';
    if (activeEmoji) activeEmoji.textContent = '⚽';
    if (activeDesc) activeDesc.textContent = 'Hai phe đối đầu đẩy bóng, đạt mốc bàn thắng là nổ pháo ăn mừng.';
  } else if (isArmyClash) {
    if (activeTitle) activeTitle.textContent = 'Cuộc Chiến Ngàn Quân (Army Clash)';
    if (activeEmoji) activeEmoji.textContent = '🏳️';
    if (activeDesc) activeDesc.textContent = 'Hai đoàn quân giáp lá cà đẩy lùi đối phương về thành lũy đối diện.';
  } else if (isTeamBattle) {
    if (activeTitle) activeTitle.textContent = 'Cuộc Chiến Xây Tháp (Team Battle)';
    if (activeEmoji) activeEmoji.textContent = '⚔️';
    if (activeDesc) activeDesc.textContent = 'Hai phe đối đầu đua điểm xây tháp gạch 3D, đạt mốc chiến thắng theo từng ván.';
  } else if (isChainsaw) {
    if (activeTitle) activeTitle.textContent = 'Cuộc Chiến Cưa Xích (Chainsaw Clash)';
    if (activeEmoji) activeEmoji.textContent = '🪚';
    if (activeDesc) activeDesc.textContent = 'Thả lưỡi cưa vào đấu trường, va chạm sinh tồn tới khi hết giờ tìm quán quân.';
  } else if (isReceiptPrinter) {
    if (activeTitle) activeTitle.textContent = 'Máy In Cảm Ơn (Receipt Printer)';
    if (activeEmoji) activeEmoji.textContent = '🧾';
    if (activeDesc) activeDesc.textContent = 'In phiếu cảm ơn cuộn giấy liên tục khi có người tặng quà, comment, follow.';
  } else if (isVidReact) {
    const isTuat = screenData?.id === 'cmtbk6asa00ehkx089sr0l2qw';
    if (activeTitle) activeTitle.textContent = isTuat ? '3 Tuất Vàng Live (Màn Hình Video)' : 'Live Show 3 Mèo (Màn Hình Video)';
    if (activeEmoji) activeEmoji.textContent = isTuat ? '🐕' : '🐱';
    if (activeDesc) activeDesc.textContent = 'Nhân vật video chạy nền, có quà là đổi sang clip chuyển động khác.';
  }

  if (obsLinkDisplay) {
    obsLinkDisplay.textContent = `${window.location.origin}/?token=${targetToken}`;
  }

  // Update Preview iframe
  const iframe = document.getElementById('overlay-iframe');
  if (iframe) {
    iframe.src = `/?token=${targetToken}`;
  }

  // Toggle Config Sections
  const configSections = [
    { id: 'config-section-livebar', show: isLiveBar },
    { id: 'config-section-votetank', show: isVoteTank },
    { id: 'config-section-fishtank', show: isFishTank },
    { id: 'config-section-football', show: isFootball },
    { id: 'config-section-armyclash', show: isArmyClash },
    { id: 'config-section-teambattle', show: isTeamBattle },
    { id: 'config-section-chainsaw', show: isChainsaw },
    { id: 'game-config-receiptprinter', show: isReceiptPrinter },
    { id: 'config-section-videoreact', show: isVidReact }
  ];
  configSections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) el.classList.toggle('hidden', !s.show);
  });

  // Default simulator subtab to rules
  const simTab = 'rules';
  document.querySelectorAll('.sim-nav-tab').forEach(b => {
    const isAct = b.getAttribute('data-sim-tab') === simTab;
    b.classList.toggle('active', isAct);
    b.classList.toggle('border-rose-500', isAct);
    b.classList.toggle('text-white', isAct);
    b.classList.toggle('border-transparent', !isAct);
    b.classList.toggle('text-slate-400', !isAct);
  });
  document.querySelectorAll('.sim-panel-content').forEach(p => p.classList.add('hidden'));
  const pActive = document.getElementById(`sim-panel-${simTab}`);
  if (pActive) pActive.classList.remove('hidden');

  // Toggle Theme Sub-Game Environment Contexts
  const themeSubSections = [
    { id: 'theme-sub-livebar', show: isLiveBar, name: 'Live Bar — Sàn Nhảy' },
    { id: 'theme-sub-votetank', show: isVoteTank, name: 'Bình Chọn Đổ Nước' },
    { id: 'theme-sub-fishtank', show: isFishTank, name: 'Cá Lớn Nuốt Cá Bé' },
    { id: 'theme-sub-football', show: isFootball, name: 'So Tài Sân Cỏ' },
    { id: 'theme-sub-armyclash', show: isArmyClash, name: 'Cuộc Chiến Ngàn Quân' },
    { id: 'theme-sub-chainsaw', show: isChainsaw, name: 'Cuộc Chiến Cưa Xích' }
  ];
  themeSubSections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) el.classList.toggle('hidden', !s.show);
    if (s.show) {
      const badge = document.getElementById('theme-active-game-badge');
      if (badge) badge.textContent = s.name;
    }
  });

  // Populate inputs
  populateAllConfigInputs();

  // Render specific UI components
  if (isLiveBar && typeof renderLiveBarLibraries === 'function') renderLiveBarLibraries();
  if (isVoteTank && typeof renderVoteTankTeams === 'function') renderVoteTankTeams();
  if (isFootball && typeof renderFootballConfig === 'function') renderFootballConfig();
  if (isArmyClash && typeof renderArmyClashConfig === 'function') renderArmyClashConfig();
  if (isTeamBattle && typeof renderTeamBattleConfig === 'function') renderTeamBattleConfig();
  if (isChainsaw && typeof renderChainsawConfig === 'function') renderChainsawConfig();

  if (typeof renderRulesList === 'function') renderRulesList();
  if (typeof renderSimRulesButtons === 'function') renderSimRulesButtons();

  if (dashboardSocket && dashboardSocket.connected) {
    dashboardSocket.emit('overlay:join', { token: targetToken });
  }
}

let dashboardSocket = null;
function setupDashboardSocket() {
  if (typeof io !== 'function') return;
  if (dashboardSocket) return;

  dashboardSocket = io('/overlay');

  dashboardSocket.on('connect', () => {
    const targetToken = screenData?.token || screenData?.id;
    if (targetToken) {
      dashboardSocket.emit('overlay:join', { token: targetToken });
    }
  });

  dashboardSocket.on('overlay:init', e => {
    if (e && e.match) {
      updateOverviewStats(e.match);
    }
  });

  dashboardSocket.on('match:state', state => {
    if (!state) return;
    updateOverviewStats(state);
  });
}

function updateOverviewStats(state) {
  const gType = screenData?.gameType;
  let userCount = 0;
  let totalDiamonds = 0;
  let topList = [];

  if (gType === 'chainsaw_clash') {
    const saws = state.chainsaw?.saws || [];
    const scores = state.chainsaw?.scores || [];
    userCount = saws.length;
    topList = scores.slice().sort((a, b) => (b.kills || 0) - (a.kills || 0)).slice(0, 5);
  } else if (gType === 'army_clash') {
    const soldiers = state.army?.soldiers || [];
    userCount = soldiers.length;
    topList = (state.army?.topPlayers || []).slice(0, 5);
  } else if (gType === 'football_duel') {
    const t1 = state.teams?.[0]?.points || 0;
    const t2 = state.teams?.[1]?.points || 0;
    userCount = (state.guests || []).length || (t1 + t2 > 0 ? 2 : 0);
  } else if (gType === 'fish_tank') {
    const fish = state.fish?.fish || [];
    userCount = fish.length;
    topList = fish.slice().sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 5);
  } else if (gType === 'vote_tank') {
    const v1 = state.vote?.tanks?.[0]?.top || [];
    const v2 = state.vote?.tanks?.[1]?.top || [];
    userCount = v1.length + v2.length;
  } else if (gType === 'team_battle') {
    const t1 = state.teams?.[0]?.points || 0;
    const t2 = state.teams?.[1]?.points || 0;
    userCount = (state.guests || []).length || (t1 + t2 > 0 ? 2 : 0);
    topList = (state.leaderboard || []).slice(0, 5);
  } else {
    const guests = state.guests || [];
    userCount = guests.length;
    topList = (state.leaderboard || []).slice(0, 5);
  }

  const uEl = document.getElementById('stat-count-users');
  if (uEl) uEl.textContent = String(userCount);

  if (state.totalDiamonds !== undefined) {
    const dEl = document.getElementById('stat-count-diamonds');
    if (dEl) dEl.textContent = `${state.totalDiamonds} 💎`;
  }

  const lbEl = document.getElementById('overview-leaderboard-list');
  if (lbEl && topList.length > 0) {
    lbEl.innerHTML = topList.map((p, idx) => `
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${idx === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}">${idx + 1}</span>
          <span class="font-bold text-white">${p.nickname || p.username || 'Khán giả'}</span>
        </div>
        <span class="font-mono font-bold text-indigo-400">${p.kills !== undefined ? `${p.kills} ⚔️` : p.level !== undefined ? `Lv.${p.level}` : `${p.score || p.points || 0}đ`}</span>
      </div>
    `).join('');
  }
}

function populateAllConfigInputs() {
  if (!screenConfig) return;

  // Live Bar Config Section
  setVal('cfg-max-guests', screenConfig.maxGuests || 60);
  setVal('cfg-spotlight-sec', screenConfig.spotlightSeconds || 5);
  setVal('cfg-stroll-sec', screenConfig.strollSeconds || 9);
  setVal('cfg-jump-sec', screenConfig.jumpSeconds || 4);
  setVal('cfg-jump-height', screenConfig.jumpHeight || 1.2);
  setVal('cfg-vip-sec', screenConfig.vipSeconds !== undefined ? screenConfig.vipSeconds : 0);
  setVal('cfg-skin-sec', screenConfig.skinSeconds !== undefined ? screenConfig.skinSeconds : 0);
  setVal('cfg-wing-sec', screenConfig.wingSeconds !== undefined ? screenConfig.wingSeconds : 0);
  setVal('cfg-badge-sec', screenConfig.badgeSeconds !== undefined ? screenConfig.badgeSeconds : 0);
  setVal('cfg-idle-leave-min', screenConfig.idleLeaveMinutes || 10);
  setVal('cfg-party-sec', screenConfig.partySeconds || 7);
  setVal('cfg-camera-zoom', screenConfig.cameraZoom || screenConfig.zoom || 1.55);
  setVal('cfg-camera-orbit', screenConfig.cameraOrbitSeconds || screenConfig.orbitSeconds || 26);
  setVal('cfg-light-mode', screenConfig.lightShow === false ? 'medium' : 'full');

  const camSwayEl = document.getElementById('cfg-camera-sway');
  if (camSwayEl) camSwayEl.checked = screenConfig.cameraSway !== false;
  const spotJoinEl = document.getElementById('cfg-spotlight-on-join');
  if (spotJoinEl) spotJoinEl.checked = screenConfig.spotlightOnJoin !== false;
  const djScreenEnableEl = document.getElementById('cfg-dj-screen-enable');
  if (djScreenEnableEl) djScreenEnableEl.checked = screenConfig.djScreen !== 'none';
  setVal('cfg-dj-screen-url', screenConfig.djScreenUrl || '');

  setVal('cfg-vote-mode', screenConfig.mode || 'race');
  setVal('cfg-win-points', screenConfig.winPoints || 1000);
  setVal('cfg-unit-label', screenConfig.unitLabel || 'PHIẾU');
  setVal('cfg-liquid', screenConfig.liquid || 'water');
  setVal('cfg-tank-scene', screenConfig.scene || 'studio');
  setVal('cfg-vote-chaos', String(screenConfig.enableChaos ?? true));

  setVal('cfg-fish-max', screenConfig.maxFish || 40);
  setVal('cfg-fish-max-level', screenConfig.maxLevel || 8);
  setVal('cfg-fish-speed', screenConfig.swimSpeed || 1.0);
  setVal('cfg-fish-shark-min', screenConfig.sharkIntervalMinutes || 5);
  setVal('cfg-fish-frenzy-duration', screenConfig.frenzyDurationSeconds || 20);
  setVal('cfg-fish-invincible', screenConfig.shieldSeconds || 6);

  setVal('cfg-fb-goal-points', screenConfig.goalPoints || 50);
  setVal('cfg-fb-power-label', screenConfig.powerLabel || 'LỰC SÚT');

  setVal('cfg-army-round-seconds', screenConfig.roundSeconds || 600);
  setVal('cfg-army-gate-distance', screenConfig.gateDistance || screenConfig.winDistance || 300);
  setVal('cfg-army-max-speed', screenConfig.maxSpeed || 3);
  setVal('cfg-army-max-soldiers-per-team', screenConfig.maxSoldiersPerTeam || screenConfig.maxSoldiers || 200);
  setVal('cfg-army-soldiers-per-join', screenConfig.soldiersPerJoin || screenConfig.joinPower || 1);
  setVal('cfg-army-power-per-person', screenConfig.powerPerPerson ?? 10);
  setVal('cfg-army-default-rule-power', screenConfig.defaultRulePower ?? 100);

  setVal('cfg-army-attack-damage', screenConfig.attackDamage ?? 2);
  setVal('cfg-army-attack-interval-ms', screenConfig.attackIntervalMs ?? 700);
  setVal('cfg-army-respawn-seconds', screenConfig.respawnSeconds ?? 6);
  setVal('cfg-army-base-hp', screenConfig.baseHp ?? 600);
  setVal('cfg-army-power-decay-pct', screenConfig.powerDecayPct ?? 5);
  setVal('cfg-army-idle-timeout-min', screenConfig.idleTimeoutMin ?? 15);

  setVal('cfg-army-boss-duration-sec', screenConfig.bossDurationSec || screenConfig.summonSeconds || 45);
  setVal('cfg-army-boss-power', screenConfig.bossPower ?? 400);

  setVal('cfg-army-buff-multiplier', screenConfig.buffMultiplier ?? 1.25);
  setVal('cfg-army-buff-duration-sec', screenConfig.buffDurationSec ?? 30);

  setVal('cfg-saw-round-seconds', screenConfig.roundSeconds || 480);
  setVal('cfg-saw-max', screenConfig.maxSaws || 36);
  setVal('cfg-saw-spawn-hp', screenConfig.spawnHp || 250);
  setVal('cfg-saw-max-hp', screenConfig.maxHp || 4000);
  setVal('cfg-saw-damage', screenConfig.damage || 10);
  setVal('cfg-saw-hit-interval', screenConfig.hitIntervalMs || 400);
  setVal('cfg-saw-shield-sec', screenConfig.spawnShieldSeconds || 3);
  setVal('cfg-saw-buff-shield-sec', screenConfig.buffShieldSeconds || 8);
  setVal('cfg-saw-drift-speed', screenConfig.driftSpeed || 1);
  setVal('cfg-saw-idle-minutes', screenConfig.idleMinutes || 8);

  const sawRespawnEl = document.getElementById('cfg-saw-auto-respawn');
  if (sawRespawnEl) sawRespawnEl.checked = screenConfig.autoRespawn !== false;
  setVal('cfg-saw-respawn-delay', screenConfig.respawnDelay || 6);

  const sawChaosEl = document.getElementById('cfg-saw-enable-chaos');
  if (sawChaosEl) sawChaosEl.checked = screenConfig.enableChaos !== false;
  setVal('cfg-saw-chaos-min-min', screenConfig.chaosMinMin || 1.5);
  setVal('cfg-saw-chaos-max-min', screenConfig.chaosMaxMin || 3);
  setVal('cfg-saw-chaos-duration', screenConfig.chaosDuration || 20);
  setVal('cfg-saw-orb-hp', screenConfig.orbHp || 600);

  setVal('cfg-tb-goal-points', screenConfig.goalPoints || 500);
  setVal('cfg-tb-unit-label', screenConfig.unitLabel || 'GẠCH');
  const persistWinsEl = document.getElementById('cfg-tb-persist-wins');
  if (persistWinsEl) persistWinsEl.checked = screenConfig.persistWins !== false;
  setVal('cfg-tb-win-label', screenConfig.winLabel || 'THẮNG {n}');
  setVal('cfg-tb-win-rule-label', screenConfig.winRuleLabel || '{points} {unit} = THẮNG · VÁN {round}');
  setVal('cfg-tb-brick-size', String(screenConfig.brickSize || '3.4'));

  // Receipt Printer Config Section
  const printer = screenConfig.printer || {};
  setVal('cfg-printer-thanks', printer.thanks || 'Cảm ơn bạn!');
  setVal('cfg-printer-gift', printer.gift || '{gift} ×{count}');
  setVal('cfg-printer-comment', printer.comment || '💬 {comment}');
  setVal('cfg-printer-like', printer.like || '❤️ Đã thả {count} tim');
  setVal('cfg-printer-follow', printer.follow || '➕ Đã follow kênh');
  setVal('cfg-printer-share', printer.share || '↗ Đã chia sẻ live');
  setVal('cfg-printer-join', printer.join || '👋 Đã tham gia live');
  setVal('cfg-printer-max-receipts', printer.maxReceipts || 12);
  setVal('cfg-printer-feed-interval', printer.feedInterval || 780);

  const prAvatar = document.getElementById('cfg-printer-show-avatar');
  if (prAvatar) prAvatar.checked = printer.showAvatar !== false;
  const prAction = document.getElementById('cfg-printer-show-action');
  if (prAction) prAction.checked = printer.showAction !== false;

  // Populate Theme, Text & Widget Inputs
  const theme = screenConfig.theme || {};
  const preset = theme.preset || 'neon';

  // Highlight active preset card
  document.querySelectorAll('.theme-preset-card').forEach(card => {
    const isAct = card.getAttribute('data-preset') === preset;
    card.classList.toggle('border-2', isAct);
    card.classList.toggle('border-cyan-500', isAct);
    card.classList.toggle('border-slate-800', !isAct);
  });

  const primaryAccent = theme.accent || theme.accentColor || '#22d3ee';
  const altAccent = theme.accentAlt || '#a855f7';
  const textClr = theme.textColor || '#ffffff';

  setVal('cfg-accent-color', primaryAccent);
  setVal('cfg-accent-color-text', primaryAccent);
  setVal('cfg-accent-alt-color', altAccent);
  setVal('cfg-accent-alt-color-text', altAccent);
  setVal('cfg-text-color', textClr);
  setVal('cfg-text-color-text', textClr);

  setVal('cfg-font-family', theme.fontFamily || 'roboto');
  setVal('cfg-leaderboard-pos', theme.leaderboardPosition || 'top-right');
  setVal('cfg-leaderboard-size', theme.leaderboardSize || 5);
  setVal('cfg-toast-pos', theme.toastPosition || 'bottom-left');

  const scaleVal = theme.scale || 1.0;
  setVal('cfg-hud-scale', scaleVal);
  const scaleSpan = document.getElementById('label-hud-scale-val');
  if (scaleSpan) scaleSpan.textContent = `${Number(scaleVal).toFixed(2)}×`;

  const isTrans = theme.transparent !== false;
  const transChk = document.getElementById('cfg-bg-transparent-checkbox');
  if (transChk) transChk.checked = isTrans;

  const bgClr = theme.bgColor || '#0b0e14';
  setVal('cfg-bg-color-picker', bgClr);
  setVal('cfg-bg-color-text', bgClr);
  setVal('cfg-theme-bg-image', theme.bgImage || '');

  const opacityVal = theme.panelOpacity !== undefined ? theme.panelOpacity : 0.55;
  setVal('cfg-panel-opacity', opacityVal);
  const opSpan = document.getElementById('cfg-panel-opacity-val');
  if (opSpan) opSpan.textContent = `${Math.round(opacityVal * 100)}%`;

  // UI Custom Texts
  const texts = screenConfig.customTexts || {};
  setVal('cfg-uitext-fb-power', screenConfig.powerLabel || texts['football.power'] || 'LỰC SÚT');
  setVal('cfg-uitext-fb-goal', texts['football.goal'] || '⚽ VÀO! VÀO! VÀO!');
  setVal('cfg-uitext-fb-target', texts['football.target'] || 'MỐC GHI BÀN: {points}');
  setVal('cfg-uitext-lb-title', texts['leaderboard.title'] || 'TOP TẶNG QUÀ');
  setVal('cfg-uitext-lb-rank1', texts['leaderboard.rank1'] || '👑 QUÁN QUÂN');
  setVal('cfg-uitext-clock', texts['clock.label'] || 'THỜI GIAN');
  setVal('cfg-uitext-alert-follow', texts['alert.follow'] || '{name} vừa theo dõi kênh');
  setVal('cfg-uitext-alert-share', texts['alert.share'] || '{name} vừa chia sẻ livestream');
  setVal('cfg-uitext-alert-gift', texts['alert.gift'] || '👑 {name} TẶNG {gift} ×{count}');
  setVal('cfg-uitext-guide-chat', screenConfig.chatGuideTitle || texts['guide.chat'] || '💬 GÕ CHỮ ĐƯỢC GÌ');
  setVal('cfg-uitext-guide-gift', screenConfig.giftGuideTitle || texts['guide.gift'] || '🎁 QUÀ NÀO ĐƯỢC GÌ');
  setVal('cfg-uitext-status-reconnect', texts['status.reconnect'] || 'Đang kết nối lại TikTok Live...');
  setVal('cfg-uitext-status-pause', texts['status.pause'] || 'Trò chơi đang tạm dừng');
  setVal('cfg-uitext-status-ended', texts['status.ended'] || 'Cảm ơn mọi người đã tham gia!');
  setVal('cfg-uitext-win-title', texts['winner.title'] || '👑 {name} CHIẾN THẮNG!');
  setVal('cfg-uitext-win-mvp', texts['winner.mvp'] || '🏆 CẦU THỦ XUẤT SẮC NHẤT');

  // Game-Specific Environment Fields
  setVal('cfg-theme-bar-scene', screenConfig.scene || 'club');
  setVal('cfg-theme-bar-dj', screenConfig.djScreen || 'visualizer');
  setVal('cfg-theme-bar-light', String(screenConfig.lightShow ?? true));

  setVal('cfg-theme-vote-scene', screenConfig.scene || 'studio');
  setVal('cfg-theme-vote-liquid', screenConfig.liquid || 'water');
  setVal('cfg-theme-vote-percent', String(screenConfig.showPercent ?? true));

  setVal('cfg-theme-fish-scene', screenConfig.scene || 'reef');
  setVal('cfg-theme-fish-glow', String(screenConfig.glowOnDrop ?? true));

  setVal('cfg-theme-football-field', screenConfig.fieldUrl || '/football-duel/stadium-field.png');
  setVal('cfg-theme-football-goal-fx', 'true');

  setVal('cfg-theme-army-bg', screenConfig.battleGround || 'bamboo');
  setVal('cfg-theme-army-summon-fx', 'true');

  setVal('cfg-theme-saw-floor', screenConfig.arenaFloor || 'concrete');
  setVal('cfg-theme-saw-sparks', 'true');

  // Sound & TTS & BGM Section
  const sound = screenConfig.sound || {};
  const tts = screenConfig.alerts?.tts || {};

  const soundEnEl = document.getElementById('cfg-sound-enabled');
  if (soundEnEl) soundEnEl.checked = sound.enabled !== false;

  setVal('cfg-sound-pack', sound.pack || 'arcade');
  setVal('cfg-sound-volume', sound.volume ?? 0.6);
  const soundVolLbl = document.getElementById('label-sound-volume');
  if (soundVolLbl) soundVolLbl.textContent = `${Math.round((sound.volume ?? 0.6) * 100)}%`;

  const ttsEnEl = document.getElementById('cfg-tts-enabled');
  if (ttsEnEl) ttsEnEl.checked = tts.enabled === true;

  setVal('cfg-tts-lang', tts.lang || 'vi-VN');
  setVal('cfg-tts-min-diamonds', tts.minDiamonds ?? 10);
  setVal('cfg-tts-rate', tts.rate ?? 1.0);
  const ttsRateLbl = document.getElementById('label-tts-rate');
  if (ttsRateLbl) ttsRateLbl.textContent = `${Number(tts.rate ?? 1.0).toFixed(1)}×`;

  setVal('cfg-tts-volume', tts.volume ?? 1.0);
  const ttsVolLbl = document.getElementById('label-tts-volume');
  if (ttsVolLbl) ttsVolLbl.textContent = `${Math.round((tts.volume ?? 1.0) * 100)}%`;

  setVal('cfg-tts-voice-id', tts.voiceId || '');
  setVal('cfg-tts-gift-template', tts.giftTemplate || 'Cảm ơn {name} đã tặng {gift}');
  const ttsFollowEl = document.getElementById('cfg-tts-read-follow');
  if (ttsFollowEl) ttsFollowEl.checked = tts.readFollow === true;
  setVal('cfg-tts-follow-template', tts.followTemplate || '{name} vừa theo dõi kênh');

  setVal('cfg-bgm-url', screenConfig.bgmUrl || '');
  setVal('cfg-bgm-volume', screenConfig.bgmVolume ?? 0.5);
  const bgmVolLbl = document.getElementById('label-bgm-volume');
  if (bgmVolLbl) bgmVolLbl.textContent = `${Math.round((screenConfig.bgmVolume ?? 0.5) * 100)}%`;

  setVal('cfg-bgm-duck', screenConfig.bgmDuckVolume ?? 0.12);
  const bgmDuckLbl = document.getElementById('label-bgm-duck');
  if (bgmDuckLbl) bgmDuckLbl.textContent = `${Math.round((screenConfig.bgmDuckVolume ?? 0.12) * 100)}%`;

  // Handle Theme Floor/Ground Sections Visibility
  const isFb = (screenData?.gameType === 'football_duel');
  const isCs = (screenData?.gameType === 'chainsaw_clash');
  const isLb = (screenData?.gameType === 'live_bar');
  const isArmy = (screenData?.gameType === 'army_clash');
  const isVideo = (screenData?.gameType === 'video_react');

  const lbSceneSec = document.getElementById('theme-livebar-scene-section');
  if (lbSceneSec) lbSceneSec.classList.toggle('hidden', !isLb);

  const csFloorSec = document.getElementById('theme-chainsaw-floor-section');
  if (csFloorSec) csFloorSec.classList.toggle('hidden', !isCs);

  const armyGroundSec = document.getElementById('theme-army-ground-section');
  if (armyGroundSec) armyGroundSec.classList.toggle('hidden', !isArmy);

  // Handle UI text category tab visibility based on gameType
  const fbTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="football"]');
  if (fbTabBtn) fbTabBtn.style.display = isFb ? '' : 'none';

  const csTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="chainsaw"]');
  if (csTabBtn) csTabBtn.style.display = isCs ? '' : 'none';

  const barTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="bar"]');
  if (barTabBtn) barTabBtn.style.display = isLb ? '' : 'none';

  const armyTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="army"]');
  if (armyTabBtn) armyTabBtn.style.display = isArmy ? '' : 'none';

  const vidTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="video"]');
  if (vidTabBtn) vidTabBtn.style.display = isVideo ? '' : 'none';

  const winnerTabBtn = document.querySelector('.ui-text-cat-btn[data-cat="winner"]');
  if (winnerTabBtn) winnerTabBtn.style.display = (isLb || isCs || isFb || isArmy || screenData?.gameType === 'team_battle') ? '' : 'none';

  // Populate Army Clash custom texts
  setVal('cfg-uitext-army-title', texts['army.title'] || 'CUỘC CHIẾN NGÀN QUÂN');
  setVal('cfg-uitext-army-team1', texts['army.team1'] || screenConfig.teams?.[0]?.name || 'PHE XANH');
  setVal('cfg-uitext-army-team2', texts['army.team2'] || screenConfig.teams?.[1]?.name || 'PHE ĐỎ');
  setVal('cfg-uitext-army-power', texts['army.power'] || 'SỨC ĐẨY: {n}');

  // Populate Video React custom texts
  setVal('cfg-uitext-video-unselected', texts['video.unselected'] || '🎬 Màn hình chưa chọn mẫu video — chọn trong dashboard');
  setVal('cfg-uitext-video-loading', texts['video.loading'] || '⏳ Đang tải video {done}/{total}…');
  setVal('cfg-uitext-video-blocked', texts['video.blocked'] || '▶️ Trình duyệt đang chặn tự phát — bấm vào khung để bắt đầu');
  setVal('cfg-uitext-video-muted', texts['video.muted'] || '🔇 Bấm vào khung để bật tiếng (OBS thì tự bật)');

  // If active tab is hidden, fallback to leaderboard
  const curActiveTab = document.querySelector('.ui-text-cat-btn.active');
  const isWinnerHidden = !winnerTabBtn || winnerTabBtn.style.display === 'none';
  if (!curActiveTab || (curActiveTab.getAttribute('data-cat') === 'football' && !isFb) || (curActiveTab.getAttribute('data-cat') === 'chainsaw' && !isCs) || (curActiveTab.getAttribute('data-cat') === 'bar' && !isLb) || (curActiveTab.getAttribute('data-cat') === 'army' && !isArmy) || (curActiveTab.getAttribute('data-cat') === 'video' && !isVideo) || (curActiveTab.getAttribute('data-cat') === 'winner' && isWinnerHidden)) {
    document.querySelectorAll('.ui-text-cat-btn').forEach(b => {
      const isLead = b.getAttribute('data-cat') === 'leaderboard';
      b.classList.toggle('bg-pink-600', isLead);
      b.classList.toggle('text-white', isLead);
      b.classList.toggle('bg-slate-800', !isLead);
      b.classList.toggle('text-slate-300', !isLead);
      b.classList.toggle('active', isLead);
    });
    document.querySelectorAll('.ui-text-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('ui-text-cat-leaderboard')?.classList.remove('hidden');
  }

  // Render Floor config for live bar
  if (typeof renderLiveBarSceneConfig === 'function') {
    renderLiveBarSceneConfig();
  }

  // Render Arena Floor config for chainsaw
  if (typeof renderChainsawFloorConfig === 'function') {
    renderChainsawFloorConfig();
  }

  // Render Ground config for army clash
  if (typeof renderArmyClashConfig === 'function') {
    renderArmyClashConfig();
  }

  // Render Widgets List for the game type
  if (typeof renderWidgetsList === 'function') {
    renderWidgetsList();
  }

  if (window.renderSoundTab) {
    window.renderSoundTab(screenData?.gameType || 'football_duel');
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function syncFormToConfig() {
  if (!screenConfig) return;

  const gType = screenData?.gameType;

  if (gType === 'live_bar') {
    screenConfig.maxGuests = Number(document.getElementById('cfg-max-guests')?.value) || 60;
    screenConfig.spotlightSeconds = Number(document.getElementById('cfg-spotlight-sec')?.value) || 5;
    screenConfig.strollSeconds = Number(document.getElementById('cfg-stroll-sec')?.value) || 9;
    screenConfig.jumpSeconds = Number(document.getElementById('cfg-jump-sec')?.value) || 4;
    screenConfig.jumpHeight = Number(document.getElementById('cfg-jump-height')?.value) || 1.2;
    screenConfig.vipSeconds = Number(document.getElementById('cfg-vip-sec')?.value) || 0;
    screenConfig.skinSeconds = Number(document.getElementById('cfg-skin-sec')?.value) || 0;
    screenConfig.wingSeconds = Number(document.getElementById('cfg-wing-sec')?.value) || 0;
    screenConfig.badgeSeconds = Number(document.getElementById('cfg-badge-sec')?.value) || 0;
    screenConfig.idleLeaveMinutes = Number(document.getElementById('cfg-idle-leave-min')?.value) || 10;
    screenConfig.partySeconds = Number(document.getElementById('cfg-party-sec')?.value) || 7;
    screenConfig.zoom = Number(document.getElementById('cfg-camera-zoom')?.value) || 1.55;
    screenConfig.cameraZoom = Number(document.getElementById('cfg-camera-zoom')?.value) || 1.55;
    screenConfig.orbitSeconds = Number(document.getElementById('cfg-camera-orbit')?.value) || 26;
    screenConfig.cameraOrbitSeconds = Number(document.getElementById('cfg-camera-orbit')?.value) || 26;

    screenConfig.lightShow = document.getElementById('cfg-light-mode')?.value !== 'medium';
    screenConfig.cameraSway = document.getElementById('cfg-camera-sway')?.checked !== false;
    screenConfig.spotlightOnJoin = document.getElementById('cfg-spotlight-on-join')?.checked !== false;
    const djEnabled = document.getElementById('cfg-dj-screen-enable')?.checked;
    screenConfig.djScreen = djEnabled ? 'visualizer' : 'none';
    screenConfig.djScreenUrl = document.getElementById('cfg-dj-screen-url')?.value || '';
  } else if (gType === 'vote_tank') {
    screenConfig.mode = document.getElementById('cfg-vote-mode')?.value || 'race';
    screenConfig.winPoints = Number(document.getElementById('cfg-win-points')?.value) || 1000;
    screenConfig.unitLabel = document.getElementById('cfg-unit-label')?.value || 'PHIẾU';
    screenConfig.liquid = document.getElementById('cfg-theme-vote-liquid')?.value || document.getElementById('cfg-liquid')?.value || 'water';
    screenConfig.scene = document.getElementById('cfg-theme-vote-scene')?.value || document.getElementById('cfg-tank-scene')?.value || 'studio';
    screenConfig.showPercent = document.getElementById('cfg-theme-vote-percent')?.value === 'true';
    screenConfig.enableChaos = document.getElementById('cfg-vote-chaos')?.value === 'true';
  } else if (gType === 'fish_tank') {
    screenConfig.maxFish = Number(document.getElementById('cfg-fish-max')?.value) || 40;
    screenConfig.maxLevel = Number(document.getElementById('cfg-fish-max-level')?.value) || 8;
    screenConfig.swimSpeed = Number(document.getElementById('cfg-fish-speed')?.value) || 1.0;
    screenConfig.sharkIntervalMinutes = Number(document.getElementById('cfg-fish-shark-min')?.value) || 5;
    screenConfig.frenzyDurationSeconds = Number(document.getElementById('cfg-fish-frenzy-duration')?.value) || 20;
    screenConfig.shieldSeconds = Number(document.getElementById('cfg-fish-invincible')?.value) || 6;
    screenConfig.scene = document.getElementById('cfg-theme-fish-scene')?.value || 'reef';
    screenConfig.glowOnDrop = document.getElementById('cfg-theme-fish-glow')?.value === 'true';
  } else if (gType === 'football_duel') {
    screenConfig.goalPoints = Number(document.getElementById('cfg-fb-goal-points')?.value) || 50;
    screenConfig.powerLabel = document.getElementById('cfg-uitext-fb-power')?.value || document.getElementById('cfg-fb-power-label')?.value || 'LỰC SÚT';
    screenConfig.fieldUrl = document.getElementById('cfg-theme-football-field')?.value || '/football-duel/stadium-field.png';
  } else if (gType === 'army_clash') {
    screenConfig.roundSeconds = Number(document.getElementById('cfg-army-round-seconds')?.value) || 600;
    screenConfig.gateDistance = Number(document.getElementById('cfg-army-gate-distance')?.value) || 300;
    screenConfig.winDistance = screenConfig.gateDistance;
    screenConfig.maxSpeed = Number(document.getElementById('cfg-army-max-speed')?.value) || 3;
    screenConfig.maxSoldiersPerTeam = Number(document.getElementById('cfg-army-max-soldiers-per-team')?.value) || 200;
    screenConfig.maxSoldiers = screenConfig.maxSoldiersPerTeam;
    screenConfig.soldiersPerJoin = Number(document.getElementById('cfg-army-soldiers-per-join')?.value) || 1;
    screenConfig.joinPower = screenConfig.soldiersPerJoin;
    screenConfig.powerPerPerson = Number(document.getElementById('cfg-army-power-per-person')?.value) || 10;
    screenConfig.defaultRulePower = Number(document.getElementById('cfg-army-default-rule-power')?.value) || 100;

    screenConfig.attackDamage = Number(document.getElementById('cfg-army-attack-damage')?.value) || 2;
    screenConfig.attackIntervalMs = Number(document.getElementById('cfg-army-attack-interval-ms')?.value) || 700;
    screenConfig.respawnSeconds = Number(document.getElementById('cfg-army-respawn-seconds')?.value) || 6;
    screenConfig.baseHp = Number(document.getElementById('cfg-army-base-hp')?.value) || 600;
    screenConfig.powerDecayPct = Number(document.getElementById('cfg-army-power-decay-pct')?.value) || 5;
    screenConfig.idleTimeoutMin = Number(document.getElementById('cfg-army-idle-timeout-min')?.value) || 15;

    screenConfig.bossDurationSec = Number(document.getElementById('cfg-army-boss-duration-sec')?.value) || 45;
    screenConfig.summonSeconds = screenConfig.bossDurationSec;
    screenConfig.bossPower = Number(document.getElementById('cfg-army-boss-power')?.value) || 400;

    screenConfig.buffMultiplier = Number(document.getElementById('cfg-army-buff-multiplier')?.value) || 1.25;
    screenConfig.buffDurationSec = Number(document.getElementById('cfg-army-buff-duration-sec')?.value) || 30;

    screenConfig.battleGround = document.getElementById('cfg-theme-army-bg')?.value || screenConfig.battleGround || 'bamboo';
  } else if (gType === 'team_battle') {
    screenConfig.goalPoints = Number(document.getElementById('cfg-tb-goal-points')?.value) || 500;
    screenConfig.unitLabel = document.getElementById('cfg-tb-unit-label')?.value || 'GẠCH';
    screenConfig.persistWins = document.getElementById('cfg-tb-persist-wins')?.checked !== false;
    screenConfig.winLabel = document.getElementById('cfg-tb-win-label')?.value || 'THẮNG {n}';
    screenConfig.winRuleLabel = document.getElementById('cfg-tb-win-rule-label')?.value || '{points} {unit} = THẮNG · VÁN {round}';
    screenConfig.brickSize = Number(document.getElementById('cfg-tb-brick-size')?.value) || 3.4;
  } else if (gType === 'chainsaw_clash') {
    screenConfig.roundSeconds = Number(document.getElementById('cfg-saw-round-seconds')?.value) || 480;
    screenConfig.maxSaws = Number(document.getElementById('cfg-saw-max')?.value) || 36;
    screenConfig.spawnHp = Number(document.getElementById('cfg-saw-spawn-hp')?.value) || 250;
    screenConfig.maxHp = Number(document.getElementById('cfg-saw-max-hp')?.value) || 4000;
    screenConfig.damage = Number(document.getElementById('cfg-saw-damage')?.value) || 10;
    screenConfig.hitIntervalMs = Number(document.getElementById('cfg-saw-hit-interval')?.value) || 400;
    screenConfig.spawnShieldSeconds = Number(document.getElementById('cfg-saw-shield-sec')?.value) || 3;
    screenConfig.buffShieldSeconds = Number(document.getElementById('cfg-saw-buff-shield-sec')?.value) || 8;
    screenConfig.driftSpeed = Number(document.getElementById('cfg-saw-drift-speed')?.value) || 1;
    screenConfig.idleMinutes = Number(document.getElementById('cfg-saw-idle-minutes')?.value) || 8;

    screenConfig.autoRespawn = document.getElementById('cfg-saw-auto-respawn')?.checked !== false;
    screenConfig.respawnDelay = Number(document.getElementById('cfg-saw-respawn-delay')?.value) || 6;

    screenConfig.enableChaos = document.getElementById('cfg-saw-enable-chaos')?.checked !== false;
    screenConfig.chaosMinMin = Number(document.getElementById('cfg-saw-chaos-min-min')?.value) || 1.5;
    screenConfig.chaosMaxMin = Number(document.getElementById('cfg-saw-chaos-max-min')?.value) || 3;
    screenConfig.chaosDuration = Number(document.getElementById('cfg-saw-chaos-duration')?.value) || 20;
    screenConfig.orbHp = Number(document.getElementById('cfg-saw-orb-hp')?.value) || 600;
  } else if (gType === 'receipt_printer') {
    if (!screenConfig.printer) screenConfig.printer = {};
    screenConfig.printer.thanks = document.getElementById('cfg-printer-thanks')?.value || 'Cảm ơn bạn!';
    screenConfig.printer.gift = document.getElementById('cfg-printer-gift')?.value || '{gift} ×{count}';
    screenConfig.printer.comment = document.getElementById('cfg-printer-comment')?.value || '💬 {comment}';
    screenConfig.printer.like = document.getElementById('cfg-printer-like')?.value || '❤️ Đã thả {count} tim';
    screenConfig.printer.follow = document.getElementById('cfg-printer-follow')?.value || '➕ Đã follow kênh';
    screenConfig.printer.share = document.getElementById('cfg-printer-share')?.value || '↗ Đã chia sẻ live';
    screenConfig.printer.join = document.getElementById('cfg-printer-join')?.value || '👋 Đã tham gia live';
    screenConfig.printer.maxReceipts = Number(document.getElementById('cfg-printer-max-receipts')?.value) || 12;
    screenConfig.printer.feedInterval = Number(document.getElementById('cfg-printer-feed-interval')?.value) || 780;
    screenConfig.printer.showAvatar = document.getElementById('cfg-printer-show-avatar')?.checked !== false;
    screenConfig.printer.showAction = document.getElementById('cfg-printer-show-action')?.checked !== false;

    // Direct overlay schema keys
    screenConfig.receiptTitle = 'DANH SÁCH CẢM ƠN';
    screenConfig.receiptThanks = screenConfig.printer.thanks;
    screenConfig.receiptGiftTemplate = screenConfig.printer.gift;
    screenConfig.receiptCommentTemplate = screenConfig.printer.comment;
    screenConfig.receiptLikeTemplate = screenConfig.printer.like;
    screenConfig.receiptFollowText = screenConfig.printer.follow;
    screenConfig.receiptShareText = screenConfig.printer.share;
    screenConfig.receiptJoinText = screenConfig.printer.join;
    screenConfig.receiptVisible = screenConfig.printer.maxReceipts;
    screenConfig.receiptSpeedMs = screenConfig.printer.feedInterval;
    screenConfig.receiptShowAvatar = screenConfig.printer.showAvatar;
    screenConfig.receiptShowGift = screenConfig.printer.showAction;
  }

  // Theme Sync
  if (!screenConfig.theme) screenConfig.theme = {};
  const activePresetCard = document.querySelector('.theme-preset-card.active') || document.querySelector('.theme-preset-card.border-cyan-500');
  if (activePresetCard) {
    screenConfig.theme.preset = activePresetCard.getAttribute('data-preset') || 'neon';
  }

  const primaryAccent = document.getElementById('cfg-accent-color')?.value || '#22d3ee';
  const altAccent = document.getElementById('cfg-accent-alt-color')?.value || '#a855f7';
  const textClr = document.getElementById('cfg-text-color')?.value || '#ffffff';

  screenConfig.theme.accent = primaryAccent;
  screenConfig.theme.accentColor = primaryAccent;
  screenConfig.theme.accentAlt = altAccent;
  screenConfig.theme.textColor = textClr;
  screenConfig.theme.fontFamily = document.getElementById('cfg-font-family')?.value || 'roboto';
  screenConfig.theme.leaderboardPosition = document.getElementById('cfg-leaderboard-pos')?.value || 'top-right';
  screenConfig.theme.leaderboardSize = Number(document.getElementById('cfg-leaderboard-size')?.value) || 5;
  screenConfig.theme.toastPosition = document.getElementById('cfg-toast-pos')?.value || 'bottom-left';
  screenConfig.theme.scale = Number(document.getElementById('cfg-hud-scale')?.value) || 1.0;
  screenConfig.theme.panelOpacity = Number(document.getElementById('cfg-panel-opacity')?.value) || 0.55;
  screenConfig.theme.transparent = document.getElementById('cfg-bg-transparent-checkbox')?.checked !== false;
  screenConfig.theme.bgColor = document.getElementById('cfg-bg-color-picker')?.value || '#0b0e14';
  screenConfig.theme.bgImage = document.getElementById('cfg-theme-bg-image')?.value || '';

  // Custom UI Texts Sync
  if (!screenConfig.customTexts) screenConfig.customTexts = {};
  screenConfig.customTexts['football.power'] = document.getElementById('cfg-uitext-fb-power')?.value || 'LỰC SÚT';
  screenConfig.customTexts['football.goal'] = document.getElementById('cfg-uitext-fb-goal')?.value || '⚽ VÀO! VÀO! VÀO!';
  screenConfig.customTexts['football.target'] = document.getElementById('cfg-uitext-fb-target')?.value || 'MỐC GHI BÀN: {points}';
  screenConfig.customTexts['leaderboard.title'] = document.getElementById('cfg-uitext-lb-title')?.value || 'TOP TẶNG QUÀ';
  screenConfig.customTexts['leaderboard.rank1'] = document.getElementById('cfg-uitext-lb-rank1')?.value || '👑 QUÁN QUÂN';
  screenConfig.customTexts['clock.label'] = document.getElementById('cfg-uitext-clock')?.value || 'THỜI GIAN';
  screenConfig.customTexts['alert.follow'] = document.getElementById('cfg-uitext-alert-follow')?.value || '{name} vừa theo dõi kênh';
  screenConfig.customTexts['alert.share'] = document.getElementById('cfg-uitext-alert-share')?.value || '{name} vừa chia sẻ livestream';
  screenConfig.customTexts['alert.gift'] = document.getElementById('cfg-uitext-alert-gift')?.value || '👑 {name} TẶNG {gift} ×{count}';
  screenConfig.customTexts['guide.chat'] = document.getElementById('cfg-uitext-guide-chat')?.value || '💬 GÕ CHỮ ĐƯỢC GÌ';
  screenConfig.customTexts['guide.gift'] = document.getElementById('cfg-uitext-guide-gift')?.value || '🎁 QUÀ NÀO ĐƯỢC GÌ';
  screenConfig.customTexts['status.reconnect'] = document.getElementById('cfg-uitext-status-reconnect')?.value || 'Đang kết nối lại TikTok Live...';
  screenConfig.customTexts['status.pause'] = document.getElementById('cfg-uitext-status-pause')?.value || 'Trò chơi đang tạm dừng';
  screenConfig.customTexts['status.ended'] = document.getElementById('cfg-uitext-status-ended')?.value || 'Cảm ơn mọi người đã tham gia!';
  screenConfig.customTexts['winner.title'] = document.getElementById('cfg-uitext-win-title')?.value || '👑 {name} CHIẾN THẮNG!';
  screenConfig.customTexts['winner.mvp'] = document.getElementById('cfg-uitext-win-mvp')?.value || '🏆 CẦU THỦ XUẤT SẮC NHẤT';

  screenConfig.customTexts['army.title'] = document.getElementById('cfg-uitext-army-title')?.value || 'CUỘC CHIẾN NGÀN QUÂN';
  screenConfig.customTexts['army.team1'] = document.getElementById('cfg-uitext-army-team1')?.value || 'PHE XANH';
  screenConfig.customTexts['army.team2'] = document.getElementById('cfg-uitext-army-team2')?.value || 'PHE ĐỎ';
  screenConfig.customTexts['army.power'] = document.getElementById('cfg-uitext-army-power')?.value || 'SỨC ĐẨY: {n}';

  screenConfig.chatGuideTitle = screenConfig.customTexts['guide.chat'];
  screenConfig.giftGuideTitle = screenConfig.customTexts['guide.gift'];
  screenConfig.powerLabel = screenConfig.customTexts['football.power'];

  // Sound Sync
  if (!screenConfig.sound) screenConfig.sound = {};
  screenConfig.sound.enabled = document.getElementById('cfg-sound-enabled')?.checked !== false;
  screenConfig.sound.pack = document.getElementById('cfg-sound-pack')?.value || 'arcade';
  screenConfig.sound.volume = Number(document.getElementById('cfg-sound-volume')?.value) ?? 0.6;

  // TTS Sync
  if (!screenConfig.alerts) screenConfig.alerts = {};
  if (!screenConfig.alerts.tts) screenConfig.alerts.tts = {};
  screenConfig.alerts.tts.enabled = document.getElementById('cfg-tts-enabled')?.checked === true;
  screenConfig.alerts.tts.lang = document.getElementById('cfg-tts-lang')?.value || 'vi-VN';
  screenConfig.alerts.tts.minDiamonds = Number(document.getElementById('cfg-tts-min-diamonds')?.value) || 10;
  screenConfig.alerts.tts.rate = Number(document.getElementById('cfg-tts-rate')?.value) || 1.0;
  screenConfig.alerts.tts.volume = Number(document.getElementById('cfg-tts-volume')?.value) ?? 1.0;
  screenConfig.alerts.tts.voiceId = document.getElementById('cfg-tts-voice-id')?.value || '';
  screenConfig.alerts.tts.giftTemplate = document.getElementById('cfg-tts-gift-template')?.value || 'Cảm ơn {name} đã tặng {gift}';
  screenConfig.alerts.tts.readFollow = document.getElementById('cfg-tts-read-follow')?.checked === true;
  screenConfig.alerts.tts.followTemplate = document.getElementById('cfg-tts-follow-template')?.value || '{name} vừa theo dõi kênh';

  // BGM Sync
  screenConfig.bgmUrl = document.getElementById('cfg-bgm-url')?.value || '';
  screenConfig.bgmVolume = Number(document.getElementById('cfg-bgm-volume')?.value) ?? 0.5;
  screenConfig.bgmDuckVolume = Number(document.getElementById('cfg-bgm-duck')?.value) ?? 0.12;
}

function setupThemeListeners() {
  // Preset card click handlers
  document.querySelectorAll('.theme-preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.theme-preset-card').forEach(c => {
        c.classList.remove('border-2', 'border-cyan-500', 'active');
        c.classList.add('border-slate-800');
      });
      card.classList.remove('border-slate-800');
      card.classList.add('border-2', 'border-cyan-500', 'active');

      const accent = card.getAttribute('data-accent');
      const accentAlt = card.getAttribute('data-accent-alt');
      const text = card.getAttribute('data-text');
      const font = card.getAttribute('data-font');

      if (accent) {
        setVal('cfg-accent-color', accent);
        setVal('cfg-accent-color-text', accent);
      }
      if (accentAlt) {
        setVal('cfg-accent-alt-color', accentAlt);
        setVal('cfg-accent-alt-color-text', accentAlt);
      }
      if (text) {
        setVal('cfg-text-color', text);
        setVal('cfg-text-color-text', text);
      }
      if (font) {
        setVal('cfg-font-family', font);
      }
    });
  });

  // Chainsaw Arena Floor Cards
  document.querySelectorAll('.chainsaw-floor-card').forEach(card => {
    card.addEventListener('click', () => {
      const f = card.getAttribute('data-floor');
      screenConfig.floorTheme = f;
      document.querySelectorAll('.chainsaw-floor-card').forEach(c => {
        const isSel = (c === card);
        c.classList.toggle('active', isSel);
        c.classList.toggle('border-2', isSel);
        c.classList.toggle('border-orange-500', isSel);
        c.classList.toggle('border', !isSel);
        c.classList.toggle('border-slate-800', !isSel);
      });
      saveCurrentConfig();
      if (window.showToast) window.showToast(`Đã chọn mặt sàn: ${f}!`);
    });
  });

  // UI Text Category tabs
  document.querySelectorAll('.ui-text-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      document.querySelectorAll('.ui-text-cat-btn').forEach(b => {
        const isAct = b === btn;
        b.classList.toggle('bg-pink-600', isAct);
        b.classList.toggle('text-white', isAct);
        b.classList.toggle('bg-slate-800', !isAct);
        b.classList.toggle('text-slate-300', !isAct);
      });
      document.querySelectorAll('.ui-text-panel').forEach(p => p.classList.add('hidden'));
      const activePanel = document.getElementById(`ui-text-cat-${cat}`);
      if (activePanel) activePanel.classList.remove('hidden');
    });
  });

  // Color picker <-> Hex text field 2-way sync
  const bindColorSync = (pickerId, textId) => {
    const p = document.getElementById(pickerId);
    const t = document.getElementById(textId);
    if (p && t) {
      p.addEventListener('input', () => { t.value = p.value; });
      t.addEventListener('input', () => { if (/^#[0-9A-F]{6}$/i.test(t.value)) p.value = t.value; });
    }
  };
  bindColorSync('cfg-accent-color', 'cfg-accent-color-text');
  bindColorSync('cfg-accent-alt-color', 'cfg-accent-alt-color-text');
  bindColorSync('cfg-text-color', 'cfg-text-color-text');
  bindColorSync('cfg-bg-color-picker', 'cfg-bg-color-text');

  // Range slider labels
  const opSlider = document.getElementById('cfg-panel-opacity');
  const opVal = document.getElementById('cfg-panel-opacity-val');
  if (opSlider && opVal) {
    opSlider.addEventListener('input', () => {
      opVal.textContent = `${Math.round(Number(opSlider.value) * 100)}%`;
    });
  }

  const scaleSlider = document.getElementById('cfg-hud-scale');
  const scaleSpan = document.getElementById('label-hud-scale-val');
  if (scaleSlider && scaleSpan) {
    scaleSlider.addEventListener('input', () => {
      scaleSpan.textContent = `${Number(scaleSlider.value).toFixed(2)}×`;
    });
  }

  // Widget cards interaction
  document.querySelectorAll('.widget-card').forEach(card => {
    card.addEventListener('click', () => {
      const wName = card.getAttribute('data-widget');
      if (window.showToast) window.showToast(`Đã chọn widget: ${card.querySelector('span.font-bold')?.textContent || wName}`);
    });
  });

  const btnReset = document.getElementById('btn-reset-layout');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (window.showToast) window.showToast('Đã khôi phục bố cục widget về mặc định!');
    });
  }

  const btnDrag = document.getElementById('btn-drag-drop-preview');
  if (btnDrag) {
    btnDrag.addEventListener('click', () => {
      if (window.showToast) window.showToast('Chế độ kéo thả trực tiếp trên OBS Preview đang bật!');
    });
  }

  const btnAddCustom = document.getElementById('btn-add-custom-text-widget');
  if (btnAddCustom) {
    btnAddCustom.addEventListener('click', () => {
      const text = prompt('Nhập nội dung dòng chữ muốn dán lên màn hình:');
      if (text && window.showToast) {
        window.showToast(`Đã thêm dòng chữ: "${text}" lên màn hình!`);
      }
    });
  }

  // Sub-game environment sync
  const bindChangeSync = (id, field, reRenderer) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        if (screenConfig) {
          screenConfig[field] = el.value;
          if (typeof reRenderer === 'function') reRenderer();
          saveCurrentConfig();
        }
      });
    }
  };
  bindChangeSync('cfg-theme-football-field', 'fieldUrl', () => typeof renderFootballConfig === 'function' && renderFootballConfig());
  bindChangeSync('cfg-theme-army-bg', 'battleGround', () => typeof renderArmyClashConfig === 'function' && renderArmyClashConfig());
  bindChangeSync('cfg-theme-saw-floor', 'arenaFloor', () => typeof renderChainsawConfig === 'function' && renderChainsawConfig());
  bindChangeSync('cfg-theme-bar-scene', 'scene');
  bindChangeSync('cfg-theme-bar-dj', 'djScreen');
  bindChangeSync('cfg-theme-vote-liquid', 'liquid');
  bindChangeSync('cfg-theme-fish-scene', 'scene');
}

async function saveCurrentConfig() {
  const currentId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
  try {
    const res = await fetch(`/api/screens/${currentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: screenConfig })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}
