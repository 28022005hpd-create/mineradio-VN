'use strict';

(function initMineradioStableI18nRuntime() {
  const NativeMutationObserver = window.__mineradioNativeMutationObserver || window.MutationObserver;
  if (!NativeMutationObserver) return;

  // Restore the real browser observer for the application modules loaded after
  // this file. Legacy i18n observers were constructed while the gate was active,
  // so they stay dormant for the lifetime of the page.
  window.MutationObserver = NativeMutationObserver;
  window.WebKitMutationObserver = NativeMutationObserver;
  window.__mineradioI18nObserverGateActive = false;

  const ATTRS = ['title', 'aria-label', 'aria-description', 'placeholder', 'data-tooltip', 'data-label'];
  const RAW_CONTENT = [
    '#stage-lyrics', '#desktop-lyrics-root', '#desktop-lyrics',
    '.lyric-line', '.lyrics-line', '[data-lyric-line]',
    '#thumb-title', '#thumb-artist', '[data-track-title]', '[data-track-artist]',
    '.shelf-track-title', '.shelf-track-artist', '.playlist-track-title', '.playlist-track-artist',
    '.search-result-title', '.search-artist-link',
    '.mini-queue-name', '.mini-queue-sub', '.qi-name', '.queue-artist-link',
    '.pl-name', '.pl-detail-title', '.pl-detail-row-title', '.pl-detail-row-artist',
    '.detail-title', '#album-detail-title', '.artist-song-name', '.comment-text',
    '.home-card-title', '.home-card-sub', '#home-next-title', '#home-next-artist',
    '.home-discovery-title', '.home-discovery-sub',
    '.user-name', '.user-nickname', '.account-name', '.profile-name'
  ].join(',');

  const textState = new WeakMap();
  const attrState = new WeakMap();
  let observer = null;
  let rowsCache = null;
  let applying = false;

  function language() {
    try {
      return window.MineradioI18n && window.MineradioI18n.getLanguage && window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
    } catch (_) {
      return 'vi';
    }
  }

  function elementFor(node) {
    return node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement;
  }

  function isRawContent(node) {
    const el = elementFor(node);
    try { return !!(el && el.closest && el.closest(RAW_CONTENT)); } catch (_) { return false; }
  }

  function buildRows() {
    const rows = [];
    const seen = new Set();
    function push(source, vi, en) {
      source = String(source == null ? '' : source);
      if (!source || seen.has(source)) return;
      seen.add(source);
      rows.push({ source: source, vi: String(vi == null ? source : vi), en: String(en == null ? source : en) });
    }

    try {
      const base = window.MineradioI18n && window.MineradioI18n.translations || {};
      Object.keys(base).forEach(function (key) { push(key, base[key].vi, base[key].en); });
    } catch (_) { }
    try {
      const extra = window.MineradioI18nExtra && window.MineradioI18nExtra.translations || {};
      Object.keys(extra).forEach(function (key) { push(key, extra[key].vi, extra[key].en); });
    } catch (_) { }
    try {
      const strictRows = window.MineradioStrictI18n && window.MineradioStrictI18n.rows || [];
      strictRows.forEach(function (row) { push(row[0], row[1], row[2]); });
    } catch (_) { }
    try {
      const finalRows = window.MineradioFinalI18n && window.MineradioFinalI18n.rows || [];
      finalRows.forEach(function (row) { push(row[0], row[1], row[2]); });
    } catch (_) { }

    // Mixed-language source strings that should be treated as one UI key.
    push('LISTENING TODAY · 今日聆听', 'NGHE HÔM NAY', 'LISTENING TODAY');

    rows.sort(function (a, b) { return b.source.length - a.source.length; });

    const exactAlias = new Map();
    rows.forEach(function (row) {
      exactAlias.set(row.source, row.source);
      if (row.vi) exactAlias.set(row.vi, row.source);
      if (row.en) exactAlias.set(row.en, row.source);
    });

    const reverse = [];
    rows.forEach(function (row) {
      if (row.vi && row.vi !== row.source && row.vi.length >= 4) reverse.push([row.vi, row.source]);
      if (row.en && row.en !== row.source && row.en.length >= 4) reverse.push([row.en, row.source]);
    });
    reverse.sort(function (a, b) { return b[0].length - a[0].length; });

    return { rows: rows, exactAlias: exactAlias, reverse: reverse };
  }

  function tables() {
    if (!rowsCache) rowsCache = buildRows();
    return rowsCache;
  }

  function splitWhitespace(value) {
    const match = String(value == null ? '' : value).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match ? { lead: match[1], core: match[2], tail: match[3] } : { lead: '', core: String(value || ''), tail: '' };
  }

  function canonicalize(value, node) {
    const parts = splitWhitespace(value);
    let core = parts.core;
    const data = tables();

    // Home listen heading is app-owned UI and historically became corrupted by
    // observer feedback. Always reset it to one canonical source key.
    const el = elementFor(node);
    if (el && el.id === 'home-listen-heading') {
      return parts.lead + 'LISTENING TODAY · 今日聆听' + parts.tail;
    }

    if (data.exactAlias.has(core)) {
      core = data.exactAlias.get(core);
      return parts.lead + core + parts.tail;
    }

    // Provider/user metadata must not be reverse-normalized by substring because
    // a song title may legitimately contain words that also exist in the UI.
    if (isRawContent(node)) return String(value == null ? '' : value);

    // Recover canonical Chinese source fragments from a localized string written
    // by one of the legacy language-change refresh callbacks.
    data.reverse.forEach(function (pair) {
      if (core.indexOf(pair[0]) >= 0) core = core.split(pair[0]).join(pair[1]);
    });
    return parts.lead + core + parts.tail;
  }

  function normalizeDynamic(value, lang) {
    let result = String(value == null ? '' : value);
    result = result.replace(/(\d+)\s*分钟/g, function (_m, n) { return lang === 'vi' ? n + ' phút' : n + ' min'; });
    result = result.replace(/(\d+)\s*首/g, function (_m, n) { return lang === 'vi' ? n + ' bài' : n + ' tracks'; });
    result = result.replace(/(\d+)\s*项/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*个/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*秒/g, function (_m, n) { return lang === 'vi' ? n + ' giây' : n + ' s'; });
    result = result.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g, function (_m, y, m, d) {
      return lang === 'vi' ? d + '/' + m + '/' + y : m + '/' + d + '/' + y;
    });
    result = result.replace(/(\d{1,2})月(\d{1,2})日/g, function (_m, m, d) {
      return lang === 'vi' ? d + '/' + m : m + '/' + d;
    });
    return result;
  }

  function renderSource(source, node) {
    const lang = language();
    const parts = splitWhitespace(source);
    let core = normalizeDynamic(parts.core, lang);
    const data = tables();

    const exactSource = data.rows.find(function (row) { return row.source === parts.core; });
    if (exactSource) return parts.lead + exactSource[lang] + parts.tail;

    // For real provider/user metadata only translate exact app fallback labels.
    if (isRawContent(node)) return String(source == null ? '' : source);

    data.rows.forEach(function (row) {
      if (core.indexOf(row.source) >= 0) core = core.split(row.source).join(row[lang]);
    });
    return parts.lead + core + parts.tail;
  }

  function translateTextNode(node, externalMutation) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const current = String(node.nodeValue || '');
    if (!current.trim()) return;

    let state = textState.get(node);
    if (!state) {
      state = { source: canonicalize(current, node), output: null };
      textState.set(node, state);
    } else if (externalMutation && current !== state.output) {
      state.source = canonicalize(current, node);
    }

    const output = renderSource(state.source, node);
    state.output = output;
    if (current !== output) node.nodeValue = output;
  }

  function attrMaps(el) {
    let map = attrState.get(el);
    if (!map) {
      map = new Map();
      attrState.set(el, map);
    }
    return map;
  }

  function translateAttribute(el, attr, externalMutation) {
    if (!el || !el.hasAttribute || !el.hasAttribute(attr)) return;
    const current = String(el.getAttribute(attr) || '');
    const map = attrMaps(el);
    let state = map.get(attr);
    if (!state) {
      state = { source: canonicalize(current, el), output: null };
      map.set(attr, state);
    } else if (externalMutation && current !== state.output) {
      state.source = canonicalize(current, el);
    }
    const output = renderSource(state.source, el);
    state.output = output;
    if (current !== output) el.setAttribute(attr, output);
  }

  function translateElement(el, externalMutation, changedAttr) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    ATTRS.forEach(function (attr) {
      if (!changedAttr || changedAttr === attr) translateAttribute(el, attr, externalMutation);
    });
  }

  function walk(root, externalMutation) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, externalMutation);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateElement(root, externalMutation);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, externalMutation);
      else translateElement(node, externalMutation);
      node = walker.nextNode();
    }
  }

  function observe() {
    if (!document.documentElement || !observer) return;
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  function runSafely(fn) {
    if (applying) return;
    applying = true;
    if (observer) observer.disconnect();
    try { fn(); } finally {
      applying = false;
      observe();
    }
  }

  function refreshAll() {
    runSafely(function () { walk(document.documentElement, false); });
  }

  observer = new NativeMutationObserver(function (mutations) {
    if (applying) return;
    runSafely(function () {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target, true);
        } else if (mutation.type === 'attributes') {
          translateElement(mutation.target, true, mutation.attributeName);
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) { walk(node, true); });
        }
      });
    });
  });

  // Rebuild the row cache after a language event in case a late-loaded i18n layer
  // extended its public translation table. Existing canonical source states are
  // retained, making VI <-> EN switching idempotent.
  window.addEventListener('mineradio:languagechange', function () {
    rowsCache = null;
    refreshAll();
    setTimeout(refreshAll, 120);
  });

  window.MineradioStableI18n = {
    refresh: refreshAll,
    canonicalize: function (value) { return canonicalize(value, document.body); },
    observerCount: 1
  };

  refreshAll();
  observe();
  setTimeout(refreshAll, 250);
  setTimeout(refreshAll, 900);
})();
