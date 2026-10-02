'use strict';

(function bootstrapMineradioVietnameseOnlyRuntime() {
  const STORAGE_KEY = 'mineradio.language';

  function load(path) {
    const request = new XMLHttpRequest();
    request.open('GET', path + '?v=' + Date.now(), false);
    request.send(null);
    if ((request.status < 200 || request.status >= 300) && request.status !== 0) {
      throw new Error('Failed to load ' + path + ' (' + request.status + ')');
    }
    (0, eval)(request.responseText + '\n//# sourceURL=' + path);
  }

  function forceVietnamese() {
    try { localStorage.setItem(STORAGE_KEY, 'vi'); } catch (_) { }
    try { document.documentElement.lang = 'vi'; } catch (_) { }

    const api = window.MineradioI18n;
    if (api) {
      try {
        if (typeof api.getLanguage === 'function' && api.getLanguage() !== 'vi' && typeof api.setLanguage === 'function') {
          api.setLanguage('vi');
        }
      } catch (_) { }

      api.getLanguage = function () { return 'vi'; };
      api.setLanguage = function () {
        try { localStorage.setItem(STORAGE_KEY, 'vi'); } catch (_) { }
        try { document.documentElement.lang = 'vi'; } catch (_) { }
        return 'vi';
      };
    }

    const select = document.getElementById('mineradio-language-select');
    if (select) {
      try { select.value = 'vi'; } catch (_) { }
      select.disabled = true;
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true');
      select.style.display = 'none';
    }

    const switcher = document.getElementById('mineradio-language-switcher');
    if (switcher && switcher.parentNode) switcher.parentNode.removeChild(switcher);
  }

  // Do not load i18n-language-ui-legacy.js. That file owns the old VI/EN menu
  // and an additional MutationObserver, both of which caused translation feedback.
  forceVietnamese();
  load('js/i18n-runtime-stable.js');
  forceVietnamese();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceVietnamese, { once: true });
  }
})();
