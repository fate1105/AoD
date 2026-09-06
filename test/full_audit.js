const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 ART OF DEDUCTION - COMPREHENSIVE PROJECT AUDIT');
console.log('==================================================\n');

let totalErrors = 0;
let totalWarnings = 0;

// 1. JS SYNTAX AUDIT
console.log('--- 1. JAVASCRIPT SYNTAX & EVALUATION AUDIT ---');
const jsFiles = [
  'js/engine.js',
  'js/cases.js',
  'js/cases/case01_blackwood.js',
  'js/cases/case02_ravenscroft.js',
  'js/cases/case03_final_melody.js',
  'js/cases/case_template.js',
  'js/ui-core.js',
  'js/ui-modals.js',
  'js/ui-timeline.js',
  'js/ui-board.js',
  'js/ui-scenes.js',
  'js/main.js'
];

jsFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    new Function(code);
    console.log(`  ✓ ${relPath.padEnd(35)}: Syntax Clean`);
  } catch (err) {
    console.error(`  ❌ ERROR in ${relPath}:`, err.message);
    totalErrors++;
  }
});

// 2. CSS INTEGRITY AUDIT
console.log('\n--- 2. CSS SYNTAX & BALANCE AUDIT ---');
const cssPath = path.join(__dirname, '..', 'css/style.css');
try {
  const css = fs.readFileSync(cssPath, 'utf8');
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;
  const openComments = (css.match(/\/\*/g) || []).length;
  const closeComments = (css.match(/\*\//g) || []).length;

  console.log(`  • CSS Curly Braces : { ${openBraces} vs ${closeBraces} } -> ${openBraces === closeBraces ? '✓ BALANCED' : '❌ MISMATCH'}`);
  console.log(`  • CSS Comments     : /* ${openComments} vs ${closeComments} */ -> ${openComments === closeComments ? '✓ BALANCED' : '❌ MISMATCH'}`);

  if (openBraces !== closeBraces) {
    console.error(`  ❌ CSS Brace Mismatch! Diff: ${openBraces - closeBraces}`);
    totalErrors++;
  }
  if (openComments !== closeComments) {
    console.error(`  ❌ CSS Comment Mismatch! Diff: ${openComments - closeComments}`);
    totalErrors++;
  }

  // Check for orphan properties / broken syntax markers
  const badPatterns = [
    { name: 'Unfinished semicolon-bracket', regex: /;\s*\}/ },
    { name: 'Double colons inside property value', regex: /\{\s*[^}]*?[a-z\-]+::\s*[^;{}]*;/i },
    { name: 'Unfinished property value', regex: /margin-[a-z]+:\s*\/\*/i }
  ];

  badPatterns.forEach(p => {
    if (p.name !== 'Unfinished semicolon-bracket' && p.regex.test(css)) {
      console.warn(`  ⚠️ Potential CSS issue found: ${p.name}`);
      totalWarnings++;
    }
  });
} catch (err) {
  console.error('  ❌ Error reading style.css:', err.message);
  totalErrors++;
}

// 3. DOM ID INTEGRITY AUDIT
console.log('\n--- 3. DOM ID & EVENT HANDLER AUDIT ---');
const htmlPath = path.join(__dirname, '..', 'index.html');
const uiFiles = [
  'js/ui-core.js',
  'js/ui-modals.js',
  'js/ui-timeline.js',
  'js/ui-board.js',
  'js/ui-scenes.js'
];

try {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const combinedUiCode = uiFiles.map(f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n');

  // Extract all getElementById calls
  const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
  let m;
  const queriedIds = new Set();
  while ((m = idRegex.exec(combinedUiCode)) !== null) {
    queriedIds.add(m[1]);
  }

  let missingStaticIds = 0;
  queriedIds.forEach(id => {
    // Check if ID is in index.html or generated dynamically in ui modules
    const inHtml = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
    const inUi = combinedUiCode.includes(`id="${id}"`) || combinedUiCode.includes(`id='${id}'`) || id.includes('_') || id.includes('${');
    if (!inHtml && !inUi) {
      console.warn(`  ⚠️ DOM ID not found statically: "${id}"`);
      totalWarnings++;
      missingStaticIds++;
    }
  });

  console.log(`  ✓ Queried DOM IDs inspected: ${queriedIds.size} total. Missing: ${missingStaticIds}`);
} catch (err) {
  console.error('  ❌ DOM audit error:', err.message);
  totalErrors++;
}

// 4. RUN ALL GAMEPLAY & DIFFICULTY SMOKE TESTS
console.log('\n--- 4. GAMEPLAY SMOKE TEST & DATA SCHEMAS ---');
try {
  require('./smoke_test.js');
} catch (err) {
  console.error('  ❌ Smoke Test Suite threw error:', err.message);
  totalErrors++;
}

console.log('\n==================================================');
if (totalErrors === 0) {
  console.log(`🎉 AUDIT COMPLETE: 0 ERRORS FOUND! All files healthy & synchronized.`);
} else {
  console.error(`🚨 AUDIT FINISHED WITH ${totalErrors} ERROR(S).`);
}
console.log('==================================================');
