/* ============================================================
   UI-CORE.JS — Điều hướng Scene, Theme Bàn Thám Tử, Thanh Thời Gian,
   Hệ thống Modal Trung Tâm & Phím Tắt Toàn Cục.
   ============================================================ */

let currentCaseIndex = null;
let replayIdx = 0;
let currentScene = 'caseSelect';
let previousScene = 'hub';

/* ---------- Scene Engine ---------- */
function setScene(html, shouldScroll = false) {
  const panel = document.getElementById('storyPanel');
  if (!panel) return;
  const prevScroll = window.scrollY;
  panel.classList.remove('scene-fade');
  panel.innerHTML = html;
  void panel.offsetWidth; // reflow to restart animation
  panel.classList.add('scene-fade');
  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: prevScroll, behavior: 'instant' });
  }
}

function goTo(scene) {
  if (scene !== 'board') {
    previousScene = scene;
  }
  if (scene !== 'hub') {
    state.hubScrollY = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  currentScene = scene;

  // Toggle active glow on detective bar board button
  const btnBoard = document.getElementById('btnToggleBoard');
  if (btnBoard) {
    btnBoard.classList.toggle('active', scene === 'board');
  }

  if (typeof RENDER !== 'undefined' && RENDER[scene]) {
    RENDER[scene]();
  }

  // Auto-save session progress whenever scene changes
  if (CASE && typeof saveCurrentGameState === 'function' && scene !== 'caseSelect' && scene !== 'ending') {
    saveCurrentGameState(CASE.id);
  }
}

function toggleBoardScene() {
  closeDetectiveModal();
  sound.click();
  if (currentScene === 'board') {
    goTo(previousScene || 'hub');
  } else {
    goTo('board');
  }
}

function setHeader(fileNo, title, subtitle) {
  const fileNoEl = document.getElementById('fileNoLabel');
  if (fileNoEl) fileNoEl.textContent = fileNo ? ('Hồ sơ mật · Số ' + fileNo) : 'Hồ sơ điều tra';
  const titleEl = document.getElementById('caseTitleHeader');
  if (titleEl) titleEl.textContent = title || 'Hồ Sơ Điều Tra';
  const sub = document.getElementById('caseSubtitle');
  if (sub) {
    if (subtitle) {
      sub.textContent = subtitle;
      sub.style.display = 'block';
    } else {
      sub.textContent = '';
      sub.style.display = 'none';
    }
  }
  const backBtn = document.getElementById('headerBackBtn');
  if (backBtn) {
    backBtn.style.display = (title && title.includes('ART OF DEDUCTION') && !fileNo) ? 'none' : 'inline-block';
  }
}

function toggleSoundMute() {
  return sound.toggleMute();
}

/* ============================================================
   VICTORIAN DESK BACKGROUND THEMES & SETTINGS
   ============================================================ */
const THEMES = [
  { id: 'theme-mahogany', label: '🪵 Bàn Gỗ Gụ', title: 'Không gian bàn gỗ gụ 221B Baker St' },
  { id: 'theme-noir-leather', label: '📜 Bìa Da Đen', title: 'Không gian bìa da mật Scotland Yard' },
  { id: 'theme-baker-study', label: '🕯️ Đèn Dầu Đêm', title: 'Không gian phòng đọc sách Baker St' }
];

let currentThemeIndex = 0;

function initTheme() {
  if (typeof localStorage === 'undefined' || typeof document === 'undefined') return;
  const saved = localStorage.getItem('aod_theme') || 'theme-mahogany';
  const idx = THEMES.findIndex(t => t.id === saved);
  currentThemeIndex = idx >= 0 ? idx : 0;
  applyTheme(THEMES[currentThemeIndex].id);
  initFontSize();
}

function applyTheme(themeId) {
  if (typeof document === 'undefined' || !document.body) return;
  document.body.classList.remove('theme-mahogany', 'theme-noir-leather', 'theme-baker-study');
  document.body.classList.add(themeId);
}

let currentFontSizeMode = 'standard';

function initFontSize() {
  if (typeof localStorage === 'undefined' || typeof document === 'undefined') return;
  currentFontSizeMode = localStorage.getItem('aod_fontsize') || 'standard';
  applyFontSize(currentFontSizeMode);
}

function applyFontSize(mode) {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('font-large', mode === 'large');
}

function setFontSizeMode(mode) {
  sound.click();
  currentFontSizeMode = mode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aod_fontsize', mode);
  }
  applyFontSize(mode);
  openSettingsModal();
}

