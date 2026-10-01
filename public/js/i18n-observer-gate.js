'use strict';

(function installMineradioI18nObserverGate() {
  if (window.__mineradioNativeMutationObserver) return;

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
})();
