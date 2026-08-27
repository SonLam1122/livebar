// =========================================================================
// DASHBOARD GLOBAL ACTIONS & NAVIGATION
// =========================================================================

function setupTabs() {
  const switchTab = (tabId) => {
    if (!tabId) return;
    currentTab = tabId;
    document.querySelectorAll('.nav-tab').forEach(b => {
      const isAct = b.getAttribute('data-tab') === tabId;
      b.classList.toggle('active', isAct);
      b.classList.toggle('border-indigo-500', isAct);
      b.classList.toggle('text-white', isAct);
      b.classList.toggle('font-bold', isAct);
      b.classList.toggle('border-transparent', !isAct);
      b.classList.toggle('text-slate-400', !isAct);
      b.classList.toggle('font-medium', !isAct);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.remove('hidden');
  };

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  document.querySelectorAll('.btn-goto-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-target-tab');
      switchTab(tabId);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab');
  if (initialTab) {
    switchTab(initialTab);
  }
}

function setupGameSwitchers() {
  const switchers = [
    { id: 'btn-switch-livebar', sid: 'cmta2zkpq00aokx08uyc7iys2' },
    { id: 'btn-switch-votetank', sid: 'cmta2p19d00alkx08nqke0l1s' },
    { id: 'btn-switch-fishtank', sid: 'cmta8m1mj00b1kx08kjei4jfv' },
    { id: 'btn-switch-football', sid: 'cmtabct2w00bikx08f4zhsfh5' },
    { id: 'btn-switch-armyclash', sid: 'cmtabeza100bokx08q9dm9q2z' },
    { id: 'btn-switch-teambattle', sid: 'cmtabetgi00blkx08pxprwvdm' },
    { id: 'btn-switch-chainsaw', sid: 'cmtabchainsaw001' },
    { id: 'btn-switch-receiptprinter', sid: 'cmtb39d1d00chkx08sjrxty0e' },
    { id: 'btn-switch-videoreact', sid: 'cmtbk6dyh00ekkx08xtg4pc3m' },
    { id: 'btn-switch-threedogs', sid: 'cmtbk6asa00ehkx089sr0l2qw' }
  ];

  switchers.forEach(s => {
    document.getElementById(s.id)?.addEventListener('click', () => {
      switchScreen(s.sid, true);
    });
  });
}

function setupGlobalActions() {
  document.getElementById('btn-open-overlay')?.addEventListener('click', () => {
    const targetToken = screenData?.token || screenData?.id;
    window.open(`/?token=${targetToken}`, '_blank', 'width=1080,height=1920');
  });

  document.getElementById('btn-copy-obs-link')?.addEventListener('click', () => {
    const targetToken = screenData?.token || screenData?.id;
    const url = `${window.location.origin}/?token=${targetToken}`;
    navigator.clipboard.writeText(url).then(() => {
      showSimActionFeedback('📋 Đã sao chép link OBS!');
      const btn = document.getElementById('btn-copy-obs-link');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Đã chép!';
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      }
    }).catch(() => {});
  });

  const handleCleanData = async () => {
    const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
    try {
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId, reset: true, resetScore: true })
      });

      const uCount = document.getElementById('stat-count-users');
      if (uCount) uCount.textContent = '0';
      const dCount = document.getElementById('stat-count-diamonds');
      if (dCount) dCount.textContent = '0 💎';
      const lbList = document.getElementById('overview-leaderboard-list');
      if (lbList) lbList.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">Đã dọn sạch dữ liệu! Chưa có người xem nào.</div>';

      showSimActionFeedback('🧹 Đã dọn sạch toàn bộ dữ liệu trận đấu về 0!');
    } catch (e) {}
  };

  document.getElementById('btn-global-clean-data')?.addEventListener('click', handleCleanData);
  document.getElementById('btn-sim-wipe-data')?.addEventListener('click', handleCleanData);
  document.getElementById('btn-reset-stats')?.addEventListener('click', handleCleanData);

  document.getElementById('btn-reload-preview')?.addEventListener('click', () => {
    const iframe = document.getElementById('overlay-iframe');
    if (iframe) iframe.src = iframe.src;
    showSimActionFeedback('🔄 Đã tải lại khung hình xem trước!');
  });

  document.getElementById('btn-fullscreen-preview')?.addEventListener('click', () => {
    const targetToken = screenData?.token || screenData?.id;
    window.open(`/?token=${targetToken}`, '_blank', 'width=1080,height=1920');
  });

  document.querySelectorAll('.btn-save-config').forEach(btn => {
    btn.addEventListener('click', async () => {
      syncFormToConfig();
      await saveCurrentConfig();
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ Đã lưu!';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    });
  });
}

function setupInputListeners() {
  const saveOnChange = () => {
    syncFormToConfig();
    saveCurrentConfig();
  };

  const inputIds = [
    'cfg-max-guests', 'cfg-spotlight-sec', 'cfg-stroll-sec', 'cfg-jump-sec', 'cfg-jump-height',
    'cfg-vip-sec', 'cfg-skin-sec', 'cfg-wing-sec', 'cfg-badge-sec', 'cfg-idle-leave-min',
    'cfg-party-sec', 'cfg-camera-zoom', 'cfg-camera-orbit', 'cfg-light-mode',
    'cfg-camera-sway', 'cfg-spotlight-on-join', 'cfg-dj-screen-enable', 'cfg-dj-screen-url',
    'cfg-vote-mode', 'cfg-win-points', 'cfg-unit-label', 'cfg-liquid', 'cfg-tank-scene', 'cfg-vote-chaos',
    'cfg-fish-max', 'cfg-fish-max-level', 'cfg-fish-speed', 'cfg-fish-shark-min', 'cfg-fish-frenzy-duration', 'cfg-fish-invincible',
    'cfg-fb-goal-points', 'cfg-fb-power-label',
    'cfg-army-max-soldiers', 'cfg-army-win-distance', 'cfg-army-summon-sec', 'cfg-army-join-power',
    'cfg-saw-max', 'cfg-saw-spawn-hp', 'cfg-saw-damage', 'cfg-saw-shield-sec',
    'cfg-accent-color', 'cfg-font-family', 'cfg-bg-transparent',
    'cfg-sound-pack', 'cfg-sound-volume', 'cfg-tts-enabled'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', saveOnChange);
      if (el.tagName === 'INPUT' && (el.type === 'color' || el.type === 'range')) {
        el.addEventListener('input', saveOnChange);
      }
    }
  });
}
