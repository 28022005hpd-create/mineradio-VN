'use strict';

(function initMineradioFinalUiLocalization() {
  const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
  const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;
  const ATTRS = ['title', 'aria-label', 'aria-description', 'placeholder', 'data-tooltip', 'data-label'];

  // Real content supplied by a music provider or the user. Unknown Han text in
  // these fields is valid content (song/artist/album/lyric/comment/playlist name)
  // and must never be replaced by a generic UI fallback.
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

  // Mixed provider metadata + app status. Known UI fragments/counters are
  // translated, but unknown Han is retained because it may be an artist, album,
  // creator, nickname, or other provider-owned content.
  const MIXED_CONTENT = [
    '.search-result-meta', '.pl-sub', '.pl-detail-sub', '.pl-detail-count',
    '.detail-sub', '#album-detail-sub', '.detail-v', '.detail-chip',
    '.artist-song-meta', '.comment-meta', '.track-detail-meta', '.track-detail-sub',
    '.song-meta', '.track-meta',
    '.home-platform-daily-list', '.home-platform-track-list'
  ].join(',');

  // [Chinese source, Vietnamese, English]. These extend the two existing locale
  // tables for UI generated at runtime inside previously protected containers.
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
    ['取消红心', 'Bỏ yêu thích', 'Remove like'],
    ['红心喜欢', 'Yêu thích', 'Like'],
    ['收藏到歌单', 'Lưu vào playlist', 'Save to playlist'],

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
    ['回到顶部', 'Về đầu', 'Back to top'],
    ['歌单详情', 'Chi tiết playlist', 'Playlist details'],
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

    // Track / album / artist detail
    ['当前酷狗歌曲缺少稳定专辑详情接口，暂不能按当前音源打开专辑。', 'Bài Kugou hiện tại chưa có API chi tiết album ổn định nên chưa thể mở album theo nguồn này.', 'The current Kugou track has no stable album-detail API, so its album cannot be opened from this source yet.'],
    ['汽水当前作为匹配源接入，暂不能按当前音源打开专辑详情。', 'Qishui hiện được dùng làm nguồn khớp nên chưa thể mở chi tiết album từ nguồn này.', 'Qishui is currently used as a matching source, so album details cannot be opened from it yet.'],
    ['当前歌曲缺少可用专辑 ID，重新搜索或播放新版结果后再打开专辑。', 'Bài hiện tại thiếu ID album khả dụng. Hãy tìm lại hoặc phát kết quả mới rồi mở album.', 'The current track has no usable album ID. Search again or play a newer result before opening the album.'],
    ['已收藏专辑', 'Đã lưu album', 'Album saved'],
    ['收藏专辑', 'Lưu album', 'Save album'],
    ['当前平台暂不支持收藏专辑', 'Nền tảng hiện tại chưa hỗ trợ lưu album', 'The current platform does not support saving albums yet'],
    ['专辑已收藏到', 'Đã lưu album trên ', 'Album saved to '],
    ['已取消收藏专辑', 'Đã bỏ lưu album', 'Album unsaved'],
    ['请重新授权后再收藏专辑', 'Hãy cấp quyền lại trước khi lưu album', 'Re-authorize before saving the album'],
    ['专辑收藏操作失败', 'Thao tác lưu album thất bại', 'Album save operation failed'],
    ['无缝衔接 开', 'Phát liền mạch: Bật', 'Gapless playback: On'],
    ['无缝衔接 关', 'Phát liền mạch: Tắt', 'Gapless playback: Off'],
    ['专辑无缝衔接已开启', 'Đã bật phát album liền mạch', 'Album gapless playback enabled'],
    ['专辑无缝衔接已关闭', 'Đã tắt phát album liền mạch', 'Album gapless playback disabled'],
    ['暂无专辑曲目', 'Chưa có bài trong album', 'No album tracks yet'],
    ['暂无热门歌曲', 'Chưa có bài nổi bật', 'No popular tracks yet'],
    ['专辑详情', 'Chi tiết album', 'Album details'],
    ['专辑曲目', 'Các bài trong album', 'Album tracks'],
    ['正在载入专辑曲目...', 'Đang tải các bài trong album...', 'Loading album tracks...'],
    ['专辑详情加载失败', 'Tải chi tiết album thất bại', 'Failed to load album details'],
    ['按专辑顺序播放', 'Phát theo thứ tự album', 'Play in album order'],
    ['歌手详情', 'Chi tiết ca sĩ', 'Artist details'],
    ['来自当前播放', 'Từ bài đang phát', 'From current playback'],
    ['关联歌手', 'Ca sĩ liên quan', 'Related artist'],
    ['所属专辑', 'Album', 'Album'],
    ['热门歌曲', 'Bài nổi bật', 'Popular tracks'],
    ['当前 QQ 歌曲缺少 singerMid，无法打开 QQ 歌手主页。', 'Bài QQ hiện tại thiếu singerMid nên không thể mở trang ca sĩ QQ.', 'The current QQ track is missing singerMid, so the QQ artist page cannot be opened.'],
    ['当前歌曲缺少可用的歌手主页信息', 'Bài hiện tại thiếu thông tin trang ca sĩ khả dụng', 'The current track has no usable artist-page information'],
    ['正在载入 QQ 歌手主页...', 'Đang tải trang ca sĩ QQ...', 'Loading QQ artist page...'],
    ['正在载入歌手主页...', 'Đang tải trang ca sĩ...', 'Loading artist page...'],
    ['歌手资料与当前歌曲不匹配，已停止展示错误主页。', 'Thông tin ca sĩ không khớp bài hiện tại nên đã dừng hiển thị trang sai.', 'Artist data does not match the current track, so the incorrect page was not shown.'],
    ['歌手主页加载失败', 'Tải trang ca sĩ thất bại', 'Failed to load artist page'],
    ['歌曲详情', 'Chi tiết bài hát', 'Track details'],
    ['歌曲名', 'Tên bài hát', 'Track name'],
    ['时长', 'Thời lượng', 'Duration'],
    ['歌词源', 'Nguồn lời bài hát', 'Lyrics source'],
    ['自定义歌词', 'Lời tùy chỉnh', 'Custom lyrics'],
    ['占位歌词', 'Lời tạm', 'Placeholder lyrics'],
    ['原词', 'Lời gốc', 'Original lyrics'],
    ['自定义封面', 'Ảnh bìa tùy chỉnh', 'Custom cover'],
    ['当前歌曲', 'Bài hiện tại', 'Current track'],
    ['未知专辑', 'Không rõ album', 'Unknown album'],
    ['未知歌手', 'Không rõ ca sĩ', 'Unknown artist'],
    ['未知', 'Không rõ', 'Unknown'],
    ['本地上传', 'Tệp cục bộ', 'Local upload'],
    ['网易云播客', 'Podcast NetEase Cloud Music', 'NetEase Cloud Music podcast'],
    ['当前平台暂无评论接口', 'Nền tảng hiện tại chưa có API bình luận', 'The current platform has no comments API'],
    ['正在载入评论...', 'Đang tải bình luận...', 'Loading comments...'],
    ['评论加载失败', 'Tải bình luận thất bại', 'Failed to load comments'],
    ['暂无评论', 'Chưa có bình luận', 'No comments yet'],
    ['写下你的评论', 'Viết bình luận của bạn', 'Write your comment'],
    ['发送中', 'Đang gửi', 'Sending'],
    ['发送', 'Gửi', 'Send'],
    ['当前平台评论只读', 'Bình luận trên nền tảng này chỉ đọc', 'Comments are read-only on this platform'],
    ['先输入评论内容', 'Hãy nhập nội dung bình luận trước', 'Enter a comment first'],
    ['评论已发布', 'Đã đăng bình luận', 'Comment posted'],
    ['评论发布失败', 'Đăng bình luận thất bại', 'Failed to post comment'],
    ['QQ 音乐评论', 'Bình luận QQ Music', 'QQ Music comments'],
    ['汽水音乐评论', 'Bình luận Qishui Music', 'Qishui Music comments'],
    ['网易云评论', 'Bình luận NetEase Cloud Music', 'NetEase Cloud Music comments'],
    ['音乐用户', 'Người dùng âm nhạc', 'Music user'],
    ['赞', 'lượt thích', 'likes'],
    ['未找到歌手信息', 'Không tìm thấy thông tin ca sĩ', 'Artist information not found'],
    ['正在查找歌手主页:', 'Đang tìm trang ca sĩ:', 'Finding artist page:'],
    ['当前歌曲缺少歌手主页信息', 'Bài hiện tại thiếu thông tin trang ca sĩ', 'The current track has no artist-page information'],

    // Custom cover / custom lyrics
    ['封面已应用，存储空间不足', 'Đã áp dụng ảnh bìa nhưng không đủ dung lượng lưu trữ', 'Cover applied, but storage space is insufficient'],
    ['封面已应用', 'Đã áp dụng ảnh bìa', 'Cover applied'],
    ['封面已保存', 'Đã lưu ảnh bìa', 'Cover saved'],
    ['已应用临时封面', 'Đã áp dụng ảnh bìa tạm thời', 'Temporary cover applied'],
    ['取消自定义封面', 'Bỏ ảnh bìa tùy chỉnh', 'Remove custom cover'],
    ['当前没有自定义封面', 'Bài hiện tại không có ảnh bìa tùy chỉnh', 'The current track has no custom cover'],
    ['先播放或选择一首歌', 'Hãy phát hoặc chọn một bài hát trước', 'Play or select a track first'],
    ['已恢复默认封面', 'Đã khôi phục ảnh bìa mặc định', 'Default cover restored'],
    ['自定义歌词内容为空', 'Nội dung lời tùy chỉnh đang trống', 'Custom lyrics are empty'],
    ['已切换到自定义歌词', 'Đã chuyển sang lời tùy chỉnh', 'Switched to custom lyrics'],
    ['已切换到原歌词', 'Đã chuyển sang lời gốc', 'Switched to original lyrics'],
    ['使用网易云或本地解析歌词', 'Dùng lời từ NetEase Cloud Music hoặc lời được phân tích cục bộ', 'Use NetEase Cloud Music lyrics or locally parsed lyrics'],

    // Account/login terms generated dynamically
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

    // Common UI terms. Long/specific rows are applied first.
    ['取消收藏', 'Bỏ lưu', 'Unsave'],
    ['重新授权', 'Cấp quyền lại', 'Re-authorize'],
    ['退出登录', 'Đăng xuất', 'Sign out'],
    ['登录', 'Đăng nhập', 'Sign in'],
    ['连接', 'Kết nối', 'Connect'],
    ['已连接', 'Đã kết nối', 'Connected'],
    ['未连接', 'Chưa kết nối', 'Not connected'],
    ['授权', 'Cấp quyền', 'Authorize'],
    ['播放', 'Phát', 'Play'],
    ['暂停', 'Tạm dừng', 'Pause'],
    ['下一首', 'Bài tiếp theo', 'Next track'],
    ['上一首', 'Bài trước', 'Previous track'],
    ['歌单', 'Playlist', 'Playlist'],
    ['歌曲', 'Bài hát', 'Track'],
    ['歌手', 'Ca sĩ', 'Artist'],
    ['专辑', 'Album', 'Album'],
    ['收藏', 'Lưu', 'Save'],
    ['重命名', 'Đổi tên', 'Rename'],
    ['删除', 'Xóa', 'Delete'],
    ['移除', 'Gỡ bỏ', 'Remove'],
    ['刷新', 'Làm mới', 'Refresh'],
    ['重试', 'Thử lại', 'Retry'],
    ['加载中', 'Đang tải', 'Loading'],
    ['载入中', 'Đang tải', 'Loading'],
    ['加载失败', 'Tải thất bại', 'Load failed'],
    ['加载', 'Tải', 'Load'],
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
    ['手动', 'Thủ công', 'Manual'],
    ['当前', 'Hiện tại', 'Current']
  ];

  const exactSafeRaw = Object.create(null);
  [
    ['未知歌手', 'Không rõ ca sĩ', 'Unknown artist'],
    ['未知专辑', 'Không rõ album', 'Unknown album'],
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
  let cachedRows = null;

  function language() {
    try {
      return window.MineradioI18n && window.MineradioI18n.getLanguage && window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
    } catch (_) { return 'vi'; }
  }

  function targetIndex(lang) { return lang === 'en' ? 2 : 1; }

  function allRows() {
    if (cachedRows) return cachedRows;
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
    cachedRows = rows.sort(function (a, b) { return b[0].length - a[0].length; });
    return cachedRows;
  }

  function normalizeCountersAndDates(value, lang) {
    let result = String(value == null ? '' : value);
    result = result.replace(/(\d+)\s*首/g, function (_m, n) { return lang === 'vi' ? n + ' bài' : n + ' tracks'; });
    result = result.replace(/(\d+)\s*项/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*个/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*分钟/g, function (_m, n) { return lang === 'vi' ? n + ' phút' : n + ' min'; });
    result = result.replace(/(\d+)\s*秒/g, function (_m, n) { return lang === 'vi' ? n + ' giây' : n + ' s'; });
    result = result.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g, function (_m, y, m, d) {
      return lang === 'vi' ? d + '/' + m + '/' + y : m + '/' + d + '/' + y;
    });
    result = result.replace(/(\d{1,2})月(\d{1,2})日/g, function (_m, m, d) {
      return lang === 'vi' ? d + '/' + m : m + '/' + d;
    });
    return result;
  }

  function translateKnown(value, lang) {
    let result = normalizeCountersAndDates(value, lang);
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
    if (/error|warning|notice|empty|progress|loading/i.test(cls)) return lang === 'vi' ? 'Thông báo' : 'Notice';
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
      // Attributes are app-owned controls even when attached to metadata rows.
      // Do not inherit RAW/MIXED protection for tooltip/aria text.
      let output = translateKnown(source, language());
      if (HAN_RE.test(output)) {
        output = output.replace(HAN_RUN_RE, contextFallback(el, language()))
          .replace(/\s{2,}/g, ' ').trim();
      }
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
        if (samples.length < 50) samples.push(text.slice(0, 180));
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
    // Rebuild aliases after the existing locale layers have switched.
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
