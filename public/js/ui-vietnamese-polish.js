'use strict';

(function installMineradioVietnameseUiPolish() {
  var attempts = 0;

  function injectStyles() {
    if (document.getElementById('mineradio-vi-polish-style')) return;
    var style = document.createElement('style');
    style.id = 'mineradio-vi-polish-style';
    style.textContent = [
      '#quality-option-list .quality-option{transition:background .16s ease,border-color .16s ease,opacity .16s ease,transform .16s ease;}',
      '#quality-option-list .quality-option:not(:disabled):hover{transform:translateX(2px);}',
      '#quality-option-list .quality-option.active{border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.09);}',
      '#quality-option-list .quality-option.effective:not(.active){box-shadow:inset 2px 0 0 rgba(255,255,255,.28);}',
      '#quality-option-list .quality-option.cap-limited:not(:disabled){opacity:.88;}',
      '#quality-option-list .quality-option.locked:disabled{opacity:.46;cursor:not-allowed;}',
      '#quality-option-list .quality-option.svip-only.locked span:first-child::after{content:"SVIP";display:inline-flex;margin-left:7px;padding:2px 5px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font-size:8px;line-height:1;letter-spacing:.06em;vertical-align:middle;opacity:.72;}',
      '#quality-option-list .quality-option span:first-child{white-space:nowrap;}',
      '#quality-option-list .quality-option small{line-height:1.25;}',
      '#lyrics-toggle-btn .lyrics-word-icon{font-size:11px;letter-spacing:-.03em;white-space:nowrap;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function vietnameseHomeText(value) {
    var text = String(value == null ? '' : value).trim();
    var map = {
      '开始听歌': 'Bắt đầu nghe',
      '继续播放': 'Tiếp tục phát',
      '音乐库': 'Thư viện nhạc',
      '每日推荐': 'Gợi ý hằng ngày',
      '最近播放': 'Đã phát gần đây',
      '为你挑选': 'Dành cho bạn',
      '音乐发现': 'Khám phá âm nhạc',
      '平台推荐': 'Gợi ý nền tảng',
      'CONTINUE': 'TIẾP TỤC',
      'LIBRARY': 'THƯ VIỆN',
      'DAILY': 'HẰNG NGÀY',
      'DAILY MIX': 'GỢI Ý HẰNG NGÀY',
      'RECENT': 'GẦN ĐÂY',
      'FOR YOU': 'DÀNH CHO BẠN',
      'DISCOVER': 'KHÁM PHÁ',
      'PLATFORM PICKS': 'GỢI Ý NỀN TẢNG'
    };
    return map[text] || text;
  }

  function polishHomeRuntime() {
    if (typeof HOME_DASHBOARD_REVIEW_DEFAULTS !== 'undefined') {
      HOME_DASHBOARD_REVIEW_DEFAULTS = [
        { text: 'Có những bài hát không phải bỗng nhiên hay hơn, mà là đến lúc ta hiểu được chúng.', source: 'Bình luận hằng ngày' },
        { text: 'Đi chậm một chút cũng không sao, miễn là vẫn tiến gần hơn tới cuộc sống mình yêu thích.', source: 'Bình luận hằng ngày' },
        { text: 'Lỡ hoàng hôn thì vẫn còn một bầu trời đầy sao.', source: 'Bình luận hằng ngày' },
        { text: 'Giữ lấy đam mê và tiến đến hành trình tiếp theo.', source: 'Bình luận hằng ngày' },
        { text: 'Câu trả lời ở trên đường, còn tự do ở trong gió.', source: 'Bình luận hằng ngày' },
        { text: 'Hãy bắt đầu âm thanh hôm nay từ nơi bạn yêu thích.', source: 'Mineradio' }
      ];
    }

    if (typeof homeDashboardGeneratedCover === 'function' && !homeDashboardGeneratedCover.__mineradioViPolished) {
      var originalGeneratedCover = homeDashboardGeneratedCover;
      homeDashboardGeneratedCover = function (title, label, tone) {
        return originalGeneratedCover(vietnameseHomeText(title), vietnameseHomeText(label), tone);
      };
      homeDashboardGeneratedCover.__mineradioViPolished = true;
    }

    if (typeof homeDashboardCoverInitials === 'function' && !homeDashboardCoverInitials.__mineradioViPolished) {
      var originalInitials = homeDashboardCoverInitials;
      homeDashboardCoverInitials = function (text) {
        var localized = vietnameseHomeText(text);
        var known = {
          'Bắt đầu nghe': 'BĐ',
          'Tiếp tục phát': 'TT',
          'Thư viện nhạc': 'TV',
          'Gợi ý hằng ngày': 'GY',
          'Đã phát gần đây': 'GĐ',
          'Dành cho bạn': 'DB',
          'Khám phá âm nhạc': 'KP',
          'Gợi ý nền tảng': 'NT'
        };
        return known[localized] || originalInitials(localized || 'Nhạc');
      };
      homeDashboardCoverInitials.__mineradioViPolished = true;
    }

    if (typeof homeDashboardUpdateClock === 'function' && !homeDashboardUpdateClock.__mineradioViPolished) {
      homeDashboardUpdateClock = function () {
        var time = document.getElementById('daily-review-time');
        var date = document.getElementById('daily-review-date');
        if (!time || !date) return;
        var now = new Date();
        var weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        var dd = String(now.getDate()).padStart(2, '0');
        var mm = String(now.getMonth() + 1).padStart(2, '0');
        time.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        date.textContent = dd + '/' + mm + '/' + now.getFullYear() + ' · ' + weekdays[now.getDay()];
      };
      homeDashboardUpdateClock.__mineradioViPolished = true;
    }
  }

  function polishStaticControls() {
    var lyricButton = document.getElementById('lyrics-toggle-btn');
    if (lyricButton) {
      lyricButton.title = 'Lời bài hát';
      lyricButton.setAttribute('aria-label', 'Lời bài hát');
      var word = lyricButton.querySelector('.lyrics-word-icon');
      if (word) word.textContent = 'Lời';
    }
    var searchAll = document.getElementById('search-mode-song');
    if (searchAll && String(searchAll.textContent || '').trim() === 'All') searchAll.textContent = 'Tất cả';
  }

  function installQualityUi() {
    if (typeof PLAYBACK_QUALITY_OPTIONS === 'undefined' || typeof updatePlaybackQualityUi !== 'function') return false;

    if (typeof PLAYBACK_QUALITY_DEFAULTS === 'object' && PLAYBACK_QUALITY_DEFAULTS) {
      PLAYBACK_QUALITY_DEFAULTS.soundcloud = 'standard';
      PLAYBACK_QUALITY_DEFAULTS.youtube = 'standard';
    }

    PLAYBACK_QUALITY_OPTIONS.netease = [
      { key: 'jymaster', title: 'Master chất lượng cao', sub: 'NetEase SVIP · chất lượng tối đa', svip: true },
      { key: 'hires', title: 'Hi-Res', sub: 'Ưu tiên chi tiết và độ phân giải cao' },
      { key: 'lossless', title: 'Lossless FLAC (SQ)', sub: 'Không mất dữ liệu · ưu tiên FLAC' },
      { key: 'exhigh', title: '320 kbps (HQ)', sub: 'MP3 chất lượng cao' },
      { key: 'standard', title: '128 kbps', sub: 'MP3 tiêu chuẩn · tương thích cao' }
    ];
    PLAYBACK_QUALITY_OPTIONS.qq = [
      { key: 'hires', title: 'Hi-Res FLAC', sub: 'QQ Music · ưu tiên độ phân giải cao' },
      { key: 'lossless', title: 'Lossless FLAC (SQ)', sub: 'QQ Music · ưu tiên ổn định' },
      { key: 'exhigh', title: '320 kbps MP3', sub: 'QQ Music · chất lượng cao' },
      { key: 'standard', title: '128 kbps MP3', sub: 'QQ Music · ưu tiên tương thích' }
    ];
    PLAYBACK_QUALITY_OPTIONS.kugou = [
      { key: 'hires', title: 'Hi-Res', sub: 'Kugou Music · ưu tiên độ phân giải cao' },
      { key: 'lossless', title: 'Lossless FLAC (SQ)', sub: 'Kugou Music · ưu tiên ổn định' },
      { key: 'exhigh', title: '320 kbps MP3', sub: 'Kugou Music · chất lượng cao' },
      { key: 'standard', title: '128 kbps MP3', sub: 'Kugou Music · ưu tiên tương thích' }
    ];
    PLAYBACK_QUALITY_OPTIONS.qishui = [
      { key: 'standard', title: 'Nguồn khớp Qishui', sub: 'Qishui Music · tự chọn nguồn phát hợp lệ' }
    ];
    PLAYBACK_QUALITY_OPTIONS.spotify = [
      { key: 'standard', title: 'Spotify', sub: 'Chất lượng do Spotify quản lý khi phát trực tiếp' }
    ];
    PLAYBACK_QUALITY_OPTIONS.soundcloud = [
      { key: 'standard', title: 'SoundCloud', sub: 'Chất lượng do SoundCloud cung cấp' }
    ];
    PLAYBACK_QUALITY_OPTIONS.youtube = [
      { key: 'standard', title: 'YouTube Music', sub: 'Chất lượng do YouTube quản lý' }
    ];

    var baseNormalizeProvider = normalizePlaybackProvider;
    normalizePlaybackProvider = function (provider) {
      var value = String(provider || '').toLowerCase();
      if (value === 'soundcloud' || value === 'sc') return 'soundcloud';
      if (value === 'youtube' || value === 'youtube-music' || value === 'youtube_music' || value === 'ytmusic' || value === 'yt') return 'youtube';
      return baseNormalizeProvider(provider);
    };

    playbackQualityLabel = function (value, provider) {
      provider = normalizePlaybackProvider(provider || currentPlaybackQualityProvider());
      value = normalizePlaybackQualityForProvider(value, provider);
      if (provider === 'spotify') return 'Spotify';
      if (provider === 'soundcloud') return 'SoundCloud';
      if (provider === 'youtube') return 'YouTube Music';
      if (provider === 'qishui') return 'Nguồn khớp Qishui';
      if (provider === 'qq') {
        if (value === 'hires') return 'Hi-Res FLAC';
        if (value === 'lossless') return 'Lossless FLAC (SQ)';
        if (value === 'exhigh') return '320 kbps MP3';
        return '128 kbps MP3';
      }
      if (provider === 'kugou') {
        if (value === 'hires') return 'Hi-Res';
        if (value === 'lossless') return 'Lossless FLAC (SQ)';
        if (value === 'exhigh') return '320 kbps MP3';
        return '128 kbps MP3';
      }
      if (value === 'jymaster') return 'Master chất lượng cao';
      if (value === 'hires') return 'Hi-Res';
      if (value === 'lossless') return 'Lossless FLAC (SQ)';
      if (value === 'exhigh') return '320 kbps (HQ)';
      return '128 kbps';
    };

    playbackQualityShortLabel = function (value, provider) {
      provider = normalizePlaybackProvider(provider || currentPlaybackQualityProvider());
      value = normalizePlaybackQualityForProvider(value, provider);
      if (provider === 'spotify') return 'SP';
      if (provider === 'soundcloud') return 'SC';
      if (provider === 'youtube') return 'YT';
      if (provider === 'qishui') return 'QS';
      if (provider === 'qq') return value === 'hires' ? 'QQ HI-RES' : (value === 'lossless' ? 'QQ SQ' : (value === 'exhigh' ? 'QQ 320' : 'QQ 128'));
      if (provider === 'kugou') return value === 'hires' ? 'KG HI-RES' : (value === 'lossless' ? 'KG SQ' : (value === 'exhigh' ? 'KG 320' : 'KG 128'));
      if (value === 'jymaster') return 'MASTER';
      if (value === 'hires') return 'HI-RES';
      if (value === 'lossless') return 'SQ';
      if (value === 'exhigh') return 'HQ';
      return 'STD';
    };

    function providerName(provider) {
      if (provider === 'netease') return 'NetEase Cloud Music';
      if (provider === 'qq') return 'QQ Music';
      if (provider === 'kugou') return 'Kugou Music';
      if (provider === 'qishui') return 'Qishui Music';
      if (provider === 'spotify') return 'Spotify';
      if (provider === 'soundcloud') return 'SoundCloud';
      if (provider === 'youtube') return 'YouTube Music';
      return 'Nguồn phát';
    }

    updatePlaybackQualityUi = function () {
      var provider = currentPlaybackQualityProvider();
      var currentSong = Array.isArray(playQueue) && currentIdx >= 0 && currentIdx < playQueue.length ? playQueue[currentIdx] : null;
      var currentQuality = getProviderPlaybackQuality(provider);
      var canUseSvip = provider === 'netease' && hasProviderSvip('netease', loginStatus);

      if (provider === 'netease' && currentQuality === 'jymaster' && !canUseSvip) {
        setProviderPlaybackQuality('netease', 'hires');
        currentQuality = 'hires';
      }

      var runtimeCapQuality = playbackQualityCapValue(currentSong, provider);
      var effectiveQuality = effectivePlaybackQualityForSong(currentSong, provider, currentQuality);
      playbackQuality = currentQuality;

      var label = document.getElementById('quality-btn-label');
      var btn = document.getElementById('quality-btn');
      var list = document.getElementById('quality-option-list');

      if (label) label.textContent = playbackQualityShortLabel(effectiveQuality, provider);
      if (btn) {
        btn.title = 'Chất lượng ' + providerName(provider) + ': ' + playbackQualityLabel(effectiveQuality, provider);
        if (currentQuality !== effectiveQuality) btn.title += ' · Ưu tiên đã lưu: ' + playbackQualityLabel(currentQuality, provider);
      }

      if (list) {
        list.innerHTML = playbackQualityOptions(provider).map(function (item) {
          var q = normalizePlaybackQualityForProvider(item.key, provider);
          var svipLocked = !!(item.svip && !canUseSvip);
          var capLimited = playbackQualityAboveCap(q, provider, runtimeCapQuality);
          var sub = item.sub || '';
          if (svipLocked) sub = 'Cần tài khoản NetEase SVIP';
          else if (capLimited) sub = 'Bài này tối đa ' + playbackQualityLabel(runtimeCapQuality, provider) + ' · vẫn lưu mức ưu tiên';
          return '<button class="quality-option' +
            (item.svip ? ' svip-only' : '') +
            (svipLocked ? ' locked' : '') +
            (capLimited ? ' cap-limited' : '') +
            (q === currentQuality ? ' active' : '') +
            (q === effectiveQuality ? ' effective' : '') +
            '" data-quality="' + item.key + '" data-svip="' + (item.svip ? '1' : '0') + '"' +
            (svipLocked ? ' disabled aria-disabled="true"' : ' aria-disabled="false"') +
            ' onclick="setPlaybackQuality(\'' + item.key + '\')">' +
            '<span>' + escHtml(item.title) + '</span><small>' + escHtml(sub) + '</small></button>';
        }).join('');

        Array.prototype.forEach.call(list.querySelectorAll('.quality-option'), function (option) {
          var q = normalizePlaybackQualityForProvider(option.dataset.quality, provider);
          var svipLocked = option.dataset.svip === '1' && !canUseSvip;
          var capLimited = playbackQualityAboveCap(q, provider, runtimeCapQuality);
          if (svipLocked) option.title = 'Cần tài khoản NetEase SVIP';
          else if (capLimited) option.title = 'Bài hiện tại sẽ tự hạ xuống ' + playbackQualityLabel(runtimeCapQuality, provider);
          else option.title = playbackQualityLabel(q, provider);
        });
      }
    };

    setPlaybackQuality = function (value) {
      var provider = currentPlaybackQualityProvider();
      var currentSong = Array.isArray(playQueue) && currentIdx >= 0 && currentIdx < playQueue.length ? playQueue[currentIdx] : null;
      var next = normalizePlaybackQualityForProvider(value, provider);
      var canUseSvip = provider === 'netease' && hasProviderSvip('netease', loginStatus);

      if (provider === 'netease' && next === 'jymaster' && !canUseSvip) {
        showToast(hasPlatformLogin('netease') ? 'Master chất lượng cao cần NetEase SVIP' : 'Đăng nhập NetEase SVIP để dùng Master chất lượng cao');
        return;
      }

      setProviderPlaybackQuality(provider, next);
      var cap = playbackQualityCapValue(currentSong, provider);
      var effective = effectivePlaybackQualityForSong(currentSong, provider, next);
      updatePlaybackQualityUi();

      var wrap = document.getElementById('quality-control');
      if (wrap) wrap.classList.remove('open');

      if (cap && playbackQualityAboveCap(next, provider, cap)) {
        if (typeof showSourceFallbackNotice === 'function') {
          showSourceFallbackNotice('Đã lưu mức ưu tiên', 'Bài hiện tại chỉ phát tối đa ' + playbackQualityLabel(cap, provider) + '. Mineradio sẽ tự hạ chất lượng cho bài này.');
        } else {
          showToast('Đã lưu mức ưu tiên · bài hiện tại tối đa ' + playbackQualityLabel(cap, provider));
        }
      }
      applyPlaybackQualityToCurrentTrack(effective, provider);
    };

    applyPlaybackQualityToCurrentTrack = function (nextQuality, provider) {
      var song = currentIdx >= 0 && currentIdx < playQueue.length ? playQueue[currentIdx] : null;
      provider = normalizePlaybackProvider(provider || songProviderKey(song));
      var label = playbackQualityLabel(nextQuality || getProviderPlaybackQuality(provider), provider);
      if (!canReloadCurrentTrackForQuality()) {
        showToast('Ưu tiên chất lượng: ' + label + ' · áp dụng từ lần phát tiếp theo');
        return;
      }
      var resumeAt = audio && isFinite(audio.currentTime) ? audio.currentTime : 0;
      showToast('Đang chuyển chất lượng: ' + label);
      Promise.resolve(playQueueAt(currentIdx, {
        qualityOverride: nextQuality || getProviderPlaybackQuality(provider),
        qualitySwitch: true,
        resumeAt: resumeAt,
        preserveHomeState: true
      })).catch(function (error) {
        console.warn('[QualitySwitch]', error);
        showToast('Chuyển chất lượng thất bại; đã giữ mức ưu tiên');
      }).finally(function () {
        if (typeof forcePlaybackControlsInteractive === 'function') forcePlaybackControlsInteractive();
      });
    };

    updatePlaybackQualityUi();
    return true;
  }

  function install() {
    if (window.__mineradioVietnameseUiPolishInstalled) return;
    if (typeof PLAYBACK_QUALITY_OPTIONS === 'undefined' || typeof updatePlaybackQualityUi !== 'function') {
      attempts += 1;
      if (attempts < 40) setTimeout(install, 50);
      return;
    }
    window.__mineradioVietnameseUiPolishInstalled = true;
    injectStyles();
    polishHomeRuntime();
    polishStaticControls();
    installQualityUi();
    if (typeof homeDashboardUpdateClock === 'function') homeDashboardUpdateClock();
    setTimeout(polishStaticControls, 250);
    setTimeout(function () {
      polishStaticControls();
      if (typeof updatePlaybackQualityUi === 'function') updatePlaybackQualityUi();
    }, 900);
  }

  setTimeout(install, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
})();
