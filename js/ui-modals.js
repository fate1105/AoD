/* ============================================================
   UI-MODALS.JS — Hệ thống Modal Chuyên Biệt:
   Hồ sơ vụ án, Sổ tay manh mối, Ghi chép & Giả thuyết làm việc,
   Soi diện mạo, Thẩm vấn & Đối chất mâu thuẫn, Mind Palace.
   ============================================================ */

/* ============================================================
   CASE PROFILE & VICTIM MODAL
   ============================================================ */
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

/* ============================================================
   CLUES NOTEBOOK & SCOTLAND YARD SEALED REPORT
   ============================================================ */
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

/* ============================================================
   SCRATCHPAD & WORKING THEORIES MODAL
   ============================================================ */
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

/* ============================================================
   OBSERVATION & CHARACTER PROFILING MODAL
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
   MIND PALACE & HYPOTHESIS MODALS
   ============================================================ */
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

/* ============================================================
   INTERACTIVE INTERROGATION & CONTRADICTION MODALS
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

/* ============================================================
   HYPOTHESIS MODAL (Overlay trên Corkboard)
   ============================================================ */
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
  if (typeof updateCorkSvg === 'function') updateCorkSvg();
  if (typeof updateCorkSelInfo === 'function') updateCorkSelInfo();
  renderBoard();
}

/* ============================================================
   INSPECTOR'S FIELD MANUAL (TUTORIAL & ONBOARDING)
   ============================================================ */
let currentTutorialTab = 'overview';

