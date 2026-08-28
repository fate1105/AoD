/* ============================================================
   MAIN.JS — khởi động game
   ============================================================ */
function startApp() {
  if (typeof initTheme === 'function') initTheme();
  if (typeof showTimeBar === 'function') showTimeBar(false);
  if (typeof goTo === 'function') goTo('caseSelect');
}

// 1. Chạy trực tiếp ngay lập tức (vì script nằm ở cuối body, DOM đã được parse xong)
startApp();

// 2. Chạy bổ trợ khi DOMContentLoaded và Window Load để chống mọi tình huống race condition
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const panel = document.getElementById('storyPanel');
    if (panel && !panel.innerHTML.trim()) {
      startApp();
    }
  });
}
