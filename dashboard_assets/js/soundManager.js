// =========================================================================
// SOUND MANAGER & AUDIO SYNTHESIZER & TTS FOR DASHBOARD
// =========================================================================

// Audio Context Singleton for synthesis in Dashboard
let dashboardAudioCtx = null;

function getAudioCtx() {
  if (!dashboardAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      dashboardAudioCtx = new AudioContext();
    }
  }
  if (dashboardAudioCtx && dashboardAudioCtx.state === 'suspended') {
    dashboardAudioCtx.resume();
  }
  return dashboardAudioCtx;
}

// Procedural Sound Synthesizers (Web Audio API)
const SoundSynth = {
  play(soundName, volume = 0.6) {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (soundName) {
      case 'footballKick': {
        // Deep punchy soccer ball kick
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
        oscGain.gain.setValueAtTime(1, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'footballNet': {
        // Ball swoosh & rustle net sound
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.25);
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'point': {
        // Quick high chime
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.06); // A5
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'coin': {
        // Mario coin style
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'gift': {
        // Happy chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          oscGain.gain.setValueAtTime(0.6, now + i * 0.06);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.25);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.25);
        });
        break;
      }

      case 'bigGift': {
        // Grand fanfare
        [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          oscGain.gain.setValueAtTime(0.9, now + i * 0.08);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.4);
        });
        break;
      }

      case 'goal':
      case 'win': {
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          oscGain.gain.setValueAtTime(0.5, now + i * 0.07);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.5);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.5);
        });
        break;
      }

      case 'brick': {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'hit': {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'countdown': {
        // High crisp beep
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'sawSpawn': {
        // Rev-up mechanical saw tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.22);
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'sawKill': {
        // Heavy saw crunch and slice
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        oscGain.gain.setValueAtTime(0.9, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'streak': {
        // Rapid 3-note ascending triumph
        [587.33, 739.99, 987.77].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          oscGain.gain.setValueAtTime(0.8, now + i * 0.06);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.18);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.18);
        });
        break;
      }

      case 'chaosEvent': {
        // Siren warble sweep
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.15);
        osc.frequency.linearRampToValueAtTime(300, now + 0.3);
        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'sawHeal': {
        // Warm rising chime
        [440, 554.37, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          oscGain.gain.setValueAtTime(0.6, now + i * 0.05);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
        break;
      }

      case 'sawShield': {
        // Metallic protective ring
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'armyJoin': {
        // Heroic recruit horn
        [349.23, 523.25, 698.46].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          oscGain.gain.setValueAtTime(0.7, now + i * 0.07);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.22);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.22);
        });
        break;
      }

      case 'armyPower': {
        // Strong power surge
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'armyClash': {
        // Metallic steel clash
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(520, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        osc2.frequency.setValueAtTime(980, now);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.15);
        oscGain.gain.setValueAtTime(0.9, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
        break;
      }

      case 'armyHero': {
        // Grand heroic fanfare
        [293.66, 369.99, 440.00, 587.33].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          oscGain.gain.setValueAtTime(0.8, now + i * 0.08);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.35);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
        break;
      }

      case 'armyBuff': {
        // Magical shimmer sparkle
        [659.25, 830.61, 987.77, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          oscGain.gain.setValueAtTime(0.7, now + i * 0.05);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.25);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.25);
        });
        break;
      }

      case 'armyComeback': {
        // Tension reversal chord swell
        [196.00, 233.08, 293.66, 392.00].forEach((freq) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.35);
          oscGain.gain.setValueAtTime(0.4, now);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.4);
        });
        break;
      }

      case 'countdown': {
        // Crisp tick
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'printReceipt': {
        // Dot matrix stepper motor chirp + paper feed slide
        [1800, 2200, 1900, 2400].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          oscGain.gain.setValueAtTime(0.15, now + i * 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.04);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now + i * 0.04);
          osc.stop(now + (i + 1) * 0.04);
        });
        break;
      }

      default: {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(440, now);
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  }
};

