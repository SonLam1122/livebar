const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('./config');

const SCREENS_FILE = path.join(ROOT_DIR, 'screens_data.json');
const LEGACY_SCREEN_FILE = path.join(ROOT_DIR, 'screen_data.json');

let screensList = [];

const DANCERS_DIR = path.join(ROOT_DIR, 'bar', 'dancers');
let _dancerScanKey = '';

// Đặt tên đẹp từ tên file: "anh-vest-xanh.gif" -> "Anh vest xanh"
function labelFromFile(file) {
  const base = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : file;
}

// Tự động nạp MỌI nhân vật trong bar/dancers/ vào thư viện skin của Live Bar.
// Nhờ vậy chỉ cần thả file .gif/.webp/.png vào thư mục là nhân vật tự xuất hiện,
// không cần sửa tay screens_data.json.
function mergeDancerSkins(list) {
  let files;
  try {
    files = fs.readdirSync(DANCERS_DIR).filter(f => /\.(gif|webp|png|apng)$/i.test(f)).sort();
  } catch (e) {
    return;
  }
  const scanKey = files.join('|');
  _dancerScanKey = scanKey;
  const liveBar = list.find(s => s.gameType === 'live_bar');
  if (!liveBar) return;
  if (!liveBar.config) liveBar.config = {};
  if (!Array.isArray(liveBar.config.skinLibrary)) liveBar.config.skinLibrary = [];
  const lib = liveBar.config.skinLibrary;
  const have = new Set(lib.map(s => s.imageUrl));
  for (const f of files) {
    const url = '/bar/dancers/' + f;
    if (have.has(url)) continue;
    lib.push({ id: 'auto_' + f.replace(/[^a-zA-Z0-9]+/g, '_'), label: labelFromFile(f), imageUrl: url });
    have.add(url);
  }
}

function loadScreens() {
  try {
    if (fs.existsSync(SCREENS_FILE)) {
      screensList = JSON.parse(fs.readFileSync(SCREENS_FILE, 'utf8'));
    } else if (fs.existsSync(LEGACY_SCREEN_FILE)) {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_SCREEN_FILE, 'utf8'));
      screensList = [legacy];
    }
  } catch (err) {
    console.error('Error loading screens:', err);
    screensList = [];
  }
  mergeDancerSkins(screensList);
  return screensList;
}

function getScreens() {
  return loadScreens();
}

function getScreenById(screenId) {
  const list = getScreens();
  return list.find(s => s.id === screenId || s.token === screenId) || list[0];
}

function updateScreenConfig(screenId, updatedConfig) {
  const list = getScreens();
  const screen = list.find(s => s.id === screenId || s.token === screenId);
  if (!screen) return null;

  screen.config = { ...screen.config, ...updatedConfig };
  fs.writeFileSync(SCREENS_FILE, JSON.stringify(list, null, 2), 'utf8');

  if (screen.id === 'cmta2zkpq00aokx08uyc7iys2') {
    try {
      fs.writeFileSync(LEGACY_SCREEN_FILE, JSON.stringify(screen, null, 2), 'utf8');
    } catch (e) {}
  }

  return screen;
}

// Initial load
loadScreens();

module.exports = {
  loadScreens,
  getScreens,
  getScreenById,
  updateScreenConfig
};
