// =========================================================================
// DASHBOARD GAME CONFIG RENDERERS (ALL 6 GAMES)
// =========================================================================

// 1. Live Bar Libraries (Dancers, VIPs, Wings, Badges)
const DEFAULT_LIVEBAR_DANCERS = [
  { id: "cmsla49vr000hnu16cqd59yt1", label: "Vũ công 1", imageUrl: "/bar/dancers/1.gif" },
  { id: "cmsla49vr000inu16kdxj8nei", label: "Vũ công 2", imageUrl: "/bar/dancers/2.gif" },
  { id: "cmsla49vr000jnu16h2tvva65", label: "Vũ công 3", imageUrl: "/bar/dancers/3.gif" },
  { id: "cmsla49vr000knu1637ny3n7g", label: "Vũ công 4", imageUrl: "/bar/dancers/4.gif" },
  { id: "cmsla49vr000lnu16sby27mpk", label: "Vũ công 5", imageUrl: "/bar/dancers/5.gif" },
  { id: "cmsla49vr000mnu16tkliw8cw", label: "Vũ công 6", imageUrl: "/bar/dancers/6.gif" },
  { id: "cmsla49vr000nnu16g54gnz18", label: "Vũ công 7", imageUrl: "/bar/dancers/7.gif" },
  { id: "cmsla49vr000onu16ud7czc4n", label: "Vũ công 8", imageUrl: "/bar/dancers/8.gif" },
  { id: "cmsla49vr000pnu16vwk7f6ym", label: "Nhảy dây", imageUrl: "/bar/dancers/nhay-day.gif" },
  { id: "cmsla49vr000qnu16f9pd10yi", label: "Váy đỏ nhún nhảy", imageUrl: "/bar/dancers/vay-do-nhun.gif" },
  { id: "cmsla49vr000rnu16jpi8o2pe", label: "Ôm má nhõng nhẽo", imageUrl: "/bar/dancers/om-ma.gif" },
  { id: "cmsla49vr000snu165rhh2xvp", label: "Chơi đàn hạc", imageUrl: "/bar/dancers/dan-hac.gif" },
  { id: "cmsla49vr000tnu160r18wzf7", label: "Váy đỏ dang tay", imageUrl: "/bar/dancers/vay-do-dang-tay.gif" },
  { id: "cmsla49vr000unu166veoku0v", label: "Cưỡi heo", imageUrl: "/bar/dancers/cuoi-heo.gif" },
  { id: "cmsla49vr000vnu16k2xjc175", label: "Quần đỏ quẩy", imageUrl: "/bar/dancers/quan-do-quay.gif" },
  { id: "cmsla49vr000wnu16pb5oa0mf", label: "Múa quạt", imageUrl: "/bar/dancers/mua-quat.gif" },
  { id: "cmsla49vr000xnu16m5ii2s85", label: "Mũ cao bồi", imageUrl: "/bar/dancers/mu-cao-boi.gif" },
  { id: "cmsla49vr000ynu16nxcwjj26", label: "Cười toe", imageUrl: "/bar/dancers/cuoi-toe.gif" },
  { id: "cmsla49vr000znu169p17k48t", label: "Quẩy tung tay", imageUrl: "/bar/dancers/quay-tung-tay.gif" },
  { id: "cmsla49vr0010nu16wyyimf7y", label: "Quay lưng lắc", imageUrl: "/bar/dancers/quay-lung.gif" },
  { id: "cmsla49vr0011nu1677ziox1i", label: "Áo hồng quần đỏ", imageUrl: "/bar/dancers/ao-hong.gif" },
  { id: "cmsla49vr0012nu16o79gto2k", label: "Chống hông nhún", imageUrl: "/bar/dancers/chong-hong.gif" },
  { id: "cmsla49vr0013nu16t0rhrg6f", label: "Dang tay xoay", imageUrl: "/bar/dancers/dang-tay-xoay.gif" },
  { id: "cmsla49vr0014nu16z2fuwgeh", label: "Váy tutu hồng", imageUrl: "/bar/dancers/vay-tutu.gif" },
  { id: "cmsla49vr0015nu16fnsjor9p", label: "Đứng ngơ", imageUrl: "/bar/dancers/dung-ngo.gif" },
  { id: "cmsla49vr0016nu16u0esve4p", label: "Chỉ tay", imageUrl: "/bar/dancers/chi-tay.gif" },
  { id: "cmsla49vr0017nu16wyimh0de", label: "Hai bông hoa", imageUrl: "/bar/dancers/hai-bong-hoa.gif" },
  { id: "cmsla49vr0018nu160ek5g0us", label: "Ba lê xoay", imageUrl: "/bar/dancers/ba-le-xoay.gif" },
  { id: "cmsla49vr0019nu16tnpos779", label: "Quần hoa", imageUrl: "/bar/dancers/quan-hoa.gif" },
  { id: "cmsla49vr001anu16r1d2ayan", label: "Bắt chéo tay", imageUrl: "/bar/dancers/bat-cheo-tay.gif" },
  { id: "cmsla49vr001bnu16tfeo9jxl", label: "Nhún nhẹ", imageUrl: "/bar/dancers/nhun-nhe.gif" },
  { id: "cmsla49vr001cnu16yb4wcten", label: "Mặt bự", imageUrl: "/bar/dancers/mat-bu.gif" },
  { id: "cmsla49vr001dnu16b7hsdf7r", label: "Vẫy tay", imageUrl: "/bar/dancers/vay-tay.gif" },
  { id: "cmsla49vr001enu1677qun785", label: "Lắc mông", imageUrl: "/bar/dancers/lac-mong.gif" },
  { id: "cmsla49vr001fnu16nck3d7ls", label: "Nhăn mặt quẩy", imageUrl: "/bar/dancers/nhan-mat.gif" },
  { id: "cmsla49vr001gnu16duxtojep", label: "Lè lưỡi bay", imageUrl: "/bar/dancers/le-luoi-bay.gif" },
  { id: "cmsla49vr001hnu1651eg01hr", label: "Tuần lộc Noel", imageUrl: "/bar/dancers/tuan-loc.gif" }
];

const DEFAULT_LIVEBAR_VIPS = [
  { id: "cmsla49vr001inu16e4xmcvfl", label: "Yêu tinh Dobby", imageUrl: "/bar/vips/dobby.gif" },
  { id: "cmsla49vr001jnu16e70768ho", label: "Anh áo khoác xám", imageUrl: "/bar/vips/anh-ao-xam.gif" },
  { id: "cmsla49vr001knu16sqxovgwf", label: "Vũ công áo xanh", imageUrl: "/bar/vips/vu-cong-xanh.gif" },
  { id: "cmsla49vr001lnu16ezi08gmm", label: "Lính hồng mặt nạ", imageUrl: "/bar/vips/linh-hong.gif" },
  { id: "cmsla49vr001mnu16kayve8kd", label: "Người xanh lá", imageUrl: "/bar/vips/nguoi-xanh-la.gif" },
  { id: "cmsla49vr001nnu1636bmu8qd", label: "Thầy hiệu trưởng", imageUrl: "/bar/vips/thay-hieu-truong.gif" },
  { id: "cmsla49vr001onu16ove02cw4", label: "Gà cao su", imageUrl: "/bar/vips/ga-cao-su.gif" },
  { id: "cmsla49vr001pnu164xcul2jj", label: "Anh vest xanh", imageUrl: "/bar/vips/anh-vest-xanh.gif" }
];

