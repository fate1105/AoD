/* ============================================================
   ENGINE.JS — logic thuần, không đụng tới nội dung vụ án cụ thể.
   Đọc dữ liệu từ CASE hiện hành (đặt bởi ui.js khi chọn vụ án).
   ============================================================ */

var CASE = null; // vụ án đang chơi, gán khi người chơi chọn từ CASES

var state = {
  time: 0,
  clues: [],
  score: 0,
  visitedLocations: [],
  inspectedItems: [],
  hypothesesAnswered: {},
  boardSelection: [],
  activeTab: 'evidence',
  chosenSuspect: null,
  hintsUsed: 0,       // đếm số lần dùng hint trong một vụ
  hintLevel: {},      // { hypId: level } — 0=chưa dùng, 1=vague đã dùng, 2=specific đã dùng
  suspectCredibility: {}, // { suspectId: score }
  eliminatedSuspects: {}, // { suspectId: clueId }
  expiredClues: [],
  chosenMethod: null,
  chosenMotive: null,
  cluePositions: {},   // { clueId: {x, y} } — vị trí ghim trên bảng
  
  // — Holmes Extension State —
  inspectedObservations: {}, // { [suspectId]: { [obsId]: inferenceId } }
  dialogueProgress: {},      // { [suspectId]: [dialogueId] }
  contradictionsFound: {},   // { [suspectId]: [dialogueId] }
  mindPalaceChoices: {},     // { [nodeId]: branchId }
  hypotheses: [],            // [ { id, suspect, motive, method, status } ]
  timelineSlots: {},         // { [timeSlot]: eventId }
  timelineCompleted: false,  // true khi phục dựng thành công toàn bộ trục thời gian
  corkboardConnections: [],  // [ { clues: [a, b], type, label } ]
  deductionScore: {},        // { observation, evidence, interrogation, contradiction, timeline, deduction, finalAccusation, total }
  timeBorrowCount: 0,        // số lần khẩn cầu gia hạn thời gian
  timeBorrowed: 0,           // tổng số phút đã vay
  difficultyMode: 'standard', // 'standard' (Chuẩn) | 'casual' (Thư Giãn)
  mistakesCount: { contradiction: 0, timeline: 0, mindPalace: 0 }
};

function resetState(){
  state.time = CASE.timeBudget;
  state.clues = [];
  state.score = 0;
  state.visitedLocations = [];
  state.inspectedItems = [];
  state.hypothesesAnswered = {};
  state.boardSelection = [];
  state.activeTab = 'evidence';
  state.chosenSuspect = null;
  state.hintsUsed = 0;
  state.hintLevel = {};
  state.suspectCredibility = {};
  state.eliminatedSuspects = {};
  state.expiredClues = [];
  state.chosenMethod = null;
  state.chosenMotive = null;
  state.cluePositions = {};
  state.accusationStep = null;
  state.timeBorrowCount = 0;
  state.timeBorrowed = 0;
  state.mistakesCount = { contradiction: 0, timeline: 0, mindPalace: 0 };
  if (!state.difficultyMode) state.difficultyMode = 'standard';
  
  // Holmes Extensions Reset
  state.inspectedObservations = {};
  state.dialogueProgress = {};
  state.contradictionsFound = {};
  state.mindPalaceChoices = {};
  state.hypotheses = [];
  state.timelineSlots = {};
  state.timelineCompleted = false;
  state.corkboardConnections = [];
  state.deductionScore = {};
  state.provisionalSuspect = null;
  state.suspectGuard = {};
  
  // Khởi tạo credibility cho tất cả suspects
  if(CASE && CASE.suspects){
    CASE.suspects.forEach(s => {
      state.suspectCredibility[s.id] = 100;
      state.inspectedObservations[s.id] = {};
      state.dialogueProgress[s.id] = [];
      state.contradictionsFound[s.id] = [];
    });
  }
  
  pendingReveals = {};
}
let pendingReveals = {};

function requiredKeyEvidence(){
  return Object.keys(CASE.evidence).filter(k=>CASE.evidence[k].key);
}

function getClueRelation(clueIds){
  if(!CASE || !CASE.clueRelations || !Array.isArray(clueIds) || clueIds.length < 2) return null;
  return CASE.clueRelations.find(r => 
    r.clues.length === clueIds.length && r.clues.every(c => clueIds.includes(c))
  ) || null;
}

/* ---------- suspect visibility (điều kiện mở khóa nghi phạm) ---------- */
function isSuspectVisible(suspect){
  if(!suspect.revealAfter) return true; // không có điều kiện → luôn hiện
  return suspect.revealAfter.every(clueId => state.clues.includes(clueId));
}

function getVisibleSuspects(){
  return CASE.suspects.filter(s => isSuspectVisible(s));
}

function getNewlyRevealedSuspect(){
  // Trả về suspect vừa được mở khóa ở lần addClue mới nhất (nếu có)
  return CASE.suspects.find(s =>
    s.revealAfter &&
    s.revealAfter.every(id => state.clues.includes(id)) &&
    // Tất cả clue điều kiện vừa đủ (clue cuối cùng vừa được thêm)
    s.revealAfter.some(id => id === state.clues[state.clues.length - 1])
  ) || null;
}