function confirmResetCurrentCase() {
  if (!CASE) return;
  sound.click();
  if (typeof confirm === 'function') {
    const ok = confirm(`Bạn có chắc muốn đặt lại tiến trình vụ án "${CASE.title}" để điều tra lại từ đầu?`);
    if (ok) {
      if (typeof clearCaseSave === 'function') {
        clearCaseSave(CASE.id);
      }
      closeDetectiveModal();
      selectCase(currentCaseIndex !== null ? currentCaseIndex : CASE.id);
    }
  }
}

function openSettingsModal() {
  const isMuted = sound.isMuted();

  const themesHtml = THEMES.map((t, idx) => {
    const isSel = idx === currentThemeIndex;
    return `
      <div class="settings-theme-option ${isSel ? 'selected' : ''}" onclick="selectThemeFromSettings(${idx})">
        <div style="font-weight:700;font-size:14.5px;color:${isSel ? '#f1c40f' : '#efe2c0'};margin-bottom:3px;">
          ${t.label} ${isSel ? '✓' : ''}
        </div>
        <div style="font-size:12px;color:#cdbf9e;">${t.title}</div>
      </div>
    `;
  }).join('');

  const html = `
    <div class="modal-profile-wrap">
      <!-- 1. Sound & Ambient Soundscape Settings -->
      <div class="settings-section">
        <div class="settings-sec-title">🔊 HIỆU ỨNG ÂM THANH (SFX)</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:4px;">
          <div>
            <div style="font-size:13.5px;color:#efe2c0;font-weight:700;">Hiệu ứng âm thanh Victorian</div>
            <div style="font-size:11.5px;color:#888;margin-top:2px;">Tiếng lật giấy, ghim thẻ, nhịp tim & đối chất</div>
          </div>
          <button class="settings-sound-toggle-btn ${isMuted ? 'muted' : 'active'}" onclick="toggleSoundFromSettings()">
            ${isMuted ? '🔇 ĐANG TẮT' : '🔊 ĐANG BẬT'}
          </button>
        </div>

        <!-- Ambient Soundscape (Item F) -->
        <div class="ambient-control-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:13.5px;color:#efe2c0;font-weight:700;">🌧️ Không Gian Âm Thanh Nền (Ambient)</div>
              <div style="font-size:11.5px;color:#888;margin-top:2px;">Tiếng mưa rào Victorian & đồng hồ quả lắc Baker St</div>
            </div>
            <button class="settings-sound-toggle-btn ${typeof ambientAudio !== 'undefined' && ambientAudio.isEnabled() ? 'active' : 'muted'}" onclick="toggleAmbientFromSettings()">
              ${typeof ambientAudio !== 'undefined' && ambientAudio.isEnabled() ? '🌧️ BẬT' : '🔇 TẮT'}
            </button>
          </div>

          ${typeof ambientAudio !== 'undefined' && ambientAudio.isEnabled() ? `
            <div class="ambient-slider-row">
              <span style="font-size:11px;color:#cdbf9e;">Âm lượng:</span>
              <input type="range" class="ambient-slider" min="0" max="1" step="0.05" value="${ambientAudio.getVolume()}" oninput="changeAmbientVolume(this.value)">
              <span style="font-size:11px;font-family:'Courier Prime',monospace;color:#f1c40f;min-width:32px;">${Math.round(ambientAudio.getVolume() * 100)}%</span>
            </div>

            <div class="ambient-mode-chips">
              <button class="ambient-mode-chip ${ambientAudio.getMode() === 'all' ? 'active' : ''}" onclick="changeAmbientMode('all')">🌧️ Mưa + Đồng hồ</button>
              <button class="ambient-mode-chip ${ambientAudio.getMode() === 'rain' ? 'active' : ''}" onclick="changeAmbientMode('rain')">🌧️ Chỉ tiếng mưa</button>
              <button class="ambient-mode-chip ${ambientAudio.getMode() === 'clock' ? 'active' : ''}" onclick="changeAmbientMode('clock')">🕰️ Chỉ đồng hồ</button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 2. Inspector's Field Manual (Tutorial) -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">📖 SỔ TAY NGHIỆP VỤ THÁM TỬ (FIELD MANUAL)</div>
        <button class="secondary-btn" style="width:100%;font-size:13px;padding:9px;border-color:#f1c40f;color:#f1c40f;font-weight:bold;" onclick="closeDetectiveModal(); openTutorialModal();">
          📖 Mở Sổ Tay Hướng Dẫn Nghiệp Vụ & Quy Tắc Phá Án ➔
        </button>
      </div>

      <!-- 3. Font Size Mode -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">🔤 KÍCH THƯỚC CHỮ (FONT SIZE)</div>
        <div class="settings-btn-row">
          <button class="settings-action-btn ${currentFontSizeMode === 'standard' ? 'active' : ''}" onclick="setFontSizeMode('standard')">
            Tiêu chuẩn (100%) ${currentFontSizeMode === 'standard' ? '✓' : ''}
          </button>
          <button class="settings-action-btn ${currentFontSizeMode === 'large' ? 'active' : ''}" onclick="setFontSizeMode('large')">
            Chữ lớn (115%) ${currentFontSizeMode === 'large' ? '✓' : ''}
          </button>
        </div>
      </div>

      <!-- 4. Desk Themes -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">🪵 KHÔNG GIAN BÀN THÁM TỬ (THEME)</div>
        <div class="settings-theme-grid">
          ${themesHtml}
        </div>
      </div>

      <!-- 5. Difficulty Mode -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">⚖️ CHẾ ĐỘ ĐIỀU TRA (DIFFICULTY MODE)</div>
        <div class="settings-btn-row">
          <button class="settings-action-btn ${state.difficultyMode === 'standard' ? 'active' : ''}" onclick="setDifficultyMode('standard')">
            🎩 Chuẩn (Standard) ${state.difficultyMode === 'standard' ? '✓' : ''}
          </button>
          <button class="settings-action-btn ${state.difficultyMode === 'casual' ? 'active' : ''}" onclick="setDifficultyMode('casual')">
            ☕ Thư Giãn (Casual) ${state.difficultyMode === 'casual' ? '✓' : ''}
          </button>
        </div>
        <div style="font-size:11.5px;color:#888;margin-top:6px;line-height:1.4;">
          ${state.difficultyMode === 'casual'
      ? '• <strong>Thư Giãn:</strong> Giảm 50% thời gian phạt, tăng 5 lượt gợi ý, gia hạn tối đa 3 lần, khóa kết cục Perfect (tối đa Good).'
      : '• <strong>Chuẩn:</strong> Trải nghiệm trinh thám nguyên bản, áp dụng luật phạt đầy đủ, có thể đạt kết cục Perfect (Cố vấn Hoàng gia).'}
        </div>
      </div>

      <!-- 6. Keyboard Shortcuts -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">⌨️ BẢNG PHÍM TẮT THÁM TỬ</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:6px;background:rgba(0,0,0,0.3);padding:10px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cdbf9e;">
          <div><span class="d-bar-kbd">H</span> Hồ sơ vụ án</div>
          <div><span class="d-bar-kbd">T</span> Trục thời gian</div>
          <div><span class="d-bar-kbd">M</span> Sổ manh mối</div>
          <div><span class="d-bar-kbd">B</span> Bảng ghim suy luận</div>
          <div><span class="d-bar-kbd">N</span> Sổ ghi chép</div>
          <div><span class="d-bar-kbd">S</span> Cài đặt</div>
          <div><span class="d-bar-kbd">ESC</span> Đóng cửa sổ</div>
        </div>
      </div>

      <!-- 7. Reset Case Progress -->
      ${CASE ? `
        <div class="settings-section" style="margin-top:16px;">
          <div class="settings-sec-title">🔄 TIẾN TRÌNH VỤ ÁN HIỆN TẠI</div>
          <button class="settings-reset-btn" onclick="confirmResetCurrentCase()">
            🔄 Đặt lại và điều tra lại vụ án này từ đầu
          </button>
        </div>
      ` : ''}
    </div>
  `;

  openDetectiveModal('⚙️ Thiết Lập & Không Gian Thám Tử', html);
}

function toggleSoundFromSettings() {
  toggleSoundMute();
  openSettingsModal();
}

function toggleAmbientFromSettings() {
  if (typeof ambientAudio !== 'undefined') {
    ambientAudio.toggle();
  }
  openSettingsModal();
}

function changeAmbientVolume(val) {
  if (typeof ambientAudio !== 'undefined') {
    ambientAudio.setVolume(parseFloat(val));
    const slider = document.querySelector('.ambient-slider');
    if (slider && slider.nextElementSibling) {
      slider.nextElementSibling.textContent = `${Math.round(ambientAudio.getVolume() * 100)}%`;
    }
  }
}

function changeAmbientMode(mode) {
  if (typeof ambientAudio !== 'undefined') {
    sound.click();
    ambientAudio.setMode(mode);
    openSettingsModal();
  }
}

function selectThemeFromSettings(idx) {
  sound.click();
  currentThemeIndex = idx;
  const theme = THEMES[idx];
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aod_theme', theme.id);
  }
  applyTheme(theme.id);
  openSettingsModal();
}

function showTimeBar(show) {
  const el = document.getElementById('timeBarWrap');
  if (el) el.style.display = show ? 'block' : 'none';
}

function showDetectiveBar(show) {
  const bar = document.getElementById('detectiveBar');
  if (bar) bar.style.display = show ? 'flex' : 'none';
}

/* ---------- Achievement Toast ---------- */
function showAchievementToast(achievementIds) {
  if (!achievementIds || achievementIds.length === 0) return;
  let delay = 0;
  achievementIds.forEach(id => {
    const a = ACHIEVEMENTS[id];
    if (!a) return;
    setTimeout(() => {
      sound.achievement();
      const toast = document.createElement('div');
      toast.className = 'achievement-toast';
      toast.innerHTML = `<span class="ach-icon">${a.icon}</span><div><div class="ach-label">Thành tích mở khóa!</div><div class="ach-name">${a.label}</div><div class="ach-desc">${a.desc}</div></div>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 30);
      setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
    }, delay);
    delay += 700;
  });
}

