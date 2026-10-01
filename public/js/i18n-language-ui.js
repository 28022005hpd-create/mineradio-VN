'use strict';

(function bootstrapMineradioLanguageUiAndStableRuntime() {
  function load(path) {
    const request = new XMLHttpRequest();
    request.open('GET', path + '?v=' + Date.now(), false);
    request.send(null);
    if ((request.status < 200 || request.status >= 300) && request.status !== 0) {
      throw new Error('Failed to load ' + path + ' (' + request.status + ')');
    }
    (0, eval)(request.responseText + '\n//# sourceURL=' + path);
  }

  load('js/i18n-language-ui-legacy.js');
  load('js/i18n-runtime-stable.js');
})();