const DEFAULT_LIVEBAR_WINGS = [
  { id: "cmsyjn6yx000hdyd8h95830ov", label: "Cánh bạch kim", imageUrl: "/bar/wings/nguoi-dan-dau-trai.webp", secondaryImageUrl: "/bar/wings/nguoi-dan-dau-phai.webp" },
  { id: "cmsyjn6yx000idyd8tjcyajqw", label: "Cánh rồng vàng", imageUrl: "/bar/wings/ong-hoang-trai.webp", secondaryImageUrl: "/bar/wings/ong-hoang-phai.webp" },
  { id: "cmsyjn6yx000jdyd8k7vtdtm8", label: "Cánh lục bảo", imageUrl: "/bar/wings/dai-gia-trai.webp", secondaryImageUrl: "/bar/wings/dai-gia-phai.webp" },
  { id: "cmsyjn6yx000kdyd8tx8lgozj", label: "Cánh phượng hồng", imageUrl: "/bar/wings/ba-chua-trai.webp", secondaryImageUrl: "/bar/wings/ba-chua-phai.webp" },
  { id: "cmsyjn6yx000ldyd8h3letr6i", label: "Cánh thuyền trưởng", imageUrl: "/bar/wings/thuyen-truong-trai.webp", secondaryImageUrl: "/bar/wings/thuyen-truong-phai.webp" },
  { id: "cmsyjn6yx000mdyd8hkzgid0h", label: "Cánh thiên thần", imageUrl: "/bar/wings/tha-thinh-trai.webp", secondaryImageUrl: "/bar/wings/tha-thinh-phai.webp" }
];

const DEFAULT_LIVEBAR_BADGES = [
  { id: "cmsla49vr001qnu16lzo2spf8", label: "Người dẫn đầu", imageUrl: "/bar/badges/nguoi-dan-dau.webp" },
  { id: "cmsla49vr001rnu16wstb5qhf", label: "Đại gia", imageUrl: "/bar/badges/dai-gia.webp" },
  { id: "cmsla49vr001snu16hcwqtrjt", label: "Ông hoàng sàn nhảy", imageUrl: "/bar/badges/ong-hoang.webp" },
  { id: "cmsla49vr001tnu16viiab444", label: "Bà chúa vũ trường", imageUrl: "/bar/badges/ba-chua.webp" },
  { id: "cmsla49vr001unu16ws5ulamr", label: "Thuyền trưởng", imageUrl: "/bar/badges/thuyen-truong.webp" },
  { id: "cmsla49vr001vnu16l6wfgx7w", label: "Thả thính", imageUrl: "/bar/badges/tha-thinh.webp" }
];

let customWingLeft = null;
let customWingRight = null;