// Sound definitions per game
const GAME_SOUNDS_MAP = {
  video_react: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' }
  ],
  receipt_printer: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' }
  ],
  football_duel: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' },
    { key: 'footballKick', label: 'Cầu thủ sút bóng', icon: '⚽' },
    { key: 'footballNet', label: 'Bóng chạm lưới', icon: '🥅' }
  ],
  team_battle: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' },
    { key: 'win', label: 'Kết ván', icon: '👑' },
    { key: 'brick', label: 'Đặt viên gạch', icon: '🧱' },
    { key: 'hit', label: 'Va chạm', icon: '💥' }
  ],
  live_bar: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' }
  ],
  vote_tank: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình chọn thành công', icon: '🗳️' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' }
  ],
  fish_tank: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Thả cá / cho ăn', icon: '🐟' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' }
  ],
  army_clash: [
    { key: 'armyJoin', label: 'Người xem vào phe', icon: '👥' },
    { key: 'armyPower', label: 'Cộng sức đẩy', icon: '💪' },
    { key: 'armyClash', label: 'Hai đội giao tranh', icon: '⚔️' },
    { key: 'armyHero', label: 'Tướng ra sân', icon: '🐉' },
    { key: 'armyBuff', label: 'Bùa tăng sức đẩy', icon: '✨' },
    { key: 'armyComeback', label: 'Lật ngược thế trận', icon: '🔄' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '💗' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'win', label: 'Kết ván', icon: '🏆' },
    { key: 'countdown', label: 'Đếm ngược', icon: '⏱️' }
  ],
  chainsaw_clash: [
    { key: 'gift', label: 'Nhận quà', icon: '🎁' },
    { key: 'bigGift', label: 'Nhận quà lớn', icon: '👑' },
    { key: 'coin', label: 'Theo dõi / chia sẻ', icon: '🔔' },
    { key: 'point', label: 'Bình luận khớp luật', icon: '💬' },
    { key: 'goal', label: 'Đạt mục tiêu', icon: '🎯' },
    { key: 'win', label: 'Kết ván', icon: '👑' },
    { key: 'countdown', label: 'Đếm ngược', icon: '⏱️' },
    { key: 'sawSpawn', label: 'Lưỡi cưa vào sân', icon: '🪚' },
    { key: 'sawKill', label: 'Hạ gục lưỡi cưa', icon: '💀' },
    { key: 'streak', label: 'Chuỗi hạ gục', icon: '🔥' },
    { key: 'chaosEvent', label: 'Biến cố mở màn', icon: '🌀' },
    { key: 'sawHeal', label: 'Lưỡi cưa cộng máu', icon: '❤️' },
    { key: 'sawShield', label: 'Lưỡi cưa nhận khiên', icon: '🛡️' }
  ]
};

// Curated Free Music Tracks for BGM Library
const CURATED_MUSIC_LIBRARY = [
  {
    id: 'stadium-chant',
    title: 'Sân Vận Động Sôi Động (Football Crowd & Beat)',
    genre: 'Stadium / Hype',
    duration: '2:45',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=stadium-rock-111584.mp3'
  },
  {
    id: 'edm-live-party',
    title: 'EDM Party Festival (Năng lượng cao)',
    genre: 'EDM / Dance',
    duration: '3:12',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3'
  },
  {
    id: 'synthwave-retro',
    title: 'Synthwave Sunset Neon (Cuộc Chiến Tháp / Retro)',
    genre: 'Synthwave / 80s',
    duration: '2:30',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_dc39bde808.mp3?filename=synthwave-80s-110045.mp3'
  },
  {
    id: 'lofi-chill',
    title: 'Lofi Chill Study & Live Stream',
    genre: 'Lofi / Relax',
    duration: '2:18',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-study-112191.mp3'
  },
  {
    id: 'asian-pop-night',
    title: 'Tokyo Night Pop & Funk (Sôi động)',
    genre: 'Funk / Pop',
    duration: '2:50',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=funky-disco-10497.mp3'
  }
];

// Audio element for in-dashboard BGM preview
let bgmPreviewAudio = null;

