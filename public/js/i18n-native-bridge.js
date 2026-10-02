'use strict';

(function syncMineradioVietnameseToMainProcess() {
  function sync() {
    try {
      try { localStorage.setItem('mineradio.language', 'vi'); } catch (_) { }
      document.documentElement.lang = 'vi';
      if (!window.desktopWindow || typeof window.desktopWindow.updateWallpaperEngineVisualSettings !== 'function') return;
      window.desktopWindow.updateWallpaperEngineVisualSettings({ __mineradioLanguage: 'vi' });
    } catch (_error) { }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
  else sync();
  setTimeout(sync, 150);
})();