function openTutorialModal(initialTab) {
  if (initialTab) currentTutorialTab = initialTab;
  sound.page();

  const tabs = [
    { id: 'overview', label: '1. Quy Trình Phá Án' },
    { id: 'observation', label: '2. Đọc Vị & Tâm Lý' },
    { id: 'contradiction', label: '3. Đối Chất Lời Khai' },
    { id: 'timeline', label: '4. Trục Thời Gian' },
    { id: 'corkboard', label: '5. Bảng Ghim & Mind Palace' },
    { id: 'accusation', label: '6. Buộc Tội 3 Chiều' }
  ];

  const tabButtonsHtml = tabs.map(t => `
    <button class="tutorial-tab-btn ${currentTutorialTab === t.id ? 'active' : ''}" onclick="selectTutorialTab('${t.id}')">
      ${t.label}
    </button>
  `).join('');

  let contentHtml = '';

  if (currentTutorialTab === 'overview') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">🕵️ 5 Bước Điều Tra Cốt Lõi Của Sherlock Holmes</div>
        <div class="tutorial-step-desc">
          Chào mừng bạn đến với <strong>Art of Deduction</strong>. Để phá giải một vụ án thành công, hãy tuân theo 5 bước logic sau:<br><br>
          <strong>Bước 1 — Khám Xét Hiện Trường:</strong> Thu thập vật chứng và tài liệu tại các phòng để mở khóa các mốc giờ và nghi phạm mới.<br>
          <strong>Bước 2 — Soi Diện Mạo & Đọc Vị:</strong> Vào phòng thẩm vấn, quan sát các chi tiết ngoại hình (bùn đất, mùi hương, vết rách) để đọc vị tâm lý.<br>
          <strong>Bước 3 — Bóc Trần Mâu Thuẫn:</strong> Tìm câu nói dối trong lời khai và đối chất bằng vật chứng tương phản chính xác.<br>
          <strong>Bước 4 — Phục Dựng Thời Gian (Timeline):</strong> Xếp các sự kiện vào đúng mốc giờ để làm lộ diện khoảng trống ngoại phạm của kẻ thủ ác.<br>
          <strong>Bước 5 — Buộc Tội 3 Chiều (WHO, HOW, WHY):</strong> Loại trừ người vô tội và kết án chính xác thủ phạm cùng cách thức & động cơ.
        </div>
      </div>
      <div class="tutorial-tip-badge">💡 MẸO NGHIỆP VỤ</div>
      <div style="font-size:12.5px;color:#cdbf9e;line-height:1.5;">
        • Hãy cẩn thận với <em>Bẫy Suy Luận (Red Herrings)</em> — một số manh mối ban đầu trông rất đáng ngờ nhưng thực chất chỉ là ngẫu nhiên.<br>
        • Quản lý thời gian cẩn thận: Mỗi lượt khám xét hoặc đối chất sai sẽ làm tiêu hao quỹ thời gian phong tỏa hiện trường.
      </div>
    `;
  } else if (currentTutorialTab === 'observation') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">👁️ Nghệ Thuật Quan Sát Vi Mô (Observation Score)</div>
        <div class="tutorial-step-desc">
          Khi tiếp cận một đối tượng trong phòng thẩm vấn, bấm <strong>"🔍 Soi diện mạo"</strong> để kích hoạt kính lúp quan sát:<br><br>
          • <strong>Điểm Sâu Sắc (High Confidence +5đ):</strong> Diễn giải sâu vào thói quen, tâm lý ẩn giấu và hành tung thực tế.<br>
          • <strong>Điểm Bề Mặt (Medium Confidence +2đ):</strong> Nhận định hiển nhiên nhưng chưa chạm tới cốt lõi.<br>
          • <strong>Thiếu Căn Cứ (Low Confidence +0đ):</strong> Suy đoán cảm tính thiếu cơ sở.<br><br>
          <em>Lưu ý: Sau khi chốt một lựa chọn quan sát, mắt xích sẽ được lưu vĩnh viễn và đóng góp 15% vào Chỉ số Holmes tổng kết.</em>
        </div>
      </div>
    `;
  } else if (currentTutorialTab === 'contradiction') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">⚡ Bóc Trần Mâu Thuẫn Song Song (Split-Screen Dual View)</div>
        <div class="tutorial-step-desc">
          Khi phát hiện lời khai có điểm bất thường, bấm <strong>"⚡ Vạch trần mâu thuẫn"</strong>:<br><br>
          1. <strong>Cột Trái:</strong> Bấm chọn đúng <em>câu nói cụ thể</em> chứa điều dối trá.<br>
          2. <strong>Cột Phải:</strong> Chọn đúng <em>vật chứng mâu thuẫn</em> trong Sổ tay.<br>
          3. Bấm <strong>"Vạch Trần Mâu Thuẫn"</strong> để phá vỡ tâm lý đối tượng, làm tụt giảm độ tin cậy và mở khóa lời khai bí mật mới.<br><br>
          <span style="color:#e74c3c;">⚠️ Phạt thời gian: Đối chất sai câu hoặc sai vật chứng sẽ bị trừ -5 phút điều tra!</span>
        </div>
      </div>
    `;
  } else if (currentTutorialTab === 'timeline') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">⏱️ Phục Dựng Trục Thời Gian (Timeline Reconstruction)</div>
        <div class="tutorial-step-desc">
          Bấm phím <strong>T</strong> hoặc biểu tượng Đồng hồ trên thanh điều hướng để mở Bàn Phục Dựng Thời Gian:<br><br>
          • Kéo hoặc bấm chọn các sự kiện để gán vào các mốc giờ tương ứng (từ sáng đến đêm).<br>
          • Dựa vào thời gian trên vé xe buýt, đồng hồ chết, lời khai người làm và báo cáo khám nghiệm.<br>
          • Khi hoàn tất toàn bộ mốc giờ chính xác, bạn nhận <strong>+15 điểm Timeline Score</strong> và lộ diện hung thủ không có chứng cứ ngoại phạm!
        </div>
      </div>
    `;
  } else if (currentTutorialTab === 'corkboard') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">📌 Bảng Ghim Corkboard & Lâu Đài Tư Duy (Mind Palace)</div>
        <div class="tutorial-step-desc">
          Bấm phím <strong>B</strong> để mở Bảng Ghim điều tra vật lý:<br><br>
          • <strong>Kéo thả thẻ ghim:</strong> Sắp xếp tự do trên mặt gỗ gụ hoặc bấm <strong>"📐 Căn Lưới"</strong> để sắp xếp tự động.<br>
          • <strong>Nối chỉ suy luận:</strong> Bấm chọn 2 hoặc nhiều thẻ ghim, sau đó bấm <strong>"🔗 Phân tích liên kết"</strong> để xác lập 1 trong 5 mối quan hệ logic (Hỗ trợ, Bác bỏ, Minh oan, Giải thích, Củng cố).<br>
          • <strong>🧠 Lâu Đài Tư Duy (Mind Palace):</strong> Mở khóa các nút tư duy đa tầng để xâu chuỗi bản chất của vụ án.
        </div>
      </div>
    `;
  } else if (currentTutorialTab === 'accusation') {
    contentHtml = `
      <div class="tutorial-step-box">
        <div class="tutorial-step-title">⚖️ Buộc Tội 3 Chiều & Sàng Lọc Ngoại Phạm (WHO - HOW - WHY)</div>
        <div class="tutorial-step-desc">
          Giai đoạn phán quyết tối hậu gồm 2 phần nghiêm ngặt:<br><br>
          <strong>1. Loại trừ người vô tội:</strong> Dùng đúng chứng cứ ngoại phạm để minh oan cho những người không liên quan trước khi kết án.<br>
          <strong>2. Buộc tội 3 chiều:</strong><br>
          • <strong>WHO (Ai là thủ phạm?):</strong> Chọn đối tượng có khoảng trống thời gian và mâu thuẫn chưa được giải thích.<br>
          • <strong>HOW (Bằng cách nào?):</strong> Chọn chính xác công cụ và phương thức gây án.<br>
          • <strong>WHY (Tại sao?):</strong> Chọn động cơ thúc đẩy thực sự của kẻ thủ ác.
        </div>
      </div>
    `;
  }

  const html = `
    <div class="tutorial-wrap">
      <div class="tutorial-tab-bar">
        ${tabButtonsHtml}
      </div>
      <div style="max-height:420px;overflow-y:auto;padding-right:4px;">
        ${contentHtml}
      </div>
      <div class="btn-row" style="margin-top:18px;justify-content:space-between;align-items:center;">
        <button class="secondary-btn" onclick="closeDetectiveModal()">Đóng sổ tay</button>
        <button class="continue-btn" onclick="closeDetectiveModal()">Đã nắm vững, vào phá án ➔</button>
      </div>
    </div>
  `;

  openDetectiveModal('📖 Sổ Tay Nghiệp Vụ Thám Tử (Inspector\'s Field Manual)', html);
}

function selectTutorialTab(tabId) {
  sound.click();
  currentTutorialTab = tabId;
  openTutorialModal(tabId);
}
