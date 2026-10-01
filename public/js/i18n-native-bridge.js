'use strict';

(function syncMineradioLanguageToMainProcess() {
  function currentLanguage() {
    try {
      if (window.MineradioI18n && typeof window.MineradioI18n.getLanguage === 'function') {
        return window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
      }
      return localStorage.getItem('mineradio.language') === 'en' ? 'en' : 'vi';
    } catch (_error) {
      return 'vi';
    }
  }

  function sync() {
    try {
      if (!window.desktopWindow || typeof window.desktopWindow.updateWallpaperEngineVisualSettings !== 'function') return;
      window.desktopWindow.updateWallpaperEngineVisualSettings({ __mineradioLanguage: currentLanguage() });
    } catch (_error) { }
  }

  window.addEventListener('mineradio:languagechange', sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
  else sync();
  setTimeout(sync, 150);
})();
