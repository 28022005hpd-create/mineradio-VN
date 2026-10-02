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

  function installDeferredLegacyI18nGate() {
    if (document.readyState !== 'loading' || window.__mineradioDeferredI18nGateInstalled) return;
    window.__mineradioDeferredI18nGateInstalled = true;

    const NativeMutationObserver = window.__mineradioNativeMutationObserver || window.MutationObserver;
    const nativeCreateTreeWalker = document.createTreeWalker.bind(document);

    function DormantMutationObserver(callback) {
      this._callback = callback;
      this._records = [];
    }
    DormantMutationObserver.prototype.observe = function () { };
    DormantMutationObserver.prototype.disconnect = function () { this._records.length = 0; };
    DormantMutationObserver.prototype.takeRecords = function () {
      const records = this._records.slice();
      this._records.length = 0;
      return records;
    };

    // Older i18n layers registered DOMContentLoaded handlers before the stable
    // runtime existed. During only those early handlers, prevent them from
    // constructing extra observers or destructively walking the whole page.
    document.addEventListener('DOMContentLoaded', function () {
      window.MutationObserver = DormantMutationObserver;
      window.WebKitMutationObserver = DormantMutationObserver;
      document.createTreeWalker = function () {
        return { nextNode: function () { return null; } };
      };
    }, true);

    // This listener is registered before application modules loaded later in
    // index-loader, but after the legacy i18n listeners. Restore browser APIs so
    // the rest of Mineradio receives the real MutationObserver/TreeWalker.
    document.addEventListener('DOMContentLoaded', function () {
      window.MutationObserver = NativeMutationObserver;
      window.WebKitMutationObserver = NativeMutationObserver;
      document.createTreeWalker = nativeCreateTreeWalker;
    }, false);
  }

  // Keep Vietnamese as the only locale and extend the dictionary before the
  // single stable observer builds its translation table.
  forceVietnamese();
  installDeferredLegacyI18nGate();
  load('js/i18n-vi-polish.js');
  load('js/i18n-runtime-stable.js');
  load('js/ui-vietnamese-polish.js');
  forceVietnamese();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceVietnamese, { once: true });
  }
})();
