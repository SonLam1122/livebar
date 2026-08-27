// =========================================================================
// TAOLIVETUONGTAC - CONTINUOUS GAME LOOP & FISH TANK AI TICKER
// =========================================================================

const { matchStates } = require('./matchState');
const { getScreens } = require('./screens');

let gameLoopInterval = null;

function startGameLoop(overlayIo) {
  if (gameLoopInterval) clearInterval(gameLoopInterval);

  gameLoopInterval = setInterval(() => {
    try {
      const now = Date.now();
      const screens = getScreens();

      for (const screen of screens) {
        const mState = matchStates[screen.id];
        if (!mState) continue;

        // =========================================================================
        // 1. FISH TANK: DYNAMIC AI SWIMMING, ROAMING & FOOD HUNTING
        // =========================================================================
        if (screen.gameType === 'fish_tank' || mState.gameType === 'fish_tank') {
          if (!mState.fish) continue;
          let changed = false;

          // Tạo sẵn cá demo sống động nếu hồ cá đang trống
          if (!mState.fish.fish || mState.fish.fish.length === 0) {
            const demoFishList = [
              { username: 'nemo_gold', nickname: 'Cá Vàng Nemo', avatarUrl: '/api/avatars/nemo.svg', level: 2 },
              { username: 'shark_junior', nickname: 'Tiểu Cá Mập', avatarUrl: '/api/avatars/shark.svg', level: 3 },
              { username: 'dory_blue', nickname: 'Cá Xanh Dory', avatarUrl: '/api/avatars/dory.svg', level: 1 }
            ];
            mState.fish.fish = demoFishList.map((df, idx) => {
              const startX = 20 + idx * 25;
              const startY = 30 + (idx % 2) * 20;
              return {
                id: `fish_${df.username}`,
                username: df.username,
                nickname: df.nickname,
                avatarUrl: df.avatarUrl,
                level: df.level,
                exp: 0,
                maxExp: 100,
                kills: 0,
                killStreak: 0,
                score: 0,
                bornAt: now,
                path: {
                  fromX: startX,
                  fromY: startY,
                  toX: Math.random() * 80 + 10,
                  toY: Math.random() * 60 + 20,
                  startedAt: now,
                  endsAt: now + (3000 + Math.random() * 2000)
                },
                escapedUntil: 0
              };
            });
            mState.aliveCount = mState.fish.fish.length;
            changed = true;
          }

          const fishes = mState.fish.fish;

          // Tự động sinh thức ăn (mồi bơi & viên thức ăn) trong hồ cá
          if (!mState.fish.food) mState.fish.food = [];
          if (mState.fish.food.length < 8 && Math.random() < 0.35) {
            mState.fish.food.push({
              id: `food_${now}_${Math.floor(Math.random() * 1000)}`,
              kind: Math.random() < 0.4 ? 'prey' : 'pellet',
              x: Math.random() * 85 + 7.5,
              y: Math.random() * 65 + 18,
              bornAt: now
            });
            changed = true;
          }

          // Cập nhật quỹ đạo bơi liên tục cho từng chú cá
          for (const fish of fishes) {
            const p = fish.path;
            if (!p || !p.endsAt || now >= p.endsAt - 250) {
              const progress = (p && p.endsAt && p.startedAt)
                ? Math.min(1, Math.max(0, (now - p.startedAt) / Math.max(1, p.endsAt - p.startedAt)))
                : 1;
              const currX = (p && p.fromX != null && p.toX != null)
                ? p.fromX + (p.toX - p.fromX) * progress
                : (Math.random() * 80 + 10);
              const currY = (p && p.fromY != null && p.toY != null)
                ? p.fromY + (p.toY - p.fromY) * progress
                : (Math.random() * 60 + 20);

              // 50% cơ hội bơi đến thức ăn gần nhất, hoặc bơi dạo chơi khắp bể
              let newToX = Math.random() * 85 + 7.5;
              let newToY = Math.random() * 65 + 18;

              if (mState.fish.food && mState.fish.food.length > 0 && Math.random() < 0.5) {
                const targetFood = mState.fish.food[Math.floor(Math.random() * mState.fish.food.length)];
                newToX = targetFood.x;
                newToY = targetFood.y;
              }

              const dist = Math.hypot(newToX - currX, newToY - currY);
              // Tốc độ bơi nhanh nhẹn, tự nhiên
              const duration = Math.max(2200, Math.min(5000, dist * 65 + Math.random() * 800));

              fish.path = {
                fromX: currX,
                fromY: currY,
                toX: newToX,
                toY: newToY,
                startedAt: now,
                endsAt: now + duration
              };
              changed = true;
            }
          }

          // Kiểm tra va chạm ăn thức ăn
          if (mState.fish.food && mState.fish.food.length > 0) {
            const remainingFood = [];
            for (const food of mState.fish.food) {
              let eaten = false;
              for (const fish of fishes) {
                const p = fish.path;
                const progress = Math.min(1, Math.max(0, (now - p.startedAt) / Math.max(1, p.endsAt - p.startedAt)));
                const fx = p.fromX + (p.toX - p.fromX) * progress;
                const fy = p.fromY + (p.toY - p.fromY) * progress;
                if (Math.hypot(fx - food.x, fy - food.y) < 7.0) {
                  eaten = true;
                  if (!mState.fish.recentFeeds) mState.fish.recentFeeds = [];
                  mState.fish.recentFeeds.push({
                    predator: fish.username,
                    foodId: food.id,
                    kind: food.kind,
                    at: now
                  });
                  fish.exp = (fish.exp || 0) + (food.kind === 'prey' ? 25 : 10);
                  if (fish.exp >= (fish.maxExp || 100) && fish.level < (screen?.config?.maxLevel || 8)) {
                    fish.level += 1;
                    fish.exp = 0;
                    fish.maxExp = Math.round((fish.maxExp || 100) * 1.5);
                  }
                  mState.fish.totalEaten = (mState.fish.totalEaten || 0) + 1;
                  changed = true;
                  break;
                }
              }
              if (!eaten && (now - food.bornAt < 25000)) {
                remainingFood.push(food);
              }
            }
            if (remainingFood.length !== mState.fish.food.length) {
              mState.fish.food = remainingFood;
              changed = true;
            }
          }

          // Dọn dẹp các hiệu ứng feed & kill cũ
          if (mState.fish.recentFeeds && mState.fish.recentFeeds.length > 0) {
            const beforeCount = mState.fish.recentFeeds.length;
            mState.fish.recentFeeds = mState.fish.recentFeeds.filter(f => now - f.at < 3500);
            if (mState.fish.recentFeeds.length !== beforeCount) changed = true;
          }
          if (mState.fish.recentKills && mState.fish.recentKills.length > 0) {
            const beforeKills = mState.fish.recentKills.length;
            mState.fish.recentKills = mState.fish.recentKills.filter(k => now - k.at < 4000);
            if (mState.fish.recentKills.length !== beforeKills) changed = true;
          }

          if (changed) {
            mState.serverNow = now;
            if (overlayIo) {
              overlayIo.to(screen.id).emit('match:state', mState);
              if (screen.token) overlayIo.to(screen.token).emit('match:state', mState);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in game loop:', err);
    }
  }, 1000);
}

module.exports = {
  startGameLoop
};
