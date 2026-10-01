'use strict';

(function initMineradioContentBoundaryI18n() {
  const RULES = [
    ['.pl-detail-loading-row .pl-detail-row-title', ['正在载入首批歌曲']],
    ['.pl-detail-loading-row .pl-detail-row-artist', ['首批完成后即可浏览和播放']],
    ['.detail-title', ['当前歌曲', '未知专辑', '未知歌手']],
    ['#album-detail-title', ['未知专辑']],
    ['.home-card-title', ['开始听歌', '继续当前队列', '等待你的音乐', '为你挑选', '音乐发现', '每日热评', '我的热评']],
    ['.home-card-sub', ['从音乐库或每日推荐开始', '登录平台或导入本地音乐后生成推荐', '平台热歌与个人偏好']]
  ];

  function translate(text) {
    try {
      if (window.MineradioFinalI18n && typeof window.MineradioFinalI18n.translate === 'function') {
        return window.MineradioFinalI18n.translate(String(text == null ? '' : text));
      }
    } catch (_) { }
    return String(text == null ? '' : text);
  }

  // Browser-native alert/confirm/prompt surfaces are synchronous, so a DOM
  // MutationObserver cannot localize them after they appear. Translate their
  // app-owned labels before Chromium opens the dialog. Unknown provider/song
  // content is preserved by the translator instead of being destructively scrubbed.
  function patchSynchronousDialogs() {
    if (window.__mineradioSynchronousDialogsLocalized) return;
    window.__mineradioSynchronousDialogsLocalized = true;

    if (typeof window.alert === 'function') {
      const originalAlert = window.alert.bind(window);
      window.alert = function (message) { return originalAlert(translate(message)); };
    }
    if (typeof window.confirm === 'function') {
      const originalConfirm = window.confirm.bind(window);
      window.confirm = function (message) { return originalConfirm(translate(message)); };
    }
    if (typeof window.prompt === 'function') {
      const originalPrompt = window.prompt.bind(window);
      window.prompt = function (message, defaultValue) {
        return originalPrompt(translate(message), defaultValue);
      };
    }
  }

  function apply(root) {
    root = root || document;
    RULES.forEach(function (rule) {
      let nodes = [];
      try {
        if (root.nodeType === Node.ELEMENT_NODE && root.matches && root.matches(rule[0])) nodes.push(root);
        if (root.querySelectorAll) nodes = nodes.concat(Array.from(root.querySelectorAll(rule[0])));
      } catch (_) { return; }
      nodes.forEach(function (el) {
        const text = String(el.textContent || '').trim();
        if (!rule[1].includes(text)) return;
        const next = translate(text);
        if (next !== text) el.textContent = next;
      });
    });
  }

  function start() {
    patchSynchronousDialogs();
    apply(document);
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'childList') m.addedNodes.forEach(function (n) {
          if (n.nodeType === Node.ELEMENT_NODE) apply(n);
          else if (n.parentElement) apply(n.parentElement);
        });
        if (m.type === 'characterData' && m.target.parentElement) apply(m.target.parentElement);
      });
    });
    if (document.body) observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    window.addEventListener('mineradio:languagechange', function () {
      setTimeout(function () { apply(document); }, 0);
      setTimeout(function () { apply(document); }, 150);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