/* ---------- Suspect Unlock Flash ---------- */
function showSuspectUnlockedNotice(suspect) {
  if (!suspect) return;
  sound.unlock();
  const notice = document.createElement('div');
  notice.className = 'suspect-unlock-notice';
  notice.innerHTML = `<span class="unlock-icon">🔓</span><div><div class="unlock-label">Nghi phạm mới xuất hiện</div><div class="unlock-name">${suspect.name}</div><div class="unlock-text">${suspect.revealText || suspect.desc}</div></div>`;
  document.body.appendChild(notice);
  setTimeout(() => notice.classList.add('show'), 30);
  setTimeout(() => { notice.classList.remove('show'); setTimeout(() => notice.remove(), 500); }, 5000);
}

/* ---------- Expire Warning Flash ---------- */
let warnedClues = [];
function checkExpireWarnings() {
  if (!CASE || !CASE.evidence) return;
  Object.keys(CASE.evidence).forEach(id => {
    const clue = CASE.evidence[id];
    if (clue.expiresAt && !state.inspectedItems.includes(id) && !state.expiredClues.includes(id)) {
      if (state.time <= clue.expiresAt + 10 && !warnedClues.includes(id)) {
        warnedClues.push(id);
        showExpireWarningNotice(clue);
      }
    }
  });
}