/* ---------- provisional suspicion (nghi vấn sơ bộ giữa game) ---------- */
function setProvisionalSuspect(suspectId){
  if(state.provisionalSuspect) {
    return { success: false, msg: 'Bạn đã sử dụng quyền đặt nghi vấn sơ bộ cho vụ án này rồi!' };
  }

  const truth = CASE.truth || CASE;
  const isCorrect = (suspectId === truth.correctSuspect);
  state.provisionalSuspect = { id: suspectId, correct: isCorrect };

  if (isCorrect) {
    state.score += 15;
    state.suspectCredibility[suspectId] = Math.max(0, (state.suspectCredibility[suspectId] || 100) - 20);
    return {
      success: true,
      correct: true,
      scoreDelta: 15,
      credibilityHit: -20,
      msg: '🎯 Trực giác thám tử sắc bén (+15 điểm)! Đối tượng chột dạ, lộ rõ vẻ hoang mang và bị giảm 20% độ tin cậy.'
    };
  } else {
    state.score = Math.max(0, state.score - 15);
    spendTime(10);
    state.suspectGuard[suspectId] = true;
    return {
      success: true,
      correct: false,
      scoreDelta: -15,
      timePenalty: 10,
      msg: '❌ Nghi vấn sai lầm (-15 điểm, -10 phút)! Bạn đặt nghi vấn lên người vô tội khiến đối tượng đề phòng và đóng chặt lời khai.'
    };
  }
}

/* ---------- credibility label ---------- */
function getCredibilityLabel(score){
  if(score >= 90) return { label: 'Chưa rõ', class: 'cred-neutral' };
  if(score >= 70) return { label: 'Có điểm ngờ', class: 'cred-low' };
  if(score >= 40) return { label: 'Đáng ngờ', class: 'cred-med' };
  return { label: 'Rất đáng ngờ', class: 'cred-high' };
}

/* ---------- elimination ---------- */

function eliminateSuspect(suspectId, clueId){
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if(!suspect || !suspect.eliminateWith) return false;

  if(suspect.eliminateWith.includes(clueId)){
    state.eliminatedSuspects[suspectId] = clueId;
    state.score += 10;

    // Tự động cập nhật giả thuyết đang theo dõi gán cho nghi phạm này thành eliminated
    (state.hypotheses || []).forEach(h => {
      if(h.suspect === suspectId && h.status === 'active'){
        setHypothesisStatus(h.id, 'eliminated');
        h.eliminatedByClue = clueId;
      }
    });

    return true;
  }
  return false;
}

function isClueAvailable(clueId){
  return !state.expiredClues.includes(clueId);
}