function renderLiveBarLibraries() {
  if (!screenConfig) return;

  if (!screenConfig.skinLibrary || screenConfig.skinLibrary.length === 0) {
    screenConfig.skinLibrary = DEFAULT_LIVEBAR_DANCERS;
  }
  if (!screenConfig.vipSkinLibrary || screenConfig.vipSkinLibrary.length === 0) {
    screenConfig.vipSkinLibrary = DEFAULT_LIVEBAR_VIPS;
  }
  if (!screenConfig.wingLibrary || screenConfig.wingLibrary.length === 0) {
    screenConfig.wingLibrary = DEFAULT_LIVEBAR_WINGS;
  }
  if (!screenConfig.badgeLibrary || screenConfig.badgeLibrary.length === 0) {
    screenConfig.badgeLibrary = DEFAULT_LIVEBAR_BADGES;
  }

  // 1. Dancers Grid
  const dancersGrid = document.getElementById('livebar-dancers-grid');
  const dancersStatus = document.getElementById('livebar-dancers-status');
  const lib = screenConfig.skinLibrary || [];
  const activeSkins = new Set(screenConfig.skins || []);

  if (dancersStatus) {
    dancersStatus.textContent = activeSkins.size === 0
      ? `Chưa tích ô nào = dùng cả ${lib.length} ảnh đang bật.`
      : `Đang chọn ${activeSkins.size}/${lib.length} ảnh được phép dùng.`;
  }

  if (dancersGrid) {
    dancersGrid.innerHTML = lib.map(item => {
      const isChecked = activeSkins.has(item.id) || activeSkins.size === 0;
      return `
        <label class="p-1.5 rounded-xl bg-slate-900 border ${isChecked ? 'border-purple-500/80 shadow-md shadow-purple-500/10' : 'border-slate-800 opacity-60'} hover:border-purple-500 hover:opacity-100 transition-all flex flex-col items-center gap-1 cursor-pointer relative group">
          <input type="checkbox" value="${item.id}" class="dancer-skin-cb absolute top-1 left-1 w-3.5 h-3.5 accent-purple-600 rounded" ${isChecked ? 'checked' : ''}>
          <img src="${item.imageUrl}" alt="${item.label}" class="w-11 h-11 object-contain pointer-events-none">
          <span class="text-[9px] font-semibold text-slate-300 group-hover:text-white truncate w-full text-center">${item.label}</span>
        </label>
      `;
    }).join('');

    dancersGrid.querySelectorAll('.dancer-skin-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = dancersGrid.querySelectorAll('.dancer-skin-cb:checked').length;
        if (checkedCount === lib.length || checkedCount === 0) {
          screenConfig.skins = [];
        } else {
          screenConfig.skins = Array.from(dancersGrid.querySelectorAll('.dancer-skin-cb:checked')).map(c => c.value);
        }
        renderLiveBarLibraries();
        saveCurrentConfig();
      });
    });
  }

  // 2. VIPs Grid
  const vipsGrid = document.getElementById('livebar-vips-grid');
  const vipsStatus = document.getElementById('livebar-vips-status');
  const vipLib = screenConfig.vipSkinLibrary || [];
  const activeVipSkins = new Set(screenConfig.vipSkins || []);

  if (vipsStatus) {
    vipsStatus.textContent = activeVipSkins.size === 0
      ? `Chưa tích ô nào = dùng cả ${vipLib.length} ảnh đang bật.`
      : `Đang chọn ${activeVipSkins.size}/${vipLib.length} ảnh VIP.`;
  }

  if (vipsGrid) {
    vipsGrid.innerHTML = vipLib.map(item => {
      const isChecked = activeVipSkins.has(item.id) || activeVipSkins.size === 0;
      return `
        <label class="p-2 rounded-xl bg-slate-900 border ${isChecked ? 'border-amber-500/80 shadow-md shadow-amber-500/10' : 'border-slate-800 opacity-60'} hover:border-amber-400 hover:opacity-100 transition-all flex flex-col items-center gap-1 cursor-pointer relative group">
          <input type="checkbox" value="${item.id}" class="vip-skin-cb absolute top-1.5 left-1.5 w-3.5 h-3.5 accent-amber-500 rounded" ${isChecked ? 'checked' : ''}>
          <img src="${item.imageUrl}" alt="${item.label}" class="w-12 h-12 object-contain pointer-events-none">
          <span class="text-[10px] font-bold text-amber-300 truncate w-full text-center">${item.label}</span>
        </label>
      `;
    }).join('');

    vipsGrid.querySelectorAll('.vip-skin-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = vipsGrid.querySelectorAll('.vip-skin-cb:checked').length;
        if (checkedCount === vipLib.length || checkedCount === 0) {
          screenConfig.vipSkins = [];
        } else {
          screenConfig.vipSkins = Array.from(vipsGrid.querySelectorAll('.vip-skin-cb:checked')).map(c => c.value);
        }
        renderLiveBarLibraries();
        saveCurrentConfig();
      });
    });
  }

  // 3. Wings Grid
  const wingsGrid = document.getElementById('livebar-wings-grid');
  const wingsStatus = document.getElementById('livebar-wings-status');
  const wingLib = screenConfig.wingLibrary || [];
  const activeWings = new Set(screenConfig.wings || []);

  if (wingsStatus) {
    wingsStatus.textContent = activeWings.size === 0
      ? `Chưa tích ô nào = dùng cả ${wingLib.length} ảnh đang bật.`
      : `Đang chọn ${activeWings.size}/${wingLib.length} đôi cánh.`;
  }

  if (wingsGrid) {
    wingsGrid.innerHTML = wingLib.map(item => {
      const isChecked = activeWings.has(item.id) || activeWings.size === 0;
      return `
        <label class="p-2 rounded-xl bg-slate-900 border ${isChecked ? 'border-sky-500/80 shadow-md shadow-sky-500/10' : 'border-slate-800 opacity-60'} hover:border-sky-400 hover:opacity-100 transition-all flex flex-col items-center gap-1.5 cursor-pointer relative group">
          <input type="checkbox" value="${item.id}" class="wing-cb absolute top-1.5 left-1.5 w-3.5 h-3.5 accent-sky-500 rounded" ${isChecked ? 'checked' : ''}>
          <div class="flex items-center justify-center gap-0.5 w-full h-12 bg-slate-950/50 rounded-lg p-1">
            <img src="${item.imageUrl}" alt="${item.label} Trái" class="w-6 h-10 object-contain pointer-events-none">
            <img src="${item.secondaryImageUrl || item.imageUrl}" alt="${item.label} Phải" class="w-6 h-10 object-contain pointer-events-none">
          </div>
          <span class="text-[10px] font-bold text-sky-300 truncate w-full text-center">${item.label}</span>
        </label>
      `;
    }).join('');

    wingsGrid.querySelectorAll('.wing-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = wingsGrid.querySelectorAll('.wing-cb:checked').length;
        if (checkedCount === wingLib.length || checkedCount === 0) {
          screenConfig.wings = [];
        } else {
          screenConfig.wings = Array.from(wingsGrid.querySelectorAll('.wing-cb:checked')).map(c => c.value);
        }
        renderLiveBarLibraries();
        saveCurrentConfig();
      });
    });
  }

  // 4. Badges Grid
  const badgesGrid = document.getElementById('livebar-badges-grid');
  const badgesStatus = document.getElementById('livebar-badges-status');
  const badgeLib = screenConfig.badgeLibrary || [];
  const activeBadges = new Set(screenConfig.badges || []);

  if (badgesStatus) {
    badgesStatus.textContent = activeBadges.size === 0
      ? `Chưa tích ô nào = dùng cả ${badgeLib.length} ảnh đang bật.`
      : `Đang chọn ${activeBadges.size}/${badgeLib.length} badge.`;
  }

  if (badgesGrid) {
    badgesGrid.innerHTML = badgeLib.map(item => {
      const isChecked = activeBadges.has(item.id) || activeBadges.size === 0;
      return `
        <label class="p-2 rounded-xl bg-slate-900 border ${isChecked ? 'border-emerald-500/80 shadow-md shadow-emerald-500/10' : 'border-slate-800 opacity-60'} hover:border-emerald-400 hover:opacity-100 transition-all flex flex-col items-center gap-1.5 cursor-pointer relative group">
          <input type="checkbox" value="${item.id}" class="badge-cb absolute top-1.5 left-1.5 w-3.5 h-3.5 accent-emerald-500 rounded" ${isChecked ? 'checked' : ''}>
          <div class="flex items-center justify-center w-full h-12 bg-slate-950/50 rounded-lg p-1">
            <img src="${item.imageUrl}" alt="${item.label}" class="w-10 h-10 object-contain pointer-events-none">
          </div>
          <span class="text-[10px] font-bold text-emerald-300 truncate w-full text-center">${item.label}</span>
        </label>
      `;
    }).join('');

    badgesGrid.querySelectorAll('.badge-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = badgesGrid.querySelectorAll('.badge-cb:checked').length;
        if (checkedCount === badgeLib.length || checkedCount === 0) {
          screenConfig.badges = [];
        } else {
          screenConfig.badges = Array.from(badgesGrid.querySelectorAll('.badge-cb:checked')).map(c => c.value);
        }
        renderLiveBarLibraries();
        saveCurrentConfig();
      });
    });
  }

  // Bind Upload and Library Action Handlers
  setupLiveBarUploadHandlers();
}