function showExpireWarningNotice(clue) {
  if (!clue) return;
  sound.wrong();
  const notice = document.createElement('div');
  notice.className = 'suspect-unlock-notice';
  notice.style.borderLeft = '3px solid #e67e22';
  notice.innerHTML = `<span class="unlock-icon" style="color:#e67e22;">⏰</span><div><div class="unlock-label" style="color:#e67e22;">CẢNH BÁO THỜI GIAN</div><div class="unlock-name">${clue.label}</div><div class="unlock-text">${clue.expireWarning || 'Manh mối này sắp hết hạn kiểm tra!'}</div></div>`;
  document.body.appendChild(notice);
  setTimeout(() => notice.classList.add('show'), 30);
  setTimeout(() => { notice.classList.remove('show'); setTimeout(() => notice.remove(), 500); }, 6000);
}

/* ---------- Universal Detective Modal System (Center Overlay) ---------- */
function openDetectiveModal(title, html) {
  const modal = document.getElementById('detectiveModal');
  const overlay = document.getElementById('detectiveModalOverlay');
  const titleEl = document.getElementById('detModalTitle');
  const bodyEl = document.getElementById('detModalBody');
  if (!modal || !overlay) return;

  if (titleEl) titleEl.innerHTML = title;
  if (bodyEl) bodyEl.innerHTML = html;

  // Explicitly reset scroll to top on every modal open
  if (bodyEl) bodyEl.scrollTop = 0;
  modal.scrollTop = 0;

  overlay.classList.add('open');
  modal.classList.add('open');
  sound.page();
}

