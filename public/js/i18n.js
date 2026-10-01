'use strict';

(function bootstrapMineradioI18n() {
  if (!window.__mineradioNativeMutationObserver) {
    const NativeMutationObserver = window.MutationObserver;
    window.__mineradioNativeMutationObserver = NativeMutationObserver;

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

    window.MutationObserver = DormantMutationObserver;
    window.WebKitMutationObserver = DormantMutationObserver;
    window.__mineradioI18nObserverGateActive = true;
  }

  const request = new XMLHttpRequest();
  request.open('GET', 'js/i18n-legacy.js?v=' + Date.now(), false);
  request.send(null);
  if ((request.status < 200 || request.status >= 300) && request.status !== 0) {
    throw new Error('Failed to load i18n-legacy.js (' + request.status + ')');
  }
  (0, eval)(request.responseText + '\n//# sourceURL=i18n-legacy.js');
})();
