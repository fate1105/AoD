const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const jsFiles = [
  'js/engine.js',
  'js/ui.js',
  'js/main.js',
  'js/cases.js',
  'js/cases/case01_blackwood.js',
  'js/cases/case02_ravenscroft.js',
  'js/cases/case03_final_melody.js',
  'js/cases/case_template.js'
];
const htmlFiles = ['index.html'];

// Read all source files
const fileContents = {};
jsFiles.concat(htmlFiles).forEach(f => {
  const fullPath = path.join(projectRoot, f);
  if (fs.existsSync(fullPath)) {
    fileContents[f] = fs.readFileSync(fullPath, 'utf8');
  }
});

console.log('==================================================');
console.log('🔍 DEAD CODE & REDUNDANCY SCANNER');
console.log('==================================================\n');

// 1. Find all function declarations in engine.js
const engineCode = fileContents['js/engine.js'];
const functionRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
const engineFunctions = [];
let match;
while ((match = functionRegex.exec(engineCode)) !== null) {
  engineFunctions.push(match[1]);
}

console.log(`Found ${engineFunctions.length} functions declared in js/engine.js`);

const unusedEngineFuncs = [];
engineFunctions.forEach(fn => {
  let callCount = 0;
  // Search in all files
  Object.entries(fileContents).forEach(([file, content]) => {
    // Regex for word boundary
    const r = new RegExp('\\b' + fn + '\\b', 'g');
    const matches = content.match(r);
    if (matches) {
      callCount += matches.length;
    }
  });

  // Since it appears once at declaration in engine.js, if callCount <= 1 then it's unused
  if (callCount <= 1) {
    unusedEngineFuncs.push({ name: fn, count: callCount });
  }
});

console.log('\n--- 1. UNUSED FUNCTIONS IN ENGINE.JS ---');
if (unusedEngineFuncs.length === 0) {
  console.log('✓ All functions in js/engine.js are actively referenced.');
} else {
  unusedEngineFuncs.forEach(u => console.log(`  ⚠️ ${u.name} (occurrences: ${u.count})`));
}

// 2. Find all function declarations in ui.js
const uiCode = fileContents['js/ui.js'];
const uiFunctions = [];
while ((match = functionRegex.exec(uiCode)) !== null) {
  uiFunctions.push(match[1]);
}

console.log(`\nFound ${uiFunctions.length} functions declared in js/ui.js`);

const unusedUiFuncs = [];
uiFunctions.forEach(fn => {
  let callCount = 0;
  Object.entries(fileContents).forEach(([file, content]) => {
    const r = new RegExp('\\b' + fn + '\\b', 'g');
    const matches = content.match(r);
    if (matches) {
      callCount += matches.length;
    }
  });

  if (callCount <= 1) {
    unusedUiFuncs.push({ name: fn, count: callCount });
  }
});

console.log('\n--- 2. UNUSED FUNCTIONS IN UI.JS ---');
if (unusedUiFuncs.length === 0) {
  console.log('✓ All functions in js/ui.js are actively referenced.');
} else {
  unusedUiFuncs.forEach(u => console.log(`  ⚠️ ${u.name} (occurrences: ${u.count})`));
}

// 3. Check state properties declared in engine.js
console.log('\n--- 3. STATE PROPERTIES AUDIT ---');
const statePropsMatch = engineCode.match(/const initialGameState = \{([\s\S]*?)\};/);
if (statePropsMatch) {
  const propLines = statePropsMatch[1].split('\n');
  propLines.forEach(line => {
    const propMatch = line.match(/^\s*([a-zA-Z0-9_$]+)\s*:/);
    if (propMatch) {
      const prop = propMatch[1];
      let stateUsageCount = 0;
      Object.entries(fileContents).forEach(([file, content]) => {
        const r = new RegExp('\\bstate\\.' + prop + '\\b', 'g');
        const matches = content.match(r);
        if (matches) {
          stateUsageCount += matches.length;
        }
      });
      if (stateUsageCount <= 1) {
        console.log(`  ⚠️ state.${prop} only used ${stateUsageCount} times`);
      }
    }
  });
}