/* ---------- save system: per-case progress ---------- */
const SAVE_KEY = 'detective_game_save_v1';
function loadSave(){
  try{
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(raw && raw.cases) return raw;
  }catch(e){}
  return {cases:{}};
}
function getCaseSave(caseId){
  const save = loadSave();
  return save.cases[caseId] || {endings:[], bestScore:0, completed:false, achievements:[]};
}
function persistEnding(caseId, endingId, score){
  const save = loadSave();
  const cur = save.cases[caseId] || {endings:[], bestScore:0, completed:false, achievements:[]};
  if(!cur.endings.includes(endingId)) cur.endings.push(endingId);
  cur.bestScore = Math.max(cur.bestScore||0, score);
  cur.completed = true;
  save.cases[caseId] = cur;
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
function isCaseUnlocked(index){
  if(index === 0) return true;
  const prev = CASES[index-1];
  if(prev.comingSoon) return false;
  return getCaseSave(prev.id).completed;
}

/* ---------- achievements ---------- */
const ACHIEVEMENTS = {
  all_clues:          { id:'all_clues',          icon:'🔍', label:'Mắt Thám Tử',          desc:'Thu thập 100% manh mối thật' },
  speedrun:           { id:'speedrun',           icon:'⚡', label:'Thần Tốc',              desc:'Hoàn thành với ≥60% thời gian còn lại' },
  no_hint:            { id:'no_hint',            icon:'🎯', label:'Không Cần Gợi Ý',      desc:'Kết thúc vụ án mà không dùng hint lần nào' },
  perfect_hyp:        { id:'perfect_hyp',        icon:'🧠', label:'Suy Luận Hoàn Hảo',     desc:'Trả lời đúng tất cả giả thuyết' },
  perfect_end:        { id:'perfect_end',        icon:'🏆', label:'Thám Tử Hoàn Hảo',      desc:'Đạt kết cục Perfect' },
  comeback:           { id:'comeback',           icon:'🔄', label:'Chuyên Gia',            desc:'Chơi lại vụ án đã hoàn thành và đạt Perfect' },
  systematic_thinker: { id:'systematic_thinker', icon:'💡', label:'Nhà Tư Duy Hệ Thống',  desc:'Tạo ≥3 giả thuyết làm việc trong quá trình phá án' },
};

function checkAchievements(endingId, idx){
  const earned = [];
  const caseSave = getCaseSave(CASE.id);
  const alreadyHas = a => (caseSave.achievements||[]).includes(a);

  // Mắt Thám Tử — thu thập tất cả clue thật
  const realEntries = Object.values(CASE.evidence).filter(e=>!e.decoy);
  const realCollected = state.clues.filter(k=>!CASE.evidence[k].decoy).length;
  if(realCollected === realEntries.length && !alreadyHas('all_clues')) earned.push('all_clues');

  // Thần Tốc — ≥60% thời gian còn lại
  if(state.time >= CASE.timeBudget * 0.6 && !alreadyHas('speedrun')) earned.push('speedrun');

  // Không Cần Gợi Ý
  if(state.hintsUsed === 0 && !alreadyHas('no_hint')) earned.push('no_hint');

  // Suy Luận Hoàn Hảo
  const correctHyp = Object.values(state.hypothesesAnswered).filter(h=>h.correct).length;
  if(correctHyp === CASE.hypotheses.length && !alreadyHas('perfect_hyp')) earned.push('perfect_hyp');

  // Thám Tử Hoàn Hảo
  if(endingId === 'perfect' && !alreadyHas('perfect_end')) earned.push('perfect_end');

  // Chuyên Gia — chơi lại (đã có perfect trước đó) và lại đạt perfect
  if(endingId === 'perfect' && alreadyHas('perfect_end') && !alreadyHas('comeback')) earned.push('comeback');

  // Nhà Tư Duy Hệ Thống — tạo ≥3 working hypotheses
  if((state.hypotheses || []).length >= 3 && !alreadyHas('systematic_thinker')) earned.push('systematic_thinker');

  // Lưu achievement mới vào save
  if(earned.length > 0){
    const save = loadSave();
    const cur = save.cases[CASE.id] || {endings:[], bestScore:0, completed:false, achievements:[]};
    if(!cur.achievements) cur.achievements = [];
    earned.forEach(a => { if(!cur.achievements.includes(a)) cur.achievements.push(a); });
    save.cases[CASE.id] = cur;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }
  return earned;
}

/* ---------- time ---------- */
function spendTime(n){
  state.time = Math.max(0, state.time - n);
  
  // Check for expired clues
  Object.keys(CASE.evidence).forEach(id => {
    const clue = CASE.evidence[id];
    if(clue.expiresAt && state.time <= clue.expiresAt && !state.inspectedItems.includes(id) && !state.expiredClues.includes(id)){
      state.expiredClues.push(id);
    }
  });
}

/* ---------- time borrowing / khẩn cầu gia hạn điều tra ---------- */
function canBorrowTime(){
  const maxBorrows = state.difficultyMode === 'casual' ? 3 : 2;
  const count = state.timeBorrowCount || 0;
  return count < maxBorrows;
}

function borrowTime(){
  const maxBorrows = state.difficultyMode === 'casual' ? 3 : 2;
  if(!canBorrowTime()){
    return { success: false, msg: `Bạn đã sử dụng hết quyền khẩn cầu gia hạn điều tra (tối đa ${maxBorrows} lần) cho vụ án này!` };
  }
  state.timeBorrowCount = (state.timeBorrowCount || 0) + 1;
  state.timeBorrowed = (state.timeBorrowed || 0) + 15;
  state.time += 15;
  return {
    success: true,
    addedMins: 15,
    penalty: 8,
    borrowCount: state.timeBorrowCount,
    remainingBorrows: maxBorrows - state.timeBorrowCount,
    newTime: state.time,
    msg: `⏱️ Đã gia hạn thành công +15 phút điều tra! (Phạt -8 điểm Uy Tín Thám Tử khi tổng kết). Còn lại ${maxBorrows - state.timeBorrowCount} lần gia hạn.`
  };
}

/* ---------- evidence ---------- */
function addClue(key){
  if(!state.clues.includes(key)){
    const c = CASE.evidence[key];
    state.clues.push(key);
    if(!c.decoy) state.score += c.key ? 10 : 5;
    return true;
  }
  return false;
}

/* ============================================================
   HOLMES EXTENSION ENGINE FUNCTIONS
   ============================================================ */

/* 1. Observation & Character Profiling */
function inspectObservation(suspectId, obsId, inferenceId){
  if(!state.inspectedObservations[suspectId]) state.inspectedObservations[suspectId] = {};
  state.inspectedObservations[suspectId][obsId] = inferenceId;

  const suspect = CASE.suspects.find(s => s.id === suspectId);
  const obs = suspect && suspect.observations ? suspect.observations.find(o => o.id === obsId) : null;
  const inf = obs && obs.inferences ? obs.inferences.find(i => i.id === inferenceId) : null;
  const conf = inf ? inf.confidence : 'medium';

  let scoreDelta = 5;
  if(conf === 'high') scoreDelta = 5;
  else if(conf === 'medium') scoreDelta = 2;
  else scoreDelta = 0;

  state.score += scoreDelta;
  return { success: true, confidence: conf, scoreDelta };
}

function getSuspectObservations(suspectId){
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  return suspect && suspect.observations ? suspect.observations : [];
}

/* 2. Interactive Interrogation & Contradiction Tree */
function getAvailableDialogues(suspectId){
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if(!suspect || !suspect.interrogation || !suspect.interrogation.dialogues) return [];
  
  const tree = CASE.interrogationTree && CASE.interrogationTree[suspectId] ? CASE.interrogationTree[suspectId] : {};
  return suspect.interrogation.dialogues.filter(d => {
    const rule = tree[d.id];
    if(!rule || !rule.unlockRequires || rule.unlockRequires.length === 0) return true;
    return rule.unlockRequires.every(req => state.clues.includes(req));
  });
}

function askDialogue(suspectId, dialogueId){
  if(!state.dialogueProgress[suspectId]) state.dialogueProgress[suspectId] = [];
  if(!state.dialogueProgress[suspectId].includes(dialogueId)){
    state.dialogueProgress[suspectId].push(dialogueId);
  }
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if(!suspect || !suspect.interrogation) return null;
  return suspect.interrogation.dialogues.find(d => d.id === dialogueId) || null;
}

function contradictDialogue(suspectId, dialogueId, clueId, statementIdx){
  const suspect = CASE.suspects.find(s => s.id === suspectId);
  if(!suspect || !suspect.interrogation) return { success: false, msg: 'Nghi phạm không tồn tại' };

  const dialogue = suspect.interrogation.dialogues.find(d => d.id === dialogueId);
  const tree = CASE.interrogationTree && CASE.interrogationTree[suspectId] ? CASE.interrogationTree[suspectId][dialogueId] : null;
  const targetClue = (tree && tree.contradictionClue) || (dialogue && dialogue.contradictionClue);
  const targetStatementIdx = dialogue && dialogue.contradictionStatementIdx !== undefined ? dialogue.contradictionStatementIdx : null;

  // Kiểm tra câu nói: nếu dialogue có định nghĩa contradictionStatementIdx và người chơi chọn statementIdx
  const isStatementCorrect = targetStatementIdx === null || statementIdx === undefined || statementIdx === targetStatementIdx;
  const isCorrect = targetClue && targetClue === clueId && isStatementCorrect;

  if(!isCorrect){
    if (!state.mistakesCount) state.mistakesCount = { contradiction: 0, timeline: 0, mindPalace: 0 };
    state.mistakesCount.contradiction = (state.mistakesCount.contradiction || 0) + 1;
    const isFirstMistake = state.mistakesCount.contradiction === 1;

    const penaltyMins = isFirstMistake ? 0 : (state.difficultyMode === 'casual' ? 2 : 5);
    if (penaltyMins > 0) spendTime(penaltyMins);

    let msg = '';
    if(!isStatementCorrect && targetClue === clueId) {
      msg = 'Bạn chọn đúng manh mối nhưng chưa chọn đúng câu nói/chi tiết mâu thuẫn trong lời khai!';
    } else {
      msg = 'Manh mối này không mâu thuẫn trực tiếp với câu nói được chọn.';
    }

    if (isFirstMistake) {
      msg += ' (⚠️ Miễn trừ phạt thời gian cho lần thử đầu tiên!)';
    } else {
      msg += ` (Đã trừ -${penaltyMins} phút điều tra).`;
    }

    return {
      success: false,
      isFirstMistake,
      penaltyMins,
      msg
    };
  }

  // Bắt bẻ đúng
  if(!state.contradictionsFound[suspectId]) state.contradictionsFound[suspectId] = [];
  if(!state.contradictionsFound[suspectId].includes(dialogueId)){
    state.contradictionsFound[suspectId].push(dialogueId);
  }

  let hit = (tree && tree.credibilityImpact) || (dialogue && dialogue.credibilityImpact) || -25;
  
  // Hiệu ứng Suspect Guard: Nếu đối tượng đang cảnh giác cao độ do thám tử từng nghi oan, giảm 50% hiệu ứng trừ độ tin cậy
  let isGuarded = false;
  if(state.suspectGuard && state.suspectGuard[suspectId]){
    isGuarded = true;
    hit = Math.round(hit * 0.5);
  }

  state.suspectCredibility[suspectId] = Math.max(0, (state.suspectCredibility[suspectId] || 100) + hit);
  state.score += 20;

  let newClueRevealed = false;
  const revealId = (tree && tree.revealClueId) || (dialogue && dialogue.revealClueId);
  if(revealId && !state.clues.includes(revealId)){
    addClue(revealId);
    newClueRevealed = true;
  }

  return {
    success: true,
    response: dialogue.contradictionResponse || 'Đối tượng ấp úng và không thể giải thích mâu thuẫn!',
    credibilityHit: hit,
    isGuarded,
    newClueRevealed,
    revealClueId: revealId
  };
}

/* 3. Timeline Reconstruction Puzzle Functions */
function assignTimelineSlot(timeSlot, eventId){
  if(!state.timelineSlots) state.timelineSlots = {};
  // Nếu eventId này đã được gán ở slot khác, gỡ khỏi slot cũ
  Object.keys(state.timelineSlots).forEach(t => {
    if(state.timelineSlots[t] === eventId) delete state.timelineSlots[t];
  });
  state.timelineSlots[timeSlot] = eventId;
  return true;
}

function unassignTimelineSlot(timeSlot){
  if(state.timelineSlots && state.timelineSlots[timeSlot]){
    delete state.timelineSlots[timeSlot];
    return true;
  }
  return false;
}

function checkTimelineReconstruction(){
  if(!CASE || !CASE.timeline) return { success: false, msg: 'Không có dữ liệu dòng thời gian' };
  if(state.timelineCompleted) return { success: true, alreadyCompleted: true, msg: 'Trục thời gian đã được phục dựng thành công!' };

  const timeline = CASE.timeline;
  const unlockedEvents = timeline.filter(item => !item.unlockClue || state.clues.includes(item.unlockClue));
  
  if(unlockedEvents.length === 0){
    return { success: false, msg: 'Chưa có sự kiện nào được mở khóa để phục dựng.' };
  }

  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;

  unlockedEvents.forEach(item => {
    const assignedId = state.timelineSlots ? state.timelineSlots[item.time] : null;
    if(!assignedId){
      emptyCount++;
    } else if(assignedId === item.id){
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  if(correctCount === unlockedEvents.length && wrongCount === 0 && emptyCount === 0){
    state.timelineCompleted = true;
    state.score += 15;
    return {
      success: true,
      msg: `🎉 Xuất sắc! Bạn đã phục dựng hoàn hảo toàn bộ ${correctCount} mốc thời gian (+15 điểm)! Khoảng trống ngoại phạm của hung thủ đã lộ diện!`
    };
  }

  if(wrongCount > 0){
    if (!state.mistakesCount) state.mistakesCount = { contradiction: 0, timeline: 0, mindPalace: 0 };
    state.mistakesCount.timeline = (state.mistakesCount.timeline || 0) + 1;
    const isFirstMistake = state.mistakesCount.timeline === 1;

    const penaltyMins = isFirstMistake ? 0 : (state.difficultyMode === 'casual' ? 1 : 2);
    if (penaltyMins > 0) spendTime(penaltyMins);

    let msg = `Có ${wrongCount} sự kiện chưa khớp mốc thời gian.`;
    if (isFirstMistake) {
      msg += ' (⚠️ Miễn trừ phạt thời gian cho lần thử đầu tiên!)';
    } else {
      msg += ` Đã trừ -${penaltyMins} phút điều tra để đối chiếu lại.`;
    }

    return {
      success: false,
      correctCount,
      wrongCount,
      isFirstMistake,
      penaltyMins,
      msg
    };
  }

  return {
    success: false,
    correctCount,
    wrongCount,
    emptyCount,
    totalUnlocked: unlockedEvents.length,
    msg: `Chưa hoàn tất! Còn ${emptyCount} mốc trống cần điền.`
  };
}

/* 3. Mind Palace Nodes */
function chooseMindPalaceBranch(nodeId, branchId){
  // Nếu đã chọn rồi thì không cho chọn lại (ngăn chặn đoán mò đổi đáp án tùy tiện)
  if (state.mindPalaceChoices[nodeId]) {
    return { locked: true, isCorrect: false };
  }
  
  const node = (CASE.mindPalaceNodes || []).find(n => n.id === nodeId);
  const branch = node ? node.branches.find(b => b.id === branchId) : null;
  const isCorrect = !!(branch && branch.correct);
  
  state.mindPalaceChoices[nodeId] = branchId;
  
  if (isCorrect) {
    state.score += 15;
  } else {
    if (!state.mistakesCount) state.mistakesCount = { contradiction: 0, timeline: 0, mindPalace: 0 };
    state.mistakesCount.mindPalace = (state.mistakesCount.mindPalace || 0) + 1;
    const isFirstMistake = state.mistakesCount.mindPalace === 1;

    if (!isFirstMistake) {
      state.score = Math.max(0, state.score - (state.difficultyMode === 'casual' ? 5 : 10));
      const penaltyMins = state.difficultyMode === 'casual' ? 2 : 5;
      spendTime(penaltyMins);
    }
  }
  
  return { locked: false, isCorrect, branch };
}

/* 4. Hypothesis Lifecycle */
function createHypothesis(suspectId, motiveId, methodId){
  const id = 'h_' + (state.hypotheses.length + 1);
  const hyp = { id, suspect: suspectId, motive: motiveId, method: methodId, status: 'active' };
  state.hypotheses.push(hyp);
  return hyp;
}

function setHypothesisStatus(hypoId, status){
  const h = state.hypotheses.find(x => x.id === hypoId);
  if(h) h.status = status;
}

/* ---------- scoring / Holmes Index ---------- */
function computeIndex(){
  const req = requiredKeyEvidence();
  const realEntries = Object.values(CASE.evidence).filter(e=>!e.decoy);
  const realCollected = state.clues.filter(k=>!CASE.evidence[k].decoy).length;
  
  // 1. Observation Score (15%)
  let totalObs = 0, earnedObsRatio = 0;
  if(CASE.suspects){
    CASE.suspects.forEach(s => {
      const obsList = s.observations || [];
      obsList.forEach(obs => {
        totalObs++;
        const chosenId = state.inspectedObservations[s.id] ? state.inspectedObservations[s.id][obs.id] : null;
        if(chosenId){
          const inf = obs.inferences.find(i => i.id === chosenId);
          const conf = inf ? inf.confidence : 'medium';
          if(conf === 'high') earnedObsRatio += 1.0;
          else if(conf === 'medium') earnedObsRatio += 0.6;
          else earnedObsRatio += 0.2;
        }
      });
    });
  }
  const observationScore = totalObs > 0 ? Math.round((earnedObsRatio / totalObs) * 100) : 100;

  // 2. Evidence Score (15%)
  const evidenceScore = Math.round((realCollected / realEntries.length) * 100);

  // 3. Interrogation & Contradiction Score (15%)
  let totalContra = 0, foundContra = 0;
  if(CASE.interrogationTree){
    Object.keys(CASE.interrogationTree).forEach(sId => {
      Object.keys(CASE.interrogationTree[sId]).forEach(dId => {
        if(CASE.interrogationTree[sId][dId].contradictionClue) totalContra++;
      });
    });
  }
  Object.keys(state.contradictionsFound).forEach(sId => {
    foundContra += state.contradictionsFound[sId].length;
  });
  const contradictionScore = totalContra > 0 ? Math.round((foundContra / totalContra) * 100) : 100;

  // 4. Timeline Reconstruction Score (15%)
  let timelineScore = 100;
  if(CASE.timeline && CASE.timeline.length > 0){
    const totalEvents = CASE.timeline.length;
    if(state.timelineCompleted){
      timelineScore = 100;
    } else if(totalEvents > 0 && state.timelineSlots){
      let correct = 0;
      CASE.timeline.forEach(item => {
        if(state.timelineSlots[item.time] === item.id) correct++;
      });
      timelineScore = Math.round((correct / totalEvents) * 100);
    } else {
      timelineScore = 0;
    }
  }

  // 5. Deduction Score (Mind Palace / Hypotheses) (20%)
  let deductionScore = 0;
  if(CASE.mindPalaceNodes && CASE.mindPalaceNodes.length > 0){
    let correctNodes = 0;
    CASE.mindPalaceNodes.forEach(node => {
      const chosen = state.mindPalaceChoices[node.id];
      const branch = node.branches.find(b => b.id === chosen);
      if(branch && branch.correct) correctNodes++;
    });
    deductionScore = Math.round((correctNodes / CASE.mindPalaceNodes.length) * 100);
  } else {
    const correctHyp = Object.values(state.hypothesesAnswered).filter(h=>h.correct).length;
    deductionScore = Math.round((correctHyp / (CASE.hypotheses.length || 1)) * 100);
  }

  // 6. Final Accusation Score (20%)
  let finalAccusationScore = 0;
  const correctSuspectId = CASE.truth ? CASE.truth.correctSuspect : CASE.correctSuspect;
  const isSuspectCorrect = state.chosenSuspect === correctSuspectId;
  
  if(CASE.truth && CASE.truth.accusation) {
    const correctMethod = CASE.truth.accusation.methods.find(m => m.correct).id;
    const correctMotive = CASE.truth.accusation.motives.find(m => m.correct).id;
    const isMethodCorrect = state.chosenMethod === correctMethod;
    const isMotiveCorrect = state.chosenMotive === correctMotive;
    
    finalAccusationScore = (isSuspectCorrect ? 50 : 0) + (isMethodCorrect ? 25 : 0) + (isMotiveCorrect ? 25 : 0);
  } else {
    finalAccusationScore = isSuspectCorrect ? 100 : 30;
  }
  
  const timeScore = Math.round((state.time / CASE.timeBudget) * 100);
  const timeBorrowPenalty = (state.timeBorrowCount || 0) * 8;
  const rawTotal = Math.round(
    (observationScore * 0.15) +
    (evidenceScore * 0.15) +
    (contradictionScore * 0.15) +
    (timelineScore * 0.15) +
    (deductionScore * 0.20) +
    (finalAccusationScore * 0.20)
  );
  const total = Math.max(0, Math.min(100, rawTotal - timeBorrowPenalty));
  
  const correctHyp = Object.values(state.hypothesesAnswered).filter(h=>h.correct).length;
  const keyCollected = req.filter(k=>state.clues.includes(k)).length;

  state.deductionScore = {
    observationScore,
    evidenceScore,
    contradictionScore,
    timelineScore,
    deductionScore,
    finalAccusationScore,
    timeScore,
    timeBorrowPenalty,
    timeBorrowCount: state.timeBorrowCount || 0,
    timeBorrowed: state.timeBorrowed || 0,
    total
  };

  return {
    observationScore,
    evidenceScore,
    contradictionScore,
    timelineScore,
    deductionScore,
    finalAccusationScore,
    decisionScore: finalAccusationScore,
    timeScore,
    timeBorrowPenalty,
    timeBorrowCount: state.timeBorrowCount || 0,
    timeBorrowed: state.timeBorrowed || 0,
    total,
    correctHyp,
    keyCollected,
    realCollected,
    keyTotal: req.length
  };
}
function rankLabel(v){
  if(v>=88) return 'Bậc Thầy Suy Luận (Sherlock Holmes)';
  if(v>=72) return 'Thám Tử Lão Luyện';
  if(v>=50) return 'Thám Tử Tập Sự';
  return 'Cần Rèn Luyện Thêm';
}

/* ---------- ending tier resolution ---------- */
function resolveEnding(){
  const idx = computeIndex();
  const truth = CASE.truth || CASE;
  const correctSuspectId = truth.correctSuspect;
  const correctSuspect = state.chosenSuspect === correctSuspectId;

  if(idx.keyCollected < Math.max(2, idx.keyTotal-1) || idx.realCollected < 5){
    return {id:'incomplete', idx, data: truth.endings.incomplete, badgeClass:'badge-incomplete'};
  }
  if(!correctSuspect){
    return {id:'wrong_'+state.chosenSuspect, idx, data: (truth.suspectEndings && truth.suspectEndings[state.chosenSuspect]) || {badge:'Buộc tội sai', title:'Sai đối tượng', body:'<p>Người này hoàn toàn vô tội.</p>'}, badgeClass:'badge-fail'};
  }
  
  if (truth.accusation) {
    const correctMethod = truth.accusation.methods.find(m => m.correct).id;
    const correctMotive = truth.accusation.motives.find(m => m.correct).id;
    const isMethodCorrect = state.chosenMethod === correctMethod;
    const isMotiveCorrect = state.chosenMotive === correctMotive;
    
    // Check elimination
    const innocentSuspects = getVisibleSuspects().filter(s => s.id !== correctSuspectId && s.eliminateWith);
    const eliminatedCount = innocentSuspects.filter(s => state.eliminatedSuspects[s.id]).length;
    const allEliminated = eliminatedCount === innocentSuspects.length;

    if(isMethodCorrect && isMotiveCorrect && idx.correctHyp===CASE.hypotheses.length && allEliminated){
      if(state.difficultyMode === 'casual') {
        return {id:'good', idx, data: truth.endings.good, badgeClass:'badge-good', isCasualCapped: true};
      }
      return {id:'perfect', idx, data: truth.endings.perfect, badgeClass:'badge-perfect'};
    }
    if(isMethodCorrect && isMotiveCorrect){
      return {id:'good', idx, data: truth.endings.good, badgeClass:'badge-good'};
    }
    if(isMotiveCorrect && !isMethodCorrect){
      return {id:'wrong_method', idx, data: truth.endings.wrong_method || truth.endings.bad, badgeClass:'badge-bad'};
    }
    if(isMethodCorrect && !isMotiveCorrect){
      return {id:'wrong_motive', idx, data: truth.endings.wrong_motive || truth.endings.bad, badgeClass:'badge-bad'};
    }
    return {id:'bad', idx, data: truth.endings.bad, badgeClass:'badge-bad'};
  } else {
    // Fallback for old cases
    if(idx.correctHyp===CASE.hypotheses.length && idx.evidenceScore===100 && idx.realCollected>=Math.round(Object.keys(CASE.evidence).length*0.75)){
      return {id:'perfect', idx, data: truth.endings.perfect, badgeClass:'badge-perfect'};
    }
    if(idx.correctHyp>=Math.ceil(CASE.hypotheses.length*0.6) && idx.evidenceScore===100){
      return {id:'good', idx, data: truth.endings.good, badgeClass:'badge-good'};
    }
    return {id:'bad', idx, data: truth.endings.bad, badgeClass:'badge-bad'};
  }
}

/* ---------- hint system (2 cấp & giới hạn theo độ khó) ---------- */
function useHint(){
  const baseMax = (CASE.difficultyRules && CASE.difficultyRules.maxHints !== undefined) ? CASE.difficultyRules.maxHints : 3;
  const maxHints = state.difficultyMode === 'casual' ? (baseMax + 2) : baseMax;
  if(state.hintsUsed >= maxHints){
    return {type:'none', msg:`Đã dùng hết số lượt gợi ý tối đa của vụ án (${maxHints} lượt)!`};
  }

  const remaining = CASE.hypotheses.filter(h=>!state.hypothesesAnswered[h.id]);
  if(remaining.length === 0) return {type:'none', msg:'Không còn giả thuyết nào để gợi ý.'};

  const h = remaining[0];
  const currentLevel = state.hintLevel[h.id] || 0;
  const hintCost = currentLevel === 0 ? 8 : 12;

  if(state.time < hintCost) {
    return {type:'none', msg:`Không đủ thời gian để nhận gợi ý (cần tối thiểu ${hintCost} phút)!`};
  }

  spendTime(hintCost);
  state.hintsUsed++;

  if(currentLevel === 0){
    // Cấp 1: gợi ý mơ hồ (hintVague)
    state.hintLevel[h.id] = 1;
    const vagueMsg = h.hintVague || 'Hãy để ý mối liên hệ giữa các manh mối bạn đã thu thập.';
    return {type:'vague', cost: hintCost, msg:`<strong>Gợi ý (-${hintCost}p):</strong> ${vagueMsg}`};
  } else {
    // Cấp 2: gợi ý cụ thể (tên manh mối)
    state.hintLevel[h.id] = 2;
    const missing = h.refs.find(r=>!state.boardSelection.includes(r));
    const label = missing ? CASE.evidence[missing].label : CASE.evidence[h.refs[0]].label;
    return {type:'specific', cost: hintCost, msg:`<strong>Gợi ý cụ thể (-${hintCost}p):</strong> hãy thử xem "${label}" có liên quan đến manh mối bạn đang xem xét không.`};
  }
}

/* ---------- sound (synthesized Victorian WebAudio, no asset files needed) ---------- */
const SOUND_MUTE_KEY = 'detective_game_sound_muted';
let audioCtx = null;
let heartbeatInterval = null;

function getAudioCtx(){
  if(typeof window === 'undefined') return null;
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; }
  }
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function isAudioMuted(){
  try{
    return typeof localStorage !== 'undefined' && localStorage.getItem(SOUND_MUTE_KEY) === 'true';
  }catch(e){ return false; }
}

function playTone(freq, dur, type, gain, detuneAmt = 3){
  if(isAudioMuted()) return;
  const ctx = getAudioCtx();
  if(!ctx) return;
  
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  
  // Random detune để âm tự nhiên, tránh cảm giác robot
  const rndDetune = detuneAmt ? (Math.random() * (detuneAmt * 2) - detuneAmt) : 0;
  
  osc.type = type || 'triangle';
  osc.frequency.setValueAtTime(freq + rndDetune, ctx.currentTime);
  
  const targetGain = gain || 0.05;
  g.gain.setValueAtTime(targetGain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  
  osc.connect(g);
  g.connect(ctx.destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function playRampTone(startFreq, endFreq, dur, type, gain){
  if(isAudioMuted()) return;
  const ctx = getAudioCtx();
  if(!ctx) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);

  const targetGain = gain || 0.05;
  g.gain.setValueAtTime(targetGain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function playChord(freqs, dur, type, gainPerNote){
  if(isAudioMuted()) return;
  const ctx = getAudioCtx();
  if(!ctx) return;

  freqs.forEach(f => {
    playTone(f, dur, type, gainPerNote || 0.03, 1.5);
  });
}

const sound = {
  isMuted: isAudioMuted,
  setMuted: (muted) => {
    try {
      localStorage.setItem(SOUND_MUTE_KEY, muted ? 'true' : 'false');
      if (muted) sound.stopHeartbeat();
    } catch(e) {}
  },
  toggleMute: () => {
    const next = !isAudioMuted();
    sound.setMuted(next);
    return next;
  },

  // 1. Gõ nhẹ / Tương tác ấm áp kiểu Victorian (Triangle/Sine)
  click: () => playTone(480, 0.04, 'triangle', 0.035, 3),
  pin:   () => playTone(310, 0.06, 'triangle', 0.04, 3),

  // 2. Tín hiệu điều tra cơ bản
  reveal: () => {
    playTone(523, 0.08, 'sine', 0.04);
    setTimeout(() => playTone(784, 0.12, 'sine', 0.04), 60);
  },
  correct: () => {
    playTone(440, 0.08, 'triangle', 0.05);
    setTimeout(() => playTone(659, 0.14, 'triangle', 0.05), 75);
  },
  wrong: () => {
    playTone(150, 0.22, 'triangle', 0.045);
    setTimeout(() => playTone(125, 0.25, 'sine', 0.04), 50);
  },
  warn: () => {
    playTone(330, 0.12, 'triangle', 0.04);
    setTimeout(() => playTone(311, 0.16, 'triangle', 0.04), 90);
  },

  // 3. SFX riêng cho 4 cơ chế nâng cao mới
  // a) Timeline Reconstruction (Thành công: chuỗi đồng hồ chuông ngân hòa âm)
  timelineVerify: () => {
    const notes = [293, 370, 440, 587]; // D4, F#4, A4, D5
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.22, 'triangle', 0.045, 1), i * 90);
    });
  },
  // b) Timeline Reconstruction (Thất bại: tiếng kẹt bánh răng kim đồng hồ)
  timelineFail: () => {
    playTone(220, 0.15, 'sawtooth', 0.03);
    playTone(208, 0.18, 'triangle', 0.04);
    setTimeout(() => playTone(145, 0.25, 'sawtooth', 0.035), 80);
  },
  // c) Vạch trần đối chất song song (Dramatic Objection/Eureka chord)
  exposeReveal: () => {
    playTone(440, 0.06, 'triangle', 0.06); // Sting attack
    setTimeout(() => {
      playChord([523, 659, 880], 0.35, 'sine', 0.04); // Revelation A-minor chord
    }, 50);
  },
  // d) Corkboard Synthesis (Kéo căng dây nối nảy tiếng pitch-slide)
  threadConnect: () => {
    playRampTone(260, 520, 0.16, 'sine', 0.045);
    setTimeout(() => playTone(520, 0.1, 'triangle', 0.035), 140);
  },
  // e) Suspect Guard (Kích hoạt phòng thủ tâm lý đen tối)
  guardUp: () => {
    playTone(196, 0.28, 'triangle', 0.05);
    playTone(207, 0.28, 'sawtooth', 0.025); // Dissonant minor second beat
    setTimeout(() => playTone(165, 0.35, 'sine', 0.04), 100);
  },

  // 4. Đồng hồ đếm ngược nhịp tim vùng đỏ (≤ 25% thời gian)
  startHeartbeat: () => {
    if (heartbeatInterval || isAudioMuted()) return;
    let tickHigh = true;
    heartbeatInterval = setInterval(() => {
      if (isAudioMuted() || !state || state.time <= 0) {
        sound.stopHeartbeat();
        return;
      }
      playTone(tickHigh ? 720 : 580, 0.025, 'triangle', 0.018, 4);
      tickHigh = !tickHigh;
    }, 2000);
  },
  stopHeartbeat: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  },

  // 5. Signature Victorian Leitmotif (A minor mystery arc: A4 -> C5 -> E5 -> D5/A5)
  unlock: () => {
    const motif = [440, 523, 659, 880];
    motif.forEach((f, i) => setTimeout(() => playTone(f, 0.16, 'triangle', 0.045), i * 75));
  },
  achievement: () => {
    const majorMotif = [440, 554, 659, 880, 1108]; // A4, C#5, E5, A5, C#6
    majorMotif.forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.045), i * 85));
  },
  ending: () => {
    const grandMotif = [440, 523, 659, 587, 880, 1046];
    grandMotif.forEach((f, i) => {
      setTimeout(() => {
        playTone(f, 0.28, 'triangle', 0.045);
        if (i >= 4) playTone(f / 2, 0.35, 'sine', 0.035); // Add deep bass harmony
      }, i * 110);
    });
  },

  // 6. Police rubber stamp slam (Heavy wooden stamp impact)
  stamp: () => {
    playTone(95, 0.12, 'triangle', 0.08, 4);
    playTone(180, 0.05, 'sawtooth', 0.04);
  },

  // 7. Subtle vintage paper rustle (Lật mở hồ sơ)
  page: () => {
    if (isAudioMuted()) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const bufSize = Math.floor(ctx.sampleRate * 0.07);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      playTone(600, 0.04, 'sine', 0.02);
    }
  }
};
