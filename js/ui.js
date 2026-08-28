/* ============================================================
   UI.JS — mọi hàm render và xử lý sự kiện DOM.
   ============================================================ */

let currentCaseIndex = null;
let replayIdx = 0;

/* ---------- scene engine ---------- */
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

let currentScene = 'caseSelect';
let previousScene = 'hub';

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

  RENDER[scene]();
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
  document.getElementById('fileNoLabel').textContent = fileNo ? ('Hồ sơ mật · Số ' + fileNo) : 'Hồ sơ điều tra';
  document.getElementById('caseTitleHeader').textContent = title || 'Hồ Sơ Điều Tra';
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
   VICTORIAN DESK BACKGROUND THEMES
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
      selectCase(CASE.id);
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
      <!-- 1. Sound Settings -->
      <div class="settings-section">
        <div class="settings-sec-title">🔊 ÂM THANH HIỆN TRƯỜNG (SFX)</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:4px;">
          <div>
            <div style="font-size:13.5px;color:#efe2c0;font-weight:700;">Hiệu ứng âm thanh Victorian</div>
            <div style="font-size:11.5px;color:#888;margin-top:2px;">Tiếng lật giấy, ghim thẻ, nhịp tim & đối chất</div>
          </div>
          <button class="settings-sound-toggle-btn ${isMuted ? 'muted' : 'active'}" onclick="toggleSoundFromSettings()">
            ${isMuted ? '🔇 ĐANG TẮT' : '🔊 ĐANG BẬT'}
          </button>
        </div>
      </div>

      <!-- 2. Font Size Mode -->
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

      <!-- 3. Desk Themes -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">🪵 KHÔNG GIAN BÀN THÁM TỬ (THEME)</div>
        <div class="settings-theme-grid">
          ${themesHtml}
        </div>
      </div>

      <!-- Difficulty Mode -->
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

      <!-- 4. Keyboard Shortcuts -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">⌨️ BẢNG PHÍM TẮT THÁM TỬ</div>
        <div style="grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:6px;background:rgba(0,0,0,0.3);padding:10px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cdbf9e;">
          <div><span class="d-bar-kbd">H</span> Hồ sơ vụ án</div>
          <div><span class="d-bar-kbd">T</span> Trục thời gian</div>
          <div><span class="d-bar-kbd">M</span> Sổ manh mối</div>
          <div><span class="d-bar-kbd">B</span> Bảng ghim suy luận</div>
          <div><span class="d-bar-kbd">N</span> Sổ ghi chép</div>
          <div><span class="d-bar-kbd">S</span> Cài đặt</div>
          <div><span class="d-bar-kbd">ESC</span> Đóng cửa sổ</div>
        </div>
      </div>

      <!-- 5. Scoring Rules Guide -->
      <div class="settings-section" style="margin-top:16px;">
        <div class="settings-sec-title">📖 QUY TẮC TÍNH ĐIỂM CHỈ SỐ HOLMES (100 ĐIỂM)</div>
        <div style="background:rgba(0,0,0,0.3);padding:10px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cdbf9e;line-height:1.6;">
          • <strong>👁️ Quan sát đọc vị:</strong> +5đ (Cao) / +2đ (Trung bình) khi soi đúng tâm lý nghi phạm.<br>
          • <strong>🔍 Thu thập vật chứng:</strong> Tìm đủ manh mối mấu chốt tại các hiện trường.<br>
          • <strong>⚡ Bóc trần mâu thuẫn:</strong> Đưa đúng vật chứng đối chất câu nói dối.<br>
          • <strong>⏱️ Phục dựng thời gian:</strong> +15đ khi sắp xếp chuẩn xác toàn bộ mốc sự kiện.<br>
          • <strong>🧠 Mind Palace:</strong> +15đ cho mỗi nút suy luận liên kết chính xác.<br>
          • <strong>⚖️ Phán quyết:</strong> Kết luận đúng thủ phạm, thủ đoạn và động cơ gây án.
        </div>
      </div>

      <!-- 6. Reset Case Progress -->
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
  document.getElementById('timeBarWrap').style.display = show ? 'block' : 'none';
}

/* ---------- achievement toast ---------- */
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

/* ---------- suspect unlock flash ---------- */
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

/* ---------- expire warning flash ---------- */
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

  titleEl.innerHTML = title;
  bodyEl.innerHTML = html;

  // Explicitly reset scroll to top on every modal open
  bodyEl.scrollTop = 0;
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

