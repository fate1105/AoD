/* ============================================================
   MAIN.JS — khởi động game & mở khóa WebAudio
   ============================================================ */
function startApp() {
  if (typeof initTheme === 'function') initTheme();
  if (typeof showTimeBar === 'function') showTimeBar(false);
  if (typeof goTo === 'function') goTo('caseSelect');
}

// User interaction audio unlocker (for browser autoplay policies)
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  const unlockAudio = () => {
    if (typeof getAudioCtx === 'function') {
      const ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
    if (typeof ambientAudio !== 'undefined' && ambientAudio.isEnabled() && currentScene !== 'caseSelect' && currentScene !== 'ending') {
      ambientAudio.start();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
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
