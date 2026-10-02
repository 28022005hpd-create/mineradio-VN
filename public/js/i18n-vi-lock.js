'use strict';

(function lockMineradioToVietnamese() {
  const STORAGE_KEY = 'mineradio.language';

  window.__mineradioVietnameseOnly = true;

  function storeVietnamese() {
    try { localStorage.setItem(STORAGE_KEY, 'vi'); } catch (_) { }
    try { document.documentElement.lang = 'vi'; } catch (_) { }
  }

  function hideLegacyLanguageControls() {
    const ids = [
      'mineradio-language-select',
      'mineradio-language-switcher',
      'mineradio-language-button',
      'mineradio-language-menu'
    ];
    ids.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'mineradio-language-select') {
        try { el.value = 'vi'; } catch (_) { }
        el.disabled = true;
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
        el.style.display = 'none';
      } else if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  storeVietnamese();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      storeVietnamese();
      hideLegacyLanguageControls();
    }, { once: true });
  } else {
    hideLegacyLanguageControls();
  }

  window.MineradioVietnameseOnly = {
    language: 'vi',
    enforce: function () {
      storeVietnamese();
      hideLegacyLanguageControls();
      return 'vi';
    }
  };
})();
