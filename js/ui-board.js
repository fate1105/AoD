/* ============================================================
   UI-BOARD.JS — Bảng Ghim Điều Tra Corkboard, Kéo Thả Thẻ Manh Mối,
   Đường Nối Sợi Chỉ SVG, & Modal Phân Tích Tổng Hợp 5 Mối Quan Hệ.
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

  setScene(`
    <div class="cork-scene">
      <div class="cork-header">
        <div>
          <div class="chapter-label">Sổ tay thám tử</div>
          <div class="cork-title">Bảng Ghim & Giả Thuyết Suy Luận</div>
          <div class="cork-subtitle">Kéo thẻ để sắp xếp &nbsp;·&nbsp; Bấm 1 lần để chọn/bỏ chọn &nbsp;·&nbsp; Bấm đôi để xem chi tiết</div>
        </div>
        <div class="cork-actions">
          <button class="secondary-btn" id="corkArrangeBtn" onclick="autoArrangeCorkGrid()" title="Tự động sắp xếp lại các ghim ngay ngắn theo lưới">
            📐 Căn Lưới
          </button>
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

      <!-- Corkboard Pin Legend & Mobile Actions -->
      <div class="cork-legend-bar" style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:#cdbf9e;background:rgba(0,0,0,0.35);padding:7px 14px;border-radius:5px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;gap:8px;">
        <span>📌 <strong>Sổ tay hiện trường:</strong> Bấm chọn thẻ ghim để đối chiếu mối liên hệ. Kéo thả tự do hoặc bấm <strong>"📐 Căn Lưới"</strong>.</span>
        <button class="secondary-btn" style="padding:3px 8px;font-size:11px;" onclick="autoArrangeCorkGrid()">📐 Sắp xếp gọn gàng</button>
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
    card.className = 'cork-pin' + (isSel ? ' selected' : '') + (c.key ? ' key-pin' : '');
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

    // — drag (Mouse & Mobile Touch)
    _setupCorkDrag(card, k, board);
    board.appendChild(card);
  });

  updateCorkSvg();
  updateCorkSelInfo();
  renderBoard();
}

function autoArrangeCorkGrid() {
  if (!CASE) return;
  sound.pin();
  const realClues = state.clues.filter(k => !CASE.evidence[k].decoy);
  const board = document.getElementById('corkboard');
  const boardWidth = board ? board.clientWidth : 800;
  const CARD_W = boardWidth < 500 ? 135 : 155;
  const CARD_H = boardWidth < 500 ? 115 : 130;
  const gapX = boardWidth < 500 ? 12 : 20;
  const gapY = boardWidth < 500 ? 12 : 20;

  const cols = Math.max(2, Math.floor((boardWidth - 24) / (CARD_W + gapX)));

  realClues.forEach((k, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const nx = 16 + col * (CARD_W + gapX);
    const ny = 20 + row * (CARD_H + gapY);
    state.cluePositions[k] = { x: nx, y: ny };
    const card = (typeof document !== 'undefined' && typeof document.querySelector === 'function') ? document.querySelector(`.cork-pin[data-id="${k}"]`) : null;
    if (card) {
      card.style.left = nx + 'px';
      card.style.top = ny + 'px';
    }
  });

  updateCorkSvg();
  if (CASE && typeof saveCurrentGameState === 'function') {
    saveCurrentGameState(CASE.id);
  }
}

function _setupCorkDrag(card, clueId, board) {
  let dragging = false, sx, sy, ox, oy;

  const onMove = e => {
    const cx = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    const cy = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    if (cx === null || cy === null) return;
    const dx = cx - sx, dy = cy - sy;
    if (!dragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragging = true;
      card._dragged = true;
      card.classList.add('dragging');
      card.style.zIndex = 250;
    }
    if (!dragging) return;
    if (e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    const bRect = board.getBoundingClientRect();
    const maxX = Math.max(10, bRect.width - card.offsetWidth - 4);
    const maxY = Math.max(10, bRect.height - card.offsetHeight - 4);
    const nx = Math.max(4, Math.min(maxX, ox + dx));
    const ny = Math.max(4, Math.min(maxY, oy + dy));
    state.cluePositions[clueId] = { x: nx, y: ny };
    card.style.left = nx + 'px';
    card.style.top = ny + 'px';
    updateCorkSvg();
  };

  const onUp = () => {
    card.style.zIndex = '';
    card.classList.remove('dragging');
    if (dragging) {
      if (CASE && typeof saveCurrentGameState === 'function') {
        saveCurrentGameState(CASE.id);
      }
    }
    dragging = false;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  };

  // Pointer event support
  card.addEventListener('pointerdown', e => {
    if (e.target.closest('.pin-detail-link')) return;
    card._dragged = false;
    sx = e.clientX;
    sy = e.clientY;
    ox = state.cluePositions[clueId]?.x || 20;
    oy = state.cluePositions[clueId]?.y || 20;
    try {
      card.setPointerCapture(e.pointerId);
    } catch (err) {}
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  });

  // Direct Touch event fallback
  card.addEventListener('touchstart', e => {
    if (e.touches && e.touches.length === 1) {
      card._dragged = false;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      ox = state.cluePositions[clueId]?.x || 20;
      oy = state.cluePositions[clueId]?.y || 20;
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }
  }, { passive: true });
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
    info.innerHTML = 'Chưa chọn thẻ nào &mdash; bấm vào một ghim để chọn';
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
