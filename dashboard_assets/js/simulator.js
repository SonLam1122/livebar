// =========================================================================
// DASHBOARD SIMULATOR DRAWER & ACTIONS
// =========================================================================

function setupSimulatorDrawer() {
  const drawer = document.getElementById('simulator-drawer');
  const toggleDrawer = () => {
    if (drawer) {
      drawer.classList.toggle('translate-x-full');
      if (!drawer.classList.contains('translate-x-full')) {
        renderSimRulesButtons();
      }
    }
  };

  document.getElementById('btn-simulator')?.addEventListener('click', toggleDrawer);
  document.getElementById('btn-close-simulator')?.addEventListener('click', toggleDrawer);
  document.getElementById('btn-minimize-simulator')?.addEventListener('click', toggleDrawer);

  // Sub-tabs in simulator drawer
  document.querySelectorAll('.sim-nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const simTab = btn.getAttribute('data-sim-tab');
      document.querySelectorAll('.sim-nav-tab').forEach(b => {
        b.classList.remove('active', 'border-rose-500', 'text-white');
        b.classList.add('border-transparent', 'text-slate-400');
      });
      btn.classList.add('active', 'border-rose-500', 'text-white');
      btn.classList.remove('border-transparent', 'text-slate-400');

      document.querySelectorAll('.sim-panel-content').forEach(p => p.classList.add('hidden'));
      const pActive = document.getElementById(`sim-panel-${simTab}`);
      if (pActive) pActive.classList.remove('hidden');

      if (simTab === 'rules') {
        renderSimRulesButtons();
      }
    });
  });

  // Random user switcher
  document.getElementById('btn-sim-random-user')?.addEventListener('click', () => {
    const nextIdx = Math.floor(Math.random() * DEMO_USERS.length);
    currentUser = { ...DEMO_USERS[nextIdx] };
    const uInp = document.getElementById('sim-user-username');
    const nInp = document.getElementById('sim-user-nickname');
    if (uInp) uInp.value = currentUser.username;
    if (nInp) nInp.value = currentUser.name;
    showSimActionFeedback(`👤 Đã đổi sang: ${currentUser.name}`);
  });

  // Quick gift buttons
  document.querySelectorAll('.sim-gift-send').forEach(btn => {
    btn.addEventListener('click', async () => {
      const giftName = btn.getAttribute('data-gift') || 'Hoa Hồng';
      const diamonds = Number(btn.getAttribute('data-diamonds')) || 1;
      const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
      const gType = screenData?.gameType;

      readSimulatorUserInputs();

      const payload = {
        screenId,
        gift: giftName,
        diamonds,
        points: diamonds >= 50 ? diamonds * 2 : diamonds * 5,
        user: currentUser
      };

      if (gType === 'live_bar' && diamonds >= 50) {
        payload.action = 'spotlight';
      }

      lastSimulatedEvent = { type: 'gift', payload, label: `🎁 Tặng ${giftName} (${diamonds}💎)` };

      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const lastLabel = document.getElementById('sim-last-event-label');
      if (lastLabel) lastLabel.textContent = `Lượt cuối: 🎁 Tặng ${giftName} (${diamonds}💎)`;
      showSimActionFeedback(`🎁 Đã tặng ${giftName} (${diamonds}💎)!`);
    });
  });

  // Send Custom Chat
  const sendChatBtn = document.getElementById('btn-sim-send-chat');
  const chatInput = document.getElementById('sim-custom-chat-input');
  const handleSendChat = async () => {
    const text = chatInput?.value?.trim();
    if (!text) return;
    const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
    const gType = screenData?.gameType;

    readSimulatorUserInputs();

    const payload = {
      screenId,
      comment: text,
      text,
      user: currentUser,
      points: 1
    };

    if (gType === 'football_duel' || gType === 'army_clash' || gType === 'vote_tank') {
      if (text === '1') payload.boostTeam = 0;
      if (text === '2') payload.boostTeam = 1;
    }

    lastSimulatedEvent = { type: 'chat', payload, label: `💬 Gõ "${text}"` };

    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (chatInput) chatInput.value = '';
    const lastLabel = document.getElementById('sim-last-event-label');
    if (lastLabel) lastLabel.textContent = `Lượt cuối: 💬 Gõ "${text}"`;
    showSimActionFeedback(`💬 Gửi bình luận: "${text}"`);
  };

  sendChatBtn?.addEventListener('click', handleSendChat);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendChat();
  });

  // Quick Reactions (Likes, Share, Follow)
  document.querySelectorAll('.sim-quick-reaction').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reactType = btn.getAttribute('data-reaction');
      const count = Number(btn.getAttribute('data-count')) || 1;
      const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
      const gType = screenData?.gameType;

      readSimulatorUserInputs();

      let payload = { screenId, user: currentUser, points: count };
      let label = '';

      if (reactType === 'like') {
        payload.action = 'like';
        payload.likeCount = count;
        if (gType === 'football_duel' || gType === 'army_clash') {
          payload.boostTeam = 0;
        }
        label = `💖 Thả ${count} tim`;
      } else if (reactType === 'share') {
        payload.action = 'share';
        if (gType === 'football_duel' || gType === 'army_clash') {
          payload.boostTeam = 1;
        }
        label = `🔁 Chia sẻ live`;
      } else if (reactType === 'follow') {
        payload.action = 'follow';
        payload.points = 10;
        label = `➕ Nhấn follow`;
      }

      lastSimulatedEvent = { type: 'reaction', payload, label };

      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const lastLabel = document.getElementById('sim-last-event-label');
      if (lastLabel) lastLabel.textContent = `Lượt cuối: ${label}`;
      showSimActionFeedback(`⚡ Đã bắn: ${label}`);
    });
  });

  // Run all rules sequentially
  document.getElementById('btn-sim-run-all-rules')?.addEventListener('click', async () => {
    const mappings = screenConfig?.mappings || [];
    if (mappings.length === 0) return;
    for (let i = 0; i < mappings.length; i++) {
      await fireRule(i);
      await new Promise(r => setTimeout(r, 300));
    }
    showSimActionFeedback('▶ Đã chạy thử toàn bộ danh sách luật!');
  });

  // Bottom Wipe button
  document.getElementById('btn-sim-wipe-bottom')?.addEventListener('click', async () => {
    const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenId, reset: true })
    });
    const lastLabel = document.getElementById('sim-last-event-label');
    if (lastLabel) lastLabel.textContent = `Lượt cuối: ⟲ Đã dọn sạch dữ liệu`;
    showSimActionFeedback('🧹 Đã dọn sạch dữ liệu ván đấu về 0!');
  });

  // Bottom Repeat Last Event
  document.getElementById('btn-sim-repeat-last')?.addEventListener('click', async () => {
    if (!lastSimulatedEvent) {
      showSimActionFeedback('ℹ️ Chưa có sự kiện nào trước đó để bắn lại.');
      return;
    }
    if (lastSimulatedEvent.type === 'rule' && typeof fireRule === 'function') {
      await fireRule(lastSimulatedEvent.ruleIdx);
    } else if (lastSimulatedEvent.payload) {
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastSimulatedEvent.payload)
      });
      const lastLabel = document.getElementById('sim-last-event-label');
      if (lastLabel) lastLabel.textContent = `Lượt cuối: ${lastSimulatedEvent.label}`;
      showSimActionFeedback(`⚡ Bắn lại: ${lastSimulatedEvent.label}`);
    }
  });

  // Scenarios handler
  document.querySelectorAll('.sim-scenario-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const scen = btn.getAttribute('data-scenario');
      const screenId = screenData?.id || 'cmta2zkpq00aokx08uyc7iys2';
      showSimActionFeedback(`🎬 Đang chạy kịch bản mô phỏng...`);

      if (scen === 'rush') {
        for (let i = 0; i < 6; i++) {
          const tIdx = i % 2;
          await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ screenId, boostTeam: tIdx, points: 5, user: DEMO_USERS[i % DEMO_USERS.length] })
          });
          await new Promise(r => setTimeout(r, 250));
        }
      } else if (scen === 'gift_storm') {
        const gifts = [
          { name: 'Mũ Bóng Chày', d: 99 },
          { name: 'Vương Miện', d: 500 },
          { name: 'Pháo Hoa', d: 1088 }
        ];
        for (let i = 0; i < gifts.length; i++) {
          await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ screenId, gift: gifts[i].name, diamonds: gifts[i].d, points: gifts[i].d * 2, user: DEMO_USERS[i % DEMO_USERS.length] })
          });
          await new Promise(r => setTimeout(r, 600));
        }
      } else if (scen === 'comeback') {
        await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenId, boostTeam: 1, action: 'summon', points: 500, diamonds: 500, user: DEMO_USERS[2] })
        });
      }
      showSimActionFeedback(`🎉 Kịch bản hoàn tất!`);
    });
  });

  // Setup Keyboard Shortcuts (1 - 9)
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      const mappings = screenConfig?.mappings || [];
      const ruleIdx = num - 1;
      if (ruleIdx < mappings.length) {
        e.preventDefault();
        fireRule(ruleIdx);
      }
    }
  });
}

function readSimulatorUserInputs() {
  const uInp = document.getElementById('sim-user-username');
  const nInp = document.getElementById('sim-user-nickname');
  if (uInp && nInp) {
    currentUser.username = uInp.value.trim() || currentUser.username;
    currentUser.nickname = nInp.value.trim() || currentUser.nickname;
    currentUser.name = currentUser.nickname;
  }
}

function showSimActionFeedback(msg) {
  const toast = document.getElementById('sim-feedback-toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('text-rose-400');
    setTimeout(() => {
      toast.classList.remove('text-rose-400');
    }, 2000);
  }
}