function renderSoundTab(gameType) {
  const container = document.getElementById('sound-items-container');
  if (!container) return;

  const soundList = GAME_SOUNDS_MAP[gameType] || GAME_SOUNDS_MAP.football_duel;
  const mutedList = screenConfig?.sound?.muted || [];

  container.innerHTML = soundList.map(s => {
    const isMuted = mutedList.includes(s.key);
    return `
      <div class="p-3 rounded-xl bg-slate-950/80 border ${isMuted ? 'border-rose-900/40 bg-rose-950/10' : 'border-slate-800/80'} flex flex-col justify-between gap-2.5 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">${s.icon}</span>
            <span class="text-xs font-bold ${isMuted ? 'text-slate-500 line-through' : 'text-slate-200'}">${s.label}</span>
          </div>
          <button class="btn-toggle-sound-mute p-1.5 rounded-lg ${isMuted ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} text-xs font-bold transition-all" data-sound-key="${s.key}" title="${isMuted ? 'Bấm để bật tiếng này' : 'Bấm để tắt tiếng này'}">
            ${isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <div class="flex items-center gap-1.5 pt-1 border-t border-slate-900">
          <button class="btn-play-single-sound flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/20 flex items-center justify-center gap-1 transition-all" data-sound-key="${s.key}">
            <span>▶️</span> Nghe
          </button>
          <label class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold cursor-pointer transition-all" title="Tải file thay thế (< 1s)">
            <span>⬆️</span>
            <input type="file" accept="audio/*" class="input-custom-sound hidden" data-sound-key="${s.key}">
          </label>
        </div>
      </div>
    `;
  }).join('');

  // Bind sound item handlers
  container.querySelectorAll('.btn-play-single-sound').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-sound-key');
      const vol = Number(document.getElementById('cfg-sound-volume')?.value ?? 0.6);
      SoundSynth.play(key, vol);
      showSimActionFeedback(`🔊 Đang phát thử: ${key}`);
    });
  });

  container.querySelectorAll('.btn-toggle-sound-mute').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-sound-key');
      if (!screenConfig.sound) screenConfig.sound = {};
      if (!screenConfig.sound.muted) screenConfig.sound.muted = [];

      const idx = screenConfig.sound.muted.indexOf(key);
      if (idx > -1) {
        screenConfig.sound.muted.splice(idx, 1);
      } else {
        screenConfig.sound.muted.push(key);
      }

      renderSoundTab(screenData?.gameType || 'football_duel');
      showSimActionFeedback(idx > -1 ? `🔊 Đã bật âm: ${key}` : `🔇 Đã tắt âm: ${key}`);
    });
  });

  container.querySelectorAll('.input-custom-sound').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const key = inp.getAttribute('data-sound-key');
      if (file) {
        showSimActionFeedback(`✅ Đã chọn file âm thanh riêng cho ${key} (${(file.size/1024).toFixed(1)} KB)`);
      }
    });
  });

  // Dynamic game title for BGM
  const bgmTitleEl = document.getElementById('label-bgm-title');
  if (bgmTitleEl) {
    const gameLabels = {
      football_duel: 'sân bóng',
      team_battle: 'trận',
      live_bar: 'sàn',
      vote_tank: 'bể bình chọn',
      fish_tank: 'bể cá',
      army_clash: 'chiến trường',
      chainsaw_clash: 'sân',
      receipt_printer: 'máy in',
      video_react: 'màn hình'
    };
    const gLabel = gameLabels[gameType] || 'sàn';
    bgmTitleEl.innerHTML = `<span>🎵</span> Nhạc nền của ${gLabel}`;
    
    const bgmDescEl = document.getElementById('label-bgm-desc');
    if (bgmDescEl) {
      if (gameType === 'video_react') {
        bgmDescEl.textContent = 'Clip nền luôn câm — tiếng nền là một bài nhạc phát lặp riêng. Clip chuyển động vẫn phát tiếng gốc của nó.';
      } else {
        bgmDescEl.textContent = `Overlay tự phát nhạc lặp vô hạn khi ${gLabel} lên sóng. Để trống nếu bạn đã phát nhạc bằng OBS hoặc bằng nhạc của TikTok.`;
      }
    }
    
    const bgmInput = document.getElementById('cfg-bgm-url');
    if (bgmInput) {
      bgmInput.placeholder = `Link YouTube hoặc https://…/nhac-nen.mp3 — để trống thì ${gLabel} không phát nhạc`;
    }
  }

  // Handle Video React BGM Mode Source Selector
  const vrBgmSec = document.getElementById('vr-bgm-source-section');
  const isVideoReact = (gameType === 'video_react');
  if (vrBgmSec) {
    vrBgmSec.style.display = isVideoReact ? '' : 'none';
    if (isVideoReact) {
      const currentSrc = screenConfig?.bgmSource || 'template';
      document.querySelectorAll('.btn-vr-bgm-source').forEach(b => {
        const src = b.getAttribute('data-source');
        const isActive = (src === currentSrc);
        b.classList.toggle('border-pink-500', isActive);
        b.classList.toggle('bg-pink-500/10', isActive);
        b.classList.toggle('text-pink-300', isActive);
        b.classList.toggle('font-bold', isActive);
        b.classList.toggle('border-slate-800', !isActive);
        b.classList.toggle('bg-slate-900', !isActive);
        b.classList.toggle('text-slate-300', !isActive);

        if (!b._bound) {
          b._bound = true;
          b.addEventListener('click', () => {
            screenConfig.bgmSource = src;
            renderSoundTab('video_react');
            if (typeof saveCurrentConfig === 'function') saveCurrentConfig();
          });
        }
      });

      const customBgmSec = document.getElementById('bgm-custom-url-section');
      if (customBgmSec) customBgmSec.style.display = (currentSrc === 'custom') ? '' : 'none';

      const descEl = document.getElementById('vr-bgm-source-desc');
      if (descEl) {
        const isTuat = (screenConfig?.template?.name || '').includes('Tuất');
        if (isTuat) {
          descEl.textContent = 'Mẫu 3 Tuất vàng Live không kèm nhạc nền, nên màn hình sẽ im tiếng cho tới khi có clip chuyển động chạy. Chọn Nhạc của tôi để tự thêm một bài.';
        } else {
          descEl.textContent = 'Đang dùng bài nhạc admin đặt sẵn trong mẫu Live Show 3 Mèo, cùng mức âm lượng admin đã cân với tiếng của clip chuyển động. Muốn bài khác thì chọn Nhạc của tôi — mẫu là của chung nên đổi nhạc trong mẫu sẽ đổi cho mọi người.';
        }
      }
    }
  }

  // Handle LED Screen audio toggle for Live Bar
  const ledSec = document.getElementById('sound-livebar-led-section');
  if (ledSec) {
    const isLiveBar = (gameType === 'live_bar');
    ledSec.style.display = isLiveBar ? '' : 'none';

    if (isLiveBar) {
      const ledChk = document.getElementById('cfg-livebar-led-sound');
      if (ledChk) {
        ledChk.checked = !!(screenConfig?.ledSound ?? screenConfig?.livebar?.ledAudio);
        if (!ledChk._bound) {
          ledChk._bound = true;
          ledChk.addEventListener('change', () => {
            if (!screenConfig.livebar) screenConfig.livebar = {};
            screenConfig.ledSound = ledChk.checked;
            screenConfig.livebar.ledAudio = ledChk.checked;
            if (typeof saveCurrentConfig === 'function') saveCurrentConfig();
          });
        }
      }
    }
  }
}

