'use strict';

(function initMineradioFinalUiLocalization() {
  const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
  const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;
  const ATTRS = ['title', 'aria-label', 'aria-description', 'placeholder', 'data-tooltip', 'data-label'];

  // Content that belongs to the music/user/provider must not be destructively
  // translated. Exact app placeholders are still translated separately.
  const RAW_CONTENT = [
    '#stage-lyrics', '#desktop-lyrics-root', '#desktop-lyrics',
    '.lyric-line', '.lyrics-line', '[data-lyric-line]',
    '#thumb-title', '#thumb-artist', '[data-track-title]', '[data-track-artist]',
    '.shelf-track-title', '.shelf-track-artist', '.playlist-track-title', '.playlist-track-artist',
    '.search-result-title', '.search-artist-link',
    '.mini-queue-name', '.mini-queue-sub', '.qi-name', '.queue-artist-link',
    '.pl-name', '.pl-detail-title', '.pl-detail-row-title', '.pl-detail-row-artist',
    '.home-card-title', '.home-card-sub', '#home-next-title', '#home-next-artist',
    '.home-discovery-title', '.home-discovery-sub',
    '.user-name', '.user-nickname', '.account-name', '.profile-name'
  ].join(',');

  // These surfaces combine provider metadata with app-owned status text. Translate
  // only known UI fragments and counters, while leaving unknown Han metadata intact.
  const MIXED_CONTENT = [
    '.search-result-meta', '.pl-sub', '.pl-detail-sub', '.pl-detail-count',
    '.home-platform-daily-list', '.home-platform-track-list',
    '.track-detail-meta', '.track-detail-sub', '.song-meta', '.track-meta'
  ].join(',');

  const EXTRA_ROWS = [
    // Search and source switching
    ['搜索历史', 'Lịch sử tìm kiếm', 'Search history'],
    ['清空', 'Xóa hết', 'Clear'],
    ['搜索播客、电台...', 'Tìm podcast, đài phát...', 'Search podcasts, radio...'],
    ['搜索酷狗音乐...', 'Tìm trên Kugou Music...', 'Search Kugou Music...'],
    ['搜索 QQ 音乐...', 'Tìm trên QQ Music...', 'Search QQ Music...'],
    ['搜索网易云音乐...', 'Tìm trên NetEase Cloud Music...', 'Search NetEase Cloud Music...'],
    ['搜索歌曲、歌手...', 'Tìm bài hát, ca sĩ...', 'Search songs, artists...'],
    ['搜索汽水音乐匹配源...', 'Tìm nguồn khớp trên Qishui Music...', 'Search matching sources on Qishui Music...'],
    ['切换音源', 'Chuyển nguồn phát', 'Switch audio source'],
    ['正在匹配', 'Đang tìm nguồn khớp', 'Matching sources'],
    ['保留当前进度', 'Giữ nguyên tiến độ hiện tại', 'Keep current position'],
    ['当前音源', 'Nguồn phát hiện tại', 'Current source'],
    ['当前', 'Hiện tại', 'Current'],
    ['匹配源', 'Nguồn khớp', 'Matched source'],
    ['可切换', 'Có thể chuyển', 'Available'],
    ['检测中', 'Đang kiểm tra', 'Checking'],
    ['无匹配', 'Không có nguồn khớp', 'No match'],
    ['切换到', 'Chuyển sang', 'Switch to'],
    ['播放将自动换源', 'Khi phát sẽ tự đổi nguồn', 'Playback will switch source automatically'],
    ['当前歌曲不支持切换音源', 'Bài hiện tại không hỗ trợ đổi nguồn phát', 'The current track does not support source switching'],
    ['未找到可切换音源', 'Không tìm thấy nguồn phát có thể chuyển', 'No switchable source found'],
    ['暂时没有匹配到同名同歌手版本。', 'Tạm thời chưa tìm thấy bản cùng tên và cùng ca sĩ.', 'No same-title, same-artist version is currently available.'],
    ['该平台无正版音源', 'Nền tảng này không có nguồn phát phù hợp', 'No suitable source on this platform'],
    ['正在切换音源', 'Đang chuyển nguồn phát', 'Switching audio source'],
    ['当前歌曲', 'Bài hiện tại', 'Current track'],
    ['音源切换失败', 'Chuyển nguồn phát thất bại', 'Source switch failed'],
    ['已保留当前播放队列，请稍后再试。', 'Đã giữ nguyên hàng đợi hiện tại. Vui lòng thử lại sau.', 'The current queue was preserved. Please try again later.'],
    ['QQ 播放需会话/授权', 'QQ Music cần phiên đăng nhập/quyền phát', 'QQ Music playback requires a session/authorization'],
    ['酷狗播放需会话/授权', 'Kugou Music cần phiên đăng nhập/quyền phát', 'Kugou Music playback requires a session/authorization'],
    ['汽水匹配源，播放会自动换源', 'Nguồn khớp Qishui; khi phát sẽ tự đổi nguồn', 'Qishui matched source; playback will switch automatically'],
    ['Spotify 匹配源，播放会自动换源', 'Nguồn khớp Spotify; khi phát sẽ tự đổi nguồn', 'Spotify matched source; playback will switch automatically'],
    ['搜索能力暂未就绪，请先完成该平台连接', 'Tìm kiếm trên nền tảng này chưa sẵn sàng; hãy kết nối tài khoản trước', 'Search is not ready for this platform; connect the account first'],
    ['当前没有可用的音乐目录搜索源', 'Hiện không có nguồn danh mục nhạc khả dụng để tìm kiếm', 'No music catalog search source is currently available'],

    // Queue
    ['已设为下一首:', 'Đã đặt phát tiếp:', 'Set as next:'],
    ['后续歌曲载入中断', 'Tải các bài tiếp theo bị gián đoạn', 'Loading later tracks was interrupted'],
    ['正在载入下一批', 'Đang tải nhóm tiếp theo', 'Loading next batch'],
    ['已准备', 'Đã sẵn sàng', 'Ready'],
    ['播放或滚动到末尾时继续', 'Sẽ tải tiếp khi phát hoặc cuộn đến cuối', 'Continues when playing or scrolling to the end'],
    ['再载一批', 'Tải thêm một nhóm', 'Load another batch'],
    ['取消常开歌单', 'Tắt ghim bảng playlist', 'Unpin playlist panel'],
    ['常开歌单', 'Ghim bảng playlist', 'Pin playlist panel'],
    ['左侧歌单已常开', 'Đã ghim bảng playlist bên trái', 'Left playlist panel pinned'],
    ['左侧歌单已恢复自动隐藏', 'Bảng playlist bên trái đã trở lại tự ẩn', 'Left playlist panel restored to auto-hide'],
    ['正在播放', 'Đang phát', 'Playing'],
    ['队列为空，先搜索或打开歌单', 'Hàng đợi trống. Hãy tìm kiếm hoặc mở playlist trước.', 'Queue is empty. Search or open a playlist first.'],
    ['队列为空，搜索后点 + 设为下一首', 'Hàng đợi trống. Sau khi tìm kiếm, bấm + để đặt bài tiếp theo.', 'Queue is empty. Search, then press + to set the next track.'],
    ['下一首播放', 'Phát tiếp theo', 'Play next'],
    ['下', 'Tiếp', 'Next'],
    ['未知歌手', 'Không rõ ca sĩ', 'Unknown artist'],
    ['取消红心', 'Bỏ yêu thích', 'Remove like'],
    ['红心喜欢', 'Yêu thích', 'Like'],
    ['收藏到歌单', 'Lưu vào playlist', 'Save to playlist'],
    ['移除', 'Gỡ bỏ', 'Remove'],

    // Playlist panel/detail
    ['Mineradio 内置歌单', 'Playlist tích hợp Mineradio', 'Mineradio built-in playlists'],
    ['网易云歌单', 'Playlist NetEase Cloud Music', 'NetEase Cloud Music playlists'],
    ['QQ 音乐歌单', 'Playlist QQ Music', 'QQ Music playlists'],
    ['酷狗音乐歌单', 'Playlist Kugou Music', 'Kugou Music playlists'],
    ['汽水音乐歌单', 'Playlist Qishui Music', 'Qishui Music playlists'],
    ['Spotify 歌单', 'Playlist Spotify', 'Spotify playlists'],
    ['歌单暂无可播放歌曲', 'Playlist chưa có bài có thể phát', 'No playable tracks in this playlist'],
    ['正在载入首批歌曲', 'Đang tải nhóm bài đầu tiên', 'Loading the first batch of tracks'],
    ['首批完成后即可浏览和播放', 'Có thể duyệt và phát sau khi tải xong nhóm đầu tiên', 'Browse and play after the first batch finishes'],
    ['从内置歌单移除', 'Gỡ khỏi playlist tích hợp', 'Remove from built-in playlist'],
    ['后续歌曲载入失败，重新打开歌单可继续', 'Tải các bài tiếp theo thất bại; mở lại playlist để tiếp tục', 'Failed to load later tracks; reopen the playlist to continue'],
    ['正在预载后续歌曲', 'Đang tải trước các bài tiếp theo', 'Preloading later tracks'],
    ['继续滚动加载', 'Tiếp tục cuộn để tải', 'Keep scrolling to load'],
    ['已加载全部', 'Đã tải toàn bộ', 'Loaded all'],
    ['取消收藏', 'Bỏ lưu', 'Unsave'],
    ['重命名', 'Đổi tên', 'Rename'],
    ['删除', 'Xóa', 'Delete'],
    ['回到顶部', 'Về đầu', 'Back to top'],
    ['歌单详情', 'Chi tiết playlist', 'Playlist details'],
    ['载入中', 'Đang tải', 'Loading'],
    ['播放歌单', 'Phát playlist', 'Play playlist'],
    ['后续歌曲载入失败，可继续滚动重试', 'Tải các bài tiếp theo thất bại; tiếp tục cuộn để thử lại', 'Failed to load later tracks; keep scrolling to retry'],
    ['歌单详情加载失败，请稍后重试', 'Tải chi tiết playlist thất bại. Vui lòng thử lại sau.', 'Failed to load playlist details. Please try again later.'],
    ['暂不支持写回歌单收藏', 'hiện chưa hỗ trợ ghi thay đổi lưu playlist', 'does not currently support writing playlist collection changes'],
    ['歌单已收藏', 'Đã lưu playlist', 'Playlist saved'],
    ['已取消收藏歌单', 'Đã bỏ lưu playlist', 'Playlist unsaved'],
    ['请重新授权后再修改歌单收藏', 'Hãy cấp quyền lại trước khi thay đổi trạng thái lưu playlist', 'Re-authorize before changing playlist collection status'],
    ['歌单收藏操作失败', 'Thao tác lưu playlist thất bại', 'Playlist collection operation failed'],
    ['部分歌单载入失败', 'Một số playlist tải thất bại', 'Some playlists failed to load'],
    ['已显示', 'Đang hiển thị', 'Showing'],
    ['正在后台载入歌单', 'Đang tải playlist trong nền', 'Loading playlists in the background'],
    ['未找到歌单', 'Không tìm thấy playlist', 'No playlists found'],
    ['登录后显示我的播客', 'Đăng nhập để xem podcast của tôi', 'Sign in to view my podcasts'],
    ['暂无播客数据', 'Chưa có dữ liệu podcast', 'No podcast data yet'],

    // Account/login terms that are frequently generated dynamically
    ['网易云音乐', 'NetEase Cloud Music', 'NetEase Cloud Music'],
    ['网易云', 'NetEase Cloud', 'NetEase Cloud'],
    ['QQ 音乐', 'QQ Music', 'QQ Music'],
    ['QQ音乐', 'QQ Music', 'QQ Music'],
    ['酷狗音乐', 'Kugou Music', 'Kugou Music'],
    ['酷狗', 'Kugou', 'Kugou'],
    ['汽水音乐', 'Qishui Music', 'Qishui Music'],
    ['汽水', 'Qishui', 'Qishui'],
    ['普通', 'Thường', 'Standard'],
    ['扫码', 'Quét QR', 'Scan QR'],
    ['官网', 'Trang chính thức', 'Official site'],
    ['弹出 Spotify 授权窗口', 'Mở cửa sổ cấp quyền Spotify', 'Open Spotify authorization window'],
    ['使用抖音 App 官方授权', 'Dùng ứng dụng Douyin để cấp quyền chính thức', 'Use the Douyin app for official authorization'],
    ['弹出酷狗官方窗口', 'Mở cửa sổ chính thức của Kugou', 'Open the official Kugou window'],
    ['连接后弹出官方窗口', 'Sau khi kết nối sẽ mở cửa sổ chính thức', 'Open the official window after connecting'],
    ['展示到右上角账号胶囊', 'Hiển thị trong cụm tài khoản góc trên bên phải', 'Show in the top-right account pill'],
    ['展示', 'Hiển thị', 'Show'],

    // Common labels that can occur inside formerly protected containers
    ['登录', 'Đăng nhập', 'Sign in'],
    ['退出登录', 'Đăng xuất', 'Sign out'],
    ['连接', 'Kết nối', 'Connect'],
    ['已连接', 'Đã kết nối', 'Connected'],
    ['未连接', 'Chưa kết nối', 'Not connected'],
    ['授权', 'Cấp quyền', 'Authorize'],
    ['重新授权', 'Cấp quyền lại', 'Re-authorize'],
    ['播放', 'Phát', 'Play'],
    ['暂停', 'Tạm dừng', 'Pause'],
    ['下一首', 'Bài tiếp theo', 'Next track'],
    ['上一首', 'Bài trước', 'Previous track'],
    ['歌单', 'Playlist', 'Playlist'],
    ['歌曲', 'Bài hát', 'Track'],
    ['歌手', 'Ca sĩ', 'Artist'],
    ['专辑', 'Album', 'Album'],
    ['收藏', 'Lưu', 'Save'],
    ['取消收藏', 'Bỏ lưu', 'Unsave'],
    ['刷新', 'Làm mới', 'Refresh'],
    ['重试', 'Thử lại', 'Retry'],
    ['加载', 'Tải', 'Load'],
    ['加载中', 'Đang tải', 'Loading'],
    ['加载失败', 'Tải thất bại', 'Load failed'],
    ['失败', 'Thất bại', 'Failed'],
    ['成功', 'Thành công', 'Success'],
    ['关闭', 'Đóng', 'Close'],
    ['取消', 'Hủy', 'Cancel'],
    ['确认', 'Xác nhận', 'Confirm'],
    ['确定', 'Xác nhận', 'OK'],
    ['返回', 'Quay lại', 'Back'],
    ['完成', 'Hoàn tất', 'Done'],
    ['更多', 'Thêm', 'More'],
    ['设置', 'Thiết lập', 'Settings'],
    ['状态', 'Trạng thái', 'Status'],
    ['来源', 'Nguồn', 'Source'],
    ['音源', 'Nguồn phát', 'Audio source'],
    ['本地', 'Cục bộ', 'Local'],
    ['在线', 'Trực tuyến', 'Online'],
    ['默认', 'Mặc định', 'Default'],
    ['自动', 'Tự động', 'Auto'],
    ['手动', 'Thủ công', 'Manual']
  ];

  const exactSafeRaw = Object.create(null);
  [
    ['未知歌手', 'Không rõ ca sĩ', 'Unknown artist'],
    ['歌单详情', 'Chi tiết playlist', 'Playlist details'],
    ['等待你的音乐', 'Đang chờ nhạc của bạn', 'Waiting for your music'],
    ['暂无歌曲', 'Chưa có bài hát', 'No tracks yet']
  ].forEach(function (row) { exactSafeRaw[row[0]] = { vi: row[1], en: row[2] }; });

  const originals = new WeakMap();
  const outputs = new WeakMap();
  const attrOriginals = new WeakMap();
  const attrOutputs = new WeakMap();
  let observer = null;
  let applying = false;

  function language() {
    try {
      return window.MineradioI18n && window.MineradioI18n.getLanguage && window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
    } catch (_) { return 'vi'; }
  }

  function targetIndex(lang) { return lang === 'en' ? 2 : 1; }

  function allRows() {
    const rows = [];
    const seen = new Set();
    function push(source, vi, en) {
      source = String(source || '');
      if (!source || seen.has(source)) return;
      seen.add(source);
      rows.push([source, String(vi || source), String(en || source)]);
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
    EXTRA_ROWS.forEach(function (row) { push(row[0], row[1], row[2]); });
    return rows.sort(function (a, b) { return b[0].length - a[0].length; });
  }

  function normalizeCounters(value, lang) {
    let result = String(value == null ? '' : value);
    result = result.replace(/(\d+)\s*首/g, function (_m, n) { return lang === 'vi' ? n + ' bài' : n + ' tracks'; });
    result = result.replace(/(\d+)\s*项/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*个/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*分钟/g, function (_m, n) { return lang === 'vi' ? n + ' phút' : n + ' min'; });
    result = result.replace(/(\d+)\s*秒/g, function (_m, n) { return lang === 'vi' ? n + ' giây' : n + ' s'; });
    return result;
  }

  function translateKnown(value, lang) {
    let result = normalizeCounters(value, lang);
    const rows = allRows();
    const idx = targetIndex(lang);
    for (let i = 0; i < rows.length; i += 1) {
      const source = rows[i][0];
      if (result.indexOf(source) >= 0) result = result.split(source).join(rows[i][idx]);
    }
    return result;
  }

  function elementFor(node) {
    return node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement;
  }

  function matchesClosest(node, selector) {
    const el = elementFor(node);
    try { return !!(el && el.closest && el.closest(selector)); } catch (_) { return false; }
  }

  function isRawContent(node) { return matchesClosest(node, RAW_CONTENT); }
  function isMixedContent(node) { return matchesClosest(node, MIXED_CONTENT); }

  function rawSafeTranslate(value, lang) {
    const trimmed = String(value == null ? '' : value).trim();
    const row = exactSafeRaw[trimmed];
    if (!row) return value;
    const replacement = row[lang] || trimmed;
    return String(value).replace(trimmed, replacement);
  }

  function contextFallback(node, lang) {
    const el = elementFor(node);
    const tag = String(el && el.tagName || '').toLowerCase();
    const cls = String(el && el.className || '');
    const role = String(el && el.getAttribute && el.getAttribute('role') || '').toLowerCase();
    if (tag === 'button' || role === 'button' || role === 'tab') return lang === 'vi' ? 'Tùy chọn' : 'Option';
    if (tag === 'label' || role === 'checkbox' || role === 'switch' || /label|status|badge/i.test(cls)) return lang === 'vi' ? 'Trạng thái' : 'Status';
    if (/title|heading|head/i.test(cls) || /^h[1-6]$/.test(tag)) return lang === 'vi' ? 'Thông tin' : 'Information';
    if (/error|warning|notice|empty|progress/i.test(cls)) return lang === 'vi' ? 'Thông báo' : 'Notice';
    return lang === 'vi' ? 'Nội dung' : 'Content';
  }

  function localize(value, node) {
    const lang = language();
    if (isRawContent(node)) return rawSafeTranslate(value, lang);
    let result = translateKnown(value, lang);
    if (isMixedContent(node)) return result;
    if (HAN_RE.test(result)) {
      const fallback = contextFallback(node, lang);
      result = result.replace(HAN_RUN_RE, fallback)
        .replace(/\s{2,}/g, ' ')
        .replace(/([·•|/,:;，。；：])\s*([·•|/,:;，。；：])/g, '$1')
        .trim();
    }
    return result;
  }

  function translateText(node, fromMutation) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const current = String(node.nodeValue || '');
    if (!current.trim()) return;
    const last = outputs.get(node);
    if (!originals.has(node) || (fromMutation && current !== last)) originals.set(node, current);
    const source = originals.get(node);
    const output = localize(source, node);
    outputs.set(node, output);
    if (current !== output) node.nodeValue = output;
  }

  function mapsFor(el) {
    let a = attrOriginals.get(el);
    let b = attrOutputs.get(el);
    if (!a) { a = new Map(); attrOriginals.set(el, a); }
    if (!b) { b = new Map(); attrOutputs.set(el, b); }
    return { originals: a, outputs: b };
  }

  function translateAttrs(el, fromMutation, changed) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    const maps = mapsFor(el);
    ATTRS.forEach(function (attr) {
      if (changed && changed !== attr) return;
      if (!el.hasAttribute(attr)) return;
      const current = String(el.getAttribute(attr) || '');
      const last = maps.outputs.get(attr);
      if (!maps.originals.has(attr) || (fromMutation && current !== last)) maps.originals.set(attr, current);
      const source = maps.originals.get(attr);
      const output = localize(source, el);
      maps.outputs.set(attr, output);
      if (current !== output) el.setAttribute(attr, output);
    });
    if ((el.tagName === 'INPUT' || el.tagName === 'BUTTON') && el.hasAttribute('value')) {
      const current = String(el.getAttribute('value') || '');
      if (HAN_RE.test(current)) el.setAttribute('value', localize(current, el));
    }
  }

  function walk(root, fromMutation) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { translateText(root, fromMutation); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateAttrs(root, fromMutation);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateText(node, fromMutation);
      else translateAttrs(node, fromMutation);
      node = walker.nextNode();
    }
  }

  function refresh() {
    if (applying || !document.documentElement) return;
    applying = true;
    try { walk(document.documentElement, false); } finally { applying = false; }
  }

  function audit() {
    const samples = [];
    let count = 0;
    if (!document.body) return { count: 0, samples: [] };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = String(node.nodeValue || '').trim();
      if (text && HAN_RE.test(text) && !isRawContent(node) && !isMixedContent(node)) {
        count += 1;
        if (samples.length < 40) samples.push(text.slice(0, 160));
      }
      node = walker.nextNode();
    }
    return { count: count, samples: samples };
  }

  function start() {
    refresh();
    if (!observer) {
      observer = new MutationObserver(function (mutations) {
        if (applying) return;
        applying = true;
        try {
          mutations.forEach(function (m) {
            if (m.type === 'characterData') translateText(m.target, true);
            else if (m.type === 'attributes') translateAttrs(m.target, true, m.attributeName);
            else if (m.type === 'childList') m.addedNodes.forEach(function (n) { walk(n, true); });
          });
        } finally { applying = false; }
      });
    }
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  window.MineradioFinalI18n = {
    refresh: refresh,
    audit: audit,
    translate: function (value) { return translateKnown(String(value == null ? '' : value), language()); },
    rows: EXTRA_ROWS
  };

  window.addEventListener('mineradio:languagechange', function () {
    setTimeout(refresh, 0);
    setTimeout(refresh, 80);
    setTimeout(refresh, 300);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  setTimeout(refresh, 250);
  setTimeout(refresh, 900);
  setTimeout(refresh, 1800);
})();