function closeDetectiveModal() {
  const modal = document.getElementById('detectiveModal');
  const overlay = document.getElementById('detectiveModalOverlay');
  if (modal) {
    modal.classList.remove('open');
    modal.scrollTop = 0;
  }
  if (overlay) overlay.classList.remove('open');
}

/* ---------- Global Window Listeners (Escape, Resize & Hotkeys) ---------- */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('keydown', e => {
    // If typing in input or textarea, don't trigger game hotkeys
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeDetectiveModal();
      if (typeof closeHypModal === 'function') closeHypModal();
      const replayPanel = document.getElementById('replayPanel');
      if (replayPanel && replayPanel.classList.contains('show')) {
        replayPanel.classList.remove('show');
      }
      return;
    }

    // Modal is open -> don't trigger background navigation hotkeys
    const modal = document.getElementById('detectiveModal');
    const isModalOpen = modal && modal.classList.contains('open');

    const key = e.key.toLowerCase();
    if (!isModalOpen && typeof CASE !== 'undefined' && CASE) {
      if (key === 'h' && typeof openCaseProfileModal === 'function') {
        e.preventDefault();
        openCaseProfileModal();
      } else if (key === 't' && typeof openTimelineModal === 'function') {
        e.preventDefault();
        openTimelineModal();
      } else if (key === 'm' && typeof openCluesListModal === 'function') {
        e.preventDefault();
        openCluesListModal();
      } else if (key === 'b') {
        e.preventDefault();
        toggleBoardScene();
      } else if (key === 'n' && typeof openScratchpadModal === 'function') {
        e.preventDefault();
        openScratchpadModal();
      } else if (key === 's') {
        e.preventDefault();
        openSettingsModal();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (currentScene === 'board' && typeof updateCorkSvg === 'function') {
      updateCorkSvg();
    }
  });
}