// Populate Speech Synthesis Voices
function populateTtsVoices() {
  const select = document.getElementById('cfg-tts-voice-id');
  if (!select) return;

  if (!('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices();
  const countEl = document.getElementById('tts-voice-count');
  if (countEl && voices.length > 0) {
    countEl.textContent = String(voices.length);
  }

  const currentVal = screenConfig?.alerts?.tts?.voiceId || '';
  select.innerHTML = '<option value="">— Giọng mặc định của hệ thống —</option>';

  // Sort Vietnamese voices to top
  const sorted = [...voices].sort((a, b) => {
    const aVi = a.lang.startsWith('vi') ? -1 : 1;
    const bVi = b.lang.startsWith('vi') ? -1 : 1;
    return aVi - bVi;
  });

  sorted.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI || v.name;
    opt.textContent = `${v.name} (${v.lang})${v.lang.startsWith('vi') ? ' 🇻🇳 [Ưu tiên]' : ''}`;
    if (opt.value === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

// Preview TTS
function speakTtsPreview(customText = null) {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Speech Synthesis API.');
    return;
  }

  window.speechSynthesis.cancel();

  const textTemplate = customText || document.getElementById('cfg-tts-gift-template')?.value || 'Cảm ơn {name} đã tặng {gift}';
  const sampleText = textTemplate
    .replace('{name}', 'Nguyễn Văn A')
    .replace('{gift}', 'Hoa Hồng')
    .replace('{count}', '10')
    .replace('{diamonds}', '10');

  const utter = new SpeechSynthesisUtterance(sampleText);
  utter.lang = document.getElementById('cfg-tts-lang')?.value || 'vi-VN';
  utter.rate = Number(document.getElementById('cfg-tts-rate')?.value || 1.0);
  utter.volume = Number(document.getElementById('cfg-tts-volume')?.value || 1.0);

  const voiceId = document.getElementById('cfg-tts-voice-id')?.value;
  if (voiceId) {
    const voice = window.speechSynthesis.getVoices().find(v => (v.voiceURI === voiceId || v.name === voiceId));
    if (voice) utter.voice = voice;
  }

  window.speechSynthesis.speak(utter);
  showSimActionFeedback(`🗣️ Đang đọc: "${sampleText}"`);
}

// Setup Global Sound Listeners
function setupSoundManagerListeners() {
  // Populate voices when loaded
  if ('speechSynthesis' in window) {
    populateTtsVoices();
    window.speechSynthesis.onvoiceschanged = populateTtsVoices;
  }

  // Sliders label updates
  const soundVol = document.getElementById('cfg-sound-volume');
  const soundVolLbl = document.getElementById('label-sound-volume');
  soundVol?.addEventListener('input', () => {
    if (soundVolLbl) soundVolLbl.textContent = `${Math.round(soundVol.value * 100)}%`;
  });

  const ttsRate = document.getElementById('cfg-tts-rate');
  const ttsRateLbl = document.getElementById('label-tts-rate');
  ttsRate?.addEventListener('input', () => {
    if (ttsRateLbl) ttsRateLbl.textContent = `${Number(ttsRate.value).toFixed(1)}×`;
  });

  const ttsVol = document.getElementById('cfg-tts-volume');
  const ttsVolLbl = document.getElementById('label-tts-volume');
  ttsVol?.addEventListener('input', () => {
    if (ttsVolLbl) ttsVolLbl.textContent = `${Math.round(ttsVol.value * 100)}%`;
  });

  const bgmVol = document.getElementById('cfg-bgm-volume');
  const bgmVolLbl = document.getElementById('label-bgm-volume');
  bgmVol?.addEventListener('input', () => {
    if (bgmVolLbl) bgmVolLbl.textContent = `${Math.round(bgmVol.value * 100)}%`;
  });

  const bgmDuck = document.getElementById('cfg-bgm-duck');
  const bgmDuckLbl = document.getElementById('label-bgm-duck');
  bgmDuck?.addEventListener('input', () => {
    if (bgmDuckLbl) bgmDuckLbl.textContent = `${Math.round(bgmDuck.value * 100)}%`;
  });

  // Action Buttons
  document.getElementById('btn-test-all-sounds')?.addEventListener('click', () => {
    const vol = Number(document.getElementById('cfg-sound-volume')?.value ?? 0.6);
    const gType = screenData?.gameType || 'football_duel';
    if (gType === 'live_bar') {
      SoundSynth.play('coin', vol);
      setTimeout(() => SoundSynth.play('point', vol), 300);
      setTimeout(() => SoundSynth.play('gift', vol), 600);
      setTimeout(() => SoundSynth.play('bigGift', vol), 1000);
      setTimeout(() => SoundSynth.play('goal', vol), 1500);
    } else if (gType === 'army_clash') {
      SoundSynth.play('armyJoin', vol);
      setTimeout(() => SoundSynth.play('armyPower', vol), 350);
      setTimeout(() => SoundSynth.play('armyClash', vol), 750);
      setTimeout(() => SoundSynth.play('armyHero', vol), 1150);
      setTimeout(() => SoundSynth.play('armyBuff', vol), 1600);
      setTimeout(() => SoundSynth.play('win', vol), 2100);
    } else {
      SoundSynth.play('footballKick', vol);
      setTimeout(() => SoundSynth.play('point', vol), 300);
      setTimeout(() => SoundSynth.play('coin', vol), 600);
      setTimeout(() => SoundSynth.play('gift', vol), 900);
      setTimeout(() => SoundSynth.play('footballNet', vol), 1300);
      setTimeout(() => SoundSynth.play('goal', vol), 1600);
    }
    showSimActionFeedback('🎧 Đang phát thử chuỗi âm thanh của game...');
  });

  document.getElementById('btn-tts-preview')?.addEventListener('click', () => speakTtsPreview());
  document.getElementById('btn-tts-preview-voice')?.addEventListener('click', () => speakTtsPreview('Xin chào, đây là giọng đọc thử nghiệm của hệ thống live tương tác TikTok!'));

  // BGM Library Modal
  const modalMusic = document.getElementById('modal-music-library');
  const musicList = document.getElementById('music-library-list');

  document.getElementById('btn-open-music-library')?.addEventListener('click', () => {
    if (musicList) {
      musicList.innerHTML = CURATED_MUSIC_LIBRARY.map(track => `
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/50 transition-all">
          <div class="space-y-0.5">
            <h5 class="text-xs font-bold text-white">${track.title}</h5>
            <div class="flex items-center gap-2 text-[10px] text-slate-400">
              <span class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-medium">${track.genre}</span>
              <span>⏱️ ${track.duration}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-preview-track px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700" data-url="${track.url}">
              ▶️ Nghe
            </button>
            <button class="btn-select-track px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md" data-url="${track.url}">
              Chọn bài này
            </button>
          </div>
        </div>
      `).join('');

      musicList.querySelectorAll('.btn-preview-track').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-url');
          if (bgmPreviewAudio) {
            bgmPreviewAudio.pause();
            bgmPreviewAudio = null;
          }
          bgmPreviewAudio = new Audio(url);
          bgmPreviewAudio.volume = Number(document.getElementById('cfg-bgm-volume')?.value ?? 0.5);
          bgmPreviewAudio.play().catch(() => {});
          showSimActionFeedback('🎵 Đang nghe thử nhạc nền...');
        });
      });

      musicList.querySelectorAll('.btn-select-track').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-url');
          const inputUrl = document.getElementById('cfg-bgm-url');
          if (inputUrl) inputUrl.value = url;
          if (bgmPreviewAudio) {
            bgmPreviewAudio.pause();
            bgmPreviewAudio = null;
          }
          modalMusic?.classList.add('hidden');
          showSimActionFeedback('✅ Đã chọn nhạc nền từ thư viện!');
        });
      });
    }
    modalMusic?.classList.remove('hidden');
  });

  document.getElementById('btn-close-music-modal')?.addEventListener('click', () => {
    if (bgmPreviewAudio) {
      bgmPreviewAudio.pause();
      bgmPreviewAudio = null;
    }
    modalMusic?.classList.add('hidden');
  });

  // Upload music file
  const musicFileInput = document.getElementById('input-upload-music-file');
  document.getElementById('btn-upload-music')?.addEventListener('click', () => {
    musicFileInput?.click();
  });

  musicFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const inputUrl = document.getElementById('cfg-bgm-url');
      if (inputUrl) inputUrl.value = url;
      showSimActionFeedback(`✅ Đã tải file nhạc lên: ${file.name} (${(file.size / (1024*1024)).toFixed(1)} MB)`);
    }
  });
}

window.SoundSynth = SoundSynth;
window.renderSoundTab = renderSoundTab;
window.setupSoundManagerListeners = setupSoundManagerListeners;
