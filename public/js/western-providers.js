'use strict';

(function initWesternProviders() {
  var statuses = {
    soundcloud: { provider: 'soundcloud', configured: false, loggedIn: false, nickname: 'SoundCloud', capabilities: {} },
    youtube: { provider: 'youtube', configured: false, loggedIn: false, nickname: 'YouTube Music', capabilities: {} }
  };
  var extraModes = ['spotify', 'soundcloud', 'youtube'];

  function lang() {
    try { return window.MineradioI18n && window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi'; } catch (_) { return 'vi'; }
  }
  function copy(vi, en) { return lang() === 'en' ? en : vi; }
  function toast(text) { if (typeof showToast === 'function') showToast(text); else console.log(text); }
  async function json(url, options) {
    if (typeof apiJson === 'function') return apiJson(url, options);
    var response = await fetch(url, options);
    var data = await response.json();
    if (!response.ok) throw new Error(data && (data.message || data.error) || ('HTTP ' + response.status));
    return data;
  }

  async function refreshStatus(provider) {
    if (provider === 'spotify') {
      if (typeof refreshSpotifyLoginStatus === 'function') return refreshSpotifyLoginStatus();
      return null;
    }
    var endpoint = provider === 'soundcloud' ? '/api/soundcloud/status' : '/api/youtube-music/status';
    try {
      var info = await json(endpoint + '?t=' + Date.now());
      statuses[provider] = Object.assign({}, statuses[provider], info || {});
      refreshProviderButton(provider);
      if (typeof updateSearchModeTabs === 'function') updateSearchModeTabs();
      return statuses[provider];
    } catch (error) {
      statuses[provider] = Object.assign({}, statuses[provider], { configured: false, error: error.message });
      refreshProviderButton(provider);
      return statuses[provider];
    }
  }

  async function configureSoundcloud() {
    var current = statuses.soundcloud || {};
    var clientId = window.prompt(copy('SoundCloud Client ID', 'SoundCloud Client ID'), current.clientId || '');
    if (clientId == null) return;
    var clientSecret = window.prompt(copy('SoundCloud Client Secret (chỉ lưu trên máy này)', 'SoundCloud Client Secret (stored only on this device)'), '');
    if (clientSecret == null) return;
    try {
      statuses.soundcloud = await json('/api/soundcloud/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })
      });
      refreshProviderButton('soundcloud');
      toast(copy('Đã kết nối SoundCloud API.', 'SoundCloud API connected.'));
    } catch (error) { toast(copy('Kết nối SoundCloud thất bại: ', 'SoundCloud connection failed: ') + error.message); }
  }

  async function configureYoutube() {
    var apiKey = window.prompt(copy('YouTube Data API key (chỉ lưu trên máy này)', 'YouTube Data API key (stored only on this device)'), '');
    if (apiKey == null) return;
    try {
      statuses.youtube = await json('/api/youtube-music/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      refreshProviderButton('youtube');
      toast(copy('Đã kết nối YouTube Music search.', 'YouTube Music search connected.'));
    } catch (error) { toast(copy('Kết nối YouTube Music thất bại: ', 'YouTube Music connection failed: ') + error.message); }
  }

  function injectProviderButton(provider, short, label, sub) {
    var host = document.getElementById('login-platform-tabs');
    if (!host || document.getElementById('login-provider-' + provider)) return;
    var button = document.createElement('button');
    button.id = 'login-provider-' + provider;
    button.className = provider + ' workflow-node western-provider-node';
    button.type = 'button';
    button.setAttribute('data-login-provider', provider);
    button.innerHTML = '<span class="provider-logo">' + short + '</span><b>' + label + '</b><small>' + sub + '</small><span class="flow-port out" data-login-provider-output="' + provider + '"></span><span class="western-provider-state"></span>';
    if (provider === 'spotify') button.onclick = function () { if (typeof selectLoginProviderNode === 'function') selectLoginProviderNode('spotify'); };
    else if (provider === 'soundcloud') button.onclick = configureSoundcloud;
    else button.onclick = configureYoutube;
    host.appendChild(button);
  }

  function refreshProviderButton(provider) {
    var button = document.getElementById('login-provider-' + provider);
    if (!button) return;
    var status = provider === 'spotify' ? (window.spotifyLoginStatus || (typeof spotifyLoginStatus !== 'undefined' ? spotifyLoginStatus : {})) : statuses[provider];
    var state = button.querySelector('.western-provider-state');
    var ready = !!(status && (status.loggedIn || status.configured || (status.capabilities && status.capabilities.search)));
    button.classList.toggle('connected', ready);
    if (state) state.textContent = ready ? '●' : '○';
    var small = button.querySelector('small');
    if (small && provider === 'soundcloud') small.textContent = ready ? copy('API đã sẵn sàng', 'API ready') : copy('OAuth/API chính thức', 'Official OAuth/API');
    if (small && provider === 'youtube') small.textContent = ready ? copy('Tìm kiếm đã sẵn sàng', 'Search ready') : copy('YouTube Data API', 'YouTube Data API');
  }

  function injectSearchButton(provider, label, beforeId) {
    var host = document.getElementById('search-mode-tabs');
    if (!host || document.getElementById('search-mode-' + provider)) return;
    var button = document.createElement('button');
    button.id = 'search-mode-' + provider;
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-selected', 'false');
    button.onclick = function () { if (typeof setSearchMode === 'function') setSearchMode(provider); };
    var before = document.getElementById(beforeId || 'search-mode-podcast');
    host.insertBefore(button, before || null);
  }

  function patchAccountProviders() {
    try {
      ACCOUNT_PROVIDER_KEYS = ['netease', 'qq', 'kugou', 'qishui', 'spotify'];
      LOGIN_WORKFLOW_PROVIDERS = ['netease', 'qq', 'kugou', 'qishui', 'spotify'];
    } catch (_) {}
    if (typeof normalizeAccountProviderKey === 'function') {
      normalizeAccountProviderKey = function(provider) {
        provider = String(provider || '').toLowerCase();
        return ['netease','qq','kugou','qishui','spotify'].indexOf(provider) >= 0 ? provider : 'netease';
      };
    }
    if (typeof normalizeLoginProviderKey === 'function') {
      normalizeLoginProviderKey = function(provider) {
        provider = String(provider || '').toLowerCase();
        return ['netease','qq','kugou','qishui','spotify'].indexOf(provider) >= 0 ? provider : 'netease';
      };
    }
    if (typeof hasAnyPlatformLogin === 'function') {
      hasAnyPlatformLogin = function() {
        return ['netease','qq','kugou','qishui','spotify'].some(function(p){ return typeof hasPlatformLogin === 'function' && hasPlatformLogin(p); });
      };
    }
  }

  function patchSearch() {
    try {
      MUSIC_SEARCH_PROVIDER_ORDER = ['netease','qq','kugou','qishui','spotify','soundcloud','youtube'];
      if (Array.isArray(SEARCH_HISTORY_MODES)) extraModes.forEach(function(m){ if (SEARCH_HISTORY_MODES.indexOf(m) < 0) SEARCH_HISTORY_MODES.push(m); });
    } catch (_) {}

    var baseStatus = typeof searchProviderStatus === 'function' ? searchProviderStatus : null;
    searchProviderStatus = function(provider) {
      if (provider === 'soundcloud' || provider === 'youtube') return statuses[provider] || {};
      return baseStatus ? baseStatus(provider) : {};
    };
    var baseUrl = typeof searchProviderUrl === 'function' ? searchProviderUrl : null;
    searchProviderUrl = function(provider, q, limit, offset) {
      if (provider === 'soundcloud') return '/api/soundcloud/search?keywords=' + encodeURIComponent(q) + '&limit=' + limit + '&offset=' + Math.max(0, Number(offset) || 0);
      if (provider === 'youtube') return '/api/youtube-music/search?keywords=' + encodeURIComponent(q) + '&limit=' + Math.min(25, limit || 10);
      return baseUrl ? baseUrl(provider, q, limit, offset) : '/api/search?keywords=' + encodeURIComponent(q);
    };
    var baseModeProvider = typeof searchModeProvider === 'function' ? searchModeProvider : null;
    searchModeProvider = function(mode) {
      if (extraModes.indexOf(mode) >= 0) return mode;
      return baseModeProvider ? baseModeProvider(mode) : '';
    };

    var baseUpdateTabs = typeof updateSearchModeTabs === 'function' ? updateSearchModeTabs : null;
    updateSearchModeTabs = function() {
      if (baseUpdateTabs) baseUpdateTabs();
      extraModes.forEach(function(mode) {
        var btn = document.getElementById('search-mode-' + mode);
        if (btn) { btn.classList.toggle('active', searchMode === mode); btn.setAttribute('aria-selected', searchMode === mode ? 'true' : 'false'); }
      });
      if (typeof $input !== 'undefined' && $input && extraModes.indexOf(searchMode) >= 0) {
        var placeholders = {
          spotify: copy('Tìm trên Spotify...', 'Search Spotify...'),
          soundcloud: copy('Tìm trên SoundCloud...', 'Search SoundCloud...'),
          youtube: copy('Tìm trên YouTube Music...', 'Search YouTube Music...')
        };
        $input.placeholder = placeholders[searchMode];
      }
    };

    var baseSetMode = typeof setSearchMode === 'function' ? setSearchMode : null;
    setSearchMode = function(mode) {
      if (extraModes.indexOf(mode) < 0) return baseSetMode ? baseSetMode(mode) : undefined;
      if (searchMode === mode) return;
      searchMode = mode;
      updateSearchModeTabs();
      if (typeof clearSearchResults === 'function') clearSearchResults();
      var area = document.getElementById('search-area');
      if (area && typeof setPeek === 'function') setPeek(area, true, 'search');
      var q = typeof $input !== 'undefined' && $input ? $input.value.trim() : '';
      if (q && typeof doSearch === 'function') doSearch(q); else if (typeof renderSearchHistory === 'function') renderSearchHistory();
    };
  }

  function openOfficial(url) {
    if (!url) return;
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (_) { location.href = url; }
  }

  function patchExternalPlayback() {
    ['playSearchResult','queueSearchResult','collectSearchResult','toggleLikeSearchResult'].forEach(function(name) {
      var original = window[name];
      if (typeof original !== 'function' || original.__westernPatched) return;
      var wrapped = function(index) {
        var song = typeof playlist !== 'undefined' && playlist ? playlist[index] : null;
        if (song && (song.provider === 'soundcloud' || song.provider === 'youtube')) {
          openOfficial(song.externalUrl || song.permalinkUrl || song.youtubeMusicUrl);
          if (name !== 'playSearchResult') toast(copy('Nguồn này dùng thao tác chính thức trên dịch vụ.', 'This source uses the provider’s official service action.'));
          return;
        }
        return original.apply(this, arguments);
      };
      wrapped.__westernPatched = true;
      window[name] = wrapped;
      try { eval(name + ' = wrapped'); } catch (_) {}
    });
  }

  function installStyle() {
    if (document.getElementById('western-provider-style')) return;
    var style = document.createElement('style');
    style.id = 'western-provider-style';
    style.textContent = '.western-provider-node .western-provider-state{position:absolute;right:8px;top:7px;font-size:9px;opacity:.55}.western-provider-node.connected .western-provider-state{opacity:1;color:#72f1b8;text-shadow:0 0 10px currentColor}.western-provider-node.spotify .provider-logo{color:#1ed760}.western-provider-node.soundcloud .provider-logo{color:#ff7700}.western-provider-node.youtube .provider-logo{color:#ff4e45}';
    document.head.appendChild(style);
  }

  function init() {
    installStyle();
    patchAccountProviders();
    injectProviderButton('spotify', 'SP', 'Spotify', 'OAuth PKCE');
    injectProviderButton('soundcloud', 'SC', 'SoundCloud', copy('OAuth/API chính thức', 'Official OAuth/API'));
    injectProviderButton('youtube', 'YT', 'YouTube Music', 'YouTube Data API');
    injectSearchButton('spotify', 'SP');
    injectSearchButton('soundcloud', 'SC');
    injectSearchButton('youtube', 'YT');
    patchSearch();
    patchExternalPlayback();
    if (typeof syncAccountProviderOrderUi === 'function') syncAccountProviderOrderUi();
    if (typeof refreshSpotifyLoginStatus === 'function') refreshSpotifyLoginStatus().then(function(){ refreshProviderButton('spotify'); }).catch(function(){});
    refreshStatus('soundcloud');
    refreshStatus('youtube');
    setTimeout(function(){ refreshProviderButton('spotify'); refreshProviderButton('soundcloud'); refreshProviderButton('youtube'); updateSearchModeTabs(); }, 350);
  }

  window.MineradioWesternProviders = {
    refresh: refreshStatus,
    configureSoundcloud: configureSoundcloud,
    configureYoutube: configureYoutube,
    statuses: statuses,
    openOfficial: openOfficial
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
