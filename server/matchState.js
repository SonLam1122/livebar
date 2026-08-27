const { getScreens } = require('./screens');

const matchStates = {};

function createCleanMatchState(screenId, gameType) {
  const base = {
    screenId,
    gameType,
    matchId: `match_${gameType}_${Date.now()}`,
    serverNow: Date.now(),
    round: 1,
    roundEndsAt: Date.now() + 3600 * 1000,
    endsAt: null,
    phase: 'playing',
    winnerIndex: null,
    winnerLabel: null,
    winnerBy: null,
    leaderboard: [],
    score: 0,
    totalDiamonds: 0,
    goal: { enabled: false, label: 'Mục tiêu kim cương', target: 10000, current: 0 }
  };

  if (gameType === 'live_bar') {
    return {
      ...base,
      score: 0,
      guests: [],
      strolls: [],
      jumps: [],
      spotlight: null,
      bar: {
        guests: [],
        strolls: [],
        jumps: [],
        spotlight: null,
        vipGuests: [],
        recentVips: [],
        spotlightQueue: [],
        kingSpotlight: null,
        soundSync: { bpm: 128, beat: 0 }
      },
      teams: [
        { name: 'Sàn nhảy', points: 0, score: 0, color: '#a855f7', emoji: '🍸', members: [] }
      ]
    };
  }

  if (gameType === 'vote_tank') {
    return {
      ...base,
      mode: 'race',
      winPoints: 1000,
      tanks: [
        { id: 'tank_1', name: 'Việt Nam', points: 0, score: 0, color: '#ef4444', emoji: '🇻🇳', voters: [], top: [] },
        { id: 'tank_2', name: 'Thái Lan', points: 0, score: 0, color: '#3b82f6', emoji: '🇹🇭', voters: [], top: [] }
      ],
      vote: {
        tanks: [
          { points: 0, top: [] },
          { points: 0, top: [] }
        ],
        recentPours: []
      },
      teams: [
        { name: 'Việt Nam', points: 0, score: 0, color: '#ef4444', emoji: '🇻🇳', members: [] },
        { name: 'Thái Lan', points: 0, score: 0, color: '#3b82f6', emoji: '🇹🇭', members: [] }
      ],
      recentPours: []
    };
  }

  if (gameType === 'fish_tank') {
    return {
      ...base,
      fish: {
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
      },
      food: [],
      highlights: [],
      giantShark: null,
      frenzy: null,
      aliveCount: 0,
      eatenCount: 0,
      teams: [
        { name: 'Hồ Cá Đại Dương', points: 0, score: 0, color: '#0d9488', emoji: '🐟', members: [] }
      ]
    };
  }

  if (gameType === 'football_duel') {
    return {
      ...base,
      teams: [
        { name: 'ĐỘI XANH', points: 0, progress: 0.5, wins: 0, score: 0, color: '#3b82f6', emoji: '🔵', members: [] },
        { name: 'ĐỘI ĐỎ', points: 0, progress: 0.5, wins: 0, score: 0, color: '#ef4444', emoji: '🔴', members: [] }
      ],
      football: {
        ball: 0.5,
        goalPoints: 50,
        powerLabel: 'LỰC SÚT',
        phase: 'playing'
      }
    };
  }

  if (gameType === 'army_clash') {
    return {
      ...base,
      teams: [
        { name: 'ĐỘI XANH', points: 0, score: 0, color: '#3b82f6', emoji: '🔵', soldiers: 0, members: [] },
        { name: 'ĐỘI ĐỎ', points: 0, score: 0, color: '#ef4444', emoji: '🔴', soldiers: 0, members: [] }
      ],
      army: {
        line: 0,
        lineSpeed: 0,
        power: [0, 0],
        streak: [0, 0],
        baseHp: [600, 600],
        pool: 0,
        soldiers: [],
        summons: [],
        recentClashes: []
      }
    };
  }

  if (gameType === 'team_battle') {
    return {
      ...base,
      round: 1,
      winnerIndex: null,
      teams: [
        { name: 'PHE XANH', points: 0, score: 0, wins: 0, color: '#38bdf8', emoji: '💙', members: [] },
        { name: 'PHE HỒNG', points: 0, score: 0, wins: 0, color: '#f43f5e', emoji: '💖', members: [] }
      ]
    };
  }

  if (gameType === 'chainsaw_clash') {
    return {
      ...base,
      chainsaw: {
        saws: [],
        scores: [],
        ring: {
          radius: 1.0,
          phase: 'normal'
        },
        podium: [],
        recentHits: [],
        recentKills: []
      },
      teams: [
        { name: 'ĐẤU TRƯỜNG CƯA XÍCH', points: 0, score: 0, color: '#f59e0b', emoji: '🪚', members: [] }
      ]
    };
  }

  if (gameType === 'receipt_printer') {
    return {
      ...base,
      receipt: {
        entries: []
      },
      teams: [
        { name: 'MÁY IN CẢM ƠN', points: 0, score: 0, color: '#22d3ee', emoji: '🧾', members: [] }
      ]
    };
  }

  if (gameType === 'video_react') {
    const s = getScreens().find(x => x.id === screenId);
    const idleUrl = s?.config?.template?.idleUrl || '/Meow/idle.mp4';
    return {
      ...base,
      video: {
        current: {
          url: idleUrl,
          loop: true,
          playId: 1
        }
      },
      teams: [
        { name: s?.name || 'MÀN HÌNH VIDEO', points: 0, score: 0, color: '#f43f5e', emoji: '🎬', members: [] }
      ]
    };
  }

  return base;
}

function initAllMatchStates() {
  const screens = getScreens();
  screens.forEach(s => {
    matchStates[s.id] = createCleanMatchState(s.id, s.gameType);
  });
  return matchStates;
}

function getMatchState(screenId) {
  if (!matchStates[screenId]) {
    const screens = getScreens();
    const screen = screens.find(s => s.id === screenId || s.token === screenId);
    const gameType = screen ? screen.gameType : 'live_bar';
    matchStates[screenId] = createCleanMatchState(screenId, gameType);
  }
  return matchStates[screenId];
}

function resetMatchState(screenId) {
  const screens = getScreens();
  const screen = screens.find(s => s.id === screenId || s.token === screenId);
  const gameType = screen ? screen.gameType : 'live_bar';
  matchStates[screenId] = createCleanMatchState(screenId, gameType);
  return matchStates[screenId];
}

function resetAllMatchStates() {
  const screens = getScreens();
  screens.forEach(s => {
    matchStates[s.id] = createCleanMatchState(s.id, s.gameType);
  });
  return matchStates;
}

// Initial state setup
initAllMatchStates();

module.exports = {
  createCleanMatchState,
  initAllMatchStates,
  getMatchState,
  resetMatchState,
  resetAllMatchStates,
  matchStates
};
