const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('./config');

const SCREENS_FILE = path.join(ROOT_DIR, 'screens_data.json');
const LEGACY_SCREEN_FILE = path.join(ROOT_DIR, 'screen_data.json');

let screensList = [];

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
