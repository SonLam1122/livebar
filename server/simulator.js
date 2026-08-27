let spotlightTimer = null;

function normalizeUser(rawUser) {
  const u = rawUser || {};
  const username = (u.username || 'nguoi_xem_demo1').trim();
  const nickname = (u.nickname || u.name || username || 'Khán giả Demo').trim();
  const avatarUrl = u.avatarUrl || u.avatar || `/api/avatars/${username}.svg`;

  return {
    username,
    name: nickname,
    nickname,
    avatar: avatarUrl,
    avatarUrl
  };
}

function handleSimulation(mState, payload, targetScreen, overlayIo) {
  const gType = targetScreen?.gameType || mState.gameType;
  const user = normalizeUser(payload.user);
  const fxList = [];

  mState.serverNow = Date.now();

  // Update leaderboard helper
  const updateLeaderboard = (pts, diamonds = 0) => {
    let entry = mState.leaderboard.find(p => p.username === user.username);
    if (!entry) {
      entry = {
        username: user.username,
        name: user.nickname,
        nickname: user.nickname,
        avatar: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        points: 0,
        diamonds: 0
      };
      mState.leaderboard.push(entry);
    }
    entry.points += pts;
    entry.diamonds += (diamonds || 0);
    mState.leaderboard.sort((a, b) => b.points - a.points);
    if (mState.leaderboard.length > 20) mState.leaderboard.length = 20;
  };

  // 1. ARMY CLASH
  if (gType === 'army_clash') {
    const tIdx = payload.boostTeam ?? 0;
    const pts = payload.points || 1;
    const winDist = targetScreen?.config?.winDistance || 300;

    if (mState.teams[tIdx]) {
      mState.teams[tIdx].points = (mState.teams[tIdx].points || 0) + pts;
      mState.teams[tIdx].score = mState.teams[tIdx].points;

      if (!mState.army) {
        mState.army = {
          line: 0,
          lineSpeed: 0,
          power: [0, 0],
          streak: [0, 0],
          baseHp: [600, 600],
          pool: 0,
          soldiers: [],
          summons: [],
          recentClashes: []
        };
      }
      if (!mState.army.recentClashes) mState.army.recentClashes = [];

      mState.army.power[tIdx] = (mState.army.power[tIdx] || 0) + pts;
      mState.army.pool = (mState.army.pool || 0) + pts;
      mState.army.streak[tIdx] = (mState.army.streak[tIdx] || 0) + 1;
      mState.army.streak[1 - tIdx] = 0;

      const speed = (mState.army.power[0] - mState.army.power[1]) * 0.1;
      mState.army.lineSpeed = Math.max(-10, Math.min(10, speed));
      mState.army.line = Math.max(-winDist, Math.min(winDist, mState.army.line + (tIdx === 0 ? pts : -pts)));

      if (payload.action === 'summon') {
        mState.army.summons.push({
          id: `sum_${Date.now()}`,
          teamIndex: tIdx,
          hero: targetScreen.config?.teams?.[tIdx]?.backgroundUrl || '/army/hero-panda.webp',
          points: pts,
          diamonds: payload.diamonds || 50,
          user,
          activeUntil: Date.now() + (targetScreen?.config?.summonSeconds || 15) * 1000
        });
        fxList.push({ kind: 'hero_summon', teamIndex: tIdx, hero: targetScreen.config?.teams?.[tIdx]?.backgroundUrl });
      } else {
        mState.army.soldiers.push({
          id: `sol_${Date.now()}_${Math.random()}`,
          teamIndex: tIdx,
          user,
          points: pts
        });
        if (mState.army.soldiers.length > (targetScreen?.config?.maxSoldiers || 120)) {
          mState.army.soldiers.shift();
        }
      }

      mState.army.recentClashes.push({
        id: `clash_${Date.now()}`,
        teamIndex: tIdx,
        points: pts,
        user
      });
      if (mState.army.recentClashes.length > 20) mState.army.recentClashes.shift();

      updateLeaderboard(pts, payload.diamonds || 0);
    }
  }

  // TEAM BATTLE / CUỘC CHIẾN THÁP (XÂY THÁP)
  if (gType === 'team_battle') {
    const tIdx = payload.boostTeam ?? 0;
    const pts = payload.points || 1;
    const diamonds = payload.diamonds || 0;
    const goalPts = targetScreen?.config?.goalPoints || 500;

    if (!mState.teams || mState.teams.length < 2) {
      mState.teams = [
        { name: 'PHE XANH', points: 0, score: 0, wins: 0, color: '#38bdf8', emoji: '💙', members: [] },
        { name: 'PHE HỒNG', points: 0, score: 0, wins: 0, color: '#f43f5e', emoji: '💖', members: [] }
      ];
    }

    if (mState.teams[tIdx]) {
      mState.teams[tIdx].points = (mState.teams[tIdx].points || 0) + pts;
      mState.teams[tIdx].score = mState.teams[tIdx].points;

      fxList.push({
        kind: 'brick_fall',
        team: tIdx,
        points: pts,
        user
      });

      // Check win condition for round
      if (mState.teams[tIdx].points >= goalPts && mState.winnerIndex === null) {
        mState.winnerIndex = tIdx;
        mState.teams[tIdx].wins = (mState.teams[tIdx].wins || 0) + 1;
        fxList.push({ kind: 'winner', winnerIndex: tIdx, team: tIdx, user });

        // Reset points and increment round after victory celebration (3s)
        setTimeout(() => {
          if (mState && mState.teams) {
            mState.round = (mState.round || 1) + 1;
            mState.winnerIndex = null;
            mState.teams[0].points = 0;
            mState.teams[0].score = 0;
            mState.teams[1].points = 0;
            mState.teams[1].score = 0;
            if (global.overlayIo) {
              global.overlayIo.emit('match:state', mState);
            }
          }
        }, 3000);
      }
    }

    updateLeaderboard(pts, diamonds);
  }

  // 2. CHAINSAW CLASH
  else if (gType === 'chainsaw_clash') {
    const pts = payload.points || 1;
    const diamonds = payload.diamonds || 0;

    if (!mState.chainsaw) {
      mState.chainsaw = {
        saws: [],
        scores: [],
        ring: { radius: 1.0, phase: 'normal' },
        podium: [],
        recentHits: [],
        recentKills: []
      };
    }
    if (!mState.chainsaw.scores) mState.chainsaw.scores = [];
    if (!mState.chainsaw.saws) mState.chainsaw.saws = [];
    if (!mState.chainsaw.recentHits) mState.chainsaw.recentHits = [];
    if (!mState.chainsaw.recentKills) mState.chainsaw.recentKills = [];

    let scoreEntry = mState.chainsaw.scores.find(s => s.username === user.username);
    if (!scoreEntry) {
      scoreEntry = {
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        kills: 0,
        bestStreak: 0
      };
      mState.chainsaw.scores.push(scoreEntry);
    }

    let saw = mState.chainsaw.saws.find(s => s.user?.username === user.username || s.username === user.username);
    if (payload.action === 'spawn' || !saw) {
      const startX = Math.random() * 50 + 25;
      const startY = Math.random() * 50 + 25;
      const toX = Math.min(85, Math.max(15, startX + (Math.random() * 40 - 20)));
      const toY = Math.min(85, Math.max(15, startY + (Math.random() * 40 - 20)));
      saw = {
        id: `saw_${user.username}`,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        user,
        hue: Math.floor(Math.random() * 360),
        hp: targetScreen?.config?.spawnHp || 250,
        maxHp: targetScreen?.config?.maxHp || 4000,
        level: 1,
        kills: scoreEntry.kills,
        path: {
          fromX: startX,
          toX,
          fromY: startY,
          toY,
          startedAt: Date.now(),
          endsAt: Date.now() + 6000
        },
        shield: {
          active: false,
          endsAt: Date.now() + (targetScreen?.config?.shieldSeconds || 4) * 1000
        },
        shieldUntil: Date.now() + (targetScreen?.config?.shieldSeconds || 4) * 1000,
        deadUntil: 0
      };
      mState.chainsaw.saws.push(saw);
      fxList.push({ kind: 'saw_spawn', user });
    }

    if (payload.action === 'grow') {
      if (saw) {
        saw.hp = Math.min(saw.maxHp, saw.hp + (diamonds * 10 || 100));
        saw.level += 1;
        saw.kills += 1;
        scoreEntry.kills += 1;
        scoreEntry.bestStreak += 1;
        saw.path = {
          fromX: saw.path.toX || 50,
          toX: Math.min(85, Math.max(15, Math.random() * 60 + 20)),
          fromY: saw.path.toY || 50,
          toY: Math.min(85, Math.max(15, Math.random() * 60 + 20)),
          startedAt: Date.now(),
          endsAt: Date.now() + 5000
        };
      }
      fxList.push({ kind: 'saw_grow', user, hp: diamonds * 10 || 100 });
    }

    if (payload.action === 'chaos') {
      mState.chainsaw.ring.phase = 'danger';
      mState.chainsaw.ring.radius = Math.max(0.3, mState.chainsaw.ring.radius - 0.2);
      fxList.push({ kind: 'chaos_ring', radius: mState.chainsaw.ring.radius });
    }

    // Simulate hit event if at least 2 saws
    const otherSaws = mState.chainsaw.saws.filter(s => s.username !== user.username);
    if (otherSaws.length > 0 && Math.random() > 0.3) {
      const other = otherSaws[Math.floor(Math.random() * otherSaws.length)];
      mState.chainsaw.recentHits.push({
        target: other.username,
        source: user.username,
        amount: targetScreen?.config?.damage || 25,
        at: Date.now(),
        x: saw.path?.toX || 50,
        y: saw.path?.toY || 50
      });
      if (mState.chainsaw.recentHits.length > 30) mState.chainsaw.recentHits.shift();
    }

    updateLeaderboard(pts, diamonds);
  }

  // 3. FOOTBALL DUEL
  else if (gType === 'football_duel') {
    const tIdx = payload.boostTeam ?? 0;
    const pts = payload.points || 1;
    const goalPts = targetScreen?.config?.goalPoints || 50;

    if (mState.teams[tIdx]) {
      mState.teams[tIdx].points = (mState.teams[tIdx].points || 0) + pts;
      mState.teams[tIdx].score = mState.teams[tIdx].points;

      const p0 = mState.teams[0]?.points || 0;
      const p1 = mState.teams[1]?.points || 0;
      const diff = p0 - p1;

      // Ball progress: 0.5 is center, 1.0 is Blue goal (entering Red net), 0.0 is Red goal (entering Blue net)
      const progress = Math.min(1, Math.max(0, 0.5 + (diff / (2 * goalPts))));
      mState.teams[0].progress = progress;
      mState.teams[1].progress = 1 - progress;
      if (mState.football) mState.football.ball = progress;

      // Check if goal threshold difference is reached
      if (diff >= goalPts) {
        // Team 0 (Blue) scores!
        mState.teams[0].wins = (mState.teams[0].wins || 0) + 1;
        mState.winnerIndex = 0;
        fxList.push({ kind: 'winner', teamIndex: 0 });
        fxList.push({ kind: 'goal_celebration', teamIndex: 0 });
        fxList.push({ kind: 'sound', name: 'footballNet' });

        // Reset points for new round kickoff
        mState.teams[0].points = 0;
        mState.teams[1].points = 0;

        setTimeout(() => {
          if (mState && mState.gameType === 'football_duel') {
            mState.winnerIndex = null;
            mState.teams[0].progress = 0.5;
            mState.teams[1].progress = 0.5;
            if (mState.football) mState.football.ball = 0.5;
            if (overlayIo) overlayIo.emit('match:state', mState);
          }
        }, 2500);
      } else if (diff <= -goalPts) {
        // Team 1 (Red) scores!
        mState.teams[1].wins = (mState.teams[1].wins || 0) + 1;
        mState.winnerIndex = 1;
        fxList.push({ kind: 'winner', teamIndex: 1 });
        fxList.push({ kind: 'goal_celebration', teamIndex: 1 });
        fxList.push({ kind: 'sound', name: 'footballNet' });

        // Reset points for new round kickoff
        mState.teams[0].points = 0;
        mState.teams[1].points = 0;

        setTimeout(() => {
          if (mState && mState.gameType === 'football_duel') {
            mState.winnerIndex = null;
            mState.teams[0].progress = 0.5;
            mState.teams[1].progress = 0.5;
            if (mState.football) mState.football.ball = 0.5;
            if (overlayIo) overlayIo.emit('match:state', mState);
          }
        }, 2500);
      } else {
        fxList.push({ kind: 'kick_boost', teamIndex: tIdx, points: pts, user });
        fxList.push({ kind: 'sound', name: 'footballKick' });
      }

      updateLeaderboard(pts, payload.diamonds || 0);
    }
  }

  // 4. VOTE TANK
  else if (gType === 'vote_tank') {
    const tIdx = payload.boostTeam ?? 0;
    const pts = payload.points || 10;
    const winPts = targetScreen?.config?.winPoints || 1000;

    if (mState.tanks && mState.tanks[tIdx]) {
      mState.tanks[tIdx].points = (mState.tanks[tIdx].points || 0) + pts;
      mState.tanks[tIdx].score = mState.tanks[tIdx].points;

      if (!mState.vote) {
        mState.vote = {
          tanks: [
            { points: 0, top: [] },
            { points: 0, top: [] }
          ],
          recentPours: []
        };
      }
      if (!mState.vote.tanks) mState.vote.tanks = [];
      if (!mState.vote.tanks[tIdx]) mState.vote.tanks[tIdx] = { points: 0, top: [] };
      if (!mState.vote.recentPours) mState.vote.recentPours = [];

      mState.vote.tanks[tIdx].points = mState.tanks[tIdx].points;
      mState.vote.tanks[tIdx].top = [
        { username: user.username, nickname: user.nickname, avatarUrl: user.avatarUrl, votes: mState.tanks[tIdx].points }
      ];

      const pourItem = {
        id: `pour_${Date.now()}`,
        tankIndex: tIdx,
        points: pts,
        user
      };

      mState.recentPours.push(pourItem);
      mState.vote.recentPours.push(pourItem);
      if (mState.recentPours.length > 30) mState.recentPours.shift();
      if (mState.vote.recentPours.length > 30) mState.vote.recentPours.shift();

      if (mState.tanks[tIdx].points >= winPts) {
        mState.winnerIndex = tIdx;
        fxList.push({ kind: 'tank_overflow_win', tankIndex: tIdx });
      } else {
        fxList.push({ kind: 'liquid_pour', tankIndex: tIdx, points: pts });
      }

      updateLeaderboard(pts, payload.diamonds || 0);
    }
  }

  // 5. FISH TANK
  else if (gType === 'fish_tank') {
    const pts = payload.points || 10;
    const diamonds = payload.diamonds || 0;

    if (!mState.fish || Array.isArray(mState.fish)) {
      mState.fish = {
        fish: [],
        food: [],
        recentKills: [],
        recentFeeds: [],
        pendingAttacks: [],
        highlights: [],
        totalEaten: 0,
        giantShark: null,
        nextGiantSharkAt: 0,
        frenzyEndsAt: 0
      };
    }
    if (!mState.fish.fish) mState.fish.fish = [];
    if (!mState.fish.food) mState.fish.food = [];
    if (!mState.fish.recentKills) mState.fish.recentKills = [];
    if (!mState.fish.recentFeeds) mState.fish.recentFeeds = [];
    if (!mState.fish.pendingAttacks) mState.fish.pendingAttacks = [];
    if (!mState.fish.highlights) mState.fish.highlights = [];

    let fishItem = mState.fish.fish.find(f => f.username === user.username);

    if (payload.action === 'spawn_fish' || !fishItem) {
      const startX = Math.random() * 80 + 40;
      const startY = Math.random() * 50 + 20;
      fishItem = {
        id: `fish_${user.username}`,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        level: 1,
        exp: 0,
        maxExp: 100,
        kills: 0,
        killStreak: 0,
        score: 0,
        bornAt: Date.now(),
        path: {
          fromX: startX,
          toX: startX + (Math.random() * 40 - 20),
          fromY: startY,
          toY: startY + (Math.random() * 30 - 15),
          startedAt: Date.now(),
          endsAt: Date.now() + 6000
        },
        escapedUntil: 0
      };
      mState.fish.fish.push(fishItem);
      mState.aliveCount = mState.fish.fish.length;
      fxList.push({ kind: 'fish_spawn', user });
    }

    if (payload.action === 'feed' || payload.gift || payload.comment) {
      if (fishItem) {
        fishItem.exp += pts;
        if (fishItem.exp >= fishItem.maxExp && fishItem.level < (targetScreen?.config?.maxLevel || 8)) {
          fishItem.level += 1;
          fishItem.exp = 0;
          fishItem.maxExp = Math.round(fishItem.maxExp * 1.5);
          fishItem.kills += 1;
          mState.fish.totalEaten = (mState.fish.totalEaten || 0) + 1;
          fxList.push({ kind: 'fish_level_up', user, level: fishItem.level });
        }
      }

      // Thả thêm các viên thức ăn vào hồ cá
      const pCount = Math.min(6, Math.max(2, Math.floor(pts / 5) || 3));
      if (!mState.fish.food) mState.fish.food = [];
      for (let i = 0; i < pCount; i++) {
        mState.fish.food.push({
          id: `food_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
          kind: 'pellet',
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          bornAt: Date.now()
        });
      }

      fxList.push({ kind: 'feed_pellets', points: pts });
    }

    if (payload.action === 'spawn_shark') {
      mState.fish.giantShark = {
        startedAt: Date.now(),
        endsAt: Date.now() + 20000,
        fromX: 0,
        toX: 160,
        y: 45
      };
      fxList.push({ kind: 'shark_incoming' });
    }

    updateLeaderboard(pts, diamonds);
  }

  // 6. RECEIPT PRINTER
  else if (gType === 'receipt_printer') {
    if (!mState.receipt) {
      mState.receipt = { entries: [] };
    }
    if (!mState.receipt.entries) {
      mState.receipt.entries = [];
    }

    const cfg = targetScreen?.config || {};
    const prCfg = cfg.printer || {};

    let eventText = '';
    const trig = payload.trigger || payload.type || (payload.gift ? 'gift' : payload.comment ? 'comment' : payload.likeCount ? 'like' : payload.action || 'gift');

    if (trig === 'gift' || payload.gift) {
      const gName = payload.gift || payload.giftName || 'Hoa Hồng';
      const count = payload.count || 1;
      const tpl = prCfg.gift || cfg.receiptGiftTemplate || '{gift} ×{count}';
      eventText = tpl.replace('{gift}', gName).replace('{count}', count);
      mState.totalDiamonds = (mState.totalDiamonds || 0) + (payload.diamonds || 1);
    } else if (trig === 'comment' || payload.comment || payload.text) {
      const commentText = payload.comment || payload.text || 'Tuyệt vời!';
      const tpl = prCfg.comment || cfg.receiptCommentTemplate || '💬 {comment}';
      eventText = tpl.replace('{comment}', commentText);
    } else if (trig === 'like' || payload.action === 'like' || payload.likeCount) {
      const count = payload.likeCount || payload.count || 15;
      const tpl = prCfg.like || cfg.receiptLikeTemplate || '❤️ Đã thả {count} tim';
      eventText = tpl.replace('{count}', count);
    } else if (trig === 'follow' || payload.action === 'follow') {
      eventText = prCfg.follow || cfg.receiptFollowText || '➕ Đã follow kênh';
    } else if (trig === 'share' || payload.action === 'share') {
      eventText = prCfg.share || cfg.receiptShareText || '↗ Đã chia sẻ live';
    } else if (trig === 'join' || trig === 'enter' || payload.action === 'join') {
      eventText = prCfg.join || cfg.receiptJoinText || '👋 Đã tham gia live';
    } else {
      eventText = payload.eventText || prCfg.thanks || cfg.receiptThanks || 'Cảm ơn bạn!';
    }

    const nextSeq = (mState.receipt.entries.at(-1)?.seq || 0) + 1;
    const newEntry = {
      seq: nextSeq,
      style: payload.style || 'classic',
      username: user.username,
      nickname: user.nickname || user.name,
      avatarUrl: user.avatarUrl || user.avatar,
      giftName: payload.gift || 'Hoa Hồng',
      repeatCount: payload.count || 1,
      eventText: eventText,
      timestamp: Date.now()
    };

    mState.receipt.entries.push(newEntry);

    const maxVisible = prCfg.maxReceipts || cfg.receiptVisible || 12;
    if (mState.receipt.entries.length > maxVisible + 10) {
      mState.receipt.entries.shift();
    }

    updateLeaderboard(payload.points || payload.diamonds || 1, payload.diamonds || 0);

    fxList.push({
      kind: 'receipt_print',
      entry: newEntry
    });
  }

  // 7. VIDEO REACT (LIVE SHOW 3 MÈO & 3 TUẤT VÀNG)
  else if (gType === 'video_react') {
    const pts = payload.points || 1;
    const diamonds = payload.diamonds || 0;

    const tpl = targetScreen?.config?.template || {};
    const actions = tpl.actions || [];
    const idleUrl = tpl.idleUrl || (targetScreen?.name?.includes('Tuất') ? '/Tuất/idle.mp4' : '/Meow/idle.mp4');

    if (!mState.video) {
      mState.video = {
        current: {
          url: idleUrl,
          loop: true,
          playId: 1
        }
      };
    }

    let matchedAction = null;

    if (payload.action === 'play_video' && payload.videoKey) {
      matchedAction = actions.find(a => a.key === payload.videoKey);
    } else if (payload.gift) {
      const rule = targetScreen?.config?.mappings?.find(m => m.action === 'play_video' && (m.trigger === 'gift_any' || (m.trigger === 'gift' && m.giftName === payload.gift)));
      if (rule && rule.videoKey) {
        matchedAction = actions.find(a => a.key === rule.videoKey);
      }
    } else if (payload.comment) {
      const rule = targetScreen?.config?.mappings?.find(m => m.action === 'play_video' && (m.trigger === 'comment_any' || (m.trigger === 'comment' && payload.comment.includes(m.keyword))));
      if (rule && rule.videoKey) {
        matchedAction = actions.find(a => a.key === rule.videoKey);
      }
    } else if (payload.type === 'like' || payload.likes) {
      const rule = targetScreen?.config?.mappings?.find(m => m.action === 'play_video' && m.trigger === 'like');
      if (rule && rule.videoKey) {
        matchedAction = actions.find(a => a.key === rule.videoKey);
      }
    } else if (payload.type === 'follow') {
      const rule = targetScreen?.config?.mappings?.find(m => m.action === 'play_video' && m.trigger === 'follow');
      if (rule && rule.videoKey) {
        matchedAction = actions.find(a => a.key === rule.videoKey);
      }
    } else if (payload.type === 'share') {
      const rule = targetScreen?.config?.mappings?.find(m => m.action === 'play_video' && m.trigger === 'share');
      if (rule && rule.videoKey) {
        matchedAction = actions.find(a => a.key === rule.videoKey);
      }
    }

    if (!matchedAction && actions.length > 0) {
      matchedAction = actions[0];
    }

    if (matchedAction && matchedAction.url) {
      const dur = matchedAction.durationMs || 7000;
      const playId = Date.now();

      mState.video.current = {
        url: matchedAction.url,
        loop: false,
        playId: playId
      };

      fxList.push({
        kind: 'play_video',
        videoKey: matchedAction.key,
        action: matchedAction,
        user
      });

      if (overlayIo) overlayIo.emit('match:state', mState);

      setTimeout(() => {
        if (mState && mState.video && mState.video.current && mState.video.current.playId === playId) {
          mState.video.current = {
            url: idleUrl,
            loop: true,
            playId: Date.now()
          };
          if (overlayIo) overlayIo.emit('match:state', mState);
        }
      }, dur);
    }

    updateLeaderboard(pts, diamonds);
  }

  // 8. LIVE BAR (DEFAULT)
  else {
    const pts = payload.points || 10;
    const diamonds = payload.diamonds || 1;

    mState.score += pts;

    let guest = mState.guests.find(g => g.username === user.username);
    if (!guest) {
      const skins = targetScreen?.config?.skinLibrary || [];
      const chosenSkin = skins[Math.floor(Math.random() * skins.length)] || { imageUrl: '/bar/dancers/1.gif' };
      guest = {
        id: `guest_${user.username}`,
        username: user.username,
        name: user.nickname,
        nickname: user.nickname,
        avatar: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        slot: mState.guests.length,
        badge: null,
        podium: null,
        vipSkin: null,
        skin: null,
        wing: null,
        skinUrl: chosenSkin.imageUrl,
        enteredAt: Date.now()
      };
      mState.guests.push(guest);
    }

    guest.diamonds = (guest.diamonds || 0) + diamonds;
    if (payload.gift) {
      guest.giftCount = (guest.giftCount || 0) + 1;
      if (diamonds > (guest.maxSingleGiftDiamonds || 0)) {
        guest.maxSingleGiftDiamonds = diamonds;
      }
    }
    if (payload.comment) {
      guest.commentCount = (guest.commentCount || 0) + 1;
    }
    if (payload.type === 'like' || payload.likes || payload.count) {
      const likeAmount = payload.likes || payload.count || 1;
      guest.likeCount = (guest.likeCount || 0) + likeAmount;
    }

    if (mState.bar) {
      mState.bar.guests = mState.guests;
    }

    // Tự động cập nhật danh hiệu (Badges) cho Live Bar
    updateLiveBarBadges(mState, fxList);

    // Tự động đưa Top 1 2 3 tặng quà nhiều nhất lên Sân Khấu (Podium)
    updateLiveBarPodium(mState, fxList);

    if (diamonds >= 50 || payload.action === 'spotlight') {
      clearTimeout(spotlightTimer);
      const spotSec = targetScreen?.config?.spotlightSeconds || 5;
      mState.spotlight = {
        username: user.username,
        nickname: user.nickname,
        user,
        diamonds,
        giftName: payload.gift || 'Vua Quà Tặng 👑',
        endsAt: Date.now() + spotSec * 1000
      };
      if (mState.bar) {
        mState.bar.spotlight = {
          username: user.username,
          reason: 'gift',
          endsAt: Date.now() + spotSec * 1000
        };
      }
      fxList.push({ kind: 'spotlight_zoom', user, diamonds, gift: payload.gift });

      spotlightTimer = setTimeout(() => {
        mState.spotlight = null;
        if (mState.bar) {
          mState.bar.spotlight = null;
        }
        mState.serverNow = Date.now();
        if (overlayIo) {
          overlayIo.emit('match:state', mState);
        }
      }, spotSec * 1000);
    }

    // Cấp ngẫu nhiên 1 trong 6 đôi Cánh khi tặng quà lớn (>= 20 kim cương hoặc action wing)
    if (diamonds >= 20 || payload.action === 'wing') {
      const wingLib = targetScreen?.config?.wingLibrary || [];
      if (wingLib.length > 0) {
        const chosenWing = wingLib[Math.floor(Math.random() * wingLib.length)];
        guest.wing = chosenWing.id;
        guest.wingName = chosenWing.label;

        fxList.push({
          kind: 'alert',
          alert: {
            title: '✨ CÁNH THẦN THOẠI ✨',
            subtitle: `${user.nickname} nhận được ${chosenWing.label}! 🪽`,
            avatarUrl: user.avatarUrl,
            color: '#f59e0b',
            durationMs: 4000
          }
        });
        fxList.push({ kind: 'sound', name: 'level_up' });

        const wingSec = targetScreen?.config?.wingSeconds || 60;
        if (wingSec > 0) {
          setTimeout(() => {
            if (guest && guest.wing === chosenWing.id) {
              guest.wing = null;
              guest.wingName = null;
              if (mState.bar) {
                mState.bar.guests = mState.guests;
              }
              mState.serverNow = Date.now();
              if (overlayIo) {
                overlayIo.emit('match:state', mState);
              }
            }
          }, wingSec * 1000);
        }
      }
    }

    if (payload.action === 'jump') {
      const jumpSec = targetScreen?.config?.jumpSeconds || 4;
      mState.jumps.push({
        username: user.username,
        user,
        startedAt: Date.now(),
        endsAt: Date.now() + jumpSec * 1000
      });
      if (mState.bar) {
        mState.bar.jumps = mState.jumps;
      }
      fxList.push({ kind: 'jump_wave', user });

      setTimeout(() => {
        mState.jumps = mState.jumps.filter(j => j.username !== user.username);
        if (mState.bar) {
          mState.bar.jumps = mState.jumps;
        }
        mState.serverNow = Date.now();
        if (overlayIo) {
          overlayIo.emit('match:state', mState);
        }
      }, jumpSec * 1000);
    }

    updateLeaderboard(pts, diamonds);
  }

  return { mState, fxList };
}

function updateLiveBarBadges(mState, fxList) {
  if (!mState.guests || mState.guests.length === 0) return;

  const guests = mState.guests;
  const previousBadges = new Map(guests.map(g => [g.username, g.badge]));

  // Xóa danh hiệu tạm thời để tính toán lại công bằng và chính xác
  guests.forEach(g => { g.badge = null; g.badgeName = null; });

  const assignedUsers = new Set();

  // 1. Người dẫn đầu (người vào phòng đầu tiên)
  const firstGuest = [...guests].sort((a, b) => (a.enteredAt || 0) - (b.enteredAt || 0))[0];
  if (firstGuest) {
    firstGuest.badge = 'cmsla49vr001qnu16lzo2spf8';
    firstGuest.badgeName = 'Người dẫn đầu';
    assignedUsers.add(firstGuest.username);
  }

  // 2. Đại gia (người tặng quà có giá trị cao nhất)
  const daiGiaCandidates = [...guests].filter(g => (g.maxSingleGiftDiamonds || 0) > 0 || (g.diamonds || 0) > 0)
    .sort((a, b) => ((b.maxSingleGiftDiamonds || 0) - (a.maxSingleGiftDiamonds || 0)) || ((b.diamonds || 0) - (a.diamonds || 0)));
  
  if (daiGiaCandidates.length > 0) {
    const topDaiGia = daiGiaCandidates[0];
    topDaiGia.badge = 'cmsla49vr001rnu16wstb5qhf';
    topDaiGia.badgeName = 'Đại gia';
    assignedUsers.add(topDaiGia.username);
  }

  // 3. Ông hoàng sàn nhảy (người tặng nhiều số lượng quà nhất)
  const giftSenders = [...guests].filter(g => (g.giftCount || 0) > 0)
    .sort((a, b) => (b.giftCount || 0) - (a.giftCount || 0));

  if (giftSenders.length > 0) {
    const ongHoang = giftSenders[0];
    if (ongHoang.badge !== 'cmsla49vr001rnu16wstb5qhf') {
      ongHoang.badge = 'cmsla49vr001snu16hcwqtrjt';
      ongHoang.badgeName = 'Ông hoàng sàn nhảy';
      assignedUsers.add(ongHoang.username);
    }
  }

  // 4. Bà chúa vũ trường (người tặng nhiều số lượng quà tiếp theo)
  const baChuaCandidates = giftSenders.filter(g => g.badge !== 'cmsla49vr001snu16hcwqtrjt' && g.badge !== 'cmsla49vr001rnu16wstb5qhf');
  if (baChuaCandidates.length > 0) {
    const baChua = baChuaCandidates[0];
    baChua.badge = 'cmsla49vr001tnu16viiab444';
    baChua.badgeName = 'Bà chúa vũ trường';
    assignedUsers.add(baChua.username);
  }

  // 5. Thuyền trưởng (người comment nhiều nhất)
  const commenters = [...guests].filter(g => (g.commentCount || 0) > 0)
    .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));

  if (commenters.length > 0) {
    const thuyenTruong = commenters.find(g => !assignedUsers.has(g.username)) || commenters[0];
    thuyenTruong.badge = 'cmsla49vr001unu16ws5ulamr';
    thuyenTruong.badgeName = 'Thuyền trưởng';
    assignedUsers.add(thuyenTruong.username);
  }

  // 6. Thả thính (người thả tim nhiều nhất)
  const likers = [...guests].filter(g => (g.likeCount || 0) > 0)
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));

  if (likers.length > 0) {
    const thaThinh = likers.find(g => !assignedUsers.has(g.username)) || likers[0];
    thaThinh.badge = 'cmsla49vr001vnu16l6wfgx7w';
    thaThinh.badgeName = 'Thả thính';
    assignedUsers.add(thaThinh.username);
  }

  // Bắn alert thông báo khi có danh hiệu mới được trao
  if (fxList) {
    guests.forEach(g => {
      const prev = previousBadges.get(g.username);
      if (g.badge && g.badge !== prev) {
        fxList.push({
          kind: 'alert',
          alert: {
            title: '🏅 DANH HIỆU MỚI 🏅',
            subtitle: `${g.nickname} đã nhận danh hiệu ${g.badgeName}!`,
            avatarUrl: g.avatarUrl,
            color: '#38bdf8',
            durationMs: 4000
          }
        });
      }
    });
  }

  if (mState.bar) {
    mState.bar.guests = mState.guests;
  }
}

function updateLiveBarPodium(mState, fxList) {
  if (!mState.guests || mState.guests.length === 0) return;

  const guests = mState.guests;
  const previousPodiums = new Map(guests.map(g => [g.username, g.podium]));

  // Reset toàn bộ vị trí sân khấu để tính toán lại chính xác
  guests.forEach(g => { g.podium = null; });

  // Lọc và sắp xếp người tặng quà nhiều nhất theo kim cương (hoặc số lượng quà)
  const topGifters = [...guests]
    .filter(g => (g.diamonds || 0) > 0 || (g.giftCount || 0) > 0)
    .sort((a, b) => ((b.diamonds || 0) - (a.diamonds || 0)) || ((b.giftCount || 0) - (a.giftCount || 0)));

  // Gán 3 vị trí trên Sân Khấu Podium:
  // Top 1 -> podium = 0 (Chính giữa sân khấu)
  // Top 2 -> podium = 1 (Bên trái sân khấu)
  // Top 3 -> podium = 2 (Bên phải sân khấu)
  if (topGifters.length > 0) {
    topGifters[0].podium = 0;
  }
  if (topGifters.length > 1) {
    topGifters[1].podium = 1;
  }
  if (topGifters.length > 2) {
    topGifters[2].podium = 2;
  }

  // Thông báo chúc mừng khi có người mới bước lên Top 1 2 3 sân khấu
  if (fxList) {
    const podiumLabels = { 0: '🥇 TOP 1 SÂN KHẤU', 1: '🥈 TOP 2 SÂN KHẤU', 2: '🥉 TOP 3 SÂN KHẤU' };
    topGifters.slice(0, 3).forEach(g => {
      const prev = previousPodiums.get(g.username);
      if (g.podium !== null && g.podium !== prev) {
        fxList.push({
          kind: 'alert',
          alert: {
            title: `⭐ ${podiumLabels[g.podium]} ⭐`,
            subtitle: `${g.nickname} đã bước lên sân khấu vinh danh!`,
            avatarUrl: g.avatarUrl,
            color: g.podium === 0 ? '#fbbf24' : g.podium === 1 ? '#94a3b8' : '#b45309',
            durationMs: 4000
          }
        });
      }
    });
  }

  if (mState.bar) {
    mState.bar.guests = mState.guests;
  }
}

module.exports = {
  handleSimulation
};
