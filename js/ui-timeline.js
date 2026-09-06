/* ============================================================
   UI-TIMELINE.JS — Hệ thống Phục Dựng Trục Thời Gian (Chronology Reconstruction Puzzle).
   ============================================================ */

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
