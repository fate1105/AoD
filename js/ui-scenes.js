/* ============================================================
   UI-SCENES.JS — Quản lý các Scene chính:
   1. Case Select (Tủ hồ sơ vụ án)
   2. Start / Hub (Hiện trường & Đối tượng)
   3. Location (Khám xét & Thẩm vấn)
   4. Decision (Buộc tội 3 chiều: WHO, HOW, WHY)
   5. Ending (Holmes Index, Tủ huân chương, Replay suy luận)
   6. RENDER Map.
   ============================================================ */

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
  const hasActiveSave = isSelUnlocked && !selCase.comingSoon && typeof hasSavedGame === 'function' && hasSavedGame(selCase.id);

  if (selCase.comingSoon) {
    ctaBtnHtml = `<button class="start-cta locked" style="width:100%;opacity:0.6;cursor:not-allowed;font-size:13px;padding:9px;" disabled>🔒 Vụ án đang được soạn thảo (Sắp ra mắt)</button>`;
  } else if (!isSelUnlocked) {
    ctaBtnHtml = `<button class="start-cta locked" style="width:100%;opacity:0.6;cursor:not-allowed;font-size:13px;padding:9px;" disabled>🔒 Cần hoàn thành vụ án trước để mở khóa</button>`;
  } else if (hasActiveSave) {
    ctaBtnHtml = `
      <div class="active-save-banner">
        <div class="active-save-info">
          <strong>💾 Phát hiện tiến trình điều tra đang dở dang!</strong><br>
          <span style="font-size:11.5px;color:#cdbf9e;">Bạn có thể tiếp tục với những manh mối & mốc thời gian đã khám phá hoặc bắt đầu lại vụ án từ đầu.</span>
        </div>
        <div class="active-save-actions">
          <button class="btn-resume-session" onclick="resumeSavedCase(${selectedCasePreviewIndex})">
            ▶ Tiếp Tục Điều Tra
          </button>
          <button class="btn-restart-session" onclick="selectCase(${selectedCasePreviewIndex})">
            🔄 Bắt Đầu Lại
          </button>
        </div>
      </div>
    `;
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
  if (typeof clearCurrentGameSave === 'function') {
    clearCurrentGameSave(CASE.id);
  }
  beginInvestigation();
}

function resumeSavedCase(index) {
  sound.page();
  currentCaseIndex = index;
  CASE = CASES[index];
  const success = loadCurrentGameState(CASE.id);
  if (!success) {
    selectCase(index);
    return;
  }
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
  if (typeof ambientAudio !== 'undefined' && ambientAudio.isEnabled()) {
    ambientAudio.start();
  }
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

/* ============================================================
   LOCATION & INTERROGATION SCENE
   ============================================================ */
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
   ENDING & PERFORMANCE METRICS
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
   RENDER MAP
   ============================================================ */
const RENDER = {
  caseSelect: renderCaseSelect,
  start: renderStart,
  hub: renderHub,
  board: renderBoardScene,
  decision: renderDecision,
  ending: renderEnding,
};