function setupLiveBarUploadHandlers() {
  const btnUploadSkin = document.getElementById('btn-upload-skin');
  const inputUploadSkin = document.getElementById('input-upload-skin');
  if (btnUploadSkin && inputUploadSkin && !btnUploadSkin._bound) {
    btnUploadSkin._bound = true;
    btnUploadSkin.addEventListener('click', () => inputUploadSkin.click());
    inputUploadSkin.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const newId = 'custom_skin_' + Date.now();
        const newName = file.name.replace(/\.[^/.]+$/, "") || 'Vũ công riêng';
        screenConfig.skinLibrary.push({ id: newId, label: newName, imageUrl: reader.result });
        renderLiveBarLibraries();
        saveCurrentConfig();
        showSimActionFeedback('✅ Đã thêm nhân vật thường thành công!');
      };
      reader.readAsDataURL(file);
    });
  }

  const btnUploadVip = document.getElementById('btn-upload-vip');
  const inputUploadVip = document.getElementById('input-upload-vip');
  if (btnUploadVip && inputUploadVip && !btnUploadVip._bound) {
    btnUploadVip._bound = true;
    btnUploadVip.addEventListener('click', () => inputUploadVip.click());
    inputUploadVip.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const newId = 'custom_vip_' + Date.now();
        const newName = file.name.replace(/\.[^/.]+$/, "") || 'VIP riêng';
        screenConfig.vipSkinLibrary.push({ id: newId, label: newName, imageUrl: reader.result });
        renderLiveBarLibraries();
        saveCurrentConfig();
        showSimActionFeedback('✅ Đã thêm nhân vật VIP thành công!');
      };
      reader.readAsDataURL(file);
    });
  }

  const btnPickLeft = document.getElementById('btn-pick-wing-left');
  const inputUploadWingLeft = document.getElementById('input-upload-wing-left');
  if (btnPickLeft && inputUploadWingLeft && !btnPickLeft._bound) {
    btnPickLeft._bound = true;
    btnPickLeft.addEventListener('click', () => inputUploadWingLeft.click());
    inputUploadWingLeft.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        customWingLeft = reader.result;
        btnPickLeft.classList.add('bg-sky-900', 'text-sky-300');
        btnPickLeft.textContent = '✓ Cánh trái';
      };
      reader.readAsDataURL(file);
    });
  }

  const btnPickRight = document.getElementById('btn-pick-wing-right');
  const inputUploadWingRight = document.getElementById('input-upload-wing-right');
  if (btnPickRight && inputUploadWingRight && !btnPickRight._bound) {
    btnPickRight._bound = true;
    btnPickRight.addEventListener('click', () => inputUploadWingRight.click());
    inputUploadWingRight.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        customWingRight = reader.result;
        btnPickRight.classList.add('bg-sky-900', 'text-sky-300');
        btnPickRight.textContent = '✓ Cánh phải';
      };
      reader.readAsDataURL(file);
    });
  }

  const btnAddWingPair = document.getElementById('btn-add-wing-pair');
  if (btnAddWingPair && !btnAddWingPair._bound) {
    btnAddWingPair._bound = true;
    btnAddWingPair.addEventListener('click', () => {
      if (!customWingLeft && !customWingRight) {
        showSimActionFeedback('⚠️ Hãy chọn ít nhất ảnh cánh trái hoặc cánh phải');
        return;
      }
      const newId = 'custom_wing_' + Date.now();
      screenConfig.wingLibrary.push({
        id: newId,
        label: 'Cánh riêng ' + (screenConfig.wingLibrary.length + 1),
        imageUrl: customWingLeft || customWingRight,
        secondaryImageUrl: customWingRight || customWingLeft
      });
      customWingLeft = null;
      customWingRight = null;
      if (btnPickLeft) {
        btnPickLeft.classList.remove('bg-sky-900', 'text-sky-300');
        btnPickLeft.textContent = 'Chọn cánh trái';
      }
      if (btnPickRight) {
        btnPickRight.classList.remove('bg-sky-900', 'text-sky-300');
        btnPickRight.textContent = 'Chọn cánh phải';
      }
      renderLiveBarLibraries();
      saveCurrentConfig();
      showSimActionFeedback('✅ Đã thêm đôi cánh mới thành công!');
    });
  }

  const btnUploadBadge = document.getElementById('btn-upload-badge');
  const inputUploadBadge = document.getElementById('input-upload-badge');
  if (btnUploadBadge && inputUploadBadge && !btnUploadBadge._bound) {
    btnUploadBadge._bound = true;
    btnUploadBadge.addEventListener('click', () => inputUploadBadge.click());
    inputUploadBadge.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const newId = 'custom_badge_' + Date.now();
        const newName = file.name.replace(/\.[^/.]+$/, "") || 'Badge riêng';
        screenConfig.badgeLibrary.push({ id: newId, label: newName, imageUrl: reader.result });
        renderLiveBarLibraries();
        saveCurrentConfig();
        showSimActionFeedback('✅ Đã thêm badge thành công!');
      };
      reader.readAsDataURL(file);
    });
  }

  const btnOpenDjLib = document.getElementById('btn-open-dj-library');
  if (btnOpenDjLib && !btnOpenDjLib._bound) {
    btnOpenDjLib._bound = true;
    btnOpenDjLib.addEventListener('click', () => {
      const presetUrl = screenConfig.djScreenUrl === '/bar/screen/dj-2.gif' ? '/bar/screen/dj-1.gif' : '/bar/screen/dj-2.gif';
      screenConfig.djScreenUrl = presetUrl;
      const inputDj = document.getElementById('cfg-dj-screen-url');
      if (inputDj) inputDj.value = presetUrl;
      saveCurrentConfig();
      showSimActionFeedback(`✅ Đã chọn mẫu màn hình LED: ${presetUrl}`);
    });
  }
}