/* ---------- Time Bar & Investigation Summary ---------- */
function renderTimeBar() {
  if (!CASE) return;
  const pct = Math.round((state.time / CASE.timeBudget) * 100);
  const timeLbl = document.getElementById('timeLabel');
  if (timeLbl) timeLbl.textContent = state.time + ' phút';
  const fill = document.getElementById('timeFill');
  if (fill) {
    fill.style.width = pct + '%';
    const isWarn = pct <= 25 && state.time > 0;
    fill.classList.toggle('warn', isWarn);
  }

  // Cập nhật thanh tóm tắt tiến độ trên đầu (nằm trên thanh thời gian)
  const req = requiredKeyEvidence();
  const hasRequired = req.every(k => state.clues.includes(k));
  const canProceed = hasRequired || state.time <= 0;
  const totalRealClues = Object.keys(CASE.evidence).filter(k => !CASE.evidence[k].decoy).length;
  const collectedRealClues = state.clues.filter(k => !CASE.evidence[k].decoy).length;
  const totalContradictions = Object.values(state.contradictionsFound || {}).reduce((acc, arr) => acc + arr.length, 0);

  const banner = document.getElementById('hubSummaryBanner');
  if (banner) {
    const isInvestigating = currentScene !== 'caseSelect' && currentScene !== 'start' && currentScene !== 'ending';
    banner.style.display = isInvestigating ? 'flex' : 'none';
    banner.innerHTML = `
      <div class="hub-summary-item">
        <span>Vật chứng:</span>
        <b>${collectedRealClues}/${totalRealClues}</b>
      </div>
      <div class="hub-summary-item">
        <span>Mâu thuẫn bẻ gãy:</span>
        <b>${totalContradictions}</b>
      </div>
      <div class="hub-summary-status ${canProceed ? 'hub-status-ready' : 'hub-status-pending'}">
        ${canProceed ? '✓ ĐỦ ĐIỀU KIỆN SUY LUẬN' : '⏳ CẦN THÊM VẬT CHỨNG'}
      </div>
    `;
  }

  // Cập nhật nút gia hạn thời gian trên header (Chỉ xuất hiện khi sắp hết giờ / vùng đỏ nguy hiểm)
  const borrowBtn = document.getElementById('btnBorrowTimeHeader');
  if (borrowBtn) {
    const isDangerZone = pct <= 25 || state.time <= 15;
    if (canBorrowTime() && isDangerZone) {
      borrowBtn.style.display = 'inline-flex';
      const remaining = 2 - (state.timeBorrowCount || 0);
      borrowBtn.innerHTML = `<span class="ext-icon">⏳</span> Gia hạn +15p <span class="ext-badge">${remaining}</span>`;
    } else {
      borrowBtn.style.display = 'none';
    }
  }

  if (state.time <= 0) {
    checkTimeoutAndRedirect();
  }
}

function checkTimeoutAndRedirect() {
  if (state.time <= 0 && currentScene !== 'decision' && currentScene !== 'ending') {
    sound.stopHeartbeat();
    sound.warn();
    const canBorrow = canBorrowTime();
    const remaining = 2 - (state.timeBorrowCount || 0);

    const borrowActionHtml = canBorrow ? `
      <div style="margin:14px 0;padding:12px 14px;background:rgba(241,196,15,0.1);border-left:3px solid #f1c40f;border-radius:4px;color:#f1c40f;font-size:13.5px;line-height:1.5;">
        <strong>📜 Quyền Khẩn Cấp: Trưng Dụng Thêm Thời Gian</strong><br>
        Bạn có thể yêu cầu Cảnh sát trưởng kéo dài thời gian phong tỏa hiện trường thêm <strong>+15 phút</strong> để hoàn tất các suy luận còn dang dở.<br>
        <em>(Lưu ý: Tiêu hao 8 điểm Uy Tín Thám Tử do kéo dài hiện trường. Còn lại: ${remaining}/2 lần).</em>
      </div>
    ` : `
      <div style="margin:14px 0;padding:10px 12px;background:rgba(231,76,60,0.1);border-left:3px solid #e74c3c;border-radius:4px;color:#e74c3c;font-size:13px;">
        Đã sử dụng hết số lần gia hạn tối đa (2 lần). Bạn bắt buộc phải bước vào giai đoạn Buộc Tội.
      </div>
    `;

    openDetectiveModal('⏰ HẾT THỜI GIAN ĐIỀU TRA HIỆN TRƯỜNG', `
      <div class="modal-profile-wrap">
        <p style="font-size:15.5px;color:#e74c3c;line-height:1.6;">
          <strong>Quỹ thời gian điều tra hiện trường đã cạn kiệt (0 phút)!</strong>
        </p>
        ${borrowActionHtml}
        <div class="btn-row" style="margin-top:20px;gap:10px;">
          ${canBorrow ? `<button class="continue-btn" onclick="handleBorrowTimeAndContinue()" style="background:#f39c12;color:#18110a;font-weight:bold;">📜 Kích Hoạt Gia Hạn (+15p) ➔</button>` : ''}
          <button class="secondary-btn" onclick="closeDetectiveModal(); goTo('decision');">Tiến vào Buộc Tội ngay ➔</button>
        </div>
      </div>
    `);
    return true;
  }
  return false;
}