// Global Window Listeners (Escape key, Viewport Resize & Detective Hotkeys)
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
      closeHypModal();
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
      if (key === 'h') {
        e.preventDefault();
        openCaseProfileModal();
      } else if (key === 't') {
        e.preventDefault();
        openTimelineModal();
      } else if (key === 'm') {
        e.preventDefault();
        openCluesListModal();
      } else if (key === 'b') {
        e.preventDefault();
        toggleBoardScene();
      } else if (key === 'n') {
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

function openCaseProfileModal() {
  if (!CASE) return;

  // Chỉ hiển thị các nghi phạm đã tiếp cận (đã khám xét địa điểm đó) hoặc đã mở khóa
  const knownSuspects = CASE.suspects.filter(s => {
    const isLocSuspect = CASE.locations.some(l => l.id === s.id);
    if (isLocSuspect) {
      return state.visitedLocations.includes(s.id);
    }
    return isSuspectVisible(s);
  });

  let suspectsHtml = '';
  if (knownSuspects.length === 0) {
    suspectsHtml = `
      <div class="board-empty" style="padding:24px 10px;font-size:15px;color:#a5946c;font-style:italic;">
        Chưa phát hiện hoặc tiếp cận đối tượng tình nghi nào.<br>
        Hãy khám xét các địa điểm hiện trường để tìm manh mối về các đối tượng liên quan!
      </div>
    `;
  } else {
    suspectsHtml = `<div class="modal-suspect-grid">` + knownSuspects.map(s => {
      const cred = getCredibilityLabel(state.suspectCredibility[s.id] || 100);
      const isElim = !!state.eliminatedSuspects[s.id];
      return `
        <div class="modal-suspect-card ${isElim ? 'eliminated' : ''}">
          <div class="modal-suspect-head">
            <span class="modal-suspect-name ${isElim ? 'name-eliminated-strike' : ''}">${s.name}</span>
            <span class="elim-status-tag ${isElim ? 'tag-cleared' : 'tag-suspect'}">
              ${isElim ? '✓ ĐÃ LOẠI TRỪ' : 'NGHI PHẠM'}
            </span>
          </div>
          <div class="modal-cred-row">
            <span class="modal-cred-lbl">Độ tin cậy:</span>
            <div class="credibility-bar" style="width:110px;height:6px;margin:0 8px;">
              <div class="credibility-fill ${cred.class}" style="width:${state.suspectCredibility[s.id] || 100}%"></div>
            </div>
            <span class="modal-cred-val ${cred.class}">${state.suspectCredibility[s.id] || 100}% (${cred.label})</span>
          </div>
          <div class="modal-suspect-desc">${s.desc}</div>
          ${isElim ? `<div class="modal-elim-reason">✓ Ngoại phạm: ${s.eliminateExplanation}</div>` : ''}
        </div>
      `;
    }).join('') + `</div>`;
  }

  let objectiveHtml = '';
  if (CASE.objective) {
    objectiveHtml = `
      <div class="modal-section">
        <div class="modal-sec-title">🎯 MỤC TIÊU ĐIỀU TRA</div>
        <div class="modal-victim-box" style="border-left-color:#2ecc71;">
          <div style="font-size:15px;color:#f1c40f;margin-bottom:6px;"><strong>Mục tiêu cốt lõi:</strong> ${CASE.objective.primary}</div>
          ${CASE.objective.secondary && CASE.objective.secondary.length > 0 ? `
            <div style="font-size:13.5px;color:#cdbf9e;border-top:1px dashed rgba(255,255,255,0.1);padding-top:6px;margin-top:6px;">
              <strong>Nhiệm vụ phụ:</strong>
              <ul style="margin:4px 0 0 18px;padding:0;">
                ${CASE.objective.secondary.map(sec => `<li>${sec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  let diffProfileHtml = '';
  if (CASE.difficultyProfile) {
    const dp = CASE.difficultyProfile;
    diffProfileHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <span style="font-size:11.5px;padding:3px 8px;border-radius:3px;background:rgba(241,196,15,0.1);color:#f1c40f;border:1px solid rgba(241,196,15,0.25);">🔍 Độ sâu suy luận: Cấp ${dp.inferenceDepth || 3}</span>
        <span style="font-size:11.5px;padding:3px 8px;border-radius:3px;background:rgba(52,152,219,0.1);color:#3498db;border:1px solid rgba(52,152,219,0.25);">⏱️ Phức tạp thời gian: Cấp ${dp.timelineComplexity || 2}</span>
        <span style="font-size:11.5px;padding:3px 8px;border-radius:3px;background:rgba(46,204,113,0.1);color:#2ecc71;border:1px solid rgba(46,204,113,0.25);">🧩 Tối thiểu ${dp.minimumReasoningSteps || 4} bước suy luận</span>
      </div>
    `;
  }

  const html = `
    <div class="modal-profile-wrap">
      ${diffProfileHtml}
      ${objectiveHtml}
      <div class="modal-section">
        <div class="modal-sec-title">📌 NẠN NHÂN & BỐI CẢNH</div>
        <div class="modal-victim-box">
          <b>${CASE.victim}</b>
          <p>${CASE.setup}</p>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-sec-title">👥 ĐỐI TƯỢNG ĐÃ PHÁT HIỆN (${knownSuspects.length})</div>
        ${suspectsHtml}
      </div>
    </div>
  `;
  openDetectiveModal(`Hồ Sơ Vụ Án: ${CASE.title}`, html);
}

const CLUE_TYPE_LABELS = {
  physical: { label: '🧤 Vật chứng', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)' },
  forensic: { label: '🔬 Pháp y / Khoa học', color: '#3498db', bg: 'rgba(52,152,219,0.12)' },
  document: { label: '📜 Văn bản / Thư từ', color: '#e67e22', bg: 'rgba(230,126,34,0.12)' },
  witness: { label: '🗣️ Nhân chứng', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)' },
  statement: { label: '💬 Lời khai', color: '#9b59b6', bg: 'rgba(155,89,182,0.12)' },
  behavior: { label: '👁️ Tâm lý / Hành vi', color: '#e74c3c', bg: 'rgba(231,76,60,0.12)' }
};

const RELIABILITY_LABELS = {
  high: { label: 'Độ tin cậy: Cao 🟢', color: '#2ecc71' },
  medium: { label: 'Độ tin cậy: Trung bình 🟡', color: '#f1c40f' },
  low: { label: 'Độ tin cậy: Cần đối chiếu 🔴', color: '#e74c3c' }
};

function openClueModal(clueId, fromList = false) {
  if (!CASE || !CASE.evidence || !CASE.evidence[clueId]) return;
  const c = CASE.evidence[clueId];
  const typeInfo = CLUE_TYPE_LABELS[c.type] || { label: c.type || 'Vật chứng', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)' };
  const relInfo = RELIABILITY_LABELS[c.reliability] || { label: 'Độ tin cậy: Cao 🟢', color: '#2ecc71' };
  const loc = CASE.locations.find(l => l.id === c.location);
  const locName = loc ? loc.name : (c.source || 'Hiện trường');

  const clueKeys = Object.keys(CASE.evidence).filter(k => !CASE.evidence[k].decoy);
  const clueIdx = clueKeys.indexOf(clueId) + 1;
  const tagId = clueIdx > 0 ? `EVID-${String(clueIdx).padStart(2, '0')}` : 'EVID-REF';
  const relDot = c.reliability === 'low' ? '🔴' : (c.reliability === 'medium' ? '🟡' : '🟢');
  const relText = c.reliability === 'low' ? 'Cần đối chiếu' : (c.reliability === 'medium' ? 'T.Bình' : 'Tin cậy');

  const backBtnHtml = fromList
    ? `<div class="btn-row" style="margin-top:14px;"><button class="secondary-btn" onclick="openCluesListModal()">← Quay lại sổ tay manh mối</button></div>`
    : '';

  const modalHtml = `
    <div class="modal-profile-wrap">
      <div style="position:relative;padding:22px 18px 16px;background:rgba(0,0,0,0.38);border:1px solid rgba(255,255,255,0.12);border-radius:6px;margin-top:8px;margin-bottom:8px;">
        <div class="forensic-tag-sticker">
          <span class="stamp-code">#${tagId}</span>
          <span class="stamp-type">${typeInfo.label}</span>
          <span style="font-size:10px;font-family:'Courier Prime',monospace;color:#6b4423;border-left:1px solid rgba(90,60,30,0.3);padding-left:6px;">${relDot} ${relText}</span>
        </div>
        <div style="font-size:12px;color:#888;margin-bottom:8px;">Nơi phát hiện: <strong style="color:#cdbf9e;">${locName}</strong></div>
        <div style="font-size:15.5px;color:#efe2c0;line-height:1.65;font-family:'Crimson Text',Georgia,serif;">
          ${c.text}
        </div>
      </div>
      ${backBtnHtml}
    </div>
  `;

  openDetectiveModal(`Ghi Chú Hiện Trường: ${c.label}`, modalHtml);
}

function openCluesListModal() {
  if (!CASE || !CASE.evidence) return;
  const discoveredClues = state.clues || [];

  if (discoveredClues.length === 0) {
    openDetectiveModal(`Sổ Tay Manh Mối (0)`, `
      <div class="modal-profile-wrap">
        <div style="padding:30px 10px;text-align:center;font-size:14.5px;color:#888;font-style:italic;">
          Chưa thu thập được manh mối nào.<br>
          Hãy khám xét các địa điểm hiện trường để tìm kiếm vật chứng!
        </div>
      </div>
    `);
    return;
  }

  const clueKeys = Object.keys(CASE.evidence).filter(k => !CASE.evidence[k].decoy);

  const cluesHtml = discoveredClues.map(cId => {
    const c = CASE.evidence[cId];
    if (!c) return '';
    const typeInfo = CLUE_TYPE_LABELS[c.type] || { label: c.type || 'Vật chứng', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)' };
    const loc = CASE.locations.find(l => l.id === c.location);
    const locName = loc ? loc.name : (c.source || 'Hiện trường');
    const clueIdx = clueKeys.indexOf(cId) + 1;
    const tagId = clueIdx > 0 ? `EVID-${String(clueIdx).padStart(2, '0')}` : 'EVID-REF';
    const relDot = c.reliability === 'low' ? '🔴' : (c.reliability === 'medium' ? '🟡' : '🟢');
    const relText = c.reliability === 'low' ? 'Cần đối chiếu' : (c.reliability === 'medium' ? 'T.Bình' : 'Tin cậy');

    return `
      <div style="position:relative;background:rgba(0,0,0,0.38);border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:18px 16px 14px;margin-bottom:18px;margin-top:8px;">
        <div class="forensic-tag-sticker" style="top:-10px;right:12px;">
          <span class="stamp-code">#${tagId}</span>
          <span class="stamp-type">${typeInfo.label}</span>
          <span style="font-size:10px;font-family:'Courier Prime',monospace;color:#6b4423;border-left:1px solid rgba(90,60,30,0.3);padding-left:6px;">${relDot} ${relText}</span>
        </div>
        <div style="font-size:15px;color:#efe2c0;font-weight:700;margin-bottom:6px;padding-right:120px;">
          ${c.label}
        </div>
        <div style="font-size:12px;color:#888;margin-bottom:8px;">Nơi phát hiện: <strong style="color:#cdbf9e;">${locName}</strong></div>
        <div style="font-size:14.5px;color:#cdbf9e;line-height:1.6;font-family:'Crimson Text',Georgia,serif;">
          ${c.text}
        </div>
      </div>
    `;
  }).join('');

  openDetectiveModal(`Sổ Tay Manh Mối Đã Thu Thập (${discoveredClues.length})`, `
    <div class="modal-profile-wrap">
      <div style="max-height:480px;overflow-y:auto;padding-right:4px;">
        ${cluesHtml}
      </div>
    </div>
  `);
}

function openScotlandYardReportModal() {
  if (!CASE) return;
  const gt = CASE.groundTruth;
  const pr = CASE.proofRequirements;
  const suspects = CASE.suspects || [];

  if (!gt && !pr) {
    alert('Chưa có hồ sơ tổng kết cho vụ án này.');
    return;
  }

  const waxSealHeaderHtml = `
    <div class="wax-seal-container">
      <div class="wax-seal-badge">
        <div class="wax-seal-inner">
          <span>SCOTLAND</span>
          <div class="seal-crown">👑</div>
          <span>YARD</span>
        </div>
      </div>
      <div>
        <div style="font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#f1c40f;letter-spacing:0.5px;">HỒ SƠ NIÊM PHONG SCOTLAND YARD</div>
        <div style="font-family:'Courier Prime',monospace;font-size:11px;color:#cdbf9e;margin-top:2px;">VĂN PHÒNG ĐIỀU TRA ĐẶC BIỆT &middot; NGUYÊN BẢN CHÍNH THỨC</div>
      </div>
    </div>
  `;

  let mompHtml = '';
  if (pr) {
    const suspectObj = suspects.find(s => s.id === pr.culprit);
    const suspectName = suspectObj ? suspectObj.name : pr.culprit;
    const renderCluesList = (clueKeys) => {
      if (!clueKeys || clueKeys.length === 0) return '<em>Không yêu cầu</em>';
      return clueKeys.map(k => {
        const c = CASE.evidence[k];
        const t = CASE.timeline ? CASE.timeline.find(x => x.id === k) : null;
        if (c) return `<span style="display:inline-block;padding:2px 6px;margin:2px;background:rgba(241,196,15,0.15);border:1px solid rgba(241,196,15,0.3);border-radius:3px;font-size:11.5px;color:#efe2c0;">📌 ${c.label}</span>`;
        if (t) return `<span style="display:inline-block;padding:2px 6px;margin:2px;background:rgba(52,152,219,0.15);border:1px solid rgba(52,152,219,0.3);border-radius:3px;font-size:11.5px;color:#efe2c0;">⏱️ ${t.time} - ${t.event.slice(0, 35)}…</span>`;
        return `<span style="font-size:11.5px;color:#888;">${k}</span>`;
      }).join(' ');
    };

    mompHtml = `
      <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(241,196,15,0.3);border-radius:6px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-weight:700;color:#f1c40f;font-size:14px;margin-bottom:8px;">⚖️ 4 TRỤ CỘT KẾT TỘI PHÁP LÝ (M.O.M.P MATRIX)</div>
        <div style="font-size:13px;color:#efe2c0;line-height:1.7;">
          • <strong>Thủ phạm đích thực:</strong> <span style="color:#e74c3c;font-weight:bold;">${suspectName}</span><br>
          • <strong>Motive (Động cơ):</strong> ${renderCluesList(pr.motive)}<br>
          • <strong>Opportunity (Thời cơ):</strong> ${renderCluesList(pr.opportunity)}<br>
          • <strong>Means (Công cụ):</strong> ${renderCluesList(pr.means)}<br>
          • <strong>Method (Cách thức):</strong> ${renderCluesList(pr.method)}<br>
          • <strong>Presence (Hiện diện):</strong> ${renderCluesList(pr.presence)}
        </div>
      </div>
    `;
  }

  let seqHtml = '';
  if (gt && gt.sequence && gt.sequence.length > 0) {
    const listSeq = gt.sequence.map((step, idx) => `
      <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;font-size:13px;">
        <span style="font-family:'Crimson Text',serif;font-weight:700;color:#f1c40f;min-width:20px;">#${idx + 1}</span>
        <span style="color:#cdbf9e;line-height:1.4;">${step}</span>
      </div>
    `).join('');

    seqHtml = `
      <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-weight:700;color:#2ecc71;font-size:14px;margin-bottom:10px;">⏱️ DIỄN BIẾN THỰC TẾ CỦA VỤ ÁN (CHRONOLOGICAL SEQUENCE)</div>
        ${listSeq}
      </div>
    `;
  }

  let suspectsLogicHtml = '';
  if (suspects.some(s => s.suspectLogic)) {
    const listS = suspects.filter(s => s.suspectLogic).map(s => {
      const sl = s.suspectLogic;
      return `
        <div style="background:rgba(0,0,0,0.25);border-left:3px solid #d4af37;padding:8px 12px;margin-bottom:8px;font-size:12.5px;">
          <strong style="color:#f1c40f;">👤 ${s.name}:</strong>
          <div style="color:#cdbf9e;margin-top:2px;">
            ${sl.motive ? `• <em>Động cơ:</em> ${sl.motive.join(', ')}<br>` : ''}
            ${sl.exculpatoryEvidence && sl.exculpatoryEvidence.length > 0 ? `• <em>Căn cứ minh oan:</em> ${sl.exculpatoryEvidence.join(', ')}<br>` : ''}
            ${sl.presence ? `• <em>Dấu vết hiện trường:</em> ${sl.presence.join(', ')}` : ''}
          </div>
        </div>
      `;
    }).join('');

    suspectsLogicHtml = `
      <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-weight:700;color:#3498db;font-size:14px;margin-bottom:10px;">👥 TỔNG KẾT LOGIC CÁC ĐỐI TƯỢNG (SUSPECT DOSSIER)</div>
        ${listS}
      </div>
    `;
  }

  openDetectiveModal(`📜 Hồ Sơ Niêm Phong: ${CASE.title}`, `
    <div class="modal-profile-wrap">
      <div style="font-size:13.5px;color:#cdbf9e;margin-bottom:14px;padding:8px 12px;background:rgba(212,175,55,0.1);border-left:3px solid #d4af37;border-radius:4px;">
        Đây là toàn bộ hồ sơ sự thật và bằng chứng kết án được niêm phong bởi Scotland Yard sau khi vụ án được phá giải.
      </div>
      <div style="max-height:460px;overflow-y:auto;padding-right:4px;">
        ${mompHtml}
        ${seqHtml}
        ${suspectsLogicHtml}
      </div>
    </div>
  `);
}

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function openTimelineModal() {
  if (!CASE || !CASE.timeline) return;

  const timeline = CASE.timeline;
  const unlockedEvents = timeline.filter(item => !item.unlockClue || state.clues.includes(item.unlockClue));
  const assignedSlots = state.timelineSlots || {};

  // Nếu đã phục dựng xong thành công, hiển thị giao diện đối chiếu hoàn chỉnh
  if (state.timelineCompleted) {
    const itemsHtml = timeline.map((item, idx) => {
      const isVerified = !!item.verified;
      const isVictim = !!item.victimEvent;
      const suspect = item.suspect ? CASE.suspects.find(s => s.id === item.suspect) : null;
      const suspectName = suspect ? suspect.name : (isVictim ? 'Nạn nhân' : 'Chưa rõ');

      let badgeHtml = '';
      if (isVictim) {
        badgeHtml = `<span style="display:inline-block;padding:3px 9px;border-radius:3px;font-size:11.5px;font-weight:600;background:rgba(231,76,60,0.25);color:#e74c3c;border:1px solid #e74c3c;">⚠️ SỰ CỐ TỬ VONG</span>`;
      } else if (isVerified) {
        badgeHtml = `<span style="display:inline-block;padding:3px 9px;border-radius:3px;font-size:11.5px;font-weight:600;background:rgba(46,204,113,0.25);color:#2ecc71;border:1px solid #2ecc71;">✓ ĐÃ XÁC THỰC NGOẠI PHẠM</span>`;
      } else {
        badgeHtml = `<span style="display:inline-block;padding:3px 9px;border-radius:3px;font-size:11.5px;font-weight:600;background:rgba(243,156,18,0.25);color:#f39c12;border:1px solid #f39c12;">❓ KHOẢNG TRỐNG NGHI VẤN (ALIBI GAP)</span>`;
      }

      const certTag = item.certainty === 'confirmed'
        ? '<span style="font-size:10.5px;padding:2px 6px;border-radius:2px;background:rgba(46,204,113,0.12);color:#2ecc71;border:1px solid rgba(46,204,113,0.25);">✓ Xác thực</span>'
        : (item.certainty === 'estimated'
          ? '<span style="font-size:10.5px;padding:2px 6px;border-radius:2px;background:rgba(241,196,15,0.12);color:#f1c40f;border:1px solid rgba(241,196,15,0.25);">⏱️ Ước tính</span>'
          : '<span style="font-size:10.5px;padding:2px 6px;border-radius:2px;background:rgba(52,152,219,0.12);color:#3498db;border:1px solid rgba(52,152,219,0.25);">🔍 Suy đoán</span>');

      const srcLabelMap = { witness: '🗣️ Nhân chứng', forensic: '🔬 Pháp y', physical: '🧤 Vật chứng', statement: '💬 Lời khai' };
      const srcTag = item.source && srcLabelMap[item.source]
        ? `<span style="font-size:10px;padding:1px 5px;border-radius:2px;background:rgba(255,255,255,0.06);color:#cdbf9e;border:1px solid rgba(255,255,255,0.1);margin-left:4px;">${srcLabelMap[item.source]}</span>`
        : '';

      return `
        <div style="display:flex;gap:14px;align-items:flex-start;position:relative;margin-bottom:14px;">
          <div style="display:flex;flex-direction:column;align-items:center;min-width:65px;">
            <span style="font-family:'Crimson Text',serif;font-weight:700;font-size:16px;color:#f1c40f;background:rgba(241,196,15,0.15);padding:4px 8px;border-radius:4px;border:1px solid rgba(241,196,15,0.3);">${item.time}</span>
            ${idx < timeline.length - 1 ? '<div style="width:2px;height:24px;background:rgba(241,196,15,0.2);margin-top:6px;"></div>' : ''}
          </div>
          <div style="flex:1;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:6px;">
                <strong style="color:#efe2c0;font-size:14px;">👤 ${suspectName}</strong>
                ${certTag}
              </div>
              ${badgeHtml}
            </div>
            <div style="font-size:13.5px;color:#cdbf9e;line-height:1.5;">${item.event}</div>
          </div>
        </div>
      `;
    }).join('');

    const bodyHtml = `
      <div style="font-family:'Segoe UI',sans-serif;">
        <div style="padding:12px 14px;background:rgba(46,204,113,0.15);border-left:3px solid #2ecc71;border-radius:4px;margin-bottom:18px;font-size:13px;color:#efe2c0;line-height:1.5;">
          <strong style="color:#2ecc71;">✓ TRỤC THỜI GIAN ĐÃ PHỤC DỰNG HOÀN TẤT (+15 ĐIỂM):</strong><br>
          Toàn bộ các mắt xích thời gian đã được xác thực chính xác. Khoảng trống ngoại phạm của kẻ thủ ác đã hiện rõ!
        </div>
        <div style="margin-top:10px;">
          ${itemsHtml}
        </div>
      </div>
    `;
    openDetectiveModal(`⏱️ Dòng Thời Gian: ${CASE.title}`, bodyHtml);
    return;
  }

  // GIAO DIỆN PUZZLE SẮP XẾP TRỤC THỜI GIAN (Timeline Reconstruction Puzzle)
  // Xáo trộn ngẫu nhiên thứ tự các thẻ sự kiện chưa gán để chống nhìn thứ tự tuần tự
  const unassignedEvents = shuffleArray(unlockedEvents.filter(ev => !Object.values(assignedSlots).includes(ev.id)));

  // Render các slot mốc giờ
  const slotsHtml = timeline.map((slotItem) => {
    const isSlotUnlocked = !slotItem.unlockClue || state.clues.includes(slotItem.unlockClue);
    const assignedEventId = assignedSlots[slotItem.time];
    const assignedEvent = assignedEventId ? timeline.find(e => e.id === assignedEventId) : null;

    if (!isSlotUnlocked) {
      return `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;opacity:0.45;">
          <div style="min-width:65px;text-align:center;">
            <span style="font-family:'Crimson Text',serif;font-weight:700;font-size:15px;color:#888;background:rgba(255,255,255,0.05);padding:3px 7px;border-radius:3px;border:1px dashed #666;">${slotItem.time}</span>
          </div>
          <div style="flex:1;background:rgba(0,0,0,0.2);border:1px dashed rgba(255,255,255,0.1);border-radius:5px;padding:10px 12px;font-size:12.5px;color:#777;font-style:italic;">
            🔒 Mốc giờ chưa mở khóa (Cần khám xét thêm hiện trường hoặc thẩm vấn)
          </div>
        </div>
      `;
    }

    if (assignedEvent) {
      const suspect = assignedEvent.suspect ? CASE.suspects.find(s => s.id === assignedEvent.suspect) : null;
      const suspectName = suspect ? suspect.name : (assignedEvent.victimEvent ? 'Nạn nhân' : 'Chưa rõ');

      return `
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
          <div style="min-width:65px;text-align:center;padding-top:6px;">
            <span style="font-family:'Crimson Text',serif;font-weight:700;font-size:15px;color:#f1c40f;background:rgba(241,196,15,0.15);padding:3px 7px;border-radius:3px;border:1px solid rgba(241,196,15,0.3);">${slotItem.time}</span>
          </div>
          <div style="flex:1;background:rgba(241,196,15,0.06);border:1px solid rgba(241,196,15,0.3);border-radius:6px;padding:10px 12px;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="color:#f1c40f;font-size:13px;">👤 ${suspectName}</strong>
              <button onclick="handleUnassignTimelineSlot('${slotItem.time}')" style="background:transparent;border:1px solid rgba(231,76,60,0.5);color:#e74c3c;border-radius:3px;padding:2px 8px;font-size:11px;cursor:pointer;">✕ Gỡ ra</button>
            </div>
            <div style="font-size:13px;color:#efe2c0;line-height:1.4;">${assignedEvent.event}</div>
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
        <div style="min-width:65px;text-align:center;">
          <span style="font-family:'Crimson Text',serif;font-weight:700;font-size:15px;color:#f1c40f;background:rgba(241,196,15,0.15);padding:3px 7px;border-radius:3px;border:1px solid rgba(241,196,15,0.3);">${slotItem.time}</span>
        </div>
        <div onclick="promptAssignToSlot('${slotItem.time}')" style="flex:1;background:rgba(255,255,255,0.03);border:1px dashed rgba(241,196,15,0.35);border-radius:6px;padding:10px 12px;cursor:pointer;color:#cdbf9e;font-size:13px;transition:all 0.2s;" onmouseover="this.style.background='rgba(241,196,15,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
          ＋ <span style="text-decoration:underline;">Bấm vào đây để chọn sự kiện gán vào mốc <strong>${slotItem.time}</strong></span>
        </div>
      </div>
    `;
  }).join('');

  // Render các thẻ sự kiện chưa gán
  const unassignedCardsHtml = unassignedEvents.length === 0 ? `
    <div style="font-size:13px;color:#887b60;font-style:italic;padding:12px;background:rgba(0,0,0,0.2);border-radius:4px;text-align:center;">
      ✓ Tất cả ${unlockedEvents.length} sự kiện đã mở khóa đều đã được gán vào các mốc thời gian.
    </div>
  ` : unassignedEvents.map(ev => {
    const suspect = ev.suspect ? CASE.suspects.find(s => s.id === ev.suspect) : null;
    const suspectName = suspect ? suspect.name : (ev.victimEvent ? 'Nạn nhân' : 'Chưa rõ');
    const availableSlots = timeline.filter(t => (!t.unlockClue || state.clues.includes(t.unlockClue)) && !assignedSlots[t.time]);
    const slotButtonsHtml = availableSlots.length > 0
      ? availableSlots.map(t => `
          <button onclick="handleAssignTimelineSlot('${t.time}', '${ev.id}')" style="background:rgba(241,196,15,0.15);border:1px solid rgba(241,196,15,0.35);color:#efe2c0;border-radius:3px;padding:3px 8px;font-size:11.5px;cursor:pointer;font-weight:600;">
            ${t.time}
          </button>
        `).join('')
      : '<span style="font-size:11px;color:#888;font-style:italic;">(Không còn mốc giờ trống)</span>';

    const isElim = ev.suspect && state.eliminatedSuspects[ev.suspect];
    const hasContra = ev.suspect && state.contradictionsFound[ev.suspect] && state.contradictionsFound[ev.suspect].length > 0;
    let alibiStatusTag = '';
    if (isElim) {
      alibiStatusTag = `<span style="font-size:10px;padding:2px 6px;border-radius:2px;background:rgba(46,204,113,0.15);border:1px solid #2ecc71;color:#2ecc71;">✓ Đã minh oan</span>`;
    } else if (hasContra) {
      alibiStatusTag = `<span style="font-size:10px;padding:2px 6px;border-radius:2px;background:rgba(231,76,60,0.15);border:1px solid #e74c3c;color:#e74c3c;">⚠️ Mâu thuẫn mốc giờ</span>`;
    }

    return `
      <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:4px;">
          <div style="font-size:12.5px;color:#f1c40f;font-weight:600;">👤 ${suspectName}</div>
          ${alibiStatusTag}
        </div>
        <div style="font-size:13px;color:#cdbf9e;line-height:1.4;margin-bottom:8px;">${ev.event}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:11.5px;color:#888;">Gán vào:</span>
          ${slotButtonsHtml}
        </div>
      </div>
    `;
  }).join('');

  const puzzleHtml = `
    <div style="font-family:'Segoe UI',sans-serif;">
      <div style="padding:12px 14px;background:rgba(241,196,15,0.08);border-left:3px solid #f1c40f;border-radius:4px;margin-bottom:18px;font-size:13px;color:#efe2c0;line-height:1.5;">
        <strong>⏱️ Bàn Phục Dựng Trục Thời Gian (Chronology Reconstruction):</strong><br>
        Dựa vào các chứng cứ và lời khai nhân chứng, hãy sắp xếp các sự kiện vào đúng mốc giờ diễn ra.<br>
        <em>Phục dựng hoàn hảo toàn bộ sự kiện sẽ nhận ngay <strong>+15 điểm Timeline Score</strong> và làm lộ diện sơ hở ngoại phạm!</em>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(310px, 1fr));gap:20px;">
        <div>
          <div style="font-weight:700;font-size:14px;color:#efe2c0;margin-bottom:12px;display:flex;justify-content:space-between;">
            <span>📍 CÁC MỐC THỜI GIAN (${Object.keys(assignedSlots).length}/${unlockedEvents.length} ĐÃ GÁN)</span>
          </div>
          ${slotsHtml}
        </div>
        
        <div>
          <div style="font-weight:700;font-size:14px;color:#efe2c0;margin-bottom:12px;">
            <span>📦 SỰ KIỆN CHƯA PHÂN BỔ (${unassignedEvents.length})</span>
          </div>
          ${unassignedCardsHtml}
        </div>
      </div>

      <div id="timelineReconFeedback" style="margin-top:14px;"></div>

      <div class="btn-row" style="margin-top:20px;justify-content:center;">
        <button class="continue-btn" style="min-width:260px;font-size:14px;" onclick="handleSubmitTimelineReconstruction()">
          🔍 Kiểm Chứng Trục Thời Gian
        </button>
      </div>
    </div>
  `;

  openDetectiveModal(`⏱️ Phục Dựng Dòng Thời Gian: ${CASE.title}`, puzzleHtml);
}

function handleAssignTimelineSlot(timeSlot, eventId) {
  sound.pin();
  assignTimelineSlot(timeSlot, eventId);
  openTimelineModal();
}

function handleUnassignTimelineSlot(timeSlot) {
  sound.click();
  unassignTimelineSlot(timeSlot);
  openTimelineModal();
}

function promptAssignToSlot(timeSlot) {
  const timeline = CASE.timeline || [];
  const unlockedEvents = timeline.filter(item => !item.unlockClue || state.clues.includes(item.unlockClue));
  const assignedSlots = state.timelineSlots || {};
  const unassignedEvents = shuffleArray(unlockedEvents.filter(ev => !Object.values(assignedSlots).includes(ev.id)));

  if (unassignedEvents.length === 0) {
    alert('Không còn sự kiện nào chưa phân bổ!');
    return;
  }

  const choicesHtml = unassignedEvents.map(ev => {
    const suspect = ev.suspect ? CASE.suspects.find(s => s.id === ev.suspect) : null;
    const suspectName = suspect ? suspect.name : (ev.victimEvent ? 'Nạn nhân' : 'Chưa rõ');

    return `
      <div onclick="handleAssignTimelineSlot('${timeSlot}', '${ev.id}')" style="background:rgba(0,0,0,0.3);border:1px solid rgba(241,196,15,0.25);border-radius:5px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(241,196,15,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
        <strong style="color:#f1c40f;font-size:13px;">👤 ${suspectName}</strong>
        <div style="font-size:13px;color:#efe2c0;line-height:1.4;margin-top:4px;">${ev.event}</div>
      </div>
    `;
  }).join('');

  openDetectiveModal(`⏱️ Chọn Sự Kiện Cho Mốc ${timeSlot}`, `
    <div style="font-family:'Segoe UI',sans-serif;">
      <p style="font-size:13.5px;color:#cdbf9e;margin-bottom:14px;">Bấm vào một sự kiện dưới đây để gán vào mốc thời gian <strong>${timeSlot}</strong>:</p>
      ${choicesHtml}
      <div class="btn-row" style="margin-top:16px;">
        <button class="secondary-btn" onclick="openTimelineModal()">← Quay lại</button>
      </div>
    </div>
  `);
}

function handleSubmitTimelineReconstruction() {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  const res = checkTimelineReconstruction();
  const fbEl = document.getElementById('timelineReconFeedback');

  if (res.success) {
    sound.timelineVerify();
    if (fbEl) {
      fbEl.innerHTML = `<div style="padding:12px;background:rgba(46,204,113,0.15);border:1px solid #2ecc71;border-radius:4px;color:#2ecc71;font-weight:600;font-size:14px;">${res.msg}</div>`;
    }
    setTimeout(() => {
      openTimelineModal();
    }, 1200);
  } else {
    sound.timelineFail();
    renderTimeBar();
    if (fbEl) {
      fbEl.innerHTML = `<div style="padding:12px;background:rgba(231,76,60,0.15);border:1px solid #e74c3c;border-radius:4px;color:#e74c3c;font-size:13.5px;line-height:1.5;">${res.msg}</div>`;
    }
  }
}

function openMindPalaceModal() {
  if (!CASE) return;

  // 1. Mind Palace Nodes
  let mindPalaceHtml = '';
  if (CASE.mindPalaceNodes && CASE.mindPalaceNodes.length > 0) {
    const nodesHtml = CASE.mindPalaceNodes.map((node, idx) => {
      const isUnlocked = node.reqClues.every(k => state.clues.includes(k));
      const chosenBranchId = state.mindPalaceChoices[node.id];
      const isDone = !!chosenBranchId;
      const chosenBranch = isDone ? node.branches.find(b => b.id === chosenBranchId) : null;
      const isCorrect = chosenBranch ? chosenBranch.correct : false;

      if (!isUnlocked) {
        return `
          <div class="mp-node-card locked">
            <div class="mp-node-head">
              <span class="mp-node-num">🔒 MẮT XÍCH #${idx + 1}</span>
              <span class="mp-status-tag tag-locked">CHƯA MỞ KHÓA</span>
            </div>
            <div class="mp-node-locked-text">
              Chưa có đủ căn cứ thực tế từ hiện trường để kích hoạt mắt xích tư duy này.
            </div>
          </div>
        `;
      }

      const branchBtns = node.branches.map(b => {
        const isChosen = chosenBranchId === b.id;
        const btnClass = isChosen ? (b.correct ? 'chosen correct' : 'chosen incorrect') : (isDone ? 'disabled' : '');
        const icon = isChosen ? (b.correct ? '✓' : '✗') : '○';
        return `
          <button class="mp-branch-btn ${btnClass}" ${isDone ? 'disabled' : ''} onclick="pickMindPalaceBranch('${node.id}', '${b.id}')">
            <span class="branch-icon">${icon}</span>
            <span class="branch-text">${b.text}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="mp-node-card ${isDone ? (isCorrect ? 'done' : 'failed') : 'active'}">
          <div class="mp-node-head">
            <span class="mp-node-num">🧠 MẮT XÍCH #${idx + 1}: ${node.label}</span>
            <span class="mp-status-tag ${isDone ? (isCorrect ? 'tag-done' : 'tag-failed') : 'tag-active'}">
              ${isDone ? (isCorrect ? '✓ ĐÃ XÂU CHUỖI ĐÚNG' : '✗ SUY LUẬN SAI LỆCH') : 'CHỜ SUY LUẬN'}
            </span>
          </div>
          <div class="mp-node-q">${node.question}</div>
          <div class="mp-branches-list">${branchBtns}</div>
        </div>
      `;
    }).join('');

    mindPalaceHtml = `
      <div class="mp-section">
        <div class="modal-sec-title">🧠 CÂY SUY LUẬN ĐA TẦNG (MIND PALACE)</div>
        <div class="mp-nodes-grid">${nodesHtml}</div>
      </div>
    `;
  }

  // 2. Hypotheses Log
  const answeredKeys = Object.keys(state.hypothesesAnswered);
  let hypoCardsHtml = '';
  if (answeredKeys.length > 0) {
    hypoCardsHtml = answeredKeys.map(id => {
      const h = CASE.hypotheses.find(x => x.id === id);
      if (!h) return '';
      const ans = state.hypothesesAnswered[id];
      const opt = h.options.find(o => o.id === ans.choiceId);
      return `
        <div class="notebook-hypo-card ${ans.correct ? 'correct' : 'wrong'}" onclick="openHypoModal('${id}')" title="Bấm để xem đối chiếu sự kiện">
          <div class="hypo-card-status ${ans.correct ? 'status-correct' : 'status-wrong'}">${ans.correct ? '✓ GIẢ THUYẾT ĐÚNG' : '✗ GIẢ THUYẾT ĐÃ LOẠI BỎ'}</div>
          <div class="hypo-card-q">${h.question}</div>
          <div class="hypo-card-ans"><strong>Kết luận của bạn:</strong> ${opt ? opt.text : ''}</div>
        </div>
      `;
    }).join('');
  }

  const hypoSectionHtml = `
    <div class="mp-section" style="margin-top:24px;">
      <div class="modal-sec-title">💡 DANH MỤC GIẢ THUYẾT ĐÃ KIỂM CHỨNG (${answeredKeys.length})</div>
      ${answeredKeys.length > 0 ? `<div class="notebook-hypo-grid">${hypoCardsHtml}</div>` : `
        <div class="board-empty" style="padding:16px 10px;font-size:14px;color:#cdbf9e;">
          Chưa có giả thuyết nào. Chọn các manh mối trên Bảng ghim rồi bấm <strong>"🔗 Phân tích liên kết"</strong> để kích hoạt!
        </div>
      `}
    </div>
  `;

  // 3. Clue Relations Log
  const connections = state.corkboardConnections || [];
  let relationsSectionHtml = '';
  if (connections.length > 0) {
    const relCardsHtml = connections.map(rel => {
      const c1 = CASE.evidence[rel.clues[0]];
      const c2 = CASE.evidence[rel.clues[1]];
      return `
        <div style="padding:10px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(241,196,15,0.2);border-radius:5px;margin-bottom:8px;font-size:13px;">
          <div style="font-weight:700;color:#f1c40f;margin-bottom:2px;">
            📌 ${c1 ? c1.label : rel.clues[0]} ⟷ ${c2 ? c2.label : rel.clues[1]}
          </div>
          <div style="color:#cdbf9e;">${rel.label}</div>
        </div>
      `;
    }).join('');
    relationsSectionHtml = `
      <div class="mp-section" style="margin-top:24px;">
        <div class="modal-sec-title">🔗 MỐI LIÊN HỆ ĐÃ XÁC LẬP TRÊN BẢNG GHIM (${connections.length})</div>
        <div>${relCardsHtml}</div>
      </div>
    `;
  }

  openDetectiveModal(`🧠 Lâu Đài Tư Duy (Mind Palace)`, `
    <div class="modal-profile-wrap">
      ${mindPalaceHtml}
      ${hypoSectionHtml}
      ${relationsSectionHtml}
    </div>
  `);
}

function pickMindPalaceBranch(nId, bId) {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  const res = chooseMindPalaceBranch(nId, bId);
  if (res.locked) return;

  if (res.isCorrect) {
    sound.correct();
  } else {
    sound.wrong();
    renderTimeBar();
    const node = (CASE.mindPalaceNodes || []).find(n => n.id === nId);
    if (node && CASE.redHerrings) {
      const rh = CASE.redHerrings.find(r => r.clues.some(c => (node.reqClues || []).includes(c)));
      if (rh) {
        setTimeout(() => {
          openDetectiveModal('💡 Cảnh Báo Bẫy Suy Luận (Red Herring)', `
            <div class="modal-profile-wrap">
              <p style="font-size:15.5px;color:#e74c3c;line-height:1.6;">
                <strong>Nhánh suy luận sai lệch (-10 điểm, -5 phút)!</strong><br>
                Bạn đã rơi vào bẫy đánh lạc hướng của hiện trường:
              </p>
              <div style="padding:12px;background:rgba(231,76,60,0.15);border-left:3px solid #e74c3c;border-radius:4px;color:#efe2c0;">
                ${rh.explanation}
              </div>
              <div class="btn-row" style="margin-top:16px;">
                <button class="continue-btn" onclick="openMindPalaceModal()">Đã hiểu, quay lại Lâu đài tư duy</button>
              </div>
            </div>
          `);
        }, 300);
        return;
      }
    }
  }

  openMindPalaceModal();
}

function openHypoModal(hypoId) {
  const ans = state.hypothesesAnswered && state.hypothesesAnswered[hypoId];
  if (!ans) return;
  const h = CASE.hypotheses.find(x => x.id === hypoId);
  if (!h) return;
  const opt = h.options.find(o => o.id === ans.choiceId);
  const evalYes = opt.evalYes.map(t => `<li class="yes">${t}</li>`).join('');
  const evalNo = opt.evalNo.map(t => `<li class="no">${t}</li>`).join('');
  const tagStyle = ans.correct
    ? 'display:inline-block;font-family:"Courier Prime",monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:2px;background:#c4a870;color:#18110a'
    : 'display:inline-block;font-family:"Courier Prime",monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:2px;background:#7a3030;color:#efe2c0';
  const html = `
    <div style="padding:10px 0;">
      <span style="${tagStyle}">${ans.correct ? '✓ Giả thuyết đúng' : '✗ Đã loại bỏ'}</span>
      <h2 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#efe2c0;margin:14px 0 10px;line-height:1.4">${h.question}</h2>
      <div style="font-family:'Crimson Text',serif;font-size:17.5px;line-height:1.7;color:#cdbf9e;margin-bottom:16px"><em>Kết luận của bạn:</em><br>${opt.text}</div>
      <div class="eval-box">
        <div class="eval-title">Đối chiếu sự kiện</div>
        <ul class="eval-list">${evalYes}${evalNo}</ul>
        <span class="confidence ${ans.correct ? 'high' : 'low'}">Độ tin cậy: ${ans.correct ? 'CAO' : 'THẤP'}</span>
      </div>
    </div>
  `;
  openDetectiveModal('Kiểm Chứng Giả Thuyết', html);
}

function showDetectiveBar(show) {
  const bar = document.getElementById('detectiveBar');
  if (bar) bar.style.display = show ? 'flex' : 'none';
}

function renderTimeBar() {
  if (!CASE) return;
  const pct = Math.round((state.time / CASE.timeBudget) * 100);
  document.getElementById('timeLabel').textContent = state.time + ' phút';
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

/* ============================================================
   CASE SELECT — TỦ HỒ SƠ LƯU TRỮ VỤ ÁN (SCALABLE 2-COLUMN CABINET)
   ============================================================ */
let selectedCasePreviewIndex = 0;
let currentCaseFilter = 'all';

function setCaseFilter(filter) {
  sound.click();
  currentCaseFilter = filter;
  renderCaseSelect();
}

function previewCase(index) {
  sound.click();
  selectedCasePreviewIndex = index;
  renderCaseSelect();
}

function renderCaseSelect() {
  showDetectiveBar(false);
  closeDetectiveModal();
  showTimeBar(false);
  setHeader(null, 'ART OF DEDUCTION — NGHỆ THUẬT SUY LUẬN', 'Quan sát mọi thứ. Suy luận sự thật.');

  // Filter cases
  const filteredCases = CASES.map((c, i) => ({ c, i })).filter(({ c }) => {
    if (currentCaseFilter === 'all') return true;
    if (currentCaseFilter === 'easy') return c.difficulty.tier === 'easy';
    if (currentCaseFilter === 'medium') return c.difficulty.tier === 'medium';
    if (currentCaseFilter === 'hard') return c.difficulty.tier === 'hard';
    return true;
  });

  if (selectedCasePreviewIndex >= CASES.length || !CASES[selectedCasePreviewIndex]) {
    selectedCasePreviewIndex = 0;
  }

  const selCase = CASES[selectedCasePreviewIndex] || CASES[0];
  const isSelUnlocked = selCase && !selCase.comingSoon && isCaseUnlocked(selectedCasePreviewIndex);
  const selSave = (selCase && !selCase.comingSoon) ? getCaseSave(selCase.id) : null;

  // Filter chips HTML
  const filterChipsHtml = `
    <div class="case-filter-bar">
      <button class="case-filter-chip ${currentCaseFilter === 'all' ? 'active' : ''}" onclick="setCaseFilter('all')">
        TẤT CẢ (${CASES.length})
      </button>
      <button class="case-filter-chip ${currentCaseFilter === 'easy' ? 'active' : ''}" onclick="setCaseFilter('easy')">
        🟢 DỄ
      </button>
      <button class="case-filter-chip ${currentCaseFilter === 'medium' ? 'active' : ''}" onclick="setCaseFilter('medium')">
        🟡 VỪA
      </button>
      <button class="case-filter-chip ${currentCaseFilter === 'hard' ? 'active' : ''}" onclick="setCaseFilter('hard')">
        🔴 KHÓ
      </button>
    </div>
  `;

  // Left column items HTML
  const caseListHtml = filteredCases.map(({ c, i }) => {
    const isSel = i === selectedCasePreviewIndex;
    const unlocked = !c.comingSoon && isCaseUnlocked(i);
    const save = c.comingSoon ? null : getCaseSave(c.id);

    let statusText = '🟢 Sẵn sàng';
    let statusClass = '';
    if (c.comingSoon) {
      statusText = '🔒 Sắp ra mắt';
    } else if (!unlocked) {
      statusText = '🔒 Chưa mở khóa';
    } else if (save && save.completed) {
      statusText = `✓ Điểm: ${save.bestScore}/100`;
      statusClass = 'done';
    }

    return `
      <div class="case-tab-item ${isSel ? 'selected' : ''} ${unlocked ? '' : 'locked'}" onclick="previewCase(${i})">
        <div class="case-tab-top">
          <span class="case-tab-file">HỒ SƠ #${c.fileNo || ('221B-' + (i + 1))}</span>
          <span style="font-size:11px;">${c.difficulty.emoji} ${c.difficulty.label}</span>
        </div>
        <div class="case-tab-title">${c.title}</div>
        <div class="case-tab-status ${statusClass}">${statusText}</div>
      </div>
    `;
  }).join('');

  // Right column preview HTML
  let previewAchievementsHtml = '';
  if (selSave && selSave.achievements && selSave.achievements.length > 0) {
    previewAchievementsHtml = `
      <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <span style="font-size:9.5px;font-family:'Courier Prime',monospace;color:var(--brass);font-weight:700;">DANH HIỆU:</span>
        <div class="case-achievements" style="margin-top:0;">
          ${selSave.achievements.map(a => {
      const ach = ACHIEVEMENTS[a];
      const name = ach ? ach.label : a;
      const desc = ach ? ach.desc : '';
      const icon = ach ? ach.icon : '★';
      return `<span class="ach-chip" data-tooltip="${icon} ${name} — ${desc}">${icon}</span>`;
    }).join('')}
        </div>
      </div>
    `;
  }

  let previewEndingsHtml = '';
  if (selSave && selSave.endings && selSave.endings.length > 0) {
    const endingIcons = { perfect: '🏅', good: '✓', bad: '〜', incomplete: '✗' };
    const endingLabels = { perfect: 'Hoàn hảo', good: 'Tốt', bad: 'Sai luận', incomplete: 'Chưa xong' };
    previewEndingsHtml = `
      <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <span style="font-size:9.5px;font-family:'Courier Prime',monospace;color:var(--brass);font-weight:700;">KẾT CỤC:</span>
        <div class="endings-row" style="margin-top:0;display:flex;gap:4px;flex-wrap:wrap;">
          ${selSave.endings.map(eid => {
      const baseId = eid.startsWith('wrong_') ? 'fail' : eid;
      const icon = baseId === 'fail' ? '❌' : (endingIcons[baseId] || '?');
      const lbl = baseId === 'fail' ? 'Sai người' : (endingLabels[baseId] || baseId);
      return `<span class="ending-chip ending-chip-${baseId}" style="font-size:10px;padding:2px 6px;">${icon} ${lbl}</span>`;
    }).join('')}
        </div>
      </div>
    `;
  }

  const suspectCount = (selCase && selCase.suspects) ? selCase.suspects.length : (selCase.difficultyProfile ? selCase.difficultyProfile.suspectCount : 3);
  const evidenceCount = (selCase && selCase.evidence) ? Object.keys(selCase.evidence).length : (selCase.difficultyProfile ? selCase.difficultyProfile.evidenceCount : 12);
  const timeBudget = selCase ? selCase.timeBudget : 75;

  let stampSealHtml = '';
  if (selSave && selSave.completed && selSave.bestScore > 0) {
    stampSealHtml = `
      <div class="dossier-record-stamp">
        <span>RECORD</span>
        <b>${selSave.bestScore}/100</b>
        <small>${rankLabel(selSave.bestScore)}</small>
      </div>
    `;
  } else {
    stampSealHtml = `<div class="dossier-stamp-seal">SCOTLAND YARD &middot; CONFIDENTIAL</div>`;
  }

  let ctaBtnHtml = '';
  if (selCase.comingSoon) {
    ctaBtnHtml = `<button class="start-cta locked" style="width:100%;opacity:0.6;cursor:not-allowed;font-size:13px;padding:9px;" disabled>🔒 Vụ án đang được soạn thảo (Sắp ra mắt)</button>`;
  } else if (!isSelUnlocked) {
    ctaBtnHtml = `<button class="start-cta locked" style="width:100%;opacity:0.6;cursor:not-allowed;font-size:13px;padding:9px;" disabled>🔒 Cần hoàn thành vụ án trước để mở khóa</button>`;
  } else {
    ctaBtnHtml = `<button class="start-cta" style="width:100%;font-size:14px;padding:9px 16px;" onclick="selectCase(${selectedCasePreviewIndex})">🔍 Mở Hồ Sơ & Bắt Đầu Điều Tra →</button>`;
  }

  const previewPaneHtml = `
    <div class="case-archive-preview">
      ${stampSealHtml}
      <div>
        <span class="case-preview-badge">TÀI LIỆU MẬT #${selCase.fileNo || ('221B-' + (selectedCasePreviewIndex + 1))} &middot; PHÒNG LƯU TRỮ BAKER ST</span>
        <div class="case-preview-title">${selCase.difficulty.emoji} ${selCase.title}</div>
        
        <div class="case-preview-meta">
          <span>🎯 <strong>Độ khó:</strong> ${selCase.difficulty.label}</span>
          <span>⏳ <strong>Hạn mức:</strong> ${timeBudget} phút</span>
          <span>👥 <strong>Nghi phạm:</strong> ${suspectCount}</span>
          <span>🔍 <strong>Vật chứng:</strong> ${evidenceCount}</span>
        </div>

        <div class="case-preview-setup">
          <strong style="color:var(--brass);font-size:11.5px;display:block;margin-bottom:3px;font-family:'Courier Prime',monospace;letter-spacing:0.5px;">📋 TÓM TẮT HỒ SƠ BAN ĐẦU:</strong>
          ${selCase.setup || selCase.victim || 'Vụ án bí ẩn đang chờ thám tử giải mã.'}
        </div>

        <!-- Difficulty Mode Selector -->
        <div style="margin-top:10px;padding:8px 10px;background:rgba(0,0,0,0.3);border:1px solid rgba(212,175,55,0.25);border-radius:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-family:'Courier Prime',monospace;font-size:10px;color:var(--brass);font-weight:700;letter-spacing:0.5px;">CHẾ ĐỘ ĐIỀU TRA:</span>
            <span style="font-size:10px;color:${state.difficultyMode === 'casual' ? '#2ecc71' : '#f1c40f'};font-weight:bold;">${state.difficultyMode === 'casual' ? '☕ THƯ GIÃN' : '🎩 CHUẨN'}</span>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="mode-pill ${state.difficultyMode === 'standard' ? 'active' : ''}" onclick="setDifficultyMode('standard')">
              🎩 Chuẩn (Hardcore)
            </button>
            <button class="mode-pill ${state.difficultyMode === 'casual' ? 'active' : ''}" onclick="setDifficultyMode('casual')">
              ☕ Thư Giãn (Casual)
            </button>
          </div>
        </div>

        ${previewEndingsHtml}
        ${previewAchievementsHtml}
      </div>

      <div style="margin-top:12px;">
        ${ctaBtnHtml}
      </div>
    </div>
  `;

  setScene(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
      <div class="scene-title" style="margin:0;font-size:17px;letter-spacing:0.5px;">🗄️ Bàn Tra Cứu Hồ Sơ Scotland Yard</div>
      ${filterChipsHtml}
    </div>
    <div class="case-archive-layout">
      <div class="case-archive-list">
        ${caseListHtml}
      </div>
      ${previewPaneHtml}
    </div>
  `);
}

function selectCase(index) {
  sound.click();
  currentCaseIndex = index;
  CASE = CASES[index];
  const savedMode = (typeof localStorage !== 'undefined' && localStorage.getItem('aod_difficulty_mode')) || 'standard';
  state.difficultyMode = savedMode;
  resetState();
  beginInvestigation();
}

function setDifficultyMode(mode) {
  sound.click();
  state.difficultyMode = mode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aod_difficulty_mode', mode);
  }
  if (currentScene === 'caseSelect') {
    renderCaseSelect();
  } else {
    openSettingsModal();
  }
}

/* ============================================================
   START SCREEN — DIRECT INVESTIGATION DEPLOYMENT
   ============================================================ */
function renderStart() {
  beginInvestigation();
}

function beginInvestigation() {
  sound.click();
  showDetectiveBar(true);
  showTimeBar(true);
  renderTimeBar();
  renderBoard();
  goTo('hub');
}

/* ============================================================
   INVESTIGATION HUB
   ============================================================ */
function renderHub() {
  setHeader(CASE.fileNo, CASE.title, null);
  const req = requiredKeyEvidence();
  const hasRequired = req.every(k => state.clues.includes(k));
  const canProceed = hasRequired || state.time <= 0;

  // Split locations into crime scenes and suspect interrogations
  const scenes = CASE.locations.filter(loc => !CASE.suspects.some(s => s.id === loc.id));
  const suspects = CASE.locations.filter(loc => CASE.suspects.some(s => s.id === loc.id));

  function renderCard(loc) {
    const total = loc.items.length;
    const done = loc.items.filter(it => state.inspectedItems.includes(it.id)).length;
    const locked = state.time <= 0 && done < total;
    const isDone = done === total;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const statusText = isDone ? '✓ ĐÃ KHÁM XONG' : (locked ? '🔒 HẾT THỜI GIAN' : `${done}/${total} VẬT CHỨNG`);

    return `
      <div class="hub-card ${isDone ? 'done' : ''} ${locked ? 'locked' : ''}" ${!locked ? `onclick="renderLocation('${loc.id}')"` : ''}>
        <div>
          <div class="hub-card-top">
            <span class="hub-icon">${loc.icon}</span>
            <span class="hub-status-chip ${isDone ? 'chip-done' : (locked ? 'chip-locked' : (done > 0 ? 'chip-active' : ''))}">${statusText}</span>
          </div>
          <div class="hub-name">${loc.name}</div>
        </div>
        <div class="hub-card-progress">
          <div class="hub-progress-bar ${isDone ? 'bar-done' : ''}" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }

  function renderSuspectCard(loc) {
    const suspect = CASE.suspects.find(s => s.id === loc.id);
    if (!suspect) return renderCard(loc);

    const dialogues = (suspect.interrogation && suspect.interrogation.dialogues) || [];
    const totalDlg = dialogues.length;
    const askedDlg = (state.dialogueProgress[suspect.id] || []).length;

    const obs = suspect.observations || [];
    const totalObs = obs.length;
    const doneObs = Object.keys(state.inspectedObservations[suspect.id] || {}).length;

    const isFullyDone = (totalDlg === 0 || askedDlg >= totalDlg) && (totalObs === 0 || doneObs >= totalObs);
    const hasStarted = askedDlg > 0 || doneObs > 0;
    const contraCount = (state.contradictionsFound[suspect.id] || []).length;
    const isEliminated = !!(state.eliminatedSuspects && state.eliminatedSuspects[suspect.id]);

    let statusText = 'CHƯA THẨM VẤN';
    let chipClass = '';
    let cardClass = '';

    if (isEliminated) {
      statusText = '✓ ĐÃ MINH OAN';
      chipClass = 'chip-innocent';
      cardClass = 'done';
    } else if (contraCount > 0) {
      statusText = `⚠️ BẮT QUẢ TANG (${contraCount} LỖI)`;
      chipClass = 'chip-warning';
      cardClass = 'warning-card';
    } else if (isFullyDone) {
      statusText = '✓ ĐÃ THẨM VẤN XONG';
      chipClass = 'chip-done';
      cardClass = 'done';
    } else if (hasStarted) {
      statusText = `ĐANG THẨM VẤN (${askedDlg}/${totalDlg})`;
      chipClass = 'chip-active';
      cardClass = 'active';
    }

    const totalActions = totalDlg + totalObs;
    const doneActions = askedDlg + doneObs;
    const percent = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

    return `
      <div class="hub-card ${cardClass}" onclick="renderLocation('${loc.id}')">
        <div>
          <div class="hub-card-top">
            <span class="hub-icon">${loc.icon}</span>
            <span class="hub-status-chip ${chipClass}">${statusText}</span>
          </div>
          <div class="hub-name">${loc.name}</div>
          <div class="hub-suspect-role">${suspect.role || 'Đối tượng điều tra'}</div>
        </div>
        <div class="hub-card-progress">
          <div class="hub-progress-bar ${isFullyDone ? 'bar-done' : ''}" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }

  setHeader(CASE.fileNo, CASE.title, null);
  renderTimeBar();

  setScene(`
    <div class="chapter-label">Điều tra & Khám xét</div>
    <div class="scene-title">Chọn địa điểm hoặc đối tượng bạn muốn kiểm tra</div>
    <div class="scene-text"><p>${state.time <= 0 ? '<em>Hết thời gian điều tra. Bạn phải chuyển sang Sổ tay phân tích với những gì đã thu thập được.</em>' : 'Mỗi hoạt động kiểm tra tốn thời gian. Hãy khám xét có chọn lọc để tìm manh mối mấu chốt.'}</p></div>

    <div class="hub-section-title">HIỆN TRƯỜNG & ĐỊA ĐIỂM (${scenes.length})</div>
    <div class="hub-grid">${scenes.map(renderCard).join('')}</div>

    <div class="hub-section-title" style="margin-top:24px;">THẨM VẤN & ĐỐI CHẤT (${suspects.length})</div>
    <div class="hub-grid">${suspects.map(renderSuspectCard).join('')}</div>

    <div class="btn-row" style="margin-top:28px;">
      <button class="continue-btn" id="hubContinue" onclick="goTo('board')" ${canProceed ? '' : 'disabled'}>
        ${hasRequired ? 'Mở Sổ tay suy luận →' : (state.time <= 0 ? 'Buộc phải dừng lại — mở Sổ tay suy luận →' : 'Cần đủ manh mối mấu chốt để sang bước suy luận')}
      </button>
    </div>
  `);

  // Preserve scroll position when returning to Hub
  if (state.hubScrollY) {
    const targetY = state.hubScrollY;
    setTimeout(() => window.scrollTo({ top: targetY, behavior: 'instant' }), 0);
  }
}

function saveScratchNotes(val) {
  state.scratchNotes = val;
  if (typeof localStorage !== 'undefined' && CASE) {
    localStorage.setItem('aod_scratch_' + CASE.id, val);
  }
}

function openScratchpadModal() {
  if (!CASE) return;
  if (typeof localStorage !== 'undefined') {
    state.scratchNotes = localStorage.getItem('aod_scratch_' + CASE.id) || state.scratchNotes || '';
  }
  const note = state.scratchNotes || '';

  const suspects = CASE.suspects || [];
  const methods = (CASE.truth && CASE.truth.accusation ? CASE.truth.accusation.methods : []) || [];
  const motives = (CASE.truth && CASE.truth.accusation ? CASE.truth.accusation.motives : []) || [];

  const theories = state.hypotheses || [];
  const theoriesListHtml = theories.length > 0 ? `
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
      ${theories.map((th, idx) => {
    const susp = suspects.find(s => s.id === th.suspect);
    const meth = methods.find(m => m.id === th.method);
    const mot = motives.find(m => m.id === th.motive);
    const isElim = th.status === 'eliminated' || (state.eliminatedSuspects && state.eliminatedSuspects[th.suspect]);

    return `
          <div style="padding:10px 12px;background:rgba(0,0,0,0.4);border:1px solid ${isElim ? 'rgba(231,76,60,0.3)' : 'rgba(212,175,55,0.3)'};border-left:3.5px solid ${isElim ? '#e74c3c' : '#f1c40f'};border-radius:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-family:'Playfair Display',serif;font-weight:700;color:${isElim ? '#aaa' : '#f1c40f'};font-size:13.5px;">
                #${idx + 1} ${susp ? susp.name : th.suspect}
              </span>
              <span style="font-family:'Courier Prime',monospace;font-size:10px;padding:2px 6px;border-radius:2px;background:${isElim ? 'rgba(231,76,60,0.2)' : 'rgba(241,196,15,0.2)'};color:${isElim ? '#e74c3c' : '#f1c40f'};font-weight:700;">
                ${isElim ? '✗ ĐÃ BỊ BÁC BỎ' : '🔍 ĐANG THEO DÕI'}
              </span>
            </div>
            <div style="font-size:12px;color:#cdbf9e;line-height:1.4;">
              • <strong>Thủ đoạn:</strong> ${meth ? meth.text : th.method}<br>
              • <strong>Động cơ:</strong> ${mot ? mot.text : th.motive}
            </div>
          </div>
        `;
  }).join('')}
    </div>
  ` : `<div style="font-size:12px;color:#888;font-style:italic;margin-top:6px;">Chưa có giả thuyết nào được lưu. Hãy thử kết hợp 1 phương án dưới đây.</div>`;

  const html = `
    <div class="modal-profile-wrap">
      <!-- 1. Working Theory Board -->
      <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-family:'Playfair Display',serif;font-size:14.5px;font-weight:700;color:var(--brass);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <span>💡 SỔ TAY GIẢ THUYẾT LÀM VIỆC</span>
          <span style="font-size:10px;font-family:'Courier Prime',monospace;color:#2ecc71;">MIỄN PHÍ THỜI GIAN</span>
        </div>
        <p style="font-size:12px;color:#cdbf9e;margin:0 0 10px;line-height:1.4;">
          Thử ghép nối các giả thuyết nghi vấn tạm thời để theo dõi. Nếu nghi phạm được minh oan, giả thuyết sẽ tự động bị bác bỏ.
        </p>

        ${(methods.length > 0 && motives.length > 0) ? `
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
            <div>
              <label style="font-size:11px;color:#cdbf9e;display:block;margin-bottom:3px;font-family:'Courier Prime',monospace;">1. THỦ PHẠM (WHO)</label>
              <select id="theorySuspectSel" style="width:100%;padding:6px;background:#18120c;color:#efe2c0;border:1px solid rgba(212,175,55,0.3);border-radius:3px;font-size:11.5px;">
                ${suspects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:#cdbf9e;display:block;margin-bottom:3px;font-family:'Courier Prime',monospace;">2. THỦ ĐOẠN (HOW)</label>
              <select id="theoryMethodSel" style="width:100%;padding:6px;background:#18120c;color:#efe2c0;border:1px solid rgba(212,175,55,0.3);border-radius:3px;font-size:11.5px;">
                ${methods.map(m => `<option value="${m.id}">${m.text.substring(0, 30)}...</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:#cdbf9e;display:block;margin-bottom:3px;font-family:'Courier Prime',monospace;">3. ĐỘNG CƠ (WHY)</label>
              <select id="theoryMotiveSel" style="width:100%;padding:6px;background:#18120c;color:#efe2c0;border:1px solid rgba(212,175,55,0.3);border-radius:3px;font-size:11.5px;">
                ${motives.map(m => `<option value="${m.id}">${m.text.substring(0, 30)}...</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="secondary-btn" style="width:100%;font-size:12px;padding:6px 12px;border-color:#f1c40f;color:#f1c40f;" onclick="addWorkingTheoryFromUI()">
            + Ghi Nhận Giả Thuyết Vào Sổ Tay
          </button>
        ` : ''}

        <div style="margin-top:12px;border-top:1px dashed rgba(212,175,55,0.2);padding-top:10px;">
          <div style="font-family:'Courier Prime',monospace;font-size:10.5px;color:var(--brass);font-weight:700;">DANH SÁCH GIẢ THUYẾT ĐANG THEO DÕI (${theories.length}):</div>
          ${theoriesListHtml}
        </div>
      </div>

      <!-- 2. Free Notes -->
      <div class="detective-scratchpad" style="margin-top:0;">
        <div class="scratchpad-header">
          <span>📝 Sổ Ghi Chú Tự Do Của Thám Tử</span>
          <span style="font-size:10.5px;font-family:'Courier Prime',monospace;color:#8a603c;">TỰ ĐỘNG LƯU</span>
        </div>
        <textarea id="modalScratchText" oninput="saveScratchNotes(this.value)" style="height:120px;" placeholder="Ghi chép mốc giờ, chi tiết đáng ngờ cá nhân...">${note}</textarea>
      </div>
    </div>
  `;
  openDetectiveModal('Sổ Ghi Chép & Giả Thuyết Làm Việc', html);
}

function addWorkingTheoryFromUI() {
  const sEl = document.getElementById('theorySuspectSel');
  const mEl = document.getElementById('theoryMethodSel');
  const vEl = document.getElementById('theoryMotiveSel');
  if (sEl && mEl && vEl) {
    sound.clue();
    createHypothesis(sEl.value, vEl.value, mEl.value);
    openScratchpadModal();
  }
}

function renderLocation(locId) {
  if (currentScene === 'hub') {
    state.hubScrollY = window.scrollY;
  }
  sound.click();
  const loc = CASE.locations.find(l => l.id === locId);
  if (!state.visitedLocations.includes(locId)) state.visitedLocations.push(locId);

  const isSuspect = CASE.suspects.some(s => s.id === locId);
  const suspect = CASE.suspects.find(s => s.id === locId);
  const totalItems = loc.items.length;
  const inspectedCount = loc.items.filter(it => state.inspectedItems.includes(it.id)).length;
  const badgeText = isSuspect ? '🏛️ PHÒNG THẨM VẤN ĐỐI TƯỢNG' : `📍 HIỆN TRƯỜNG KHÁM NGHIỆM (${inspectedCount}/${totalItems} ĐÃ THU THẬP)`;
  const titleText = isSuspect ? `Thẩm Vấn: ${suspect.name}` : `${loc.icon || '🔍'} ${loc.name}`;

  // Helper to render each item card with unified reveal block
  function renderItemBlock(it) {
    const c = CASE.evidence[it.id];
    const inspected = state.inspectedItems.includes(it.id);
    const expired = !isClueAvailable(it.id) && !inspected;
    const locked = !inspected && state.time < it.cost;

    if (inspected) {
      // Gộp chung thành 1 block thẻ thống nhất đẹp mắt
      return `
        <div class="evidence-unified-card ${c.decoy ? 'decoy' : ''}">
          <div class="evidence-unified-header">
            <span class="item-name">${c.label}</span>
            <span class="item-cost">✓ Đã kiểm tra</span>
          </div>
          <div class="evidence-unified-body">
            ${c.decoy ? '<em>Không có gì liên quan</em>' : c.text}
          </div>
        </div>
      `;
    }

    const clickHandler = (!locked && !expired) ? `onclick="inspectItemById('${locId}', '${it.id}')"` : '';

    return `
      <div class="item-row ${locked ? 'locked' : ''} ${expired ? 'expired-item' : ''}" ${clickHandler}>
        <span class="item-name">${c.label} ${c.expiresAt && !expired ? '<span class="expire-badge">⏰ ' + c.expiresAt + '</span>' : ''}</span>
        <span class="item-cost">${expired ? 'Đã mất cơ hội' : (locked ? 'Không đủ thời gian' : '⏳ -' + it.cost + ' phút')}</span>
      </div>
    `;
  }

  const itemsHtml = loc.items.map(renderItemBlock).join('');

  if (isSuspect) {
    // SUSPECT INTERROGATION LAYOUT: Header Box -> Items/Reveals -> Questions
    const interHeaderHtml = renderInterrogationHeader(suspect, locId);
    const interQuestionsHtml = renderInterrogationQuestions(suspect, locId);

    setScene(`
      <div class="chapter-label">🏛️ PHÒNG THẨM VẤN SCOTLAND YARD</div>
      ${interHeaderHtml}
      
      ${totalItems > 0 ? `
        <div style="margin-top:16px;">
          <div style="font-family:'Courier Prime',monospace;font-size:11px;font-weight:700;color:var(--brass);letter-spacing:0.8px;margin-bottom:8px;">VẬT CHỨNG & LỜI KHAI BAN ĐẦU:</div>
          <div class="item-list">${itemsHtml}</div>
        </div>
      ` : ''}

      <div style="margin-top:16px;">
        <div style="font-family:'Courier Prime',monospace;font-size:11px;font-weight:700;color:var(--brass);letter-spacing:0.8px;margin-bottom:8px;">CÂU HỎI THẨM VẤN & ĐỐI CHẤT:</div>
        ${interQuestionsHtml}
      </div>

      <div class="btn-row" style="margin-top:24px;">
        <button class="continue-btn" onclick="goTo('hub')">← Quay lại Bàn Điều Tra</button>
      </div>
    `);
  } else {
    // NORMAL CRIME SCENE LOCATION LAYOUT
    setScene(`
      <div class="chapter-label">${badgeText}</div>
      <div class="scene-title">${titleText}</div>
      <div class="item-list">${itemsHtml}</div>
      <div class="btn-row" style="margin-top:24px;">
        <button class="continue-btn" onclick="goTo('hub')">← Quay lại Bàn Điều Tra</button>
      </div>
    `);
  }

  checkExpireWarnings();
  renderBoard();
}

function inspectItemById(locId, itemId) {
  const loc = CASE.locations.find(l => l.id === locId);
  const it = loc ? loc.items.find(i => i.id === itemId) : null;
  if (loc && it) {
    inspectItem(loc, it);
  }
}

function inspectItem(loc, item) {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  spendTime(item.cost);
  renderTimeBar();
  const prevClues = [...state.clues];
  const isNew = addClue(item.id);
  state.inspectedItems.push(item.id);
  if (!pendingReveals[loc.id]) pendingReveals[loc.id] = [];
  pendingReveals[loc.id].unshift(item.id);
  const c = CASE.evidence[item.id];
  if (isNew) { c.decoy ? sound.click() : sound.pin(); }
  sound.reveal();

  // Kiểm tra nghi phạm mới được mở khóa
  const newSuspect = getNewlyRevealedSuspect();
  if (newSuspect) setTimeout(() => showSuspectUnlockedNotice(newSuspect), 800);

  checkExpireWarnings();
  renderLocation(loc.id);
}

/* ============================================================
   CORKBOARD — bảng điều tra vật lý (ghim kéo thả + dây nối SVG)
   ============================================================ */
function renderBoardScene() {
  const realClues = state.clues.filter(k => !CASE.evidence[k].decoy);

  // Khởi tạo vị trí cho các ghim chưa có vị trí
  const CARD_W = 155, CARD_H = 130;
  realClues.forEach((k, i) => {
    if (!state.cluePositions[k]) {
      const cols = Math.max(3, Math.ceil(Math.sqrt(realClues.length + 1)));
      const col = i % cols, row = Math.floor(i / cols);
      state.cluePositions[k] = {
        x: 24 + col * (CARD_W + 18) + (Math.random() * 16 - 8),
        y: 36 + row * (CARD_H + 18) + (Math.random() * 12 - 6)
      };
    }
  });

  state.boardSelection = [];
  _renderCorkboard();
}

function _renderCorkboard(inlineMsg) {
  const realClues = state.clues.filter(k => !CASE.evidence[k].decoy);
  const remaining = CASE.hypotheses.filter(h => !state.hypothesesAnswered[h.id]);
  const answeredKeys = Object.keys(state.hypothesesAnswered);

  setScene(`
    <div class="cork-scene">
      <div class="cork-header">
        <div>
          <div class="chapter-label">Sổ tay thám tử</div>
          <div class="cork-title">Bảng Ghim & Giả Thuyết Suy Luận</div>
          <div class="cork-subtitle">Kéo thẻ để sắp xếp &nbsp;·&nbsp; Bấm 1 lần để chọn/bỏ chọn &nbsp;·&nbsp; Bấm đôi để xem chi tiết</div>
        </div>
        <div class="cork-actions">
          <button class="secondary-btn" id="corkRelBtn" onclick="openDiscoveredRelationsModal()" title="Xem danh sách các mối liên hệ đã xác lập">
            🔗 Mối liên hệ (${(state.corkboardConnections || []).length}/${(CASE.clueRelations || []).length})
          </button>
          <button class="secondary-btn cork-hypo-btn" id="corkHypoBtn" onclick="openMindPalaceModal()" title="Mở Lâu đài tư duy & Giả thuyết">
            🧠 Lâu đài tư duy (${Object.keys(state.mindPalaceChoices).length}/${(CASE.mindPalaceNodes || []).length})
          </button>
          <button class="secondary-btn cork-hint-btn" id="hintCorkBtn" onclick="triggerHintCork()" ${state.time < 5 ? 'disabled' : ''}>
            💡 ${state.hintsUsed === 0 ? 'Gợi ý (-5p)' : 'Gợi ý thêm (-5p)'}
          </button>
          <button class="continue-btn" onclick="goTo('decision')" style="white-space:nowrap">
            ${remaining.length === 0 ? 'Đến bước Buộc Tội →' : 'Sẵn sàng Buộc Tội →'}
          </button>
        </div>
      </div>

      <!-- Corkboard Pin Legend -->
      <div class="cork-legend-bar" style="display:flex;gap:18px;align-items:center;font-size:12.5px;color:#cdbf9e;background:rgba(0,0,0,0.35);padding:7px 14px;border-radius:5px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08);">
        <span>📌 <strong>Sổ tay hiện trường:</strong> Bấm chọn các thẻ ghim để đối chiếu mối liên hệ và xâu chuỗi sự thật.</span>
      </div>

      <!-- Corkboard Section (Full Scale) -->
      <div class="corkboard" id="corkboard">
        <svg class="cork-svg" id="corkSvg" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>

      <div class="cork-bottom-bar">
        <div id="corkSelInfo" class="cork-sel-info">Chưa chọn thẻ nào &mdash; bấm vào một ghim để chọn</div>
        <button class="analyze-btn" id="analyzeBtn" disabled onclick="tryConnectCork()">🔗 Phân tích liên kết</button>
      </div>
      ${inlineMsg ? `<div class="feedback-box feedback-cork">${inlineMsg}</div>` : ''}
    </div>
  `);
  renderTimeBar();

  const board = document.getElementById('corkboard');

  realClues.forEach(k => {
    const c = CASE.evidence[k];
    const pos = state.cluePositions[k] || { x: 20, y: 20 };
    const isSel = state.boardSelection.includes(k);
    const rot = ((k.charCodeAt(0) * 11 + k.length * 7) % 7 - 3) * 0.75;

    const card = document.createElement('div');
    card.className = 'cork-pin' + (isSel ? ' selected' : '');
    card.dataset.id = k;
    card.style.cssText = `left:${pos.x}px;top:${pos.y}px;transform:rotate(${rot}deg);`;
    card.innerHTML = `<div class="pin-head"></div><div class="pin-note"><b>${c.label}</b><span>${c.text.slice(0, 95)}${c.text.length > 95 ? '…' : ''}</span></div>`;

    // — double click: open clue modal directly
    card.addEventListener('dblclick', e => {
      e.stopPropagation();
      openClueModal(k);
    });

    // — single click: select / deselect
    let clickTimer = null;
    card.addEventListener('click', e => {
      if (card._dragged) return;
      if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; openClueModal(k); return; }
      clickTimer = setTimeout(() => {
        clickTimer = null;
        sound.click();
        const idx = state.boardSelection.indexOf(k);
        if (idx >= 0) state.boardSelection.splice(idx, 1);
        else if (state.boardSelection.length < 4) state.boardSelection.push(k);
        card.classList.toggle('selected', state.boardSelection.includes(k));
        updateCorkSvg();
        updateCorkSelInfo();
      }, 240);
    });

    // — drag
    _setupCorkDrag(card, k, board);
    board.appendChild(card);
  });

  updateCorkSvg();
  updateCorkSelInfo();
  renderBoard();
}

function _setupCorkDrag(card, clueId, board) {
  let dragging = false, sx, sy, ox, oy;

  const onMove = e => {
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    if (!cx) return;
    const dx = cx - sx, dy = cy - sy;
    if (!dragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { dragging = true; card._dragged = true; card.style.zIndex = 200; }
    if (!dragging) return;
    const bRect = board.getBoundingClientRect();
    const maxX = bRect.width - card.offsetWidth - 4;
    const maxY = bRect.height - card.offsetHeight - 4;
    const nx = Math.max(4, Math.min(maxX, ox + dx));
    const ny = Math.max(4, Math.min(maxY, oy + dy));
    state.cluePositions[clueId] = { x: nx, y: ny };
    card.style.left = nx + 'px';
    card.style.top = ny + 'px';
    updateCorkSvg();
  };

  const onUp = () => {
    card.style.zIndex = '';
    dragging = false;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
  };

  card.addEventListener('pointerdown', e => {
    if (e.target.closest('.pin-detail-link')) return;
    card._dragged = false;
    sx = e.clientX; sy = e.clientY;
    ox = state.cluePositions[clueId]?.x || 20;
    oy = state.cluePositions[clueId]?.y || 20;
    card.setPointerCapture(e.pointerId);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

function updateCorkSvg() {
  const svg = document.getElementById('corkSvg');
  const board = document.getElementById('corkboard');
  if (!svg || !board) return;
  const bRect = board.getBoundingClientRect();
  const sel = state.boardSelection;

  // Collect center positions
  const centers = {};
  board.querySelectorAll('.cork-pin').forEach(card => {
    const r = card.getBoundingClientRect();
    centers[card.dataset.id] = {
      x: r.left - bRect.left + r.width / 2,
      y: r.top - bRect.top + r.height / 2
    };
  });

  let lines = `
    <defs>
      <filter id="corkThreadShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.65"/>
      </filter>
    </defs>
  `;

  // 1. Draw persistent confirmed connections
  const persistent = state.corkboardConnections || [];
  persistent.forEach(rel => {
    if (rel.clues && rel.clues.length >= 2) {
      const a = centers[rel.clues[0]], b = centers[rel.clues[1]];
      if (a && b) {
        const color = rel.type === 'contradicts' ? '#e74c3c' : '#f1c40f';
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
        lines += `<path d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" stroke="${color}" stroke-width="2.8" fill="none" opacity="0.95" filter="url(#corkThreadShadow)"/>`;
        lines += `<circle cx="${a.x}" cy="${a.y}" r="4.5" fill="#d4af37" stroke="#161210" stroke-width="1.2"/>`;
        lines += `<circle cx="${b.x}" cy="${b.y}" r="4.5" fill="#d4af37" stroke="#161210" stroke-width="1.2"/>`;
      }
    }
  });

  // 2. Draw active selection lines
  for (let i = 0; i < sel.length; i++) {
    for (let j = i + 1; j < sel.length; j++) {
      const a = centers[sel[i]], b = centers[sel[j]];
      if (!a || !b) continue;
      const rel = getClueRelation([sel[i], sel[j]]);
      const color = rel ? (rel.type === 'contradicts' ? '#e74c3c' : '#f1c40f') : '#c0392b';
      const dash = rel ? '' : '6,4';
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
      lines += `<path d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" stroke="${color}" stroke-width="2.4" fill="none" stroke-dasharray="${dash}" opacity="0.9" filter="url(#corkThreadShadow)"/>`;
      lines += `<circle cx="${a.x}" cy="${a.y}" r="4" fill="${color}" opacity="0.85"/>`;
      lines += `<circle cx="${b.x}" cy="${b.y}" r="4" fill="${color}" opacity="0.85"/>`;
    }
  }
  svg.innerHTML = lines;
}

function updateCorkSelInfo() {
  const info = document.getElementById('corkSelInfo');
  const btn = document.getElementById('analyzeBtn');
  const sel = state.boardSelection;
  if (!info) return;

  if (sel.length === 0) {
    info.innerHTML = 'Ch\u01b0a ch\u1ecdn th\u1ebb n\u00e0o &mdash; b\u1ea5m v\u00e0o m\u1ed9t ghim \u0111\u1ec3 ch\u1ecdn';
    if (btn) btn.disabled = true;
  } else {
    const names = sel.map(k => `<em>${CASE.evidence[k].label}</em>`).join(' + ');
    const rel = getClueRelation(sel);
    const relTag = rel && sel.length >= 2
      ? ` &nbsp;<span class="inline-rel ${rel.type}">${rel.type === 'supports' ? '🟡 Cùng hướng' : '🔴 Mâu thuẫn'}</span>`
      : '';
    info.innerHTML = `Đã chọn: ${names}${relTag}`;
    if (btn) btn.disabled = false;
  }
}

function tryConnectCork() {
  const sel = state.boardSelection;
  const match = CASE.hypotheses.find(h => !state.hypothesesAnswered[h.id] && h.refs.every(r => sel.includes(r)));
  if (match) {
    sound.correct();
    showHypModal(match);
    return;
  }

  const rel = getClueRelation(sel);
  if (rel) {
    // Kiểm tra xem mối liên hệ này đã được xác lập trước đó hay chưa
    const alreadyConnected = state.corkboardConnections && state.corkboardConnections.some(c =>
      c.clues && sel.every(s => c.clues.includes(s)) && c.clues.every(cId => sel.includes(cId))
    );

    if (alreadyConnected) {
      sound.click();
      const info = document.getElementById('corkSelInfo');
      if (info) {
        info.innerHTML = `✨ <strong>Mối liên hệ đã được xác lập:</strong> ${rel.label} (Đã nhận điểm trước đó).`;
        info.style.color = '#f1c40f';
        setTimeout(() => { info.style.color = ''; updateCorkSelInfo(); }, 4000);
      }
      return;
    }

    if (rel.question && rel.options) {
      sound.reveal();
      openCorkSynthesisModal(rel);
      return;
    }

    sound.pin();
    state.score += 5;
    if (!state.corkboardConnections) state.corkboardConnections = [];
    state.corkboardConnections.push(rel);
    const info = document.getElementById('corkSelInfo');
    if (info) {
      info.innerHTML = `✨ <strong>Mối liên hệ (${rel.type === 'supports' ? 'Hỗ trợ' : 'Mâu thuẫn'}):</strong> ${rel.label} (+5đ)`;
      info.style.color = '#2ecc71';
      setTimeout(() => { info.style.color = ''; updateCorkSelInfo(); }, 5000);
    }
    updateCorkSvg();
    const relBtn = document.getElementById('corkRelBtn');
    if (relBtn) relBtn.textContent = `🔗 Mối liên hệ (${state.corkboardConnections.length}/${(CASE.clueRelations || []).length})`;
    return;
  }

  sound.wrong();
  spendTime(2);
  renderTimeBar();
  const info = document.getElementById('corkSelInfo');
  if (info) {
    const prev = info.innerHTML;
    info.innerHTML = '⚠ Tổ hợp này chưa tạo được liên kết logic (-2 phút) — thử kết hợp khác.';
    info.style.color = '#e74c3c';
    setTimeout(() => { info.style.color = ''; info.innerHTML = prev; }, 3000);
  }
}

function openDiscoveredRelationsModal() {
  const connections = state.corkboardConnections || [];
  const totalPossible = (CASE.clueRelations || []).length;

  const typeLabels = {
    supports: { label: 'Hỗ trợ & Đồng quy', color: '#f1c40f', bg: 'rgba(241,196,15,0.15)' },
    contradicts: { label: 'Bác bỏ & Mâu thuẫn', color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' },
    eliminates: { label: 'Loại trừ nghi phạm', color: '#2ecc71', bg: 'rgba(46,204,113,0.15)' },
    explains: { label: 'Giải thích cơ chế/động cơ', color: '#3498db', bg: 'rgba(52,152,219,0.15)' },
    corroborates: { label: 'Củng cố vật chứng', color: '#9b59b6', bg: 'rgba(155,89,182,0.15)' }
  };

  const listHtml = connections.length === 0 ? `
    <div style="padding:30px 10px;text-align:center;font-size:14px;color:#888;font-style:italic;">
      Chưa xác lập được mối liên hệ nào.<br>
      Hãy chọn 2 thẻ ghim trên Bảng ghim và bấm <strong>"🔗 Phân tích liên kết"</strong> để đối chiếu!
    </div>
  ` : connections.map((rel) => {
    const c1 = CASE.evidence[rel.clues[0]];
    const c2 = CASE.evidence[rel.clues[1]];
    const typeInfo = typeLabels[rel.type] || { label: rel.type, color: '#f1c40f', bg: 'rgba(241,196,15,0.15)' };
    return `
      <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:12px 14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap;">
          <div style="font-size:14px;color:#efe2c0;font-weight:600;">
            📌 <em>${c1 ? c1.label : rel.clues[0]}</em> &nbsp;⟷&nbsp; 📌 <em>${c2 ? c2.label : rel.clues[1]}</em>
          </div>
          <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:3px;background:${typeInfo.bg};color:${typeInfo.color};border:1px solid ${typeInfo.color};">
            ${typeInfo.label}
          </span>
        </div>
        <div style="font-size:13.5px;color:#cdbf9e;line-height:1.5;">
          ${rel.label}
        </div>
      </div>
    `;
  }).join('');

  openDetectiveModal(`🔗 Các Mối Liên Hệ Đã Xác Lập (${connections.length}/${totalPossible})`, `
    <div class="modal-profile-wrap">
      <div style="font-size:13.5px;color:#cdbf9e;margin-bottom:14px;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:4px;">
        Mỗi mối liên hệ logic được phân tích chính xác trên Bảng ghim sẽ giúp củng cố lập luận và làm sáng tỏ bức tranh toàn cảnh của vụ án.
      </div>
      <div style="max-height:380px;overflow-y:auto;padding-right:4px;">
        ${listHtml}
      </div>
      <div class="btn-row" style="margin-top:16px;">
        <button class="continue-btn" onclick="closeDetectiveModal()">Đã hiểu ➔</button>
      </div>
    </div>
  `);
}

function openCorkSynthesisModal(rel) {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  const c1 = CASE.evidence[rel.clues[0]];
  const c2 = CASE.evidence[rel.clues[1]];

  const optionsHtml = rel.options.map((opt, i) => `
    <button class="choice-btn" style="margin-bottom:10px;text-align:left;" onclick="handleSelectCorkSynthesis('${rel.clues[0]}', '${rel.clues[1]}', '${opt.id}')">
      <span class="letter">${String.fromCharCode(65 + i)}</span>
      <div style="flex:1;">${opt.text}</div>
    </button>
  `).join('');

  openDetectiveModal(`🔗 Phân Tích Quan Hệ Manh Mối`, `
    <div style="font-family:'Segoe UI',sans-serif;">
      <div style="display:flex;gap:10px;margin-bottom:14px;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);align-items:center;">
        <span style="font-size:18px;">📌</span>
        <div style="font-size:13.5px;color:#efe2c0;">
          <strong>${c1.label}</strong> ⟷ <strong>${c2.label}</strong>
        </div>
      </div>

      <p style="font-size:15px;font-weight:600;color:#f1c40f;line-height:1.5;margin-bottom:14px;">
        ${rel.question}
      </p>

      <div class="choices">
        ${optionsHtml}
      </div>

      <div id="corkSynthesisFb" style="margin-top:12px;"></div>
    </div>
  `);
}

function handleSelectCorkSynthesis(c1Id, c2Id, optId) {
  const rel = getClueRelation([c1Id, c2Id]);
  if (!rel) return;
  const opt = rel.options.find(o => o.id === optId);
  const fbEl = document.getElementById('corkSynthesisFb');

  if (opt && opt.correct) {
    sound.threadConnect();
    if (!state.corkboardConnections) state.corkboardConnections = [];
    const alreadyDone = state.corkboardConnections.some(c =>
      c.clues && c.clues.includes(c1Id) && c.clues.includes(c2Id)
    );
    if (!alreadyDone) {
      state.score += 10;
      state.corkboardConnections.push(rel);
    }
    if (fbEl) {
      fbEl.innerHTML = `
        <div style="padding:12px;background:rgba(46,204,113,0.15);border:1px solid #2ecc71;border-radius:4px;color:#2ecc71;font-size:14px;line-height:1.5;">
          <strong>✓ Chính xác ${alreadyDone ? '(Đã xác lập trước đó)' : '(+10 điểm)'}!</strong><br>
          ${rel.label}
        </div>
      `;
    }
    setTimeout(() => {
      closeDetectiveModal();
      updateCorkSvg();
      const relBtn = document.getElementById('corkRelBtn');
      if (relBtn) relBtn.textContent = `🔗 Mối liên hệ (${state.corkboardConnections.length}/${(CASE.clueRelations || []).length})`;
      const info = document.getElementById('corkSelInfo');
      if (info) {
        info.innerHTML = `✨ <strong>Mối liên hệ (${rel.type === 'supports' ? 'Hỗ trợ' : 'Mâu thuẫn'}):</strong> ${rel.label} ${alreadyDone ? '' : '(+10đ)'}`;
        info.style.color = '#2ecc71';
        setTimeout(() => { info.style.color = ''; updateCorkSelInfo(); }, 5000);
      }
    }, 1200);
  } else {
    sound.wrong();
    spendTime(2);
    renderTimeBar();
    if (fbEl) {
      fbEl.innerHTML = `
        <div style="padding:12px;background:rgba(231,76,60,0.15);border:1px solid #e74c3c;border-radius:4px;color:#e74c3c;font-size:13.5px;line-height:1.5;">
          <strong>✗ Chưa chính xác (-2 phút)!</strong><br>
          Suy luận này chưa khớp với bản chất logic của hai manh mối. Hãy suy nghĩ lại!
        </div>
      `;
    }
  }
}

function triggerHintCork() {
  const result = useHint();
  renderTimeBar();
  if (!result) return;
  const info = document.getElementById('corkSelInfo');
  if (info) {
    const prev = info.innerHTML;
    info.innerHTML = result.msg;
    info.style.color = '#f1c40f';
    setTimeout(() => { info.style.color = ''; updateCorkSelInfo(); }, 5000);
  }
}

/* — Hypothesis modal (overlay trên corkboard, không scroll lên đầu) — */
function showHypModal(h) {
  let modal = document.getElementById('hypModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hypModal';
    modal.className = 'hyp-modal-overlay';
    document.getElementById('storyPanel').appendChild(modal);
  }
  modal.onclick = (e) => {
    if (e.target === modal) closeHypModal();
  };
  modal.innerHTML = `
    <div class="hyp-modal-card">
      <div class="hyp-modal-badge">Giả thuyết được kích hoạt</div>
      <div class="hyp-q">${h.question}</div>
      <div id="hypModalOpts"></div>
      <div id="hypModalEval"></div>
      <button class="continue-btn" id="hypModalBack" style="display:none" onclick="closeHypModal()">← Quay lại bảng điều tra</button>
    </div>
  `;
  modal.style.display = 'flex';
  sound.reveal();

  const optBox = document.getElementById('hypModalOpts');
  h.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'hyp-opt';
    btn.textContent = opt.text;
    btn.onclick = () => pickHypModalOpt(h, opt, optBox, btn);
    optBox.appendChild(btn);
  });
}

function pickHypModalOpt(h, opt, optBox, btnEl) {
  if (state.hypothesesAnswered[h.id]) return;
  state.hypothesesAnswered[h.id] = { choiceId: opt.id, correct: opt.correct };
  state.score += opt.correct ? 25 : 5;
  if (opt.correct) sound.correct(); else { sound.wrong(); btnEl.classList.add('shake'); }
  [...optBox.children].forEach(b => b.disabled = true);
  h.options.forEach((o, i) => { if (o.id === opt.id) optBox.children[i].classList.add(o.correct ? 'correct' : 'incorrect'); });

  const evalYes = (opt.evalYes || []).map(t => `<li class="yes">✓ ${t}</li>`).join('');
  const evalNo = (opt.evalNo || []).map(t => `<li class="no">✗ ${t}</li>`).join('');

  let redHerringHtml = '';
  if (!opt.correct && CASE.redHerrings && CASE.redHerrings.length > 0) {
    const rh = CASE.redHerrings.find(r => r.clues.some(c => (h.refs || []).includes(c)));
    if (rh) {
      redHerringHtml = `
        <div style="margin-top:12px;padding:10px 14px;background:rgba(231,76,60,0.15);border-left:3px solid #e74c3c;border-radius:4px;font-size:13.5px;color:#f39c12;line-height:1.5;">
          <strong>💡 Bẫy suy luận:</strong> ${rh.explanation}
        </div>
      `;
    }
  }

  const evalEl = document.getElementById('hypModalEval');
  if (evalEl) {
    evalEl.innerHTML = `
      <div class="eval-box">
        <div class="eval-title">Đối chiếu sự kiện</div>
        <ul class="eval-list">${evalYes}${evalNo}</ul>
        <span class="confidence ${opt.correct ? 'high' : 'low'}">Độ tin cậy: ${opt.correct ? 'CAO' : 'THẤP'}</span>
        ${redHerringHtml}
      </div>
    `;
  }
  const backBtn = document.getElementById('hypModalBack');
  if (backBtn) backBtn.style.display = 'inline-block';

  const hypoBtn = document.getElementById('corkHypoBtn');
  if (hypoBtn) {
    hypoBtn.textContent = `💡 Giả thuyết (${Object.keys(state.hypothesesAnswered).length})`;
  }
}

function closeHypModal() {
  const modal = document.getElementById('hypModal');
  if (modal) modal.style.display = 'none';
  state.boardSelection = [];
  updateCorkSvg();
  updateCorkSelInfo();
  renderBoard();
}

/* ============================================================
   DECISION — 3-way accusation (WHO, HOW, WHY) + Elimination
   ============================================================ */
function renderDecision() {
  if (state.accusationStep === 'motive' && state.chosenMethod && state.chosenSuspect) {
    renderAccusationMotive();
    return;
  }
  if (state.accusationStep === 'method' && state.chosenSuspect) {
    renderAccusationMethod();
    return;
  }
  if (state.accusationStep === 'who') {
    renderAccusationWho();
    return;
  }
  if (state.accusationStep === 'confirm' && state.chosenMotive && state.chosenMethod && state.chosenSuspect) {
    renderAccusationConfirm();
    return;
  }

  // Phase 1: Elimination
  const visible = getVisibleSuspects();
  const toEliminate = visible.filter(s => s.eliminateWith && !state.eliminatedSuspects[s.id]);

  if (toEliminate.length > 0 && state.clues.length > 0) {
    state.accusationStep = 'elimination';
    renderElimination();
    return;
  }

  // Phase 2: Accusation - WHO
  renderAccusationWho();
}

function handleProceedToAccusation() {
  const visible = getVisibleSuspects();
  const uneliminatedInnocents = visible.filter(s => s.eliminateWith && !state.eliminatedSuspects[s.id]);

  if (uneliminatedInnocents.length > 0) {
    const names = uneliminatedInnocents.map(s => `<strong>${s.name}</strong>`).join(', ');
    openDetectiveModal('⚠️ Cảnh Báo Thám Tử: Chưa Loại Trừ Nghi Phạm', `
      <div class="modal-profile-wrap">
        <div style="font-family:'Crimson Text',serif;font-size:16px;line-height:1.6;color:#efe2c0;">
          <p>Bạn vẫn còn <strong>${uneliminatedInnocents.length}</strong> đối tượng chưa được xác nhận ngoại phạm: ${names}.</p>
          <p style="color:#e74c3c;">Việc vội vàng tiến hành Buộc Tội khi hồ sơ chưa được sàng lọc kỹ có thể dẫn đến việc kết án oan người vô tội hoặc làm giảm điểm uy tín thám tử của bạn.</p>
          <p>Bạn có chắc chắn muốn bỏ qua bước loại trừ để tiến hành Buộc Tội ngay bây giờ không?</p>
        </div>
        <div class="btn-row" style="margin-top:20px;">
          <button class="secondary-btn" onclick="closeDetectiveModal()">← Quay lại kiểm tra</button>
          <button class="continue-btn" onclick="closeDetectiveModal(); renderAccusationWho();" style="background:#c0392b;">Tiếp tục Buộc Tội ➔</button>
        </div>
      </div>
    `);
    return;
  }
  renderAccusationWho();
}

function renderElimination(msg) {
  const visible = getVisibleSuspects();
  const allCount = CASE.suspects.length;
  const hiddenCount = allCount - visible.length;
  const hiddenHint = hiddenCount > 0
    ? `<div class="hidden-suspect-hint">🔍 Còn ${hiddenCount} nghi phạm chưa xuất hiện — hãy tiếp tục khám nghiệm nếu muốn tìm đủ.</div>`
    : '';

  setScene(`
    <div class="chapter-label">Giai đoạn 1: Loại trừ nghi phạm</div>
    <div class="scene-title">Xác thực bằng chứng ngoại phạm</div>
    <div class="scene-text"><p>Hãy chọn bằng chứng thích hợp để chứng minh sự vô tội của những người có bằng chứng ngoại phạm trước khi tiến hành buộc tội.</p></div>
    ${hiddenHint}
    ${msg ? `<div class="feedback-box">${msg}</div>` : ''}
    <div class="elimination-grid" id="elimGrid"></div>
    <div class="btn-row" style="margin-top:28px;">
      <button class="secondary-btn" onclick="goTo('hub')">← Trở về điều tra thêm manh mối</button>
      <button class="continue-btn" onclick="handleProceedToAccusation()">Tiến hành Buộc Tội (WHO) →</button>
    </div>
  `);

  const grid = document.getElementById('elimGrid');
  visible.forEach(s => {
    const isEliminated = !!state.eliminatedSuspects[s.id];
    const cred = getCredibilityLabel(state.suspectCredibility[s.id] || 100);
    const div = document.createElement('div');
    div.className = 'elimination-card' + (isEliminated ? ' eliminated' : '');

    let alibiActionHtml = '';
    if (isEliminated) {
      alibiActionHtml = `
        <div class="elim-cleared-banner" style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;">
          <div class="police-stamp police-stamp-verified">✓ NGOẠI PHẠM XÁC THỰC</div>
          <div class="elim-reason" style="margin-top:4px;">${s.eliminateExplanation}</div>
        </div>
      `;
    } else {
      const selectId = 'elim_select_' + s.id;
      const opts = state.clues.map(c => `<option value="${c}">${CASE.evidence[c].label}: ${CASE.evidence[c].text.slice(0, 45)}…</option>`).join('');
      alibiActionHtml = `
        <div class="elim-alibi-box">
          <div class="elim-alibi-label">ĐƯA BẰNG CHỨNG NGOẠI PHẠM ĐỂ LOẠI TRỪ:</div>
          <div class="elim-action">
            <select id="${selectId}" class="elim-select">
              <option value="">-- Chọn manh mối chứng minh ngoại phạm --</option>
              ${opts}
            </select>
            <button class="eliminate-btn" onclick="tryEliminate('${s.id}')">✓ Xác nhận</button>
          </div>
        </div>
      `;
    }

    div.innerHTML = `
      <div class="elim-card-header">
        <div class="elim-name-col">
          <span class="elim-suspect-name">${s.name}</span>
          <div class="elim-cred-wrap">
            <span class="elim-cred-lbl">Độ tin cậy:</span>
            <div class="credibility-bar" style="width:130px;height:7px;margin:0 8px;">
              <div class="credibility-fill ${cred.class}" style="width:${state.suspectCredibility[s.id] || 100}%"></div>
            </div>
            <span class="elim-cred-val ${cred.class}">${state.suspectCredibility[s.id] || 100}% (${cred.label})</span>
          </div>
        </div>
        <span class="elim-status-tag ${isEliminated ? 'tag-cleared' : 'tag-suspect'}">
          ${isEliminated ? '✓ ĐÃ LOẠI TRỪ' : 'NGHI PHẠM'}
        </span>
      </div>
      <div class="elim-suspect-desc">${s.desc}</div>
      ${alibiActionHtml}
    `;
    grid.appendChild(div);
  });
}

function tryEliminate(suspectId) {
  const selectEl = document.getElementById('elim_select_' + suspectId);
  if (!selectEl) return;
  const clueId = selectEl.value;
  if (!clueId) return;

  const prevScroll = window.scrollY;
  if (eliminateSuspect(suspectId, clueId)) {
    sound.stamp();
    sound.correct();
    renderElimination(`<strong>Chính xác!</strong> Đã loại trừ thành công.`);
  } else {
    sound.wrong();
    renderElimination(`<strong>Sai lầm!</strong> Bằng chứng "${CASE.evidence[clueId].label}" không đủ để loại trừ người này.`);
  }
  window.scrollTo({ top: prevScroll, behavior: 'instant' });
}

function renderAccusationWho() {
  state.accusationStep = 'who';
  const visible = getVisibleSuspects().filter(s => !state.eliminatedSuspects[s.id]);

  setScene(`
    <div class="chapter-label">Giai đoạn 2: Buộc tội (1/3)</div>
    <div class="scene-title">AI LÀ HUNG THỦ?</div>
    <div class="scene-text"><p>Chọn nghi phạm chính mà mọi manh mối và sơ hở ngoại phạm đều hướng tới.</p></div>
    <div class="suspect-grid" id="suspectGrid"></div>
    <div class="btn-row" style="margin-top:24px;">
      <button class="secondary-btn" onclick="state.accusationStep='elimination'; renderElimination();">← Quay lại bước loại trừ</button>
      <button class="continue-btn" id="decisionNext" ${state.chosenSuspect ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'} onclick="renderAccusationMethod()">Tiếp tục (Chọn Phương thức) →</button>
      <button class="secondary-btn" onclick="goTo('hub')">🔍 Quay lại điều tra thêm manh mối</button>
    </div>
  `);
  const grid = document.getElementById('suspectGrid');
  visible.forEach(s => {
    const isSel = state.chosenSuspect === s.id;
    const isDim = state.chosenSuspect && !isSel;
    const div = document.createElement('div');
    div.className = 'suspect-opt' + (isSel ? ' sel' : '') + (isDim ? ' dimmed' : '');
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <b style="font-size:16px;">${s.name}</b>
        <span class="sel-indicator" style="font-size:13px;color:#f1c40f;font-weight:bold;">${isSel ? '✓ ĐÃ CHỌN' : ''}</span>
      </div>
      <span style="font-size:13.5px;color:#cdbf9e;">${s.desc}</span>
    `;
    div.onclick = () => {
      sound.click();
      state.chosenSuspect = s.id;
      [...grid.children].forEach((c, idx) => {
        const otherS = visible[idx];
        const selected = otherS.id === s.id;
        c.classList.toggle('sel', selected);
        c.classList.toggle('dimmed', !selected);
        const ind = c.querySelector('.sel-indicator');
        if (ind) ind.textContent = selected ? '✓ ĐÃ CHỌN' : '';
      });
      const nextBtn = document.getElementById('decisionNext');
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    };
    grid.appendChild(div);
  });
}

function checkAccusationRequirement(opt) {
  if (!opt.reqClues || opt.reqClues.length === 0) return { unlocked: true };
  const missing = opt.reqClues.filter(c => !state.clues.includes(c));
  if (missing.length === 0) return { unlocked: true };
  return { unlocked: false, hint: opt.reqHint || 'Cần thu thập thêm manh mối liên quan' };
}

function renderAccusationMethod() {
  state.accusationStep = 'method';
  setScene(`
    <div class="chapter-label">Giai đoạn 2: Buộc tội (2/3)</div>
    <div class="scene-title">BẰNG CÁCH NÀO? (PHƯƠNG THỨC GÂY ÁN)</div>
    <div class="scene-text"><p>Chọn phương thức hung thủ đã sử dụng dựa trên chuỗi bằng chứng vật lý bạn đã thu thập được.</p></div>
    <div class="choices" id="methodChoices"></div>
    <div class="btn-row" style="margin-top:24px;">
      <button class="secondary-btn" onclick="renderAccusationWho()">← Quay lại chọn nghi phạm</button>
      <button class="continue-btn" id="methodNext" ${state.chosenMethod ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'} onclick="renderAccusationMotive()">Tiếp tục (Chọn Động cơ) →</button>
      <button class="secondary-btn" onclick="goTo('hub')">🔍 Quay lại điều tra thêm manh mối</button>
    </div>
  `);
  const box = document.getElementById('methodChoices');
  const methods = CASE.truth?.accusation?.methods || CASE.accusation?.methods || [];
  methods.forEach((m, i) => {
    const check = checkAccusationRequirement(m);
    const btn = document.createElement('button');
    const isSel = state.chosenMethod === m.id;
    const isDim = state.chosenMethod && !isSel;

    if (check.unlocked) {
      btn.className = 'choice-btn' + (isSel ? ' sel' : '') + (isDim ? ' dimmed' : '');
      btn.innerHTML = `<span class="letter">${String.fromCharCode(65 + i)}</span><div style="flex:1;text-align:left;">${m.text}</div><span class="sel-indicator" style="font-size:12px;color:#f1c40f;font-weight:bold;margin-left:8px;">${isSel ? '✓ ĐÃ CHỌN' : ''}</span>`;
      btn.onclick = () => {
        sound.click();
        state.chosenMethod = m.id;
        [...box.children].forEach(c => {
          if (!c.disabled) {
            c.classList.remove('sel');
            c.classList.add('dimmed');
            const ind = c.querySelector('.sel-indicator');
            if (ind) ind.textContent = '';
          }
        });
        btn.classList.remove('dimmed');
        btn.classList.add('sel');
        const ind = btn.querySelector('.sel-indicator');
        if (ind) ind.textContent = '✓ ĐÃ CHỌN';
        const nextBtn = document.getElementById('methodNext');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.cursor = 'pointer';
        }
      };
    } else {
      btn.className = 'choice-btn choice-locked';
      btn.disabled = true;
      btn.innerHTML = `
        <span class="letter" style="opacity:0.6;">🔒</span>
        <div style="flex:1;text-align:left;">
          <div style="opacity:0.65;font-weight:500;">[Chưa đủ dữ liệu suy luận phương thức này]</div>
          <div style="font-size:12px;color:#f39c12;margin-top:4px;">💡 ${check.hint}</div>
        </div>
      `;
    }
    box.appendChild(btn);
  });
}

function renderAccusationMotive() {
  state.accusationStep = 'motive';
  setScene(`
    <div class="chapter-label">Giai đoạn 2: Buộc tội (3/3)</div>
    <div class="scene-title">TẠI SAO? (ĐỘNG CƠ GÂY ÁN)</div>
    <div class="scene-text"><p>Chọn động cơ thôi thúc kẻ thủ ác ra tay dựa trên mâu thuẫn và hồ sơ bạn đã bóc tách.</p></div>
    <div class="choices" id="motiveChoices"></div>
    <div class="btn-row" style="margin-top:24px;">
      <button class="secondary-btn" onclick="renderAccusationMethod()">← Quay lại chọn phương thức</button>
      <button class="continue-btn" id="motiveNext" ${state.chosenMotive ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'} onclick="renderAccusationConfirm()">Tiếp tục (Xác nhận bản án) →</button>
      <button class="secondary-btn" onclick="goTo('hub')">🔍 Quay lại điều tra thêm manh mối</button>
    </div>
  `);
  const box = document.getElementById('motiveChoices');
  const motives = CASE.truth?.accusation?.motives || CASE.accusation?.motives || [];
  motives.forEach((m, i) => {
    const check = checkAccusationRequirement(m);
    const btn = document.createElement('button');
    const isSel = state.chosenMotive === m.id;
    const isDim = state.chosenMotive && !isSel;

    if (check.unlocked) {
      btn.className = 'choice-btn' + (isSel ? ' sel' : '') + (isDim ? ' dimmed' : '');
      btn.innerHTML = `<span class="letter">${String.fromCharCode(65 + i)}</span><div style="flex:1;text-align:left;">${m.text}</div><span class="sel-indicator" style="font-size:12px;color:#f1c40f;font-weight:bold;margin-left:8px;">${isSel ? '✓ ĐÃ CHỌN' : ''}</span>`;
      btn.onclick = () => {
        sound.click();
        state.chosenMotive = m.id;
        [...box.children].forEach(c => {
          if (!c.disabled) {
            c.classList.remove('sel');
            c.classList.add('dimmed');
            const ind = c.querySelector('.sel-indicator');
            if (ind) ind.textContent = '';
          }
        });
        btn.classList.remove('dimmed');
        btn.classList.add('sel');
        const ind = btn.querySelector('.sel-indicator');
        if (ind) ind.textContent = '✓ ĐÃ CHỌN';
        const nextBtn = document.getElementById('motiveNext');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.cursor = 'pointer';
        }
      };
    } else {
      btn.className = 'choice-btn choice-locked';
      btn.disabled = true;
      btn.innerHTML = `
        <span class="letter" style="opacity:0.6;">🔒</span>
        <div style="flex:1;text-align:left;">
          <div style="opacity:0.65;font-weight:500;">[Chưa đủ dữ liệu suy luận động cơ này]</div>
          <div style="font-size:12px;color:#f39c12;margin-top:4px;">💡 ${check.hint}</div>
        </div>
      `;
    }
    box.appendChild(btn);
  });
}

function renderAccusationConfirm() {
  state.accusationStep = 'confirm';
  const methods = CASE.truth?.accusation?.methods || CASE.accusation?.methods || [];
  const motives = CASE.truth?.accusation?.motives || CASE.accusation?.motives || [];
  const suspect = CASE.suspects.find(s => s.id === state.chosenSuspect) || { name: 'Chưa rõ' };
  const method = methods.find(m => m.id === state.chosenMethod) || { text: 'Chưa rõ' };
  const motive = motives.find(m => m.id === state.chosenMotive) || { text: 'Chưa rõ' };

  setScene(`
    <div class="chapter-label">Xác nhận</div>
    <div class="scene-title">Bản án cuối cùng</div>
    <div class="accusation-confirm">
      <p><strong>Hung thủ:</strong> ${suspect.name}</p>
      <p><strong>Cách thức:</strong> ${method.text}</p>
      <p><strong>Động cơ:</strong> ${motive.text}</p>
    </div>
    <div class="btn-row" style="margin-top:24px;">
      <button class="secondary-btn" onclick="renderAccusationMotive()">← Thay đổi lựa chọn</button>
      <button class="continue-btn" onclick="goTo('ending')">Đưa ra ánh sáng →</button>
    </div>
  `);
}

/* ============================================================
   ENDING
   ============================================================ */
function bar(label, val) { return `<div class="bar-row"><div class="bar-head"><span>${label}</span><span>${val}</span></div><div class="bar-track"><div class="bar-fill" data-w="${val}"></div></div></div>`; }

function renderEnding() {
  showDetectiveBar(false);
  showTimeBar(false);
  closeDetectiveModal();
  setHeader(CASE.fileNo, CASE.title, null);

  const result = resolveEnding();
  const idx = result.idx;
  const d = result.data || { badge: 'Kết cục', title: 'Vụ án khép lại', body: '<p>Hồ sơ vụ án đã được ghi nhận.</p>' };

  const prevSave = getCaseSave(CASE.id);
  const prevBest = prevSave ? (prevSave.bestScore || 0) : 0;
  const isNewRecord = idx.total > prevBest && prevBest > 0;

  persistEnding(CASE.id, result.id, idx.total);

  // Kiểm tra achievements
  const newAch = checkAchievements(result.id, idx);

  const missedEvidence = Object.keys(CASE.evidence).filter(k => !CASE.evidence[k].decoy && !state.clues.includes(k));
  const missedHtml = missedEvidence.length ? `<div class="missed-box"><div class="eval-title">Bạn đã bỏ qua</div><ul>${missedEvidence.map(k => `<li>${CASE.evidence[k].label}</li>`).join('')}</ul></div>` : '';

  // Achievements earned hiển thị dưới ending (Tủ trưng bày Huân chương & Danh hiệu)
  const caseSave = getCaseSave(CASE.id);
  const allAch = caseSave.achievements || [];
  const achHtml = allAch.length > 0
    ? `
      <div class="ach-panel">
        <div class="ach-panel-header">
          <span class="ach-panel-title">🏆 TỦ TRƯNG BÀY HUÂN CHƯƠNG & DANH HIỆU (${allAch.length})</span>
          <span class="ach-panel-sub">Chiến tích nghiệp vụ đạt được trong vụ án</span>
        </div>
        <div class="ach-grid">
          ${allAch.map(id => {
      const a = ACHIEVEMENTS[id];
      if (!a) return '';
      return `
              <div class="ach-medal-card">
                <div class="ach-medal-token">
                  <span class="ach-icon-lg">${a.icon}</span>
                </div>
                <div class="ach-medal-info">
                  <div class="ach-item-label">${a.label}</div>
                  <div class="ach-item-desc">${a.desc}</div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `
    : '';

  const recordBadge = isNewRecord
    ? `<div style="margin-top:4px;color:#2ecc71;font-weight:bold;font-size:13.5px;">🎉 KỶ LỤC MỚI CỦA BẠN (Vượt qua ${prevBest} điểm)!</div>`
    : (prevBest > 0 ? `<div style="margin-top:4px;color:#cdbf9e;font-size:13px;">Kỷ lục trước đây: <strong>${prevBest}/100</strong></div>` : '');

  const isCaseSolved = idx.total >= 80 || result.id === 'perfect' || result.id === 'good';
  const caseClosedStampHtml = isCaseSolved ? `
    <div style="text-align:center;margin:12px 0;">
      <div class="stamp-case-closed">
        <div class="stamp-closed-inner">
          <span>★ SCOTLAND YARD ★</span>
          <b>CASE CLOSED</b>
          <span class="stamp-closed-date">VỤ ÁN ĐÃ PHÁ GIẢI</span>
        </div>
      </div>
    </div>
  ` : '';

  // Working Theories Summary
  const userTheories = state.hypotheses || [];
  let theoriesSummaryHtml = '';
  if (userTheories.length > 0) {
    theoriesSummaryHtml = `
      <div class="theories-summary-panel" style="margin-top:16px;padding:12px 14px;background:rgba(0,0,0,0.35);border:1px solid rgba(212,175,55,0.25);border-radius:4px;">
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:13.5px;font-weight:700;color:var(--brass);margin-bottom:8px;">
          💡 HÀNH TRÌNH TƯ DUY (${userTheories.length} GIẢ THUYẾT ĐÃ CÂN NHẮC)
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${userTheories.map((th, i) => {
      const susp = (CASE.suspects || []).find(s => s.id === th.suspect);
      const methods = (CASE.truth && CASE.truth.accusation ? CASE.truth.accusation.methods : []) || [];
      const motives = (CASE.truth && CASE.truth.accusation ? CASE.truth.accusation.motives : []) || [];
      const meth = methods.find(m => m.id === th.method);
      const mot = motives.find(m => m.id === th.motive);

      const isConfirmed = th.status === 'confirmed' || (result.id === 'perfect' && th.suspect === CASE.truth.correctSuspect);
      const isEliminated = th.status === 'eliminated' || (state.eliminatedSuspects && state.eliminatedSuspects[th.suspect]);

      let badge = '<span style="color:#f1c40f;font-weight:bold;font-size:11px;">[ĐÃ XEM XÉT]</span>';
      if (isConfirmed) badge = '<span style="color:#2ecc71;font-weight:bold;font-size:11px;">[✓ CHÍNH XÁC]</span>';
      else if (isEliminated) badge = '<span style="color:#e74c3c;font-weight:bold;font-size:11px;">[✗ ĐÃ BÁC BỎ]</span>';

      return `
              <div style="font-size:12px;color:#cdbf9e;line-height:1.4;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:3px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                <span>#${i + 1} <strong>${susp ? susp.name : th.suspect}</strong> &middot; ${meth ? meth.text : th.method}</span>
                ${badge}
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  setScene(`
    <div class="chapter-label">BÁO CÁO KẾT CỤC &middot; HỒ SƠ #${CASE.fileNo}</div>
    ${caseClosedStampHtml}
    <div style="margin: 10px 0 6px;">
      <span class="ending-badge ${result.badgeClass}">${d.badge}</span>
    </div>
    <div class="scene-title">${d.title}</div>
    <div class="scene-text">${d.body}</div>
    ${missedHtml}
    <div class="index-panel">
      <div class="case-stamp">HỒ SƠ ${CASE.fileNo}</div>
      <h3>Bảng Đánh Giá Chỉ Số Holmes</h3>
      ${recordBadge}
      ${bar('👁️ QUAN SÁT & ĐỌC VỊ', idx.observationScore)}
      ${bar('🔍 THU THẬP VẬT CHỨNG', idx.evidenceScore)}
      ${bar('⚡ BẮT BẺ MÂU THUẪN', idx.contradictionScore || idx.decisionScore)}
      ${bar('⏱️ PHỤC DỰNG THỜI GIAN', idx.timelineScore !== undefined ? idx.timelineScore : 100)}
      ${bar('🧠 SUY LUẬN & MIND PALACE', idx.deductionScore)}
      ${bar('⚖️ PHÁN QUYẾT CUỐI CÙNG', idx.finalAccusationScore || idx.decisionScore)}
      <div class="index-total"><span class="num">${idx.total}</span><br><span class="lbl">/ 100 &middot; ${rankLabel(idx.total)}</span></div>

      <!-- Secondary Metrics (Time Speedrun Indicator) -->
      <div class="secondary-speed-metric" style="margin-top:12px;padding:8px 12px;background:rgba(0,0,0,0.3);border:1px dashed rgba(212,175,55,0.25);border-radius:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
          <span style="color:#cdbf9e;">⚡ <strong>Hiệu quả thời gian còn lại:</strong></span>
          <span style="font-family:'Courier Prime',monospace;color:${idx.timeScore >= 60 ? '#2ecc71' : '#f1c40f'};font-weight:bold;">${state.time} phút (${idx.timeScore}%)</span>
        </div>
      </div>

      <div class="hints-used-note" style="margin-top:8px;">${state.hintsUsed > 0 ? `Đã dùng gợi ý: ${state.hintsUsed} lần` : '✓ Không dùng gợi ý lần nào'}</div>
      <div class="time-borrow-note" style="margin-top:6px;font-size:12.5px;">
        ${(state.timeBorrowCount || 0) > 0
      ? `<span style="color:#f39c12;">⚠️ Đã trưng dụng Lệnh Khẩn Cấp: ${state.timeBorrowCount} lần (+${state.timeBorrowed} phút, -${state.timeBorrowCount * 8} điểm Uy Tín)</span>`
      : '<span style="color:#2ecc71;">✓ Không gia hạn thêm thời gian lần nào (+0 điểm phạt)</span>'
    }
      </div>
      ${theoriesSummaryHtml}
    </div>
    ${achHtml}
    <div class="ending-action-container">
      <div class="ending-btn-row">
        <button class="ending-btn ending-btn-primary" onclick="toggleReplay()">
          <span>🔍</span>
          <span>Xem Holmes Suy Luận Từng Bước</span>
        </button>
        <button class="ending-btn ending-btn-primary" onclick="openScotlandYardReportModal()">
          <span>📜</span>
          <span>Hồ Sơ Niêm Phong Scotland Yard</span>
        </button>
      </div>
      <div class="ending-btn-row">
        <button class="ending-btn ending-btn-secondary" onclick="selectCase(currentCaseIndex)">
          <span>🔄</span>
          <span>Chơi Lại Vụ Này</span>
        </button>
        <button class="ending-btn ending-btn-secondary" onclick="goTo('caseSelect')">
          <span>📂</span>
          <span>Chọn Vụ Án Khác</span>
        </button>
      </div>
    </div>
    <div class="replay-panel" id="replayPanel"></div>
  `);
  sound.stopHeartbeat();
  sound.ending();
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }, 60);

  // Hiện achievement toast sau 1 giây
  if (newAch.length > 0) setTimeout(() => showAchievementToast(newAch), 1200);
}

const REPLAY_STEPS_KEY = 'replaySteps';
function toggleReplay() {
  const panel = document.getElementById('replayPanel');
  if (panel.classList.contains('show')) { panel.classList.remove('show'); return; }
  replayIdx = 0; panel.classList.add('show'); renderReplayStep();
}
function renderReplayStep() {
  const steps = (CASE.truth && CASE.truth.replaySteps) || CASE.replaySteps || [];
  const panel = document.getElementById('replayPanel');
  if (steps.length === 0) { panel.innerHTML = '<div class="replay-card"><div class="replay-text">Chưa có lời giải chi tiết cho vụ án này.</div></div>'; return; }

  // Lấy clue key liên quan đến bước này (dựa trên thứ tự replaySteps gắn với replayClues nếu có)
  const replayClues = (CASE.truth && CASE.truth.replayClues) || CASE.replayClues || [];
  const relatedClue = replayClues[replayIdx];
  const clueHighlightHtml = relatedClue && CASE.evidence[relatedClue]
    ? `<div class="replay-clue-ref" style="cursor:pointer;" onclick="openClueModal('${relatedClue}')" title="Bấm để xem vật chứng"><span class="replay-clue-icon">📌</span><span>${CASE.evidence[relatedClue].label} (Xem chi tiết)</span></div>`
    : '';

  const dots = steps.map((_, i) => `<span class="step-dot ${i === replayIdx ? 'active' : ''}"></span>`).join('');

  let hypothesesDebriefHtml = '';
  if (CASE.competingHypotheses && CASE.competingHypotheses.length > 0 && replayIdx === steps.length - 1) {
    const listHtml = CASE.competingHypotheses.map(h => {
      const isProven = h.status === 'proven';
      return `
        <div style="padding:8px 10px;border-radius:4px;margin-top:6px;background:${isProven ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)'};border-left:3px solid ${isProven ? '#2ecc71' : '#e74c3c'};font-size:12.5px;color:#efe2c0;text-align:left;">
          <div style="font-weight:700;color:${isProven ? '#2ecc71' : '#e74c3c'};">${isProven ? '✓' : '✗'} ${h.title}</div>
          <div style="color:#cdbf9e;margin-top:2px;">${h.explanation}</div>
        </div>
      `;
    }).join('');
    hypothesesDebriefHtml = `
      <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;">
        <strong style="color:#f1c40f;font-size:13px;">📋 ĐỐI CHIẾU CÁC GIẢ THUYẾT VỤ ÁN:</strong>
        ${listHtml}
      </div>
    `;
  }

  panel.innerHTML = `<div class="replay-card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.6);border:1px solid rgba(241,196,15,0.35);">
    <div class="replay-step-label" style="color:#f1c40f;font-weight:700;letter-spacing:0.5px;">🕵️ HOLMES SUY LUẬN &middot; BƯỚC ${replayIdx + 1}/${steps.length}</div>
    <div class="replay-text" style="font-family:'Crimson Text',serif;font-size:16.5px;line-height:1.6;color:#efe2c0;font-style:italic;">${steps[replayIdx]}</div>
    ${clueHighlightHtml}
    ${hypothesesDebriefHtml}
    <div class="replay-nav">
      <button class="secondary-btn" onclick="replayNav(-1)" ${replayIdx === 0 ? 'disabled' : ''}>← Trước</button>
      <div class="step-dots">${dots}</div>
      <button class="secondary-btn" onclick="replayNav(1)" ${replayIdx === steps.length - 1 ? 'disabled' : ''}>Tiếp →</button>
    </div></div>`;
}
function replayNav(delta) {
  sound.click();
  const steps = (CASE.truth && CASE.truth.replaySteps) || CASE.replaySteps || [];
  replayIdx = Math.max(0, Math.min(steps.length - 1, replayIdx + delta));
  renderReplayStep();
}

/* ============================================================
   RENDER MAP + BOOT
   ============================================================ */
const RENDER = {
  caseSelect: renderCaseSelect,
  start: renderStart,
  hub: renderHub,
  board: renderBoardScene,
  decision: renderDecision,
  ending: renderEnding,
};
/* ============================================================
   OBSERVATION & PROFILING MODAL (Holmes Character Inspection)
   ============================================================ */
function openObservationModal(suspectId) {
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if (!suspect || !suspect.observations) return;

  const obsList = getSuspectObservations(suspectId);
  const currentInspects = state.inspectedObservations[suspectId] || {};

  function renderObservationBody() {
    const inspectedCount = Object.keys(currentInspects).length;
    const cardsHtml = obsList.map((obs, idx) => {
      const selectedInferenceId = currentInspects[obs.id];
      const isDone = !!selectedInferenceId;
      const chosenInference = selectedInferenceId ? obs.inferences.find(inf => inf.id === selectedInferenceId) : null;

      const inferenceBtns = obs.inferences.map(inf => {
        const isChosen = selectedInferenceId === inf.id;
        const conf = inf.confidence || 'medium';
        const confClass = isChosen ? `chosen conf-${conf}` : '';
        let badgeHtml = '';
        let styleOverride = '';
        if (isChosen) {
          if (conf === 'high') {
            badgeHtml = `<span style="display:inline-block;padding:2px 6px;border-radius:3px;background:rgba(46,204,113,0.2);color:#2ecc71;font-size:11px;font-weight:bold;margin-left:6px;">✓ SÂU SẮC (+5đ)</span>`;
            styleOverride = 'border-color:#2ecc71;background:rgba(46,204,113,0.12);color:#fff;';
          } else if (conf === 'medium') {
            badgeHtml = `<span style="display:inline-block;padding:2px 6px;border-radius:3px;background:rgba(241,196,15,0.2);color:#f1c40f;font-size:11px;font-weight:bold;margin-left:6px;">⚡ BỀ MẶT (+2đ)</span>`;
            styleOverride = 'border-color:#f1c40f;background:rgba(241,196,15,0.12);color:#fff;';
          } else {
            badgeHtml = `<span style="display:inline-block;padding:2px 6px;border-radius:3px;background:rgba(231,76,60,0.2);color:#e74c3c;font-size:11px;font-weight:bold;margin-left:6px;">⚠ THIẾU CĂN CỨ (+0đ)</span>`;
            styleOverride = 'border-color:#e74c3c;background:rgba(231,76,60,0.12);color:#fff;';
          }
        }
        return `
          <button class="obs-inference-btn ${confClass}" ${isDone ? 'disabled' : ''} onclick="pickObservationInference('${suspectId}', '${obs.id}', '${inf.id}')" style="${styleOverride}">
            <span class="inf-icon" style="${isChosen ? (conf === 'high' ? 'color:#2ecc71;' : (conf === 'medium' ? 'color:#f1c40f;' : 'color:#e74c3c;')) : ''}">${isChosen ? '✓ ' : '○ '}</span>
            <span class="inf-text">${inf.text} ${badgeHtml}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="obs-card ${isDone ? 'done' : ''}">
          <div class="obs-card-head">
            <span class="obs-num">ĐIỂM QUAN SÁT #${idx + 1}</span>
            <span class="obs-label"><b>${obs.label}</b></span>
            <span class="obs-status">${isDone ? '✓ ĐÃ CHỐT SUY LUẬN' : 'CHỜ ĐỌC VỊ'}</span>
          </div>
          <div class="obs-detail">${obs.detail}</div>
          <div class="obs-inferences-wrap">
            <div class="obs-inf-title">Suy luận của bạn từ chi tiết này:</div>
            <div class="obs-inferences-list">${inferenceBtns}</div>
          </div>
        </div>
      `;
    }).join('');

    const allDone = inspectedCount === obsList.length;
    const summaryHtml = allDone ? `
      <div class="obs-summary-box">
        <div class="obs-summary-title">HỒ SƠ TÂM LÝ & ĐẶC ĐIỂM (PROFILING HOÀN TẤT)</div>
        <p>Bạn đã quan sát kỹ lưỡng diện mạo của <strong>${suspect.name}</strong>. Các chi tiết này sẽ giúp bạn dễ dàng nhận diện sơ hở và bắt bẻ khi tiến hành thẩm vấn.</p>
      </div>
    ` : '';

    return `
      <div class="obs-modal-wrap">
        <div class="obs-header-desc" style="padding:12px;background:rgba(241,196,15,0.08);border-left:3px solid #f1c40f;border-radius:4px;margin-bottom:16px;font-size:13.5px;color:#efe2c0;line-height:1.5;">
          <strong>Nghệ thuật Đọc Vị của Holmes (Suspect Profiling):</strong><br>
          • <strong>Lợi ích:</strong> Đóng góp <strong>15% điểm số</strong> vào Bảng đánh giá Holmes Score (Observation Score).<br>
          • Giúp giải mã các dấu vết ngoại hình (mùi hương, bùn đất, vết rách) để chuẩn bị bằng chứng đối chất tâm lý.<br>
          • <em>Lưu ý: Sau khi chọn một nhánh suy luận, mắt xích sẽ được chốt cố định và không thể thay đổi lại!</em>
        </div>
        <div class="obs-list">${cardsHtml}</div>
        ${summaryHtml}
      </div>
    `;
  }

  openDetectiveModal(`Quan Sát & Đọc Vị: ${suspect.name}`, renderObservationBody());
}

function pickObservationInference(sId, oId, infId) {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  if (state.inspectedObservations[sId] && state.inspectedObservations[sId][oId]) {
    return; // Đã chốt lựa chọn
  }
  sound.pin();
  inspectObservation(sId, oId, infId);
  openObservationModal(sId);
  // Update button in location if open
  const obsBtnText = document.getElementById('obsBtnText_' + sId);
  const suspect = CASE ? CASE.suspects.find(s => s.id === sId) : null;
  if (obsBtnText && suspect && suspect.observations) {
    const count = Object.keys(state.inspectedObservations[sId] || {}).length;
    obsBtnText.textContent = `${count}/${suspect.observations.length} đã soi`;
  }
}

/* ============================================================
   INTERACTIVE INTERROGATION & CONTRADICTION HANDLERS
   ============================================================ */
function renderInterrogationHeader(suspect, locId) {
  const cred = getCredibilityLabel(state.suspectCredibility[suspect.id] || 100);
  const doneObs = Object.keys(state.inspectedObservations[suspect.id] || {}).length;
  const totalObs = suspect.observations ? suspect.observations.length : 0;
  const isGuarded = state.suspectGuard && state.suspectGuard[suspect.id];

  return `
    <div class="interrogate-header-box">
      <div class="interrogate-title-col">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="interrogate-title">THẨM VẤN ĐỐI TƯỢNG: ${suspect.name}</span>
          ${isGuarded ? `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;font-size:11px;font-weight:bold;">CẢNH GIÁC CAO ĐỘ (-50% sát thương tâm lý)</span>` : ''}
        </div>
        <div class="elim-cred-wrap" style="margin-top:6px;">
          <span class="elim-cred-lbl">Độ tin cậy:</span>
          <div class="credibility-bar" style="width:130px;height:7px;margin:0 8px;">
            <div class="credibility-fill ${cred.class}" id="interrogateCredBar_${suspect.id}" style="width:${state.suspectCredibility[suspect.id] || 100}%"></div>
          </div>
          <span class="elim-cred-val ${cred.class}" id="interrogateCredVal_${suspect.id}">${state.suspectCredibility[suspect.id] || 100}% (${cred.label})</span>
        </div>
      </div>
      <div class="interrogate-header-actions" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        ${totalObs > 0 ? `
          <button class="obs-trigger-btn" onclick="openObservationModal('${suspect.id}')">
            🔍 Soi diện mạo (<span id="obsBtnText_${suspect.id}">${doneObs}/${totalObs}</span>)
          </button>
        ` : ''}
        ${state.provisionalSuspect ? `
          <span class="prov-badge ${state.provisionalSuspect.id === suspect.id ? (state.provisionalSuspect.correct ? 'prov-correct' : 'prov-wrong') : 'prov-other'}" style="padding:6px 12px;border-radius:4px;font-size:12px;font-weight:bold;letter-spacing:0.5px;background:${state.provisionalSuspect.id === suspect.id ? (state.provisionalSuspect.correct ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)') : 'rgba(255,255,255,0.05)'};color:${state.provisionalSuspect.id === suspect.id ? (state.provisionalSuspect.correct ? '#2ecc71' : '#e74c3c') : '#888'};border:1px solid currentColor;">
            ${state.provisionalSuspect.id === suspect.id ? (state.provisionalSuspect.correct ? '🎯 ĐÃ NGHI VẤN (CHÍNH XÁC)' : '❌ ĐÃ NGHI VẤN (SAI LẦM)') : '⚖️ ĐÃ ĐẶT NGHI VẤN KHÁC'}
          </span>
        ` : `
          <button class="prov-trigger-btn secondary-btn" style="border-color:#f39c12;color:#f39c12;" onclick="promptProvisionalSuspicion('${suspect.id}', '${locId}')">
            ⚖️ Nghi vấn sơ bộ
          </button>
        `}
      </div>
    </div>
  `;
}

function renderInterrogationQuestions(suspect, locId) {
  const dialogues = getAvailableDialogues(suspect.id);
  const asked = state.dialogueProgress[suspect.id] || [];
  const contradictions = state.contradictionsFound[suspect.id] || [];

  let dialoguesHtml = dialogues.map((d, idx) => {
    const isAsked = asked.includes(d.id);
    const isContradicted = contradictions.includes(d.id);

    return `
      <div class="interrogate-item ${isAsked ? 'asked' : ''} ${isContradicted ? 'contradicted' : ''}" id="dlg_item_${d.id}">
        <div class="interrogate-q-row" onclick="toggleDialogueAnswer('${suspect.id}', '${d.id}')">
          <span class="dlg-idx">Q${idx + 1}</span>
          <span class="dlg-q-text">${d.question}</span>
          <span class="dlg-status-tag ${isContradicted ? 'tag-broken' : (isAsked ? 'tag-asked' : 'tag-new')}">
            ${isContradicted ? '⚡ ĐÃ BẺ GÃY MÂU THUẪN' : (isAsked ? '✓ ĐÃ HỎI' : 'CHƯA HỎI')}
          </span>
        </div>
        <div class="interrogate-answer-wrap ${isAsked ? 'open' : ''}" id="dlg_ans_${d.id}">
          <div class="dlg-bubble">
            <strong>${suspect.name}:</strong> "${d.answer}"
          </div>
          <div class="dlg-action-bar">
            ${!isContradicted ? `
              <button class="contradict-toggle-btn" onclick="openContradictionDualModal('${suspect.id}', '${d.id}', '${locId}')">
                ⚡ Vạch trần mâu thuẫn lời khai
              </button>
            ` : `
              <div class="contradict-success-badge">✓ Mâu thuẫn trong lời khai này đã bị bóc trần!</div>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const isBreakdown = (state.suspectCredibility[suspect.id] || 100) <= 35 && suspect.interrogation && suspect.interrogation.breakdownResponse;

  return `
    <div class="interrogate-list">${dialoguesHtml}</div>
    ${isBreakdown ? `
      <div class="suspect-breakdown-box" style="margin-top:12px;">
        <div class="breakdown-badge">💥 ĐỐI TƯỢNG VỠ TRẬN TÂM LÝ</div>
        <p>${suspect.interrogation.breakdownResponse}</p>
      </div>
    ` : ''}
  `;
}

function promptProvisionalSuspicion(suspectId, locId) {
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if (!suspect) return;

  openDetectiveModal(`⚖️ Đặt Nghi Vấn Sơ Bộ: ${suspect.name}`, `
    <div class="modal-profile-wrap">
      <div style="font-size:15.5px;color:#efe2c0;line-height:1.6;">
        <p>Bạn có chắc chắn muốn <strong>công khai đặt nghi vấn sơ bộ</strong> lên đối tượng <strong>${suspect.name}</strong> không?</p>
        <div style="margin:12px 0;padding:12px;background:rgba(241,196,15,0.1);border-left:3px solid #f1c40f;border-radius:4px;font-size:14px;color:#f1c40f;">
          <strong>Quy tắc rủi ro giữa chừng:</strong><br>
          • <strong>Nếu ĐÚNG (là hung thủ):</strong> Thưởng +15 điểm, đối tượng hoảng loạn giảm 20% độ tin cậy.<br>
          • <strong>Nếu SAI (người vô tội):</strong> Phạt -15 điểm, tốn 10 phút quý giá và đối tượng sẽ đề phòng, khép chặt lời khai.<br>
          <em>(Bạn chỉ có duy nhất 1 lần đặt nghi vấn sơ bộ trong suốt vụ án!)</em>
        </div>
      </div>
      <div class="btn-row" style="margin-top:18px;">
        <button class="secondary-btn" onclick="closeDetectiveModal()">← Cân nhắc thêm</button>
        <button class="continue-btn" onclick="confirmProvisionalSuspicion('${suspectId}', '${locId}')" style="background:#e67e22;">
          ⚖️ Xác nhận đặt nghi vấn
        </button>
      </div>
    </div>
  `);
}

function confirmProvisionalSuspicion(suspectId, locId) {
  closeDetectiveModal();
  const res = setProvisionalSuspect(suspectId);
  if (res.correct) {
    sound.correct();
  } else {
    sound.guardUp();
    renderTimeBar();
  }

  openDetectiveModal(res.correct ? '🎯 Nghi Vấn Thành Công' : '❌ Nghi Vấn Sai Lầm', `
    <div class="modal-profile-wrap">
      <div style="font-size:16px;line-height:1.6;color:${res.correct ? '#2ecc71' : '#e74c3c'};">
        ${res.msg}
      </div>
      <div class="btn-row" style="margin-top:20px;">
        <button class="continue-btn" onclick="closeDetectiveModal(); renderLocation('${locId}');">Tiếp tục điều tra</button>
      </div>
    </div>
  `);
}

function toggleDialogueAnswer(suspectId, dialogueId) {
  sound.click();
  askDialogue(suspectId, dialogueId);
  const item = document.getElementById('dlg_item_' + dialogueId);
  const ansBox = document.getElementById('dlg_ans_' + dialogueId);
  if (item) {
    item.classList.add('asked');
    const tag = item.querySelector('.dlg-status-tag');
    if (tag && !tag.classList.contains('tag-broken')) {
      tag.className = 'dlg-status-tag tag-asked';
      tag.textContent = '✓ ĐÃ HỎI';
    }
  }
  if (ansBox) ansBox.classList.toggle('open');
}

/* ============================================================
   SPLIT-SCREEN DUAL-VIEW CONTRADICTION MODAL
   ============================================================ */
var currentContraState = {
  suspectId: null,
  dialogueId: null,
  locId: null,
  selectedStatementIdx: 0,
  selectedClueId: null
};

function openContradictionDualModal(suspectId, dialogueId, locId) {
  if (state.time <= 0) {
    checkTimeoutAndRedirect();
    return;
  }
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if (!suspect || !suspect.interrogation) return;
  const dialogue = suspect.interrogation.dialogues.find(d => d.id === dialogueId);
  if (!dialogue) return;

  const statements = dialogue.statements || [dialogue.answer];
  currentContraState = {
    suspectId,
    dialogueId,
    locId,
    selectedStatementIdx: 0,
    selectedClueId: null
  };

  sound.reveal();
  renderContradictionDualModalContent(suspect, dialogue, statements);
}

function renderContradictionDualModalContent(suspect, dialogue, statements) {
  const statementCardsHtml = statements.map((stmt, idx) => {
    const isSel = currentContraState.selectedStatementIdx === idx;
    return `
      <div class="contra-statement-card ${isSel ? 'selected' : ''}" onclick="selectContraStatement(${idx})" style="padding:12px 14px;background:${isSel ? 'rgba(241,196,15,0.18)' : 'rgba(0,0,0,0.3)'};border:1px solid ${isSel ? '#f1c40f' : 'rgba(255,255,255,0.1)'};border-radius:6px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:11.5px;font-weight:700;color:${isSel ? '#f1c40f' : '#888'};">CÂU #${idx + 1}</span>
          <span style="font-size:11.5px;color:${isSel ? '#f1c40f' : '#666'};">${isSel ? '✓ ĐANG CHỌN' : 'BẤM ĐỂ CHỌN'}</span>
        </div>
        <div style="font-size:13.5px;color:#efe2c0;line-height:1.5;">"${stmt}"</div>
      </div>
    `;
  }).join('');

  const realClues = state.clues;
  const clueCardsHtml = realClues.length === 0 ? `
    <div style="font-size:13px;color:#888;font-style:italic;padding:20px;text-align:center;">
      Chưa có manh mối nào trong sổ tay.
    </div>
  ` : realClues.map(cId => {
    const c = CASE.evidence[cId];
    const isSel = currentContraState.selectedClueId === cId;
    return `
      <div class="contra-clue-card ${isSel ? 'selected' : ''}" onclick="selectContraClue('${cId}')" style="padding:10px 12px;background:${isSel ? 'rgba(46,204,113,0.18)' : 'rgba(0,0,0,0.3)'};border:1px solid ${isSel ? '#2ecc71' : 'rgba(255,255,255,0.1)'};border-radius:6px;margin-bottom:8px;cursor:pointer;transition:all 0.2s;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <strong style="color:${isSel ? '#2ecc71' : '#efe2c0'};font-size:13px;">${c.label}</strong>
          <span style="font-size:11px;color:${isSel ? '#2ecc71' : '#666'};">${isSel ? '✓ ĐÃ CHỌN' : ''}</span>
        </div>
        <div style="font-size:12.5px;color:#cdbf9e;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${c.text}</div>
      </div>
    `;
  }).join('');

  const selectedClue = currentContraState.selectedClueId ? CASE.evidence[currentContraState.selectedClueId] : null;

  const modalHtml = `
    <div style="font-family:'Segoe UI',sans-serif;">
      <div style="padding:10px 14px;background:rgba(231,76,60,0.1);border-left:3px solid #e74c3c;border-radius:4px;margin-bottom:16px;font-size:13px;color:#efe2c0;line-height:1.5;">
        <strong>Bác Bỏ Mâu Thuẫn Lời Khai (Direct Statement vs Evidence):</strong><br>
        1. Bấm chọn <strong>câu nói cụ thể</strong> chứa sơ hở hoặc dối trá bên cột trái.<br>
        2. Bấm chọn <strong>vật chứng phản bác</strong> bên cột phải, sau đó bấm <strong>"Vạch Trần Mâu Thuẫn"</strong>.
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(310px, 1fr));gap:18px;">
        <!-- Cột Trái: Lời Khai -->
        <div>
          <div style="font-weight:700;font-size:13.5px;color:#f1c40f;margin-bottom:10px;">
            LỜI KHAI: ${suspect.name.toUpperCase()}
          </div>
          <div style="font-size:12.5px;color:#888;margin-bottom:8px;"><em>Câu hỏi: "${dialogue.question}"</em></div>
          <div id="contraStatementList">${statementCardsHtml}</div>
        </div>

        <!-- Cột Phải: Sổ Tay Manh Mối -->
        <div>
          <div style="font-weight:700;font-size:13.5px;color:#2ecc71;margin-bottom:10px;">
            SỔ TAY VẬT CHỨNG (${realClues.length})
          </div>
          <div style="max-height:280px;overflow-y:auto;padding-right:4px;" id="contraClueList">
            ${clueCardsHtml}
          </div>
        </div>
      </div>

      <div style="margin-top:16px;padding:10px 14px;background:rgba(0,0,0,0.4);border-radius:6px;border:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div style="font-size:13px;color:#cdbf9e;">
          <strong>Mục tiêu đối chất:</strong> Câu #${currentContraState.selectedStatementIdx + 1} &nbsp;|&nbsp; 
          <strong>Vật chứng:</strong> <span style="color:${selectedClue ? '#2ecc71' : '#e74c3c'};">${selectedClue ? selectedClue.label : 'Chưa chọn'}</span>
        </div>
        <button class="continue-btn" id="btnExecuteContra" onclick="submitDualContradiction()" style="background:#e74c3c;white-space:nowrap;">
          Vạch Trần Mâu Thuẫn
        </button>
      </div>

      <div id="contraDualFeedback" style="margin-top:12px;"></div>
    </div>
  `;

  openDetectiveModal(`Đối Chất: ${suspect.name}`, modalHtml);
}

function selectContraStatement(idx) {
  sound.click();
  currentContraState.selectedStatementIdx = idx;
  const suspect = CASE.suspects.find(s => s.id === currentContraState.suspectId);
  const dialogue = suspect.interrogation.dialogues.find(d => d.id === currentContraState.dialogueId);
  const statements = dialogue.statements || [dialogue.answer];
  renderContradictionDualModalContent(suspect, dialogue, statements);
}

function selectContraClue(clueId) {
  sound.pin();
  currentContraState.selectedClueId = clueId;
  const suspect = CASE.suspects.find(s => s.id === currentContraState.suspectId);
  const dialogue = suspect.interrogation.dialogues.find(d => d.id === currentContraState.dialogueId);
  const statements = dialogue.statements || [dialogue.answer];
  renderContradictionDualModalContent(suspect, dialogue, statements);
}

function submitDualContradiction() {
  const { suspectId, dialogueId, locId, selectedStatementIdx, selectedClueId } = currentContraState;
  const fbEl = document.getElementById('contraDualFeedback');

  if (!selectedClueId) {
    if (fbEl) {
      fbEl.innerHTML = `<div style="padding:10px;background:rgba(231,76,60,0.15);border:1px solid #e74c3c;border-radius:4px;color:#e74c3c;font-size:13px;">Vui lòng chọn 1 manh mối ở cột bên phải để đối chất!</div>`;
    }
    return;
  }

  const res = contradictDialogue(suspectId, dialogueId, selectedClueId, selectedStatementIdx);

  if (res.success) {
    sound.exposeReveal();
    if (fbEl) {
      fbEl.innerHTML = `
        <div style="padding:14px;background:rgba(46,204,113,0.15);border:1px solid #2ecc71;border-radius:6px;color:#2ecc71;line-height:1.5;">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;">⚡ BẺ GÃY MÂU THUẪN THÀNH CÔNG! (Độ tin cậy ${res.credibilityHit}%)</div>
          <p style="color:#efe2c0;font-size:13.5px;margin-bottom:6px;">"${res.response}"</p>
          ${res.isGuarded ? '<div style="font-size:12px;color:#f39c12;">🛡️ Đối tượng đang cảnh giác cao độ nên chỉ giảm nhẹ độ tin cậy.</div>' : ''}
          ${res.newClueRevealed ? '<div style="color:#f1c40f;font-weight:bold;margin-top:4px;">✨ Mở khóa manh mối mới: ' + CASE.evidence[res.revealClueId].label + '</div>' : ''}
        </div>
      `;
    }
    const btn = document.getElementById('btnExecuteContra');
    if (btn) btn.disabled = true;
    setTimeout(() => {
      closeDetectiveModal();
      renderLocation(locId);
    }, 2200);
  } else {
    sound.wrong();
    renderTimeBar();
    const btn = document.getElementById('btnExecuteContra');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      }, 1200);
    }
    if (fbEl) {
      fbEl.innerHTML = `
        <div style="padding:12px;background:rgba(231,76,60,0.15);border:1px solid #e74c3c;border-radius:4px;color:#e74c3c;font-size:13px;line-height:1.5;">
          <strong>❌ Bác bỏ thất bại (-5 phút)!</strong><br>
          ${res.msg}
        </div>
      `;
    }
  }
}