// 2. Vote Tank Teams
function renderVoteTankTeams() {
  if (!screenConfig.teams || !Array.isArray(screenConfig.teams)) {
    screenConfig.teams = [
      { name: 'Việt Nam', color: '#ef4444', emoji: '🇻🇳' },
      { name: 'Thái Lan', color: '#3b82f6', emoji: '🇹🇭' }
    ];
  }

  const grid = document.getElementById('votetank-teams-grid');
  if (grid) {
    grid.innerHTML = screenConfig.teams.map((t, idx) => `
      <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Bình ${idx + 1}</span>
          <input type="color" class="vt-team-color w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5" value="${t.color || '#3b82f6'}" data-idx="${idx}">
        </div>
        <div class="flex gap-2">
          <input type="text" maxlength="4" class="vt-team-emoji w-14 px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-center font-bold text-white focus:outline-none focus:border-cyan-500" value="${t.emoji || '🗳️'}" data-idx="${idx}">
          <input type="text" maxlength="30" class="vt-team-name flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-cyan-500" value="${t.name}" data-idx="${idx}">
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.vt-team-color').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].color = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    grid.querySelectorAll('.vt-team-emoji').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].emoji = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    grid.querySelectorAll('.vt-team-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].name = e.target.value;
          saveCurrentConfig();
        }
      });
    });
  }
}

// 3. Football Duel Config
function renderFootballConfig() {
  const stadiumsGrid = document.getElementById('football-stadiums-grid');
  if (stadiumsGrid) {
    const curUrl = screenConfig.fieldUrl || FOOTBALL_STADIUMS[0].url;
    stadiumsGrid.innerHTML = FOOTBALL_STADIUMS.map(s => {
      const isSel = s.url === curUrl;
      return `
        <div class="football-stadium-card ${isSel ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'} p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2" data-field-url="${s.url}">
          <div class="aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-800/80 relative">
            <img src="${s.url}" alt="${s.label}" class="w-full h-full object-cover">
            ${isSel ? '<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold shadow-md">✓</span>' : ''}
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200 text-center truncate">${s.label}</p>
            <p class="text-[10px] text-slate-400 text-center truncate">${s.hint}</p>
          </div>
        </div>
      `;
    }).join('');

    stadiumsGrid.querySelectorAll('.football-stadium-card').forEach(card => {
      card.addEventListener('click', () => {
        screenConfig.fieldUrl = card.getAttribute('data-field-url');
        const themeFieldSel = document.getElementById('cfg-theme-football-field');
        if (themeFieldSel) themeFieldSel.value = screenConfig.fieldUrl;
        renderFootballConfig();
        saveCurrentConfig();
      });
    });
  }

  if (!screenConfig.teams || screenConfig.teams.length < 2) {
    screenConfig.teams = [
      { name: "ĐỘI XANH", color: "#3b82f6", emoji: "🔵", backgroundUrl: "/football-duel/ronaldo-idle.png" },
      { name: "ĐỘI ĐỎ", color: "#ef4444", emoji: "🔴", backgroundUrl: "/football-duel/messi-idle.png" }
    ];
  }

  const teamsGrid = document.getElementById('football-teams-grid');
  if (teamsGrid) {
    teamsGrid.innerHTML = screenConfig.teams.map((team, idx) => {
      const isLeft = idx === 0;
      const curPlayer = team.backgroundUrl || FOOTBALL_PLAYERS[idx].idleUrl;
      return `
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${isLeft ? 'Đội bóng trái' : 'Đội bóng phải'}</span>
            <span class="text-xs font-bold" style="color: ${team.color}">${team.name}</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300">Icon</label>
              <input type="text" maxlength="8" class="fb-team-emoji w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-center font-bold text-white focus:outline-none focus:border-emerald-500" value="${team.emoji || (isLeft ? '🔵' : '🔴')}" data-team-idx="${idx}">
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-xs font-bold text-slate-300">Tên Đội Bóng</label>
              <input type="text" maxlength="30" class="fb-team-name w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500" value="${team.name || ''}" data-team-idx="${idx}">
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-800/80">
            <label class="text-xs font-bold text-slate-300">Cầu Thủ Siêu Sao</label>
            <div class="grid grid-cols-2 gap-2">
              ${FOOTBALL_PLAYERS.map(p => {
                const isSel = p.idleUrl === curPlayer || team.backgroundUrl?.includes(p.id);
                return `
                  <div class="football-player-card ${isSel ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500/30' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'} p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2" data-team-idx="${idx}" data-player-url="${p.idleUrl}">
                    <img src="${p.idleUrl}" alt="${p.label}" class="w-10 h-10 rounded-lg object-contain bg-black/40 border border-slate-700">
                    <span class="text-xs font-bold text-white truncate">${p.label}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    teamsGrid.querySelectorAll('.fb-team-emoji').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].emoji = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.fb-team-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].name = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.football-player-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = Number(card.getAttribute('data-team-idx'));
        const pUrl = card.getAttribute('data-player-url');
        if (screenConfig.teams[idx] && pUrl) {
          screenConfig.teams[idx].backgroundUrl = pUrl;
          renderFootballConfig();
          saveCurrentConfig();
        }
      });
    });
  }
}

// 4. Army Clash Config
function renderArmyClashConfig() {
  const curGround = screenConfig.battleGround || ARMY_GROUNDS[1].id;

  const renderGrid = (gridEl) => {
    if (!gridEl) return;
    gridEl.innerHTML = ARMY_GROUNDS.map(g => {
      const isSel = g.id === curGround || g.url === screenConfig.battleGround;
      const isTransparent = g.id === 'transparent';
      return `
        <div class="army-ground-card ${isSel ? 'border-2 border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30' : 'border border-slate-800 bg-slate-950/80 hover:border-slate-700'} p-2.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-2 group relative" data-ground-id="${g.id}">
          <div class="w-full h-24 rounded-xl overflow-hidden ${isTransparent ? 'bg-slate-900 border border-dashed border-slate-700' : 'bg-black border border-slate-800/80'} relative flex items-center justify-center">
            ${isTransparent 
              ? '<span class="text-2xl">🚫</span>' 
              : `<img src="${g.url}" alt="${g.label}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="hidden w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-xs font-bold text-amber-300">⚔️ ${g.label}</div>`
            }
            ${isSel ? '<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold shadow-md">✓</span>' : ''}
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200 text-center truncate">${g.label}</p>
            <p class="text-[10px] text-slate-400 text-center line-clamp-1 leading-relaxed">${g.hint}</p>
          </div>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('.army-ground-card').forEach(card => {
      card.addEventListener('click', () => {
        screenConfig.battleGround = card.getAttribute('data-ground-id');
        const sel = document.getElementById('cfg-theme-army-bg');
        if (sel) sel.value = screenConfig.battleGround;
        renderArmyClashConfig();
        saveCurrentConfig();
        if (window.showToast) window.showToast(`Đã chọn nền: ${screenConfig.battleGround}`);
      });
    });
  };

  renderGrid(document.getElementById('army-grounds-grid'));
  renderGrid(document.getElementById('theme-army-grounds-grid'));

  if (!screenConfig.teams || screenConfig.teams.length < 2) {
    screenConfig.teams = [
      { name: "ĐỘI XANH", color: "#3b82f6", emoji: "🔵", backgroundUrl: "/army/hero-panda.webp" },
      { name: "ĐỘI ĐỎ", color: "#ef4444", emoji: "🔴", backgroundUrl: "/army/hero-dragon.webp" }
    ];
  }

  const teamsGrid = document.getElementById('army-teams-grid');
  if (teamsGrid) {
    teamsGrid.innerHTML = screenConfig.teams.map((team, idx) => {
      const isLeft = idx === 0;
      const curHero = team.backgroundUrl || ARMY_HEROES[idx % ARMY_HEROES.length].url;
      return `
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${isLeft ? 'Quân đoàn trái' : 'Quân đoàn phải'}</span>
            <span class="text-xs font-bold" style="color: ${team.color}">${team.name}</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300">Icon Cờ</label>
              <input type="text" maxlength="8" class="army-team-emoji w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-center font-bold text-white focus:outline-none focus:border-amber-500" value="${team.emoji || (isLeft ? '🔵' : '🔴')}" data-team-idx="${idx}">
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-xs font-bold text-slate-300">Tên Quân Đoàn</label>
              <input type="text" maxlength="30" class="army-team-name w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500" value="${team.name || ''}" data-team-idx="${idx}">
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-800/80">
            <label class="text-xs font-bold text-slate-300">Tướng Thần Thoại</label>
            <div class="grid grid-cols-2 gap-2">
              ${ARMY_HEROES.map(h => {
                const isSel = h.url === curHero || team.backgroundUrl?.includes(h.id);
                return `
                  <div class="army-hero-choice ${isSel ? 'border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/30' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'} p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5" data-team-idx="${idx}" data-hero-url="${h.url}">
                    <img src="${h.url}" alt="${h.label}" class="w-10 h-10 rounded-lg object-cover bg-black/40 border border-slate-700">
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-white truncate">${h.label}</p>
                      <span class="text-[10px] text-amber-400 font-semibold block">⚡ ${h.skill}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    teamsGrid.querySelectorAll('.army-team-emoji').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].emoji = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.army-team-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].name = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.army-hero-choice').forEach(card => {
      card.addEventListener('click', () => {
        const idx = Number(card.getAttribute('data-team-idx'));
        const hUrl = card.getAttribute('data-hero-url');
        if (screenConfig.teams[idx] && hUrl) {
          screenConfig.teams[idx].backgroundUrl = hUrl;
          renderArmyClashConfig();
          saveCurrentConfig();
        }
      });
    });
  }
}

// 5. Chainsaw Clash Config
function renderChainsawConfig() {
  const floorsGrid = document.getElementById('chainsaw-floors-grid');
  if (floorsGrid) {
    const curFloor = screenConfig.arenaFloor || screenConfig.floorTheme || CHAINSAW_FLOORS[0].id;
    floorsGrid.innerHTML = CHAINSAW_FLOORS.map(f => {
      const isSel = f.id === curFloor || f.url === screenConfig.arenaFloor || f.id === screenConfig.floorTheme;
      return `
        <div class="chainsaw-floor-card ${isSel ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'} p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2" data-floor-id="${f.id}">
          <div class="h-28 rounded-xl overflow-hidden ${f.url ? 'bg-black border border-slate-800/80' : 'bg-slate-900 border border-dashed border-slate-700'} flex items-center justify-center relative">
            ${f.url ? `<img src="${f.url}" alt="${f.label}" class="w-full h-full object-cover">` : `<span class="text-slate-500 text-xs font-bold">⬛ Trong mờ</span>`}
            ${isSel ? '<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold shadow-md">✓</span>' : ''}
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200 truncate">${f.label}</p>
            <p class="text-[10px] text-slate-400 leading-snug line-clamp-2">${f.hint}</p>
          </div>
        </div>
      `;
    }).join('');

    floorsGrid.querySelectorAll('.chainsaw-floor-card').forEach(card => {
      card.addEventListener('click', () => {
        const fId = card.getAttribute('data-floor-id');
        screenConfig.arenaFloor = fId;
        screenConfig.floorTheme = fId;
        const sel = document.getElementById('cfg-theme-saw-floor');
        if (sel) sel.value = fId;
        renderChainsawConfig();
        saveCurrentConfig();
      });
    });
  }
}

// 6. Team Battle / Cuộc Chiến Tháp Config
function renderTeamBattleConfig() {
  const teamsGrid = document.getElementById('teambattle-teams-grid');
  if (teamsGrid) {
    if (!screenConfig.teams || screenConfig.teams.length < 2) {
      screenConfig.teams = [
        { name: 'PHE XANH', color: '#38bdf8', emoji: '💙', backgroundUrl: '' },
        { name: 'PHE HỒNG', color: '#f472b6', emoji: '💗', backgroundUrl: '' }
      ];
    }

    teamsGrid.innerHTML = screenConfig.teams.map((team, idx) => {
      const isLeft = idx === 0;
      const defaultName = isLeft ? 'PHE XANH' : 'PHE HỒNG';
      const defaultEmoji = isLeft ? '💙' : '💗';
      const defaultColor = isLeft ? '#38bdf8' : '#f472b6';
      const curColor = team.color || defaultColor;
      const curEmoji = team.emoji || defaultEmoji;
      const curName = team.name || defaultName;
      const curBg = team.backgroundUrl || '';

      return `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span class="text-xs font-black uppercase tracking-wider ${isLeft ? 'text-sky-400' : 'text-pink-400'} flex items-center gap-1.5">
              <span>${isLeft ? '🔵' : '🔴'}</span> ${isLeft ? 'Bên trái' : 'Bên phải'}
            </span>
            <span class="text-xs font-bold font-mono" style="color: ${curColor}">${curName}</span>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300">Icon</label>
              <input type="text" maxlength="8" class="tb-team-emoji w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-center font-bold text-white focus:outline-none focus:border-sky-500" value="${curEmoji}" data-team-idx="${idx}">
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-xs font-bold text-slate-300">Tên phe</label>
              <input type="text" maxlength="30" class="tb-team-name w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-sky-500" value="${curName}" data-team-idx="${idx}">
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Màu phe</label>
            <div class="flex items-center gap-2">
              <input type="color" class="tb-team-color w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer p-1 shrink-0" value="${curColor}" data-team-idx="${idx}">
              <input type="text" class="tb-team-color-text w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white" value="${curColor}" data-team-idx="${idx}">
            </div>
            <p class="text-[10px] text-slate-400">Dùng cho tháp gạch, tên phe và cú loé lúc thắng ván.</p>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label class="text-xs font-bold text-slate-300">Ảnh nền của phe</label>
            <div class="flex items-center gap-2">
              <input type="text" class="tb-team-bg-url w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500" placeholder="Dán link ảnh, hoặc bấm Tải ảnh" value="${curBg}" data-team-idx="${idx}">
              <button class="tb-btn-upload-bg px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shrink-0 transition-all" data-team-idx="${idx}">
                Tải ảnh
              </button>
              <button class="tb-btn-lib-bg px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shrink-0 transition-all" data-team-idx="${idx}">
                Kho ảnh
              </button>
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed">
              Để trống thì nửa khung của phe này tô màu phe. Ảnh dọc (9:16) là vừa nhất — overlay cắt theo kiểu phủ kín, phần thừa hai bên sẽ mất.
            </p>
          </div>
        </div>
      `;
    }).join('');

    teamsGrid.querySelectorAll('.tb-team-color').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        const textInp = teamsGrid.querySelector(`.tb-team-color-text[data-team-idx="${idx}"]`);
        if (textInp) textInp.value = e.target.value;
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].color = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.tb-team-color-text').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        const colorInp = teamsGrid.querySelector(`.tb-team-color[data-team-idx="${idx}"]`);
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          if (colorInp) colorInp.value = e.target.value;
          if (screenConfig.teams[idx]) {
            screenConfig.teams[idx].color = e.target.value;
            saveCurrentConfig();
          }
        }
      });
    });

    teamsGrid.querySelectorAll('.tb-team-emoji').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].emoji = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.tb-team-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].name = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.tb-team-bg-url').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.getAttribute('data-team-idx'));
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].backgroundUrl = e.target.value;
          saveCurrentConfig();
        }
      });
    });

    teamsGrid.querySelectorAll('.tb-btn-upload-bg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-team-idx'));
        const fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.accept = 'image/*';
        fileInp.onchange = () => {
          if (fileInp.files && fileInp.files[0]) {
            const url = URL.createObjectURL(fileInp.files[0]);
            if (screenConfig.teams[idx]) {
              screenConfig.teams[idx].backgroundUrl = url;
              renderTeamBattleConfig();
              saveCurrentConfig();
              if (window.showToast) window.showToast(`Đã tải ảnh nền cho ${screenConfig.teams[idx].name}!`);
            }
          }
        };
        fileInp.click();
      });
    });

    teamsGrid.querySelectorAll('.tb-btn-lib-bg').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-team-idx'));
        const presetBgs = [
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=720&q=80',
          'https://images.unsplash.com/photo-1557683316-973673baf926?w=720&q=80',
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=720&q=80',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=720&q=80'
        ];
        const pick = presetBgs[idx % presetBgs.length];
        if (screenConfig.teams[idx]) {
          screenConfig.teams[idx].backgroundUrl = pick;
          renderTeamBattleConfig();
          saveCurrentConfig();
          if (window.showToast) window.showToast(`Đã chọn ảnh nền từ Kho ảnh cho ${screenConfig.teams[idx].name}!`);
        }
      });
    });
  }
}

