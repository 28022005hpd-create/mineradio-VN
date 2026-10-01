'use strict';

(function initMineradioWesternPlayback() {
  var state = {
    provider: '',
    mode: '',
    song: null,
    index: -1,
    playing: false,
    duration: 0,
    position: 0,
    updatedAt: 0,
    switchSerial: 0,
    volume: -1,
    soundcloudAudio: null,
    soundcloudWidget: null,
    soundcloudWidgetReady: false,
    spotifyPlayer: null,
    spotifyDeviceId: '',
    spotifyReadyPromise: null,
    spotifySdkPromise: null,
    spotifyConnectPoll: 0,
    youtubePlayer: null,
    youtubeReadyPromise: null,
    youtubeApiPromise: null,
    progressTimer: 0,
    volumeTimer: 0,
    progressDrag: null
  };

  var base = {};

  function lang() {
    try { return window.MineradioI18n && window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi'; }
    catch (_) { return 'vi'; }
  }
  function copy(vi, en) { return lang() === 'en' ? en : vi; }
  function toast(message) {
    if (typeof showToast === 'function') showToast(message);
    else console.log('[WesternPlayback]', message);
  }
  function providerOf(song) {
    if (!song) return '';
    try {
      if (typeof songProviderKey === 'function') {
        var key = String(songProviderKey(song) || '').toLowerCase();
        if (key) return key;
      }
    } catch (_) {}
    return String(song.provider || song.source || song.type || '').toLowerCase();
  }
  function isWestern(provider) {
    return provider === 'spotify' || provider === 'soundcloud' || provider === 'youtube';
  }
  function isCustomPlaybackActive() {
    return isWestern(state.provider) && !!state.song;
  }
  function isExternalClockMode() {
    return state.mode === 'spotify-sdk' || state.mode === 'spotify-connect' || state.mode === 'youtube' || state.mode === 'soundcloud-widget';
  }
  async function json(url, options) {
    var response = await fetch(url, options || {});
    var payload = {};
    try { payload = await response.json(); } catch (_) {}
    if (!response.ok || payload && payload.ok === false) {
      var error = new Error(payload && (payload.message || payload.error) || ('HTTP ' + response.status));
      error.payload = payload;
      error.status = response.status;
      throw error;
    }
    return payload;
  }
  function officialUrl(song) {
    if (!song) return '';
    if (providerOf(song) === 'spotify') return song.spotifyUrl || (song.spotifyId ? 'https://open.spotify.com/track/' + encodeURIComponent(song.spotifyId) : '');
    if (providerOf(song) === 'soundcloud') return song.permalinkUrl || song.externalUrl || '';
    if (providerOf(song) === 'youtube') return song.youtubeMusicUrl || song.externalUrl || (song.youtubeVideoId ? 'https://music.youtube.com/watch?v=' + encodeURIComponent(song.youtubeVideoId) : '');
    return song.externalUrl || '';
  }
  function openOfficial(song) {
    var url = typeof song === 'string' ? song : officialUrl(song);
    if (!url) return;
    try {
      if (window.desktopWindow && typeof window.desktopWindow.openUpdatePage === 'function') {
        window.desktopWindow.openUpdatePage(url);
        return;
      }
    } catch (_) {}
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (_) { location.href = url; }
  }

  // -------------------------------------------------------------------------
  // Provider deck / attribution UI
  // -------------------------------------------------------------------------
  function ensureDock() {
    var dock = document.getElementById('western-playback-dock');
    if (dock) return dock;
    dock = document.createElement('section');
    dock.id = 'western-playback-dock';
    dock.className = 'western-playback-dock';
    dock.setAttribute('aria-live', 'polite');
    dock.innerHTML =
      '<div class="western-playback-head">' +
        '<span id="western-playback-badge" class="western-playback-badge">MR</span>' +
        '<div class="western-playback-copy"><b id="western-playback-title"></b><small id="western-playback-artist"></small></div>' +
        '<button id="western-playback-open" class="western-playback-open" type="button">↗</button>' +
      '</div>' +
      '<div id="western-playback-note" class="western-playback-note"></div>' +
      '<div id="western-youtube-wrap" class="western-youtube-wrap"><div id="western-youtube-player"></div></div>' +
      '<iframe id="western-soundcloud-widget" class="western-soundcloud-widget" title="SoundCloud player" allow="autoplay" loading="lazy"></iframe>';
    document.body.appendChild(dock);
    var open = document.getElementById('western-playback-open');
    if (open) open.onclick = function () { openOfficial(state.song); };
    installStyle();
    return dock;
  }
  function installStyle() {
    if (document.getElementById('western-playback-style')) return;
    var style = document.createElement('style');
    style.id = 'western-playback-style';
    style.textContent =
      '.western-playback-dock{position:fixed;right:18px;bottom:104px;width:min(390px,calc(100vw - 36px));z-index:2600;padding:12px;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:rgba(8,11,15,.86);backdrop-filter:blur(20px);box-shadow:0 18px 55px rgba(0,0,0,.34);opacity:0;transform:translateY(12px);pointer-events:none;transition:.22s ease}' +
      '.western-playback-dock.show{opacity:1;transform:none;pointer-events:auto}' +
      '.western-playback-head{display:flex;align-items:center;gap:10px;min-height:42px}.western-playback-badge{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;font-size:11px;font-weight:900;letter-spacing:.06em;background:rgba(255,255,255,.1)}' +
      '.western-playback-copy{min-width:0;flex:1}.western-playback-copy b,.western-playback-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.western-playback-copy b{font-size:13px}.western-playback-copy small{font-size:10px;opacity:.62;margin-top:3px}' +
      '.western-playback-open{width:32px;height:32px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer}.western-playback-note{font-size:10px;line-height:1.45;opacity:.65;margin-top:7px}' +
      '.western-playback-dock.spotify .western-playback-badge{color:#1ed760}.western-playback-dock.soundcloud .western-playback-badge{color:#ff7700}.western-playback-dock.youtube .western-playback-badge{color:#ff4e45}' +
      '.western-youtube-wrap{display:none;width:100%;min-height:203px;margin-top:10px;border-radius:12px;overflow:hidden;background:#000}.western-playback-dock.youtube .western-youtube-wrap{display:block}.western-youtube-wrap iframe{display:block;width:100%!important;height:213px!important;min-width:200px!important;min-height:200px!important}' +
      '.western-soundcloud-widget{display:none;width:100%;height:166px;border:0;margin-top:10px;border-radius:10px;overflow:hidden}.western-playback-dock.soundcloud.widget .western-soundcloud-widget{display:block}' +
      'body.spotify-official-playback #western-playback-note{opacity:.82}' +
      '@media(max-width:640px){.western-playback-dock{right:10px;bottom:92px;width:calc(100vw - 20px)}.western-youtube-wrap iframe{height:200px!important}}';
    document.head.appendChild(style);
  }
  function showDock(provider, song, mode) {
    var dock = ensureDock();
    dock.className = 'western-playback-dock show ' + provider + (mode === 'soundcloud-widget' ? ' widget' : '');
    var badge = document.getElementById('western-playback-badge');
    var title = document.getElementById('western-playback-title');
    var artist = document.getElementById('western-playback-artist');
    var note = document.getElementById('western-playback-note');
    if (badge) badge.textContent = provider === 'spotify' ? 'SP' : (provider === 'soundcloud' ? 'SC' : 'YT');
    if (title) title.textContent = song && (song.name || song.title) || '';
    if (artist) artist.textContent = song && song.artist || '';
    if (note) {
      if (provider === 'spotify') {
        note.textContent = mode === 'spotify-sdk'
          ? copy('Spotify Premium đang phát bằng Web Playback SDK chính thức. Chế độ đồng bộ hình ảnh theo âm thanh bị tắt để tuân thủ chính sách Spotify.', 'Spotify Premium is playing through the official Web Playback SDK. Audio-reactive visual synchronization is disabled for Spotify policy compliance.')
          : copy('Mineradio đang điều khiển thiết bị Spotify Connect đang hoạt động.', 'Mineradio is controlling your active Spotify Connect device.');
      } else if (provider === 'soundcloud') {
        note.textContent = mode === 'soundcloud-widget'
          ? copy('Phát bằng SoundCloud Widget chính thức.', 'Playing through the official SoundCloud Widget.')
          : copy('Nguồn âm thanh chính thức từ SoundCloud · người tải lên và nguồn được ghi công phía trên.', 'Official SoundCloud stream · uploader and source attribution are shown above.');
      } else {
        note.textContent = copy('Video được phát bằng YouTube IFrame Player chính thức và luôn hiển thị trong khi phát.', 'Video playback uses the official YouTube IFrame Player and remains visible while playing.');
      }
    }
    document.body.classList.toggle('spotify-official-playback', provider === 'spotify');
  }
  function hideDock() {
    var dock = document.getElementById('western-playback-dock');
    if (dock) dock.classList.remove('show');
    document.body.classList.remove('spotify-official-playback');
  }

  function setTrackUi(song, provider) {
    try {
      var hint = document.getElementById('hint');
      if (hint) hint.classList.add('hidden');
      var title = document.getElementById('thumb-title');
      var artist = document.getElementById('thumb-artist');
      var wrap = document.getElementById('thumb-wrap');
      if (title) title.textContent = song.name || song.title || '';
      if (artist) artist.textContent = song.artist || '';
      if (wrap) wrap.classList.add('visible');
      if (typeof updateControlTrackInfo === 'function') updateControlTrackInfo(song);
      var cover = song.cover || song.picUrl || song.albumCover || '';
      if (cover && typeof loadCoverFromUrl === 'function') {
        loadCoverFromUrl(typeof coverUrlWithSize === 'function' ? coverUrlWithSize(cover, 400) : cover, {
          seamlessTrackSwitch: true,
          noCoverTransition: false
        });
      }
      // Never attach timed third-party lyrics to official Spotify playback.
      // For all three Western players a neutral title line avoids stale lyrics.
      if (typeof setOriginalLyricsState === 'function') {
        var fallback = [song.name || song.title || '', song.artist || ''].filter(Boolean).join(' - ');
        setOriginalLyricsState(fallback ? [{ t: 0, text: fallback, duration: 9999, charCount: Math.max(1, fallback.length), fallback: true }] : [], false, 'fallback', [], 'none');
        if (typeof applyPreferredLyricsForCurrent === 'function') applyPreferredLyricsForCurrent(true);
      }
      if (typeof syncLikeStatusForSong === 'function') syncLikeStatusForSong(song);
      if (typeof updateEmptyHomeVisibility === 'function') updateEmptyHomeVisibility();
      if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
      if (typeof forcePlaybackControlsInteractive === 'function') forcePlaybackControlsInteractive();
    } catch (error) {
      console.warn('[WesternPlayback] track UI update failed', error);
    }
  }
  function beginTrack(song, idx, provider, mode) {
    state.switchSerial += 1;
    state.provider = provider;
    state.mode = mode || '';
    state.song = song;
    state.index = idx;
    state.playing = false;
    state.duration = normalizeDuration(song && (song.duration || song.durationMs));
    state.position = 0;
    state.updatedAt = performance.now();
    try {
      if (typeof finalizeListenSession === 'function') finalizeListenSession(false);
      if (typeof clearAlbumGaplessPreload === 'function') clearAlbumGaplessPreload('western-provider');
      if (typeof resetCuefieldAutoMix === 'function') resetCuefieldAutoMix('western-provider');
      if (typeof cancelBeatAnalysisTimer === 'function') cancelBeatAnalysisTimer();
      if (typeof cancelBeatPrefetchTimer === 'function') cancelBeatPrefetchTimer();
    } catch (_) {}
    currentIdx = idx;
    trackSwitchToken += 1;
    try {
      if (audio && audio !== state.soundcloudAudio) {
        audio.onended = null;
        audio.pause();
      }
    } catch (_) {}
    playing = false;
    if (typeof setPlayIcon === 'function') setPlayIcon(false);
    setTrackUi(song, provider);
    showDock(provider, song, mode);
    return state.switchSerial;
  }
  function normalizeDuration(value) {
    var n = Number(value) || 0;
    if (!isFinite(n) || n <= 0) return 0;
    return n > 1000 ? n / 1000 : n;
  }
  function setPlaying(value) {
    state.playing = !!value;
    state.updatedAt = performance.now();
    playing = !!value;
    if (typeof setPlayIcon === 'function') setPlayIcon(!!value);
    if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
    if (value && typeof switchPlaybackVisualToEmily === 'function' && state.provider !== 'spotify') {
      try { switchPlaybackVisualToEmily(); } catch (_) {}
    }
  }
  function maybeAdvance() {
    setPlaying(false);
    setTimeout(function () {
      if (typeof nextTrack === 'function') nextTrack();
    }, 30);
  }

  // -------------------------------------------------------------------------
  // SoundCloud: direct official stream, with official Widget fallback for HLS
  // -------------------------------------------------------------------------
  async function loadSoundcloudWidgetApi() {
    if (window.SC && window.SC.Widget) return window.SC;
    if (loadSoundcloudWidgetApi.promise) return loadSoundcloudWidgetApi.promise;
    loadSoundcloudWidgetApi.promise = new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = function() { window.SC && window.SC.Widget ? resolve(window.SC) : reject(new Error('SOUNDCLOUD_WIDGET_UNAVAILABLE')); };
      script.onerror = function() { reject(new Error('SOUNDCLOUD_WIDGET_LOAD_FAILED')); };
      document.head.appendChild(script);
    });
    return loadSoundcloudWidgetApi.promise;
  }
  function stopSoundcloud() {
    try {
      if (state.soundcloudAudio) {
        state.soundcloudAudio.pause();
        state.soundcloudAudio.onended = null;
      }
    } catch (_) {}
    try { if (state.soundcloudWidget) state.soundcloudWidget.pause(); } catch (_) {}
    state.soundcloudWidgetReady = false;
  }
  async function playSoundcloudWidget(song, idx, opts, serial) {
    if (serial !== state.switchSerial) return false;
    var SC = await loadSoundcloudWidgetApi();
    if (serial !== state.switchSerial) return false;
    state.mode = 'soundcloud-widget';
    showDock('soundcloud', song, state.mode);
    var frame = document.getElementById('western-soundcloud-widget');
    if (!frame) throw new Error('SOUNDCLOUD_WIDGET_FRAME_MISSING');
    var sourceUrl = officialUrl(song);
    if (!sourceUrl) throw new Error('SOUNDCLOUD_PERMALINK_MISSING');
    frame.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(sourceUrl) + '&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false';
    var widget = SC.Widget(frame);
    state.soundcloudWidget = widget;
    state.soundcloudWidgetReady = false;
    return new Promise(function(resolve, reject) {
      var settled = false;
      var timer = setTimeout(function() {
        if (settled) return;
        settled = true;
        reject(new Error('SOUNDCLOUD_WIDGET_TIMEOUT'));
      }, 10000);
      widget.bind(SC.Widget.Events.READY, function() {
        if (serial !== state.switchSerial) return;
        state.soundcloudWidgetReady = true;
        widget.getDuration(function(ms) { if (serial === state.switchSerial) state.duration = Math.max(0, Number(ms) || 0) / 1000; });
        widget.setVolume(Math.round(currentVolume() * 100));
        widget.play();
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(true);
        }
      });
      widget.bind(SC.Widget.Events.PLAY, function() { if (serial === state.switchSerial) setPlaying(true); });
      widget.bind(SC.Widget.Events.PAUSE, function() { if (serial === state.switchSerial) setPlaying(false); });
      widget.bind(SC.Widget.Events.FINISH, function() { if (serial === state.switchSerial) maybeAdvance(); });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
        if (serial !== state.switchSerial) return;
        state.position = Math.max(0, Number(data && data.currentPosition) || 0) / 1000;
        state.updatedAt = performance.now();
        if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
      });
    });
  }
  async function playSoundcloud(song, idx, opts) {
    stopOtherProviders('soundcloud');
    var serial = beginTrack(song, idx, 'soundcloud', 'soundcloud-direct');
    showLoadingSafe();
    try {
      var id = song.id || song.providerSongId || '';
      var info = await json('/api/soundcloud/song/url?id=' + encodeURIComponent(id));
      if (serial !== state.switchSerial) return false;
      if (!info.url) throw new Error('SOUNDCLOUD_STREAM_UNAVAILABLE');
      if (info.delivery === 'hls') {
        return await playSoundcloudWidget(song, idx, opts, serial);
      }
      var media = new Audio();
      state.soundcloudAudio = media;
      media.crossOrigin = 'anonymous';
      media.preload = 'auto';
      media.volume = 1;
      media.__mineradioTrackSwitchToken = trackSwitchToken;
      try { media.__mineradioQueueItemKey = typeof queueItemKey === 'function' ? queueItemKey(song) : ('soundcloud:' + id); } catch (_) {}
      audio = media;
      var proxyUrl = '/api/audio?url=' + encodeURIComponent(info.url);
      media.src = proxyUrl;
      media.addEventListener('loadedmetadata', function() {
        if (serial !== state.switchSerial) return;
        state.duration = isFinite(media.duration) && media.duration > 0 ? media.duration : state.duration;
        if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
      });
      media.addEventListener('timeupdate', function() {
        if (serial !== state.switchSerial) return;
        state.position = isFinite(media.currentTime) ? media.currentTime : 0;
        state.duration = isFinite(media.duration) && media.duration > 0 ? media.duration : state.duration;
        state.updatedAt = performance.now();
        if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
      });
      media.addEventListener('play', function() { if (serial === state.switchSerial) setPlaying(true); });
      media.addEventListener('pause', function() { if (serial === state.switchSerial && !media.ended) setPlaying(false); });
      media.addEventListener('ended', function() { if (serial === state.switchSerial) maybeAdvance(); });
      var fallbackStarted = false;
      media.addEventListener('error', function() {
        if (serial !== state.switchSerial || fallbackStarted) return;
        fallbackStarted = true;
        playSoundcloudWidget(song, idx, opts, serial).catch(function(error) {
          toast(copy('SoundCloud không thể phát bài này trong ứng dụng.', 'This SoundCloud track could not be played in the app.') + ' ' + error.message);
        });
      });
      try {
        if (typeof ensurePlaybackAudioGraph === 'function') await ensurePlaybackAudioGraph('soundcloud-official');
      } catch (graphError) {
        console.warn('[WesternPlayback] SoundCloud audio graph unavailable', graphError);
      }
      var resumeAt = Math.max(0, Number(opts && opts.resumeAt) || 0);
      if (resumeAt > 0) {
        media.addEventListener('loadedmetadata', function applyResume() {
          try { media.currentTime = Math.min(resumeAt, Math.max(0, (media.duration || resumeAt) - 0.2)); } catch (_) {}
        }, { once: true });
      }
      await media.play();
      setPlaying(true);
      return true;
    } catch (error) {
      console.warn('[WesternPlayback] SoundCloud direct playback failed', error);
      try {
        var fallback = await playSoundcloudWidget(song, idx, opts, serial);
        if (fallback) return true;
      } catch (widgetError) {
        console.warn('[WesternPlayback] SoundCloud widget fallback failed', widgetError);
      }
      hideLoadingSafe();
      toast(copy('Không phát được SoundCloud trong ứng dụng. Mở nguồn chính thức để tiếp tục.', 'SoundCloud playback failed in the app. Open the official source to continue.'));
      openOfficial(song);
      return false;
    } finally {
      hideLoadingSafe();
    }
  }

  // -------------------------------------------------------------------------
  // YouTube: official visible IFrame Player API
  // -------------------------------------------------------------------------
  function loadYoutubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (state.youtubeApiPromise) return state.youtubeApiPromise;
    state.youtubeApiPromise = new Promise(function(resolve, reject) {
      var previous = window.onYouTubeIframeAPIReady;
      var timeout = setTimeout(function() { reject(new Error('YOUTUBE_IFRAME_API_TIMEOUT')); }, 12000);
      window.onYouTubeIframeAPIReady = function() {
        try { if (typeof previous === 'function') previous(); } catch (_) {}
        clearTimeout(timeout);
        if (window.YT && window.YT.Player) resolve(window.YT);
        else reject(new Error('YOUTUBE_IFRAME_API_UNAVAILABLE'));
      };
      var script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = function() { clearTimeout(timeout); reject(new Error('YOUTUBE_IFRAME_API_LOAD_FAILED')); };
      document.head.appendChild(script);
    });
    return state.youtubeApiPromise;
  }
  async function ensureYoutubePlayer() {
    if (state.youtubePlayer) return state.youtubePlayer;
    if (state.youtubeReadyPromise) return state.youtubeReadyPromise;
    state.youtubeReadyPromise = loadYoutubeApi().then(function(YT) {
      return new Promise(function(resolve, reject) {
        ensureDock();
        var host = document.getElementById('western-youtube-player');
        if (!host) return reject(new Error('YOUTUBE_PLAYER_HOST_MISSING'));
        state.youtubePlayer = new YT.Player(host, {
          width: 380,
          height: 213,
          playerVars: {
            autoplay: 0,
            controls: 1,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
            origin: location.origin && location.origin !== 'null' ? location.origin : undefined
          },
          events: {
            onReady: function(event) {
              try { event.target.setVolume(Math.round(currentVolume() * 100)); } catch (_) {}
              resolve(event.target);
            },
            onStateChange: function(event) {
              if (state.provider !== 'youtube') return;
              var playerState = YT.PlayerState || {};
              if (event.data === playerState.PLAYING) setPlaying(true);
              else if (event.data === playerState.PAUSED) setPlaying(false);
              else if (event.data === playerState.ENDED) maybeAdvance();
              state.duration = safeYoutubeNumber('getDuration', state.duration);
              state.position = safeYoutubeNumber('getCurrentTime', state.position);
              state.updatedAt = performance.now();
            },
            onError: function(event) {
              if (state.provider !== 'youtube') return;
              setPlaying(false);
              toast(copy('Video YouTube này không cho phép phát nhúng. Hãy mở nguồn chính thức.', 'This YouTube video cannot be embedded. Open the official source instead.') + ' [' + event.data + ']');
            },
            onAutoplayBlocked: function() {
              if (state.provider !== 'youtube') return;
              toast(copy('YouTube chặn tự phát. Hãy nhấn Play một lần.', 'YouTube blocked autoplay. Press Play once.'));
            }
          }
        });
      });
    }).catch(function(error) {
      state.youtubeReadyPromise = null;
      throw error;
    });
    return state.youtubeReadyPromise;
  }
  function safeYoutubeNumber(method, fallback) {
    try {
      var player = state.youtubePlayer;
      if (player && typeof player[method] === 'function') {
        var value = Number(player[method]());
        if (isFinite(value) && value >= 0) return value;
      }
    } catch (_) {}
    return Number(fallback) || 0;
  }
  function stopYoutube() {
    try { if (state.youtubePlayer && typeof state.youtubePlayer.pauseVideo === 'function') state.youtubePlayer.pauseVideo(); } catch (_) {}
  }
  async function playYoutube(song, idx, opts) {
    stopOtherProviders('youtube');
    var serial = beginTrack(song, idx, 'youtube', 'youtube');
    showLoadingSafe();
    try {
      var videoId = song.youtubeVideoId || song.providerSongId || song.id || '';
      if (!videoId) throw new Error('YOUTUBE_VIDEO_ID_MISSING');
      var player = await ensureYoutubePlayer();
      if (serial !== state.switchSerial) return false;
      showDock('youtube', song, 'youtube');
      var startSeconds = Math.max(0, Number(opts && opts.resumeAt) || 0);
      player.loadVideoById({ videoId: String(videoId), startSeconds: startSeconds });
      try { player.setVolume(Math.round(currentVolume() * 100)); } catch (_) {}
      state.duration = safeYoutubeNumber('getDuration', state.duration);
      state.position = startSeconds;
      state.updatedAt = performance.now();
      return true;
    } catch (error) {
      console.warn('[WesternPlayback] YouTube playback failed', error);
      toast(copy('Không thể khởi tạo YouTube Player. Mở YouTube Music chính thức.', 'Could not initialize the YouTube Player. Opening YouTube Music.'));
      openOfficial(song);
      return false;
    } finally {
      hideLoadingSafe();
    }
  }

  // -------------------------------------------------------------------------
  // Spotify: official Web Playback SDK, then Spotify Connect fallback
  // -------------------------------------------------------------------------
  function loadSpotifySdk() {
    if (window.Spotify && window.Spotify.Player) return Promise.resolve(window.Spotify);
    if (state.spotifySdkPromise) return state.spotifySdkPromise;
    state.spotifySdkPromise = new Promise(function(resolve, reject) {
      var previous = window.onSpotifyWebPlaybackSDKReady;
      var timeout = setTimeout(function() { reject(new Error('SPOTIFY_SDK_TIMEOUT')); }, 12000);
      window.onSpotifyWebPlaybackSDKReady = function() {
        try { if (typeof previous === 'function') previous(); } catch (_) {}
        clearTimeout(timeout);
        if (window.Spotify && window.Spotify.Player) resolve(window.Spotify);
        else reject(new Error('SPOTIFY_SDK_UNAVAILABLE'));
      };
      var script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = function() { clearTimeout(timeout); reject(new Error('SPOTIFY_SDK_LOAD_FAILED')); };
      document.head.appendChild(script);
    });
    return state.spotifySdkPromise;
  }
  async function spotifyToken() {
    return json('/api/spotify/playback/token?t=' + Date.now());
  }
  async function ensureSpotifyPlayer() {
    if (state.spotifyPlayer && state.spotifyDeviceId) return state.spotifyPlayer;
    if (state.spotifyReadyPromise) return state.spotifyReadyPromise;
    state.spotifyReadyPromise = Promise.all([loadSpotifySdk(), spotifyToken()]).then(function(values) {
      var Spotify = values[0];
      return new Promise(function(resolve, reject) {
        var settled = false;
        var timer = setTimeout(function() {
          if (!settled) {
            settled = true;
            reject(new Error('SPOTIFY_PLAYER_READY_TIMEOUT'));
          }
        }, 12000);
        var player = new Spotify.Player({
          name: 'Mineradio',
          getOAuthToken: function(callback) {
            spotifyToken().then(function(info) { callback(info.accessToken || ''); }).catch(function() { callback(''); });
          },
          volume: currentVolume(),
          enableMediaSession: true
        });
        state.spotifyPlayer = player;
        player.addListener('ready', function(data) {
          state.spotifyDeviceId = data && data.device_id || '';
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(player);
          }
        });
        player.addListener('not_ready', function(data) {
          if (data && data.device_id === state.spotifyDeviceId) state.spotifyDeviceId = '';
        });
        ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach(function(name) {
          player.addListener(name, function(error) {
            console.warn('[Spotify SDK]', name, error && error.message);
            if (!settled && (name === 'initialization_error' || name === 'authentication_error' || name === 'account_error')) {
              settled = true;
              clearTimeout(timer);
              reject(new Error((name + ': ' + (error && error.message || '')).trim()));
            }
          });
        });
        player.addListener('autoplay_failed', function() {
          if (state.provider === 'spotify' && state.mode === 'spotify-sdk') {
            toast(copy('Spotify chặn tự phát. Hãy nhấn Play một lần.', 'Spotify blocked autoplay. Press Play once.'));
          }
        });
        player.addListener('player_state_changed', function(data) {
          if (!data || state.provider !== 'spotify' || state.mode !== 'spotify-sdk') return;
          state.position = Math.max(0, Number(data.position) || 0) / 1000;
          state.duration = Math.max(0, Number(data.duration) || 0) / 1000;
          state.updatedAt = performance.now();
          setPlaying(!data.paused);
          if (data.paused && state.duration > 0 && state.position >= state.duration - 1.1) maybeAdvance();
        });
        Promise.resolve(player.connect()).then(function(ok) {
          if (!ok && !settled) {
            settled = true;
            clearTimeout(timer);
            reject(new Error('SPOTIFY_PLAYER_CONNECT_FAILED'));
          }
        }).catch(function(error) {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(error);
          }
        });
      });
    }).catch(function(error) {
      state.spotifyReadyPromise = null;
      throw error;
    });
    return state.spotifyReadyPromise;
  }
  function stopSpotifyPoll() {
    if (state.spotifyConnectPoll) clearInterval(state.spotifyConnectPoll);
    state.spotifyConnectPoll = 0;
  }
  function startSpotifyConnectPoll(serial) {
    stopSpotifyPoll();
    var poll = async function() {
      if (serial !== state.switchSerial || state.provider !== 'spotify' || state.mode !== 'spotify-connect') return;
      try {
        var info = await json('/api/spotify/playback/state?t=' + Date.now());
        var playback = info && info.state;
        if (!playback) return;
        state.position = Math.max(0, Number(playback.progress_ms) || 0) / 1000;
        state.duration = Math.max(0, Number(playback.item && playback.item.duration_ms) || 0) / 1000;
        state.updatedAt = performance.now();
        setPlaying(!!playback.is_playing);
      } catch (_) {}
    };
    poll();
    state.spotifyConnectPoll = setInterval(poll, 1800);
  }
  async function playSpotifyConnect(song, idx, opts, serial) {
    state.mode = 'spotify-connect';
    showDock('spotify', song, state.mode);
    await json('/api/spotify/playback/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: song.spotifyId || song.providerSongId || song.id || '',
        uri: song.spotifyUri || song.uri || '',
        positionMs: Math.max(0, Math.round((Number(opts && opts.resumeAt) || 0) * 1000))
      })
    });
    if (serial !== state.switchSerial) return false;
    setPlaying(true);
    startSpotifyConnectPoll(serial);
    return true;
  }
  async function playSpotify(song, idx, opts) {
    stopOtherProviders('spotify');
    var serial = beginTrack(song, idx, 'spotify', 'spotify-sdk');
    showLoadingSafe();
    try {
      var status = typeof spotifyLoginStatus !== 'undefined' ? spotifyLoginStatus : {};
      if (!status.loggedIn || String(status.product || '').toLowerCase() !== 'premium') {
        throw Object.assign(new Error('SPOTIFY_DIRECT_REQUIRES_PREMIUM'), { allowNativeFallback: true });
      }
      try {
        var player = await ensureSpotifyPlayer();
        if (serial !== state.switchSerial) return false;
        try { if (typeof player.activateElement === 'function') await player.activateElement(); } catch (_) {}
        state.mode = 'spotify-sdk';
        showDock('spotify', song, state.mode);
        await json('/api/spotify/playback/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: state.spotifyDeviceId,
            id: song.spotifyId || song.providerSongId || song.id || '',
            uri: song.spotifyUri || song.uri || '',
            positionMs: Math.max(0, Math.round((Number(opts && opts.resumeAt) || 0) * 1000))
          })
        });
        if (serial !== state.switchSerial) return false;
        setPlaying(true);
        return true;
      } catch (sdkError) {
        console.warn('[WesternPlayback] Spotify SDK unavailable, trying Connect', sdkError);
        if (sdkError && sdkError.payload && sdkError.payload.error === 'SPOTIFY_PLAYBACK_REAUTHORIZE_REQUIRED') throw sdkError;
        return await playSpotifyConnect(song, idx, opts, serial);
      }
    } catch (error) {
      console.warn('[WesternPlayback] Spotify direct playback failed', error);
      var code = error && error.payload && error.payload.error || error.message || '';
      if (/REAUTHORIZE/.test(code)) {
        toast(copy('Spotify cần cấp lại quyền Playback. Mở mục Spotify và kết nối lại OAuth.', 'Spotify needs Playback permissions. Reconnect Spotify OAuth from the account panel.'));
      } else if (/PREMIUM/.test(code)) {
        toast(copy('Phát Spotify trực tiếp cần tài khoản Premium; Mineradio sẽ dùng cơ chế đổi nguồn hiện có.', 'Direct Spotify playback requires Premium; Mineradio will use its existing source fallback.'));
      } else {
        toast(copy('Spotify SDK/Connect chưa sẵn sàng; Mineradio sẽ thử nguồn phát dự phòng.', 'Spotify SDK/Connect is unavailable; Mineradio will try its playback fallback.'));
      }
      state.provider = '';
      state.mode = '';
      state.song = null;
      state.index = -1;
      hideDock();
      if (base.playQueueAt) return base.playQueueAt.call(window, idx, opts || {});
      return false;
    } finally {
      hideLoadingSafe();
    }
  }

  // -------------------------------------------------------------------------
  // Shared controls
  // -------------------------------------------------------------------------
  function currentVolume() {
    try {
      var value = Number(targetVolume);
      if (isFinite(value)) return Math.max(0, Math.min(1, value));
    } catch (_) {}
    return 1;
  }
  async function toggleWesternPlay() {
    if (!isCustomPlaybackActive()) return false;
    if (state.provider === 'soundcloud') {
      if (state.mode === 'soundcloud-widget' && state.soundcloudWidget) {
        if (state.playing) state.soundcloudWidget.pause(); else state.soundcloudWidget.play();
        return true;
      }
      if (state.soundcloudAudio) {
        if (state.soundcloudAudio.paused) await state.soundcloudAudio.play(); else state.soundcloudAudio.pause();
        return true;
      }
    }
    if (state.provider === 'youtube' && state.youtubePlayer) {
      if (state.playing) state.youtubePlayer.pauseVideo(); else state.youtubePlayer.playVideo();
      return true;
    }
    if (state.provider === 'spotify') {
      if (state.mode === 'spotify-sdk' && state.spotifyPlayer) {
        await state.spotifyPlayer.togglePlay();
      } else {
        await json('/api/spotify/playback/' + (state.playing ? 'pause' : 'resume'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        });
        setPlaying(!state.playing);
      }
      return true;
    }
    return false;
  }
  async function seekWestern(seconds) {
    seconds = Math.max(0, Number(seconds) || 0);
    if (!isCustomPlaybackActive()) return false;
    if (state.provider === 'soundcloud') {
      if (state.mode === 'soundcloud-widget' && state.soundcloudWidget) state.soundcloudWidget.seekTo(Math.round(seconds * 1000));
      else if (state.soundcloudAudio) state.soundcloudAudio.currentTime = seconds;
    } else if (state.provider === 'youtube' && state.youtubePlayer) {
      state.youtubePlayer.seekTo(seconds, true);
    } else if (state.provider === 'spotify') {
      if (state.mode === 'spotify-sdk' && state.spotifyPlayer && typeof state.spotifyPlayer.seek === 'function') await state.spotifyPlayer.seek(Math.round(seconds * 1000));
      else await json('/api/spotify/playback/seek', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ positionMs: Math.round(seconds * 1000) })
      });
    }
    state.position = seconds;
    state.updatedAt = performance.now();
    if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
    return true;
  }
  function stopOtherProviders(keep) {
    if (keep !== 'soundcloud') stopSoundcloud();
    if (keep !== 'youtube') stopYoutube();
    if (keep !== 'spotify') {
      stopSpotifyPoll();
      try { if (state.spotifyPlayer && state.mode === 'spotify-sdk') state.spotifyPlayer.pause(); } catch (_) {}
      if (state.provider === 'spotify' && state.mode === 'spotify-connect') {
        json('/api/spotify/playback/pause', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(function(){});
      }
    }
  }
  function leaveWesternPlayback(reason) {
    if (!isCustomPlaybackActive()) return;
    stopOtherProviders('');
    state.provider = '';
    state.mode = '';
    state.song = null;
    state.index = -1;
    state.playing = false;
    state.duration = 0;
    state.position = 0;
    hideDock();
  }
  function showLoadingSafe() { try { if (typeof showLoading === 'function') showLoading(); } catch (_) {} }
  function hideLoadingSafe() { try { if (typeof hideLoading === 'function') hideLoading(); } catch (_) {} }
  function providerPosition() {
    if (state.provider === 'youtube') return safeYoutubeNumber('getCurrentTime', state.position);
    if (state.provider === 'soundcloud' && state.mode === 'soundcloud-direct' && state.soundcloudAudio && isFinite(state.soundcloudAudio.currentTime)) return state.soundcloudAudio.currentTime;
    if (state.playing && (state.mode === 'spotify-connect')) {
      return state.position + Math.max(0, performance.now() - state.updatedAt) / 1000;
    }
    return Math.max(0, Number(state.position) || 0);
  }
  function providerDuration() {
    if (state.provider === 'youtube') return safeYoutubeNumber('getDuration', state.duration);
    if (state.provider === 'soundcloud' && state.mode === 'soundcloud-direct' && state.soundcloudAudio && isFinite(state.soundcloudAudio.duration) && state.soundcloudAudio.duration > 0) return state.soundcloudAudio.duration;
    return Math.max(0, Number(state.duration) || normalizeDuration(state.song && (state.song.duration || state.song.durationMs)));
  }
  function syncVolume() {
    if (!isCustomPlaybackActive()) return;
    var volume = currentVolume();
    if (Math.abs(volume - state.volume) < 0.005) return;
    state.volume = volume;
    try {
      if (state.provider === 'youtube' && state.youtubePlayer) state.youtubePlayer.setVolume(Math.round(volume * 100));
      else if (state.provider === 'soundcloud' && state.mode === 'soundcloud-widget' && state.soundcloudWidget) state.soundcloudWidget.setVolume(Math.round(volume * 100));
      else if (state.provider === 'spotify' && state.mode === 'spotify-sdk' && state.spotifyPlayer) state.spotifyPlayer.setVolume(volume);
      else if (state.provider === 'spotify' && state.mode === 'spotify-connect') {
        json('/api/spotify/playback/volume', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ volumePercent: Math.round(volume * 100) })
        }).catch(function(){});
      }
    } catch (_) {}
  }
  function startRuntimeTimers() {
    if (!state.progressTimer) {
      state.progressTimer = setInterval(function() {
        if (!isCustomPlaybackActive()) return;
        if (state.provider === 'spotify') {
          // Spotify Developer Policy prohibits synchronizing Spotify recordings
          // to visual media. Never feed SDK audio into Mineradio analyzers.
          try {
            bass = 0; mid = 0; treble = 0; audioEnergy = 0;
            smoothBass *= .82; smoothMid *= .82; smoothTreb *= .82; smoothEnergy *= .82;
          } catch (_) {}
        }
        if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
      }, 250);
    }
    if (!state.volumeTimer) state.volumeTimer = setInterval(syncVolume, 320);
  }

  // -------------------------------------------------------------------------
  // Monkey patches around the existing player. Native providers retain their
  // exact original code path.
  // -------------------------------------------------------------------------
  function patchCorePlayback() {
    if (typeof playQueueAt === 'function' && !playQueueAt.__westernCompletePatched) {
      base.playQueueAt = playQueueAt;
      var wrappedPlayQueueAt = async function(idx, opts) {
        var song = Array.isArray(playQueue) ? playQueue[idx] : null;
        var provider = providerOf(song);
        if (provider === 'soundcloud') return playSoundcloud(song, idx, opts || {});
        if (provider === 'youtube') return playYoutube(song, idx, opts || {});
        if (provider === 'spotify') return playSpotify(song, idx, opts || {});
        leaveWesternPlayback('native-switch');
        return base.playQueueAt.apply(this, arguments);
      };
      wrappedPlayQueueAt.__westernCompletePatched = true;
      playQueueAt = wrappedPlayQueueAt;
      window.playQueueAt = wrappedPlayQueueAt;
    }

    if (typeof playSearchResult === 'function' && !playSearchResult.__westernCompletePatched) {
      base.playSearchResult = playSearchResult;
      var wrappedPlaySearchResult = function(index) {
        var song = Array.isArray(playlist) ? playlist[index] : null;
        var provider = providerOf(song);
        if (isWestern(provider)) {
          playQueue = playlist.slice();
          return playQueueAt(index, { manual: true });
        }
        return base.playSearchResult.apply(this, arguments);
      };
      wrappedPlaySearchResult.__westernCompletePatched = true;
      playSearchResult = wrappedPlaySearchResult;
      window.playSearchResult = wrappedPlaySearchResult;
    }

    if (typeof queueSearchResult === 'function' && !queueSearchResult.__westernCompletePatched) {
      base.queueSearchResult = queueSearchResult;
      var wrappedQueueSearchResult = function(index) {
        var song = Array.isArray(playlist) ? playlist[index] : null;
        if (song && (providerOf(song) === 'soundcloud' || providerOf(song) === 'youtube')) {
          var insertAt = currentIdx >= 0 ? Math.min(playQueue.length, currentIdx + 1) : playQueue.length;
          playQueue.splice(insertAt, 0, Object.assign({}, song));
          toast(copy('Đã thêm vào hàng đợi.', 'Added to queue.'));
          return;
        }
        return base.queueSearchResult.apply(this, arguments);
      };
      wrappedQueueSearchResult.__westernCompletePatched = true;
      queueSearchResult = wrappedQueueSearchResult;
      window.queueSearchResult = wrappedQueueSearchResult;
    }

    if (typeof togglePlay === 'function' && !togglePlay.__westernCompletePatched) {
      base.togglePlay = togglePlay;
      var wrappedTogglePlay = async function() {
        if (isCustomPlaybackActive()) {
          try { return await toggleWesternPlay(); }
          catch (error) { toast(copy('Điều khiển phát thất bại: ', 'Playback control failed: ') + error.message); return false; }
        }
        return base.togglePlay.apply(this, arguments);
      };
      wrappedTogglePlay.__westernCompletePatched = true;
      togglePlay = wrappedTogglePlay;
      window.togglePlay = wrappedTogglePlay;
    }

    if (typeof getPlaybackCurrentSeconds === 'function' && !getPlaybackCurrentSeconds.__westernCompletePatched) {
      base.getPlaybackCurrentSeconds = getPlaybackCurrentSeconds;
      var wrappedCurrent = function() {
        if (isExternalClockMode()) return providerPosition();
        return base.getPlaybackCurrentSeconds.apply(this, arguments);
      };
      wrappedCurrent.__westernCompletePatched = true;
      getPlaybackCurrentSeconds = wrappedCurrent;
      window.getPlaybackCurrentSeconds = wrappedCurrent;
    }
    if (typeof getPlaybackDurationSeconds === 'function' && !getPlaybackDurationSeconds.__westernCompletePatched) {
      base.getPlaybackDurationSeconds = getPlaybackDurationSeconds;
      var wrappedDuration = function() {
        if (isExternalClockMode()) return providerDuration();
        return base.getPlaybackDurationSeconds.apply(this, arguments);
      };
      wrappedDuration.__westernCompletePatched = true;
      getPlaybackDurationSeconds = wrappedDuration;
      window.getPlaybackDurationSeconds = wrappedDuration;
    }

    patchSearchMetadata();
    bindWesternProgressSeek();
  }

  function patchSearchMetadata() {
    if (typeof searchResultMetaHtml === 'function' && !searchResultMetaHtml.__westernCompletePatched) {
      base.searchResultMetaHtml = searchResultMetaHtml;
      var wrappedMetaHtml = function(song, index) {
        var provider = providerOf(song);
        if (!isWestern(provider)) return base.searchResultMetaHtml.apply(this, arguments);
        var artist = String(song && song.artist || '').trim();
        var album = String(song && song.album || '').trim();
        var label = provider === 'spotify'
          ? copy('Spotify Premium / Connect', 'Spotify Premium / Connect')
          : (provider === 'soundcloud' ? copy('Phát trực tiếp SoundCloud', 'Direct SoundCloud playback') : copy('YouTube Player trong ứng dụng', 'In-app YouTube Player'));
        var bits = [];
        if (album) bits.push(album);
        bits.push(label);
        var tail = ' · ' + (typeof escHtml === 'function' ? escHtml(bits.join(' · ')) : bits.join(' · '));
        if (!artist) return tail.slice(3);
        var escapedArtist = typeof escHtml === 'function' ? escHtml(artist) : artist;
        return '<button class="search-artist-link" type="button" onclick="event.stopPropagation();openSearchResultArtist(' + index + ')">' + escapedArtist + '</button>' + tail;
      };
      wrappedMetaHtml.__westernCompletePatched = true;
      searchResultMetaHtml = wrappedMetaHtml;
      window.searchResultMetaHtml = wrappedMetaHtml;
    }
    if (typeof searchResultMetaText === 'function' && !searchResultMetaText.__westernCompletePatched) {
      base.searchResultMetaText = searchResultMetaText;
      var wrappedMetaText = function(song) {
        var provider = providerOf(song);
        if (!isWestern(provider)) return base.searchResultMetaText.apply(this, arguments);
        var label = provider === 'spotify' ? 'Spotify Premium / Connect' : (provider === 'soundcloud' ? 'SoundCloud Direct' : 'YouTube Player');
        return [song.artist, song.album, label].filter(Boolean).join(' · ');
      };
      wrappedMetaText.__westernCompletePatched = true;
      searchResultMetaText = wrappedMetaText;
      window.searchResultMetaText = wrappedMetaText;
    }
  }

  function bindWesternProgressSeek() {
    var bar = document.getElementById('progress-bar');
    if (!bar || bar.__westernPlaybackSeekBound) return;
    bar.__westernPlaybackSeekBound = true;
    function point(e) {
      var rect = bar.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      var duration = providerDuration();
      return { ratio: ratio, seconds: ratio * duration, duration: duration };
    }
    bar.addEventListener('pointerdown', function(e) {
      if (!isExternalClockMode()) return;
      e.preventDefault(); e.stopImmediatePropagation();
      state.progressDrag = { pointerId: e.pointerId };
      try { bar.setPointerCapture(e.pointerId); } catch (_) {}
      var p = point(e);
      if (typeof setProgressVisual === 'function') setProgressVisual(p.ratio * 100);
      var display = document.getElementById('time-display');
      if (display && typeof formatProgramTime === 'function') display.textContent = formatProgramTime(p.seconds) + ' / ' + formatProgramTime(p.duration);
    }, true);
    bar.addEventListener('pointermove', function(e) {
      if (!state.progressDrag || state.progressDrag.pointerId !== e.pointerId || !isExternalClockMode()) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var p = point(e);
      if (typeof setProgressVisual === 'function') setProgressVisual(p.ratio * 100);
      var display = document.getElementById('time-display');
      if (display && typeof formatProgramTime === 'function') display.textContent = formatProgramTime(p.seconds) + ' / ' + formatProgramTime(p.duration);
    }, true);
    bar.addEventListener('pointerup', function(e) {
      if (!state.progressDrag || state.progressDrag.pointerId !== e.pointerId || !isExternalClockMode()) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var p = point(e);
      state.progressDrag = null;
      try { bar.releasePointerCapture(e.pointerId); } catch (_) {}
      seekWestern(p.seconds).catch(function(error) { toast(copy('Không thể tua: ', 'Seek failed: ') + error.message); });
    }, true);
    bar.addEventListener('pointercancel', function(e) {
      if (!state.progressDrag || state.progressDrag.pointerId !== e.pointerId) return;
      e.preventDefault(); e.stopImmediatePropagation();
      state.progressDrag = null;
    }, true);
  }

  function upgradeProviderCapabilities() {
    try {
      var western = window.MineradioWesternProviders;
      if (!western || !western.statuses) return;
      ['soundcloud', 'youtube'].forEach(function(provider) {
        var status = western.statuses[provider] || {};
        status.capabilities = Object.assign({}, status.capabilities || {}, {
          inAppPlayback: true,
          officialPlayback: true,
          playableUrl: provider === 'soundcloud',
          embeddedPlayback: provider === 'youtube'
        });
        western.statuses[provider] = status;
      });
    } catch (_) {}
  }

  function init() {
    ensureDock();
    patchCorePlayback();
    upgradeProviderCapabilities();
    startRuntimeTimers();
    setTimeout(function() { patchCorePlayback(); upgradeProviderCapabilities(); }, 250);
    setTimeout(function() { patchCorePlayback(); upgradeProviderCapabilities(); }, 900);
  }

  window.MineradioWesternPlayback = {
    state: state,
    playSoundcloud: playSoundcloud,
    playYoutube: playYoutube,
    playSpotify: playSpotify,
    seek: seekWestern,
    toggle: toggleWesternPlay,
    openOfficial: openOfficial,
    leave: leaveWesternPlayback
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else setTimeout(init, 0);
})();
