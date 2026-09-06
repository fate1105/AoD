/**
 * SMOKE TEST SUITE — Art of Deduction
 * Verifies end-to-end game logic for all cases (Case 01: Blackwood, Case 02: Ravenscroft)
 * Run with: node test/smoke_test.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Browser Environment
global.window = { scrollTo: () => {} };
let _storage = {};
global.localStorage = {
  getItem: (k) => _storage[k] || null,
  setItem: (k, v) => { _storage[k] = v; },
  removeItem: (k) => { delete _storage[k]; },
  clear: () => { _storage = {}; }
};

const makeEl = () => ({
  classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false, toggle: ()=>{} },
  style: {},
  innerHTML: '',
  textContent: '',
  appendChild: ()=>{},
  setAttribute: ()=>{},
  addEventListener: ()=>{},
  querySelectorAll: () => [],
  parentNode: { insertBefore: ()=>{} },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  offsetWidth: 100,
  offsetHeight: 100,
  dataset: {},
  remove: ()=>{}
});

global.document = {
  getElementById: () => makeEl(),
  querySelectorAll: () => [makeEl()],
  createElement: () => makeEl(),
  body: { appendChild: ()=>{} },
  addEventListener: ()=>{}
};

// Load codebases
const case1Code = fs.readFileSync(path.join(__dirname, '../js/cases/case01_blackwood.js'), 'utf8');
const case2Code = fs.readFileSync(path.join(__dirname, '../js/cases/case02_ravenscroft.js'), 'utf8');
const case3Code = fs.readFileSync(path.join(__dirname, '../js/cases/case03_final_melody.js'), 'utf8');
const casesCode = fs.readFileSync(path.join(__dirname, '../js/cases.js'), 'utf8');
const engineCode = fs.readFileSync(path.join(__dirname, '../js/engine.js'), 'utf8');
const uiCoreCode = fs.readFileSync(path.join(__dirname, '../js/ui-core.js'), 'utf8');
const uiModalsCode = fs.readFileSync(path.join(__dirname, '../js/ui-modals.js'), 'utf8');
const uiTimelineCode = fs.readFileSync(path.join(__dirname, '../js/ui-timeline.js'), 'utf8');
const uiBoardCode = fs.readFileSync(path.join(__dirname, '../js/ui-board.js'), 'utf8');
const uiScenesCode = fs.readFileSync(path.join(__dirname, '../js/ui-scenes.js'), 'utf8');

vm.runInThisContext(case1Code);
vm.runInThisContext(case2Code);
vm.runInThisContext(case3Code);
vm.runInThisContext(casesCode);
vm.runInThisContext(engineCode);
vm.runInThisContext(uiCoreCode);
vm.runInThisContext(uiModalsCode);
vm.runInThisContext(uiTimelineCode);
vm.runInThisContext(uiBoardCode);
vm.runInThisContext(uiScenesCode);

function assert(condition, message) {
  if (!condition) {
    console.error('❌ ASSERTION FAILED:', message);
    process.exit(1);
  }
}

console.log('==================================================');
console.log('🕵️ RUNNING ART OF DEDUCTION SMOKE TEST SUITE');
console.log('==================================================\n');

// 1. Validate CASES Schema Structure
assert(Array.isArray(CASES), 'CASES must be an array');
assert(CASES.length >= 2, 'Should have at least 2 active cases');

CASES.filter(c => !c.comingSoon).forEach((c, idx) => {
  console.log(`[CASE ${idx + 1}] Validating schema: ${c.title}...`);
  assert(c.id, 'Case missing id');
  assert(c.truth, 'Case must have truth object');
  assert(c.truth.correctSuspect, 'Case truth missing correctSuspect');
  assert(c.truth.accusation, 'Case truth missing accusation');
  assert(c.truth.accusation.methods && c.truth.accusation.methods.some(m => m.correct), 'Case truth missing correct method');
  assert(c.truth.accusation.motives && c.truth.accusation.motives.some(m => m.correct), 'Case truth missing correct motive');
  assert(c.truth.endings, 'Case truth missing endings');
  assert(c.truth.suspectEndings, 'Case truth missing suspectEndings');
  assert(c.suspects && c.suspects.length >= 3, 'Case must have >= 3 suspects');
  assert(c.clueRelations && c.clueRelations.length > 0, 'Case must have clueRelations');
  assert(c.mindPalaceNodes && c.mindPalaceNodes.length > 0, 'Case must have mindPalaceNodes');
  assert(c.interrogationTree, 'Case must have interrogationTree');
});

// 2. Playtest Case 01 (Blackwood) to Perfect Ending
console.log('\n--- PLAYTESTING CASE 01: Cái Chết Tại Biệt Thự Blackwood ---');
selectCase(0);
beginInvestigation();

// Inspect all location items
CASE.locations.forEach(loc => {
  loc.items.forEach(it => {
    inspectItem(loc, it);
  });
});
console.log('✓ Inspected all location clues in Case 01. Total clues:', state.clues.length);

// Observations for all suspects
CASE.suspects.forEach(s => {
  (s.observations || []).forEach(obs => {
    const highInf = obs.inferences.find(inf => inf.confidence === 'high') || obs.inferences[0];
    inspectObservation(s.id, obs.id, highInf.id);
  });
});
console.log('✓ Completed profiling observations for Case 01 suspects.');

// Interrogate & Contradict with statement-level selection
// Housekeeper: study_lavender_scent on statement 1
const resH = contradictDialogue('housekeeper', 'q_w_morning', 'study_lavender_scent', 1);
assert(resH.success, 'Housekeeper morning contradiction should succeed');
// Son: fabric, note, ladder_physics
const resS1 = contradictDialogue('son', 'q_s_visit', 'fabric', 1);
assert(resS1.success, 'Son visit contradiction should succeed');
const resS2 = contradictDialogue('son', 'q_s_will', 'note', 1);
assert(resS2.success, 'Son will contradiction should succeed');
const resS3 = contradictDialogue('son', 'q_s_ladder', 'ladder_physics', 1);
assert(resS3.success, 'Son ladder contradiction should succeed');
console.log('✓ Direct statement-level contradictions registered for Case 01.');

// Mind Palace
CASE.mindPalaceNodes.forEach(node => {
  const correctBranch = node.branches.find(b => b.correct);
  chooseMindPalaceBranch(node.id, correctBranch.id);
});
console.log('✓ Mind Palace nodes chained.');

// Hypotheses
CASE.hypotheses.forEach(h => {
  const correctOpt = h.options.find(o => o.correct);
  state.hypothesesAnswered[h.id] = { choiceId: correctOpt.id, correct: true };
});

// Timeline Reconstruction Puzzle for Case 01
CASE.timeline.forEach(item => {
  assignTimelineSlot(item.time, item.id);
});
const timeReconRes1 = checkTimelineReconstruction();
assert(timeReconRes1.success, 'Timeline reconstruction should be 100% correct');
assert(state.timelineCompleted, 'Timeline must be marked as completed');
console.log('✓ Timeline Reconstruction puzzle verified for Case 01.');

// Eliminate innocent suspects
eliminateSuspect('gardener', 'gardener_alibi');
eliminateSuspect('housekeeper', 'wilson_secret_letter');
assert(state.eliminatedSuspects.gardener, 'Gardener must be eliminated');
assert(state.eliminatedSuspects.housekeeper, 'Housekeeper must be eliminated');
console.log('✓ Innocent suspects eliminated.');

// Accusation
state.chosenSuspect = 'son';
state.chosenMethod = 'cut_ladder';
state.chosenMotive = 'inheritance';

const result1 = resolveEnding();
console.log(`✓ Case 01 Result: ${result1.id} (Score: ${result1.idx.total}/100)`);
assert(result1.id === 'perfect', 'Case 01 should resolve to perfect ending');
assert(result1.idx.total >= 88, 'Case 01 Holmes index should qualify as Master');

// 3. Playtest Case 02 (Ravenscroft) to Perfect Ending
console.log('\n--- PLAYTESTING CASE 02: Cái Chết Tại Thư Viện Ravenscroft ---');
selectCase(1);
beginInvestigation();

// Inspect all location items
CASE.locations.forEach(loc => {
  loc.items.forEach(it => {
    inspectItem(loc, it);
  });
});
console.log('✓ Inspected location clues in Case 02.');

// Contradict Nephew to unlock nephew_alibi_proof!
const resNephew = contradictDialogue('nephew', 'q_n_cigar', 'ashtray', 0);
assert(resNephew.success, 'Nephew contradiction should succeed');
assert(state.clues.includes('nephew_alibi_proof'), 'nephew_alibi_proof should be unlocked in state.clues');

// Contradict Butler to unlock butler_secret
const resButler = contradictDialogue('butler', 'q_b_argument', 'glove', 1);
assert(resButler.success, 'Butler contradiction should succeed');
assert(state.clues.includes('butler_secret'), 'butler_secret should be unlocked');

// Contradict Isolde
const resI1 = contradictDialogue('isolde', 'q_i_letter', 'letter', 1);
assert(resI1.success, 'Isolde letter contradiction should succeed');
const resI2 = contradictDialogue('isolde', 'q_i_mud', 'mud', 1);
assert(resI2.success, 'Isolde mud contradiction should succeed');
console.log('✓ Contradictions and clue unlocks registered for Case 02.');

// Observations
CASE.suspects.forEach(s => {
  (s.observations || []).forEach(obs => {
    const highInf = obs.inferences.find(inf => inf.confidence === 'high') || obs.inferences[0];
    inspectObservation(s.id, obs.id, highInf.id);
  });
});

// Mind Palace
CASE.mindPalaceNodes.forEach(node => {
  const correctBranch = node.branches.find(b => b.correct);
  chooseMindPalaceBranch(node.id, correctBranch.id);
});

// Hypotheses
CASE.hypotheses.forEach(h => {
  const correctOpt = h.options.find(o => o.correct);
  state.hypothesesAnswered[h.id] = { choiceId: correctOpt.id, correct: true };
});

// Timeline Reconstruction Puzzle for Case 02
CASE.timeline.forEach(item => {
  assignTimelineSlot(item.time, item.id);
});
const timeReconRes2 = checkTimelineReconstruction();
assert(timeReconRes2.success, 'Timeline reconstruction should be 100% correct for Case 02');
console.log('✓ Timeline Reconstruction puzzle verified for Case 02.');

// Eliminate innocent suspects
eliminateSuspect('nephew', 'nephew_alibi_proof');
eliminateSuspect('butler', 'butler_alibi');
assert(state.eliminatedSuspects.nephew, 'Nephew must be eliminated with nephew_alibi_proof');
assert(state.eliminatedSuspects.butler, 'Butler must be eliminated with butler_alibi');
console.log('✓ Case 02 innocent suspects eliminated.');

// Accusation
state.chosenSuspect = 'isolde';
state.chosenMethod = 'poison';
state.chosenMotive = 'embezzle';

const result2 = resolveEnding();
console.log(`✓ Case 02 Result: ${result2.id} (Score: ${result2.idx.total}/100)`);
assert(result2.id === 'perfect', 'Case 02 should resolve to perfect ending');
assert(result2.idx.total >= 88, 'Case 02 Holmes index should qualify as Master');

// 4. Verify Guessing Penalty & Difficulty Enforcements
console.log('\n--- TESTING ANTI-GUESSING PENALTIES & DIFFICULTY RULES ---');
selectCase(0);
beginInvestigation();

const initialTime = state.time; // 85
const initialScore = state.score;

// Test 4.1: Wrong Contradiction Penalty & First Mistake Grace Period
console.log('Testing wrong statement/clue contradiction penalty & grace period...');
// 1st Wrong attempt (Grace period: no deduction)
const resGrace1 = contradictDialogue('son', 'q_s_visit', 'clock', 1);
assert(!resGrace1.success && resGrace1.isFirstMistake, 'First wrong contradiction should have grace period');
assert(state.time === initialTime, 'First wrong contradiction should not deduct time');

// 2nd Wrong attempt (Deducts 5 minutes)
const resWrongStmt = contradictDialogue('son', 'q_s_visit', 'fabric', 0); // sentence 0 instead of 1
assert(!resWrongStmt.success && !resWrongStmt.isFirstMistake, 'Subsequent wrong attempt must not have grace period');
assert(state.time === initialTime - 5, 'Second wrong statement index must deduct 5 minutes');
console.log('✓ Failed contradiction and grace period correctly verified.');

// Test 4.2: Timeline Reconstruction Wrong Placement Penalty & Grace Period
console.log('Testing Timeline Reconstruction wrong placement penalty & grace period...');
state.clues.push('gardener_alibi', 'wilson_secret_letter');
assignTimelineSlot('08:30', 'evt_son_arrive'); // Wrong event for 08:30
// 1st wrong check (Grace period: no deduction)
const resGraceTimeline = checkTimelineReconstruction();
assert(!resGraceTimeline.success && resGraceTimeline.isFirstMistake, 'First wrong timeline should have grace period');
assert(state.time === initialTime - 5, 'First wrong timeline check should not deduct time');

// 2nd wrong check (Deducts 2 minutes)
const resWrongTimeline = checkTimelineReconstruction();
assert(!resWrongTimeline.success && !resWrongTimeline.isFirstMistake, 'Subsequent wrong timeline check must deduct 2 minutes');
assert(state.time === initialTime - 7, 'Second wrong timeline check must deduct 2 minutes');
console.log('✓ Timeline Reconstruction wrong placement penalty verified.');

// Test 4.3: Mind Palace Wrong Branch Penalty & Locking
console.log('Testing Mind Palace penalties & locking...');
const firstNode = CASE.mindPalaceNodes[0];
const wrongBranch = firstNode.branches.find(b => !b.correct);
const correctBranch = firstNode.branches.find(b => b.correct);

// 1st wrong choice (First mistake grace period)
const chooseRes1 = chooseMindPalaceBranch(firstNode.id, wrongBranch.id);
assert(!chooseRes1.isCorrect, 'Branch should be marked incorrect');
assert(!chooseRes1.locked, 'First choice should not be locked');
assert(state.time === initialTime - 7, 'First wrong branch should have grace period');

// Attempt to change choice on locked node
const chooseRes2 = chooseMindPalaceBranch(firstNode.id, correctBranch.id);
assert(chooseRes2.locked, 'Subsequent attempts on answered node must be locked');
assert(state.mindPalaceChoices[firstNode.id] === wrongBranch.id, 'Choice should remain locked');
console.log('✓ Mind Palace choice locking and wrong choice penalty verified.');

// Test 4.4: Corkboard Reasoning Synthesis Verification
console.log('Testing Corkboard Reasoning Synthesis...');
state.clues.push('ladder', 'ladder_physics');
const relTest = getClueRelation(['ladder', 'ladder_physics']);
assert(relTest && relTest.question, 'Clue relation must have synthesis question');
const optWrong = relTest.options.find(o => !o.correct);
const optRight = relTest.options.find(o => o.correct);
const timeBeforeSynth = state.time;
handleSelectCorkSynthesis('ladder', 'ladder_physics', optWrong.id);
assert(state.time === timeBeforeSynth - 2, 'Wrong cork synthesis must deduct 2 minutes');
const scoreBeforeSynth = state.score;
handleSelectCorkSynthesis('ladder', 'ladder_physics', optRight.id);
assert(state.score === scoreBeforeSynth + 10, 'Correct cork synthesis must award +10 score');
console.log('✓ Corkboard Reasoning Synthesis correctly awarded points.');

// Test 4.5: Enforce maxHints limit
console.log('Testing difficultyRules.maxHints limit...');
const maxAllowedHints = CASE.difficultyRules.maxHints;
for (let i = 0; i < maxAllowedHints; i++) {
  useHint();
}
assert(state.hintsUsed === maxAllowedHints, 'Hints used count should equal maxHints');
const hintOverLimit = useHint();
assert(hintOverLimit && hintOverLimit.type === 'none', 'Over-limit hint request must be rejected');
console.log(`✓ maxHints limit (${maxAllowedHints}) strictly enforced.`);

// Test 4.6: Casual Mode Rules (maxHints 5, borrow 3 times, cap perfect at good)
console.log('Testing Casual Mode adjustments...');
selectCase(0);
state.difficultyMode = 'casual';
beginInvestigation();
assert(canBorrowTime(), 'Casual mode should allow borrow time');
borrowTime();
borrowTime();
assert(canBorrowTime(), 'Casual mode should allow 3rd borrow');
borrowTime();
assert(!canBorrowTime(), 'Casual mode should not allow 4th borrow');

// Verify casual mode ending cap
state.chosenSuspect = 'son';
state.chosenMethod = 'cut_ladder';
state.chosenMotive = 'inheritance';
state.clues = Object.keys(CASE.evidence).filter(k => !CASE.evidence[k].decoy);
state.eliminatedSuspects = { gardener: 'gardener_alibi', housekeeper: 'wilson_secret_letter' };
CASE.hypotheses.forEach(h => state.hypothesesAnswered[h.id] = { correct: true });
const casualEnding = resolveEnding();
assert(casualEnding.id === 'good', 'Casual mode perfect run should be capped at Good ending');
console.log('✓ Casual Mode mechanics (borrows=3, ending capped at good) verified!');

// Test 4.7: Provisional Suspicion & Suspect Guard Active Defense
console.log('Testing Provisional Suspicion and Suspect Guard effect...');
selectCase(0);
state.difficultyMode = 'standard';
beginInvestigation();
state.clues.push('study_lavender_scent');

// Wrong provisional suspicion (on housekeeper)
const resProvWrong = setProvisionalSuspect('housekeeper');
assert(!resProvWrong.correct, 'Housekeeper should be incorrect provisional suspect');
assert(state.suspectGuard.housekeeper, 'Wrongly accused suspect must enter guarded state');

// Now test contradiction against guarded housekeeper
const initialCred = state.suspectCredibility.housekeeper;
const resGuardedContra = contradictDialogue('housekeeper', 'q_w_morning', 'study_lavender_scent', 1);
assert(resGuardedContra.success, 'Guarded contradiction should succeed if correct');
assert(resGuardedContra.isGuarded, 'Contradiction response should flag isGuarded = true');
// Original impact is -25, halved is Math.round(-25 * 0.5) = -12
assert(resGuardedContra.credibilityHit === -12, 'Credibility impact must be halved when suspectGuard is active');
assert(state.suspectCredibility.housekeeper === initialCred - 12, 'Credibility drop must reflect halved impact');
// Test 4.7: Victorian WebAudio Synthesizer & Mute System
console.log('Testing Victorian WebAudio SFX & Mute system...');
assert(typeof sound.timelineVerify === 'function', 'sound.timelineVerify must exist');
assert(typeof sound.timelineFail === 'function', 'sound.timelineFail must exist');
assert(typeof sound.exposeReveal === 'function', 'sound.exposeReveal must exist');
assert(typeof sound.threadConnect === 'function', 'sound.threadConnect must exist');
assert(typeof sound.guardUp === 'function', 'sound.guardUp must exist');
assert(typeof sound.startHeartbeat === 'function', 'sound.startHeartbeat must exist');
assert(typeof sound.stopHeartbeat === 'function', 'sound.stopHeartbeat must exist');

// Test mute toggle and persistence
sound.setMuted(false);
assert(!sound.isMuted(), 'Sound should be unmuted');
const mutedState = sound.toggleMute();
assert(mutedState && sound.isMuted(), 'Sound toggle should mute audio');
assert(localStorage.getItem('detective_game_sound_muted') === 'true', 'Muted state must persist to localStorage');
sound.toggleMute();
assert(!sound.isMuted(), 'Second toggle should unmute audio');
console.log('✓ Victorian WebAudio SFX & Mute system verified!');

// Test 4.8: Profiling Confidence Scoring (High +5, Medium +2, Low +0)
console.log('Testing Observation Profiling confidence scoring...');
selectCase(0);
beginInvestigation();
const obsInitialScore = state.score;
const resHigh = inspectObservation('gardener', 'gardener_hands', 'gardening_only');
assert(resHigh.success && resHigh.confidence === 'high' && resHigh.scoreDelta === 5, 'High confidence must award +5 score');
assert(state.score === obsInitialScore + 5, 'Score should increase by 5');

const resMed = inspectObservation('son', 'jacket_tear', 'car_door_hook');
assert(resMed.success && resMed.confidence === 'medium' && resMed.scoreDelta === 2, 'Medium confidence must award +2 score');
assert(state.score === obsInitialScore + 7, 'Score should increase by 2');

const resLow = inspectObservation('housekeeper', 'wilson_apron', 'kitchen_duty');
assert(resLow.success && resLow.confidence === 'low' && resLow.scoreDelta === 0, 'Low confidence must award +0 score');
assert(state.score === obsInitialScore + 7, 'Score should not increase for low confidence');
console.log('✓ Profiling Confidence Scoring (High +5, Medium +2, Low +0) verified!');

// Test 4.9: Time Borrowing & Overtime Penalty
console.log('Testing Time Borrowing / Extension system...');
selectCase(0);
beginInvestigation();
assert(canBorrowTime(), 'Should be able to borrow time initially');
const timeBeforeBorrow = state.time;
const bRes1 = borrowTime();
assert(bRes1.success && state.time === timeBeforeBorrow + 15, 'First borrow must add 15 minutes');
assert(state.timeBorrowCount === 1 && state.timeBorrowed === 15, 'Borrow count and borrowed minutes must be tracked');

const bRes2 = borrowTime();
assert(bRes2.success && state.time === timeBeforeBorrow + 30, 'Second borrow must add 15 minutes');
assert(state.timeBorrowCount === 2 && !canBorrowTime(), 'Max borrows (2) reached, cannot borrow further');

const bRes3 = borrowTime();
assert(!bRes3.success, 'Third borrow must be rejected');

const idxWithPenalty = computeIndex();
assert(idxWithPenalty.timeBorrowPenalty === 16, 'Two borrows must calculate 16 point penalty');
console.log('✓ Time Borrowing & Overtime penalty verified!');

// Test 4.10: Working Theory Board & Systematic Thinker Achievement
console.log('Testing Working Theory Board & Systematic Thinker achievement...');
selectCase(0);
beginInvestigation();
const hyp1 = createHypothesis('gardener', 'debt', 'cut_ladder');
const hyp2 = createHypothesis('housekeeper', 'inheritance', 'cut_ladder');
const hyp3 = createHypothesis('son', 'inheritance', 'cut_ladder');
assert(state.hypotheses.length === 3, '3 working hypotheses should be created');
assert(hyp1.status === 'active', 'Initial hypothesis status should be active');

// Test auto-elimination on suspect elimination
eliminateSuspect('gardener', 'gardener_alibi');
assert(hyp1.status === 'eliminated', 'Gardener hypothesis must be auto-eliminated');
assert(hyp1.eliminatedByClue === 'gardener_alibi', 'Eliminated clue must be recorded');

// Verify achievement
const earnedAch = checkAchievements('perfect', computeIndex());
const caseSave = getCaseSave(CASE.id);
assert(caseSave.achievements.includes('systematic_thinker'), 'Systematic Thinker achievement must be earned for >=3 theories');
console.log('✓ Working Theory Board & Systematic Thinker achievement verified!');

// Test 4.11: Active In-Progress Session Save & Resume (Item B)
console.log('Testing Active In-Progress Session Save & Resume...');
selectCase(0);
beginInvestigation();
addClue('ladder');
addClue('footprints');
state.visitedLocations.push('greenhouse');
state.time = 45;
assignTimelineSlot('09:35', 'evt_victim_greenhouse');

assert(saveCurrentGameState('case01_blackwood'), 'saveCurrentGameState must return true');
assert(hasSavedGame('case01_blackwood'), 'hasSavedGame must detect saved progress');

// Reset state in memory
resetState();
assert(state.clues.length === 0, 'State should be empty after reset');

// Resume
assert(loadCurrentGameState('case01_blackwood'), 'loadCurrentGameState must restore session');
assert(state.clues.includes('ladder') && state.clues.includes('footprints'), 'Clues must be restored');
assert(state.time === 45, 'Time must be restored');
assert(state.timelineSlots['09:35'] === 'evt_victim_greenhouse', 'Timeline slots must be restored');

clearCurrentGameSave('case01_blackwood');
assert(!hasSavedGame('case01_blackwood'), 'Saved game must be cleared');
console.log('✓ Active In-Progress Session Save & Resume verified!');

// Test 4.12: Procedural Victorian Ambient Audio Controller (Item F)
console.log('Testing Procedural Victorian Ambient Audio controller...');
assert(typeof ambientAudio !== 'undefined', 'ambientAudio must exist');
assert(typeof ambientAudio.start === 'function', 'ambientAudio.start must exist');
assert(typeof ambientAudio.stop === 'function', 'ambientAudio.stop must exist');
assert(typeof ambientAudio.setVolume === 'function', 'ambientAudio.setVolume must exist');
assert(typeof ambientAudio.setMode === 'function', 'ambientAudio.setMode must exist');

ambientAudio.setVolume(0.5);
assert(Math.abs(ambientAudio.getVolume() - 0.5) < 0.01, 'Ambient volume should be 0.5');

ambientAudio.setMode('rain');
assert(ambientAudio.getMode() === 'rain', 'Ambient mode should be rain');
ambientAudio.setMode('all');

ambientAudio.start();
ambientAudio.stop();
console.log('✓ Procedural Victorian Ambient Audio controller verified!');

// Test 4.13: Corkboard Auto-Arrange & Tutorial Field Manual (Items C & H)
console.log('Testing Corkboard Auto-Arrange & Tutorial Field Manual...');
selectCase(0);
beginInvestigation();
addClue('ladder');
addClue('footprints');
autoArrangeCorkGrid();
assert(state.cluePositions['ladder'] !== undefined, 'Auto arrange must assign position to ladder');
assert(state.cluePositions['footprints'] !== undefined, 'Auto arrange must assign position to footprints');

assert(typeof openTutorialModal === 'function', 'openTutorialModal must exist');
assert(typeof selectTutorialTab === 'function', 'selectTutorialTab must exist');
selectTutorialTab('contradiction');
assert(currentTutorialTab === 'contradiction', 'Tutorial tab must switch to contradiction');
console.log('✓ Corkboard Auto-Arrange & Tutorial Field Manual verified!');

console.log('\n==================================================');
console.log('🎉 ALL SMOKE TESTS PASSED! 100% VERIFIED!');
console.log('==================================================\n');