// 7. Render Overlay Widgets List
function renderWidgetsList() {
  const container = document.getElementById('widgets-list-container');
  if (!container) return;

  const gType = screenData?.gameType || 'team_battle';
  let widgets = [];

  if (gType === 'team_battle') {
    widgets = [
      { key: 'teamBattleScore', icon: '🧱', name: 'Khối điểm hai phe', desc: 'Tên phe, điểm và bảng thành tích — dời cả cụm', enabled: true },
      { key: 'teamBattleRule', icon: '📜', name: 'Nhãn luật thắng', desc: 'Dòng "400 gạch = thắng · ván 15"', enabled: true },
      { key: 'giftColumnLeft', icon: '🎁', name: 'Cột quà phe 1', desc: 'Danh sách quà dọc dán mép TRÁI, đọc thẳng từ bảng luật', enabled: true },
      { key: 'giftColumnRight', icon: '🎁', name: 'Cột quà phe 2', desc: 'Danh sách quà dọc dán mép PHẢI, đọc thẳng từ bảng luật', enabled: true },
      { key: 'winner', icon: '👑', name: 'Banner người thắng', desc: 'Hiện khi kết thúc vòng chơi', enabled: true },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '💬', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🖼️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'football_duel') {
    widgets = [
      { key: 'footballScore', icon: '⚽', name: 'Bảng tỉ số sân cỏ', desc: 'Tên hai đội và số bàn thắng — dời cả cụm', enabled: true },
      { key: 'footballPower', icon: '⚡', name: 'Thanh lực sút', desc: 'Hiệu số lực, số lực hai phe và mốc ghi bàn', enabled: true },
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Chưa có luật quà nào — thêm ở tab “Quà & chuyển động”', enabled: true },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Gõ chữ / thả tim / follow thì được gì', enabled: true },
      { key: 'winner', icon: '👑', name: 'Banner người thắng', desc: 'Hiện khi kết thúc vòng chơi', enabled: true },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '💬', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🖼️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'chainsaw_clash') {
    widgets = [
      { key: 'chainsawArena', icon: '🪚', name: 'Đấu trường cưa xích', desc: 'Cả cái sân vuông — kéo để chừa chỗ cho khuôn mặt bạn', enabled: true },
      { key: 'chainsawTopKills', icon: '💀', name: 'Bảng TOP hạ gục', desc: 'Ai hạ được nhiều lưỡi cưa nhất trong ván này', enabled: true },
      { key: 'chainsawClock', icon: '⏱️', name: 'Đồng hồ vòng chơi', desc: 'Thời gian còn lại + số vòng', enabled: true },
      { key: 'chainsawPodium', icon: '🥇', name: 'Bục Quán quân', desc: 'Top 3 nhiều mạng nhất, chỉ hiện lúc hết ván', enabled: true },
      { key: 'winner', icon: '👑', name: 'Banner người thắng', desc: 'Hiện khi kết thúc vòng chơi', enabled: true },
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Đang tắt', enabled: false },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '💬', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🖼️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'army_clash') {
    widgets = [
      { key: 'armyBattleground', icon: '⚔️', name: 'Chiến trường', desc: 'Cả dải đất và hai đội quân — kéo để chừa chỗ cho khuôn mặt bạn', enabled: true },
      { key: 'armyTugBar', icon: '📏', name: 'Thanh giằng co', desc: 'Vạch giao tranh đang ở đâu, còn bao nhiêu mét tới cổng', enabled: true },
      { key: 'armyPower', icon: '💪', name: 'Sức đẩy hai phe', desc: 'Tên phe, sức đẩy, chuỗi thắng', enabled: true },
      { key: 'giftColumnLeft', icon: '🎁', name: 'Cột quà phe 1', desc: 'Danh sách quà dọc dán mép TRÁI, đọc thẳng từ bảng luật', enabled: true },
      { key: 'giftColumnRight', icon: '🎁', name: 'Cột quà phe 2', desc: 'Danh sách quà dọc dán mép PHẢI, đọc thẳng từ bảng luật', enabled: true },
      { key: 'armyClock', icon: '⏱️', name: 'Đồng hồ vòng chơi', desc: 'Thời gian còn lại + số vòng', enabled: true },
      { key: 'winner', icon: '🏆', name: 'Banner người thắng', desc: 'Hiện khi kết thúc vòng chơi', enabled: true },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false },
      { key: 'leaderboard', icon: '👑', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'toast', icon: '📢', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🏷️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'video_react') {
    widgets = [
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Đang tắt', enabled: false },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Đang tắt', enabled: false },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '📢', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🏷️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'receipt_printer') {
    widgets = [
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Đang tắt', enabled: false },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '📢', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🏷️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  } else if (gType === 'live_bar') {
    widgets = [
      { key: 'guestCounter', icon: '👥', name: 'Đếm khách trong sàn', desc: 'Số người đang có mặt trong bar', enabled: true },
      { key: 'queueBar', icon: '⏳', name: 'Hàng chờ lên khung', desc: 'Đang tắt', enabled: false },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '💬', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi từ nút “Nhắn lên live” cho người xem đọc', enabled: true },
      { key: 'logo', icon: '🖼️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false },
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Đang tắt', enabled: false },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Đang tắt', enabled: false }
    ];
  } else {
    widgets = [
      { key: 'gameScore', icon: '🎮', name: 'Bảng điểm chính', desc: 'Điểm số và thanh tiến độ', enabled: true },
      { key: 'giftGuide', icon: '🎁', name: 'Bảng quà & phần thưởng', desc: 'Bảng quy đổi quà', enabled: true },
      { key: 'chatGuide', icon: '💬', name: 'Bảng bình luận & tương tác', desc: 'Gõ chữ / thả tim / follow', enabled: true },
      { key: 'winner', icon: '👑', name: 'Banner người thắng', desc: 'Hiện khi kết thúc vòng chơi', enabled: true },
      { key: 'leaderboard', icon: '🏆', name: 'Bảng xếp hạng tặng quà', desc: 'Top người tặng nhiều nhất', enabled: true },
      { key: 'goal', icon: '🎯', name: 'Thanh mục tiêu', desc: 'Đang tắt', enabled: false },
      { key: 'toast', icon: '💬', name: 'Thông báo nhỏ', desc: 'Dòng chạy khi có tương tác', enabled: true },
      { key: 'alert', icon: '🌟', name: 'Thông báo quà lớn', desc: 'Thẻ to giữa màn hình', enabled: true },
      { key: 'mcMessage', icon: '🎙️', name: 'Tin nhắn MC', desc: 'Chữ bạn gửi cho người xem', enabled: true },
      { key: 'logo', icon: '🖼️', name: 'Logo', desc: 'Chưa có link ảnh — dán bên dưới', enabled: false }
    ];
  }

  container.innerHTML = widgets.map(w => {
    return `
      <div class="widget-card p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-pink-500/50 transition-all space-y-2 cursor-pointer group" data-widget="${w.key}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">${w.icon}</span>
            <span class="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">${w.name}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full ${w.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'} font-bold">
            ${w.enabled ? 'Hiện' : 'Đang tắt'}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 leading-relaxed">${w.desc}</p>
      </div>
    `;
  }).join('');
}

// 8. Live Bar Floor Scene Handler
function renderLiveBarSceneConfig() {
  const sceneSection = document.getElementById('theme-livebar-scene-section');
  if (!sceneSection) return;

  const isLiveBar = (screenData?.gameType === 'live_bar');
  sceneSection.style.display = isLiveBar ? '' : 'none';

  if (!isLiveBar) return;

  const currentScene = screenConfig?.scene || 'neon_club';
  document.querySelectorAll('.livebar-scene-card').forEach(card => {
    const s = card.getAttribute('data-scene');
    const isActive = (s === currentScene || (currentScene === 'club' && s === 'neon_club'));
    card.classList.toggle('active', isActive);
    card.classList.toggle('border-2', isActive);
    card.classList.toggle('border-purple-500', isActive);
    card.classList.toggle('border', !isActive);
    card.classList.toggle('border-slate-800', !isActive);

    if (!card._bound) {
      card._bound = true;
      card.addEventListener('click', () => {
        screenConfig.scene = s;
        renderLiveBarSceneConfig();
        saveCurrentConfig();
      });
    }
  });
}

// 10. Video React (Live Show 3 Mèo) Clips Handler
function renderVideoReactClips() {
  const container = document.getElementById('vr-clips-list-container');
  if (!container) return;

  const tpl = screenConfig?.template || {
    name: '3 Tuất vàng Live',
    actions: []
  };

  const nameEl = document.getElementById('vr-template-name');
  if (nameEl) {
    const isTuat = (tpl.name || '').includes('Tuất');
    nameEl.innerHTML = `<span>${isTuat ? '🐕' : '🐱'}</span> ${tpl.name || 'Màn hình video'}`;
  }
  const descEl = document.getElementById('vr-template-desc');
  if (descEl) {
    descEl.textContent = tpl.description || 'Nhân vật video chạy nền, có quà là đổi sang clip chuyển động khác.';
  }

  const mappings = screenConfig?.mappings || [];
  const actions = tpl.actions || [];
  const videoNames = screenConfig?.videoNames || {};

  let unassignedCount = 0;

  container.innerHTML = actions.map(act => {
    const customName = videoNames[act.key] || {};
    const label = customName.label || act.label;
    const emoji = customName.emoji || act.emoji || '🐱';
    const durSec = (act.durationMs / 1000).toFixed(1);
    const coolSec = act.cooldownMs ? (act.cooldownMs / 1000).toFixed(0) : 0;

    const matchedRules = mappings.filter(m => m.action === 'play_video' && m.videoKey === act.key);
    const hasRules = matchedRules.length > 0;
    if (!hasRules) unassignedCount++;

    const subInfo = `Dài ${durSec}s${coolSec > 0 ? ` · nghỉ ${coolSec}s giữa 2 lần` : ''} · ưu tiên ${act.priority || 10}`;

    return `
      <div class="vr-clip-card p-4 rounded-2xl bg-slate-950/80 border ${hasRules ? 'border-slate-800' : 'border-slate-800/80'} space-y-3" data-video-key="${act.key}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-base">${emoji}</span>
            <span class="text-sm font-bold text-white">${label}</span>
            <span class="text-[11px] ${hasRules ? 'text-emerald-400 font-semibold' : 'text-slate-500 italic'}">
              · ${hasRules ? `${matchedRules.length} điều kiện` : 'chưa có điều kiện'}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-vr-rename-clip px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all" data-video-key="${act.key}" data-label="${label}" data-emoji="${emoji}">
              ✏️ Đổi tên
            </button>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 font-medium">${subInfo}</div>

        <!-- Rules for this clip -->
        <div class="space-y-2">
          ${hasRules ? matchedRules.map(r => {
            const trigDesc = r.trigger === 'gift' ? `🎁 Tặng quà: ${r.giftName || r.gift || 'Món quà'}` :
                             r.trigger === 'gift_any' ? `🎁 Mọi món quà` :
                             r.trigger === 'comment' ? `💬 Gõ chữ: "${r.keyword || ''}"` :
                             r.trigger === 'like' ? `❤️ Thả ${r.minCount || 15} tim` :
                             r.trigger === 'follow' ? `➕ Follow kênh` :
                             r.trigger === 'share' ? `🔁 Chia sẻ live` : `⚡ Tương tác`;
            return `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200">
                <span class="font-semibold">${trigDesc}</span>
                <button class="btn-vr-remove-rule text-slate-500 hover:text-rose-400 font-bold px-1.5 py-0.5 rounded transition-colors" data-rule-idx="${mappings.indexOf(r)}">
                  ✕
                </button>
              </div>
            `;
          }).join('') : `
            <p class="text-xs text-slate-500 italic">Chưa có điều kiện — clip này sẽ không bao giờ được phát.</p>
          `}
        </div>

        <!-- Quick Add Trigger Dropdown / Buttons -->
        <div class="pt-1 flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-400 mr-1">Thêm:</span>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 text-[11px] font-semibold border border-slate-800 hover:border-pink-500/40 transition-all" data-video-key="${act.key}" data-trigger="gift">
            🎁 Món quà
          </button>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 text-[11px] font-semibold border border-slate-800 hover:border-pink-500/40 transition-all" data-video-key="${act.key}" data-trigger="gift_any">
            🎁 Mọi món quà
          </button>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold border border-slate-800 hover:border-cyan-500/40 transition-all" data-video-key="${act.key}" data-trigger="comment">
            💬 Gõ chữ
          </button>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 text-[11px] font-semibold border border-slate-800 hover:border-rose-500/40 transition-all" data-video-key="${act.key}" data-trigger="like">
            ❤️ Thả tim
          </button>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 text-[11px] font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all" data-video-key="${act.key}" data-trigger="follow">
            ➕ Follow
          </button>
          <button class="btn-vr-add-trigger px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-600/20 text-slate-300 hover:text-teal-300 text-[11px] font-semibold border border-slate-800 hover:border-teal-500/40 transition-all" data-video-key="${act.key}" data-trigger="share">
            🔁 Chia sẻ
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Update alert
  const alertEl = document.getElementById('vr-no-rules-alert');
  if (alertEl) alertEl.classList.toggle('hidden', mappings.length > 0);

  // Update summary
  const sumEl = document.getElementById('vr-clips-summary');
  if (sumEl) {
    sumEl.textContent = unassignedCount > 0 ?
      `Còn ${unassignedCount} clip chưa có điều kiện nào — chúng sẽ không bao giờ lên sóng.` :
      `Đã gán điều kiện cho toàn bộ ${actions.length} clip.`;
  }

  // Bind Add Trigger Buttons
  container.querySelectorAll('.btn-vr-add-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const vKey = btn.getAttribute('data-video-key');
      const trig = btn.getAttribute('data-trigger');
      if (!screenConfig.mappings) screenConfig.mappings = [];

      let newRule = {
        action: 'play_video',
        videoKey: vKey,
        trigger: trig,
        points: 1,
        enabled: true
      };

      if (trig === 'gift') {
        newRule.giftName = 'Hoa Hồng';
        newRule.giftId = 5655;
      } else if (trig === 'comment') {
        newRule.keyword = '1';
      } else if (trig === 'like') {
        newRule.minCount = 15;
      }

      screenConfig.mappings.push(newRule);
      renderVideoReactClips();
      if (typeof renderRulesList === 'function') renderRulesList();
      saveCurrentConfig();
      if (window.showToast) window.showToast(`✅ Đã thêm điều kiện cho clip!`);
    });
  });

  // Bind Remove Rule Buttons
  container.querySelectorAll('.btn-vr-remove-rule').forEach(btn => {
    btn.addEventListener('click', () => {
      const rIdx = Number(btn.getAttribute('data-rule-idx'));
      if (screenConfig.mappings && screenConfig.mappings[rIdx]) {
        screenConfig.mappings.splice(rIdx, 1);
        renderVideoReactClips();
        if (typeof renderRulesList === 'function') renderRulesList();
        saveCurrentConfig();
        if (window.showToast) window.showToast(`🗑️ Đã xoá điều kiện!`);
      }
    });
  });

  // Bind Rename Clip Buttons
  container.querySelectorAll('.btn-vr-rename-clip').forEach(btn => {
    btn.addEventListener('click', () => {
      const vKey = btn.getAttribute('data-video-key');
      const curLabel = btn.getAttribute('data-label');
      const newName = prompt(`Nhập tên hiển thị mới cho clip "${curLabel}":`, curLabel);
      if (newName !== null && newName.trim()) {
        if (!screenConfig.videoNames) screenConfig.videoNames = {};
        screenConfig.videoNames[vKey] = {
          ...screenConfig.videoNames[vKey],
          label: newName.trim()
        };
        renderVideoReactClips();
        saveCurrentConfig();
      }
    });
  });
}