function promptBorrowTime() {
  if (!canBorrowTime()) {
    openDetectiveModal('⏱️ Giới Hạn Gia Hạn', '<div class="modal-profile-wrap"><p style="color:#e74c3c;font-size:14.5px;">Bạn đã sử dụng hết quyền trưng dụng gia hạn điều tra (tối đa 2 lần) cho vụ án này!</p></div>');
    return;
  }
  const remaining = 2 - (state.timeBorrowCount || 0);
  openDetectiveModal('📜 Lệnh Khẩn Cấp: Trưng Dụng Thời Gian', `
    <div class="modal-profile-wrap">
      <div style="font-size:15.5px;color:#efe2c0;line-height:1.6;">
        <p>Bạn có muốn <strong>trưng dụng thêm 15 phút</strong> từ Cảnh sát trưởng để tiếp tục khám nghiệm hiện trường và bóc tách lời khai?</p>
        <div style="margin:14px 0;padding:12px 14px;background:rgba(241,196,15,0.1);border-left:3px solid #f1c40f;border-radius:4px;color:#f1c40f;font-size:13.5px;line-height:1.5;">
          <strong>Quy tắc gia hạn điều tra:</strong><br>
          • Cộng ngay <strong>+15 phút</strong> vào đồng hồ điều tra hiện trường.<br>
          • Đánh đổi <strong>-8 điểm Uy Tín Thám Tử</strong> trên tổng điểm Holmes Index cuối vụ án.<br>
          • Số lệnh khẩn cấp còn lại: <strong>${remaining}/2 lần</strong>.
        </div>
      </div>
      <div class="btn-row" style="margin-top:20px;">
        <button class="secondary-btn" onclick="closeDetectiveModal()">← Giữ nguyên hiện trạng</button>
        <button class="continue-btn" onclick="handleBorrowTimeAndContinue()" style="background:#f39c12;color:#18110a;font-weight:bold;">📜 Kích Hoạt Gia Hạn (+15 Phút) ➔</button>
      </div>
    </div>
  `);
}

function handleBorrowTimeAndContinue() {
  const res = borrowTime();
  if (res.success) {
    sound.correct();
    closeDetectiveModal();
    renderTimeBar();
    openDetectiveModal('📜 Gia Hạn Thành Công', `
      <div class="modal-profile-wrap">
        <p style="font-size:15px;color:#2ecc71;line-height:1.6;">
          <strong>${res.msg}</strong>
        </p>
        <div class="btn-row" style="margin-top:16px;">
          <button class="continue-btn" onclick="closeDetectiveModal()">Tiếp tục điều tra ➔</button>
        </div>
      </div>
    `);
  }
}

function renderBoard() {
  // Update badge counter
  const bEvidence = document.getElementById('badgeEvidence');
  if (bEvidence) bEvidence.textContent = state.clues.length;
}
