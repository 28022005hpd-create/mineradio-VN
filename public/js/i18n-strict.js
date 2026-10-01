'use strict';

(function initMineradioStrictLocalization() {
  const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
  const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;
  const ATTRS = ['title', 'aria-label', 'placeholder', 'data-tooltip'];

  // Never scrub user/provider content. Known UI phrases are still localized before
  // they enter these containers by the existing i18n layer, but strict fallback
  // replacement is intentionally disabled here so Chinese song titles and lyrics
  // remain untouched.
  const HARD_PROTECTED = [
    '#stage-lyrics',
    '#desktop-lyrics-root',
    '#desktop-lyrics',
    '#search-results',
    '#queue-list',
    '#pl-list',
    '#podcast-list',
    '#track-detail-body',
    '#thumb-title',
    '#thumb-artist',
    '[data-track-title]',
    '[data-track-artist]',
    '.lyric-line',
    '.lyrics-line',
    '.shelf-track-title',
    '.shelf-track-artist',
    '.playlist-track-title',
    '.playlist-track-artist',
    '.home-platform-daily-list',
    '.home-platform-track-list'
  ].join(',');

  // Dynamic home cards may contain either an app fallback label or real music
  // metadata. Translate known phrases, but never replace unknown Han text there.
  const SOFT_PROTECTED = [
    '.home-card-title',
    '.home-card-sub',
    '#home-next-title',
    '#home-next-artist',
    '.home-discovery-title',
    '.home-discovery-sub'
  ].join(',');

  // Additional phrases found in dynamically-created views, modal flows, account
  // states, update UI, visual console, system settings and common error paths.
  // Format: [Chinese source, Vietnamese, English].
  const STRICT_ROWS = [
    ['为你挑选', 'Dành cho bạn', 'For you'],
    ['换一首，也许正合心意', 'Đổi một bài khác, có thể sẽ đúng gu bạn', 'Try another track — it may fit your mood'],
    ['换一首', 'Đổi bài khác', 'Try another'],
    ['等待你的音乐', 'Đang chờ nhạc của bạn', 'Waiting for your music'],
    ['登录平台或导入本地音乐后生成推荐', 'Đăng nhập nền tảng hoặc nhập nhạc cục bộ để tạo gợi ý', 'Sign in to a platform or import local music to generate recommendations'],
    ['平台热歌与个人偏好', 'Nhạc thịnh hành & sở thích cá nhân', 'Platform hits & personal taste'],
    ['打开平台推荐中心；没有可选推荐接口时会明确留空。', 'Mở trung tâm gợi ý nền tảng; nếu không có nguồn gợi ý khả dụng, khu vực này sẽ để trống.', 'Open the platform recommendation center; it stays empty when no recommendation source is available.'],
    ['音乐发现', 'Khám phá âm nhạc', 'Music discovery'],
    ['今日聆听和音乐发现', 'Nghe hôm nay & khám phá âm nhạc', 'Today listening & music discovery'],
    ['今日推荐', 'Gợi ý hôm nay', 'Today’s recommendations'],
    ['每日热评', 'Bình luận nổi bật hôm nay', 'Daily highlight'],
    ['我的热评', 'Bình luận của tôi', 'My highlights'],
    ['有些歌不是突然好听，而是终于听懂了。', 'Có những bài hát không bỗng nhiên hay hơn; chỉ là cuối cùng ta đã hiểu chúng.', 'Some songs do not suddenly sound better; you simply finally understand them.'],
    ['慢一点没关系，重要的是一直在向喜欢的生活靠近。', 'Chậm một chút cũng không sao; quan trọng là vẫn tiến gần hơn đến cuộc sống mình yêu thích.', 'It is fine to move slowly; what matters is getting closer to the life you want.'],
    ['错过落日余晖，还会有满天星辰。', 'Lỡ ánh hoàng hôn vẫn còn cả bầu trời đầy sao.', 'Miss the sunset and there is still a sky full of stars.'],
    ['保持热爱，奔赴下一场山海。', 'Giữ lấy đam mê và tiếp tục đến hành trình kế tiếp.', 'Keep your passion and head toward the next journey.'],
    ['答案在路上，自由在风里。', 'Câu trả lời ở trên đường, tự do ở trong gió.', 'The answer is on the road; freedom is in the wind.'],
    ['开始听歌', 'Bắt đầu nghe nhạc', 'Start listening'],
    ['继续当前队列', 'Tiếp tục hàng đợi hiện tại', 'Continue current queue'],
    ['从音乐库或每日推荐开始', 'Bắt đầu từ thư viện nhạc hoặc gợi ý hằng ngày', 'Start from your library or daily recommendations'],
    ['项内容 · 本地音乐与歌单', 'mục · nhạc cục bộ & playlist', 'items · local music & playlists'],
    ['本地音乐与歌单', 'Nhạc cục bộ & playlist', 'Local music & playlists'],
    ['本地音乐', 'Nhạc cục bộ', 'Local music'],
    ['平台推荐', 'Gợi ý nền tảng', 'Platform recommendations'],
    ['推荐中心', 'Trung tâm gợi ý', 'Recommendation center'],
    ['暂无推荐', 'Chưa có gợi ý', 'No recommendations yet'],
    ['暂无数据', 'Chưa có dữ liệu', 'No data yet'],
    ['暂无内容', 'Chưa có nội dung', 'No content yet'],
    ['暂无歌曲', 'Chưa có bài hát', 'No songs yet'],
    ['暂无歌单', 'Chưa có playlist', 'No playlists yet'],
    ['没有更多了', 'Không còn nội dung khác', 'No more items'],
    ['加载更多', 'Tải thêm', 'Load more'],
    ['正在加载', 'Đang tải', 'Loading'],
    ['加载中', 'Đang tải', 'Loading'],
    ['加载失败', 'Tải thất bại', 'Load failed'],
    ['读取失败', 'Đọc thất bại', 'Read failed'],
    ['保存失败', 'Lưu thất bại', 'Save failed'],
    ['保存成功', 'Đã lưu', 'Saved successfully'],
    ['操作失败', 'Thao tác thất bại', 'Operation failed'],
    ['操作成功', 'Thao tác thành công', 'Operation successful'],
    ['网络错误', 'Lỗi mạng', 'Network error'],
    ['网络异常', 'Mạng gặp sự cố', 'Network problem'],
    ['请稍后重试', 'Vui lòng thử lại sau', 'Please try again later'],
    ['重试', 'Thử lại', 'Retry'],
    ['确定', 'Xác nhận', 'Confirm'],
    ['确认', 'Xác nhận', 'Confirm'],
    ['取消', 'Hủy', 'Cancel'],
    ['关闭', 'Đóng', 'Close'],
    ['完成', 'Hoàn tất', 'Done'],
    ['返回', 'Quay lại', 'Back'],
    ['继续', 'Tiếp tục', 'Continue'],
    ['下一步', 'Tiếp theo', 'Next'],
    ['上一步', 'Quay lại', 'Previous'],
    ['跳过', 'Bỏ qua', 'Skip'],
    ['查看详情', 'Xem chi tiết', 'View details'],
    ['详情', 'Chi tiết', 'Details'],
    ['更多', 'Thêm', 'More'],
    ['编辑', 'Chỉnh sửa', 'Edit'],
    ['删除', 'Xóa', 'Delete'],
    ['移除', 'Gỡ bỏ', 'Remove'],
    ['添加', 'Thêm', 'Add'],
    ['新建', 'Tạo mới', 'New'],
    ['创建', 'Tạo', 'Create'],
    ['重命名', 'Đổi tên', 'Rename'],
    ['复制', 'Sao chép', 'Copy'],
    ['已复制', 'Đã sao chép', 'Copied'],
    ['导入', 'Nhập', 'Import'],
    ['导出', 'Xuất', 'Export'],
    ['选择文件', 'Chọn tệp', 'Choose file'],
    ['选择文件夹', 'Chọn thư mục', 'Choose folder'],
    ['打开文件夹', 'Mở thư mục', 'Open folder'],
    ['刷新', 'Làm mới', 'Refresh'],
    ['搜索', 'Tìm kiếm', 'Search'],
    ['搜索功能，如：粒子、缓存、歌词', 'Tìm tính năng, ví dụ: hạt, cache, lời bài hát', 'Search features, e.g. particles, cache, lyrics'],
    ['搜索视觉控制台功能', 'Tìm tính năng trong bảng điều khiển hình ảnh', 'Search Visual Console features'],
    ['视觉控制台分类', 'Danh mục bảng điều khiển hình ảnh', 'Visual Console categories'],
    ['撤销上一步设置', 'Hoàn tác thiết lập trước', 'Undo previous setting'],
    ['撤销', 'Hoàn tác', 'Undo'],
    ['最近操作', 'Thao tác gần đây', 'Recent actions'],
    ['历史', 'Lịch sử', 'History'],
    ['没有匹配的设置', 'Không tìm thấy thiết lập phù hợp', 'No matching settings'],
    ['其他设置', 'Thiết lập khác', 'Other settings'],
    ['尚未归入明确分类的兼容项', 'Các mục tương thích chưa được phân loại cụ thể', 'Compatibility items not yet assigned to a category'],
    ['兼容设置', 'Thiết lập tương thích', 'Compatibility setting'],
    ['热键', 'Phím tắt', 'Hotkeys'],
    ['快捷键', 'Phím tắt', 'Shortcuts'],
    ['按键', 'Phím', 'Key'],
    ['启用', 'Bật', 'Enable'],
    ['已启用', 'Đã bật', 'Enabled'],
    ['未启用', 'Chưa bật', 'Disabled'],
    ['禁用', 'Tắt', 'Disable'],
    ['开启', 'Bật', 'On'],
    ['关闭状态', 'Đang tắt', 'Off'],
    ['显示', 'Hiển thị', 'Show'],
    ['隐藏', 'Ẩn', 'Hide'],
    ['自动', 'Tự động', 'Auto'],
    ['手动', 'Thủ công', 'Manual'],
    ['默认', 'Mặc định', 'Default'],
    ['当前', 'Hiện tại', 'Current'],
    ['自定义', 'Tùy chỉnh', 'Custom'],
    ['高级', 'Nâng cao', 'Advanced'],
    ['实验', 'Thử nghiệm', 'Experimental'],
    ['推荐', 'Đề xuất', 'Recommended'],
    ['状态', 'Trạng thái', 'Status'],
    ['设置', 'Thiết lập', 'Settings'],
    ['选项', 'Tùy chọn', 'Options'],
    ['模式', 'Chế độ', 'Mode'],
    ['质量', 'Chất lượng', 'Quality'],
    ['性能', 'Hiệu năng', 'Performance'],
    ['低配', 'Máy cấu hình thấp', 'Low spec'],
    ['中等', 'Trung bình', 'Medium'],
    ['高', 'Cao', 'High'],
    ['超高', 'Rất cao', 'Ultra'],
    ['跟随屏幕', 'Theo màn hình', 'Match display'],
    ['垂直同步', 'Đồng bộ dọc', 'VSync'],
    ['节能', 'Tiết kiệm điện', 'Power saving'],
    ['后台', 'Nền', 'Background'],
    ['前台', 'Tiền cảnh', 'Foreground'],
    ['保持运行', 'Tiếp tục chạy', 'Keep running'],
    ['停止释放', 'Dừng & giải phóng', 'Stop & release'],
    ['自动优化', 'Tự tối ưu', 'Auto optimize'],
    ['直播后台保持', 'Giữ chạy nền khi live', 'Keep live rendering in background'],
    ['最小化继续渲染', 'Tiếp tục render khi thu nhỏ', 'Keep rendering when minimized'],
    ['内存管理', 'Quản lý bộ nhớ', 'Memory management'],
    ['系统内存状态', 'Trạng thái bộ nhớ hệ thống', 'System memory status'],
    ['内存说明', 'Thông tin bộ nhớ', 'Memory info'],
    ['自动压缩播放器', 'Tự giảm bộ nhớ trình phát', 'Auto-trim player memory'],
    ['后台触发压缩', 'Giảm bộ nhớ khi chạy nền', 'Trim memory in background'],
    ['系统级定时释放', 'Giải phóng bộ nhớ hệ thống định kỳ', 'Scheduled system memory release'],
    ['需要时请求管理员', 'Yêu cầu quyền quản trị khi cần', 'Request administrator rights when needed'],
    ['系统释放范围', 'Phạm vi giải phóng hệ thống', 'System release scope'],
    ['工作集', 'Working set', 'Working set'],
    ['修改页', 'Trang đã sửa đổi', 'Modified pages'],
    ['待机页', 'Trang chờ', 'Standby pages'],
    ['缓存与存储', 'Cache & lưu trữ', 'Cache & storage'],
    ['统一缓存目录、占用和各类路径', 'Thư mục cache chung, dung lượng và các đường dẫn', 'Unified cache directory, usage, and paths'],
    ['缓存路径', 'Đường dẫn cache', 'Cache path'],
    ['缓存目录', 'Thư mục cache', 'Cache directory'],
    ['占用', 'Dung lượng dùng', 'Usage'],
    ['更改目录', 'Đổi thư mục', 'Change directory'],
    ['刷新占用', 'Làm mới dung lượng', 'Refresh usage'],
    ['重启生效', 'Khởi động lại để áp dụng', 'Restart to apply'],
    ['启动与退出', 'Khởi động & thoát', 'Startup & exit'],
    ['直接退出', 'Thoát trực tiếp', 'Exit immediately'],
    ['后台托盘', 'Thu về khay hệ thống', 'System tray'],
    ['打开软件继续播放', 'Tiếp tục phát khi mở ứng dụng', 'Continue playback when app opens'],
    ['快速启动', 'Khởi động nhanh', 'Fast startup'],
    ['按上次进度', 'Theo tiến độ lần trước', 'Resume previous position'],
    ['重播整首', 'Phát lại từ đầu', 'Restart track'],
    ['播放输出设备', 'Thiết bị đầu ra âm thanh', 'Playback output device'],
    ['音频路由', 'Định tuyến âm thanh', 'Audio routing'],
    ['默认设备', 'Thiết bị mặc định', 'Default device'],
    ['扬声器', 'Loa', 'Speakers'],
    ['耳机', 'Tai nghe', 'Headphones'],
    ['设备', 'Thiết bị', 'Device'],
    ['不可用', 'Không khả dụng', 'Unavailable'],
    ['可用', 'Khả dụng', 'Available'],
    ['登录', 'Đăng nhập', 'Sign in'],
    ['登录中', 'Đang đăng nhập', 'Signing in'],
    ['登录成功', 'Đăng nhập thành công', 'Signed in successfully'],
    ['登录失败', 'Đăng nhập thất bại', 'Sign-in failed'],
    ['未登录', 'Chưa đăng nhập', 'Not signed in'],
    ['已登录', 'Đã đăng nhập', 'Signed in'],
    ['退出登录', 'Đăng xuất', 'Sign out'],
    ['账号', 'Tài khoản', 'Account'],
    ['账户', 'Tài khoản', 'Account'],
    ['用户', 'Người dùng', 'User'],
    ['扫码登录', 'Đăng nhập bằng QR', 'QR sign-in'],
    ['二维码', 'Mã QR', 'QR code'],
    ['二维码已过期', 'Mã QR đã hết hạn', 'QR code expired'],
    ['请刷新二维码', 'Vui lòng làm mới mã QR', 'Please refresh the QR code'],
    ['等待扫码', 'Đang chờ quét mã', 'Waiting for scan'],
    ['等待确认', 'Đang chờ xác nhận', 'Waiting for confirmation'],
    ['扫码成功', 'Quét mã thành công', 'QR scan successful'],
    ['授权成功', 'Cấp quyền thành công', 'Authorization successful'],
    ['授权失败', 'Cấp quyền thất bại', 'Authorization failed'],
    ['Cookie 登录', 'Đăng nhập bằng Cookie', 'Cookie sign-in'],
    ['手动导入 Cookie', 'Nhập Cookie thủ công', 'Import Cookie manually'],
    ['登录状态', 'Trạng thái đăng nhập', 'Login status'],
    ['平台', 'Nền tảng', 'Platform'],
    ['网易云音乐', 'NetEase Cloud Music', 'NetEase Cloud Music'],
    ['网易云', 'NetEase Cloud', 'NetEase Cloud'],
    ['酷狗音乐', 'Kugou Music', 'Kugou Music'],
    ['汽水音乐', 'Qishui Music', 'Qishui Music'],
    ['抖音确认', 'Xác nhận Douyin', 'Douyin confirmation'],
    ['官方窗口', 'Cửa sổ chính thức', 'Official window'],
    ['官方扫码', 'QR chính thức', 'Official QR'],
    ['会话', 'Phiên đăng nhập', 'Session'],
    ['更新', 'Cập nhật', 'Update'],
    ['检查更新', 'Kiểm tra cập nhật', 'Check for updates'],
    ['发现新版本', 'Có phiên bản mới', 'New version available'],
    ['当前已是最新版本', 'Bạn đang dùng phiên bản mới nhất', 'You are already on the latest version'],
    ['新版本', 'Phiên bản mới', 'New version'],
    ['版本', 'Phiên bản', 'Version'],
    ['下载', 'Tải xuống', 'Download'],
    ['下载页面', 'Trang tải xuống', 'Download page'],
    ['下载线路', 'Nguồn tải xuống', 'Download sources'],
    ['打开下载页面', 'Mở trang tải xuống', 'Open download page'],
    ['浏览器', 'Trình duyệt', 'Browser'],
    ['软件不会在本地下载或应用补丁', 'Ứng dụng sẽ không tự tải hoặc áp dụng bản vá cục bộ', 'The app will not download or apply patches locally'],
    ['自动换源', 'Tự đổi nguồn', 'Automatic source fallback'],
    ['正在尝试其他音源', 'Đang thử nguồn âm thanh khác', 'Trying another audio source'],
    ['切换音源', 'Đổi nguồn âm thanh', 'Switch audio source'],
    ['音源', 'Nguồn âm thanh', 'Audio source'],
    ['播放失败', 'Phát thất bại', 'Playback failed'],
    ['播放错误', 'Lỗi phát nhạc', 'Playback error'],
    ['无法播放', 'Không thể phát', 'Unable to play'],
    ['开始播放', 'Bắt đầu phát', 'Start playback'],
    ['暂停', 'Tạm dừng', 'Pause'],
    ['播放', 'Phát', 'Play'],
    ['上一首', 'Bài trước', 'Previous track'],
    ['下一首', 'Bài tiếp theo', 'Next track'],
    ['随机播放', 'Phát ngẫu nhiên', 'Shuffle'],
    ['单曲循环', 'Lặp một bài', 'Repeat one'],
    ['顺序循环', 'Lặp theo thứ tự', 'Repeat all'],
    ['播放队列', 'Hàng đợi phát', 'Playback queue'],
    ['当前队列', 'Hàng đợi hiện tại', 'Current queue'],
    ['清空队列', 'Xóa hàng đợi', 'Clear queue'],
    ['添加到队列', 'Thêm vào hàng đợi', 'Add to queue'],
    ['已添加到队列', 'Đã thêm vào hàng đợi', 'Added to queue'],
    ['歌单', 'Playlist', 'Playlist'],
    ['我的歌单', 'Playlist của tôi', 'My playlists'],
    ['内置歌单', 'Playlist tích hợp', 'Built-in playlist'],
    ['收藏', 'Đã lưu', 'Saved'],
    ['喜欢', 'Yêu thích', 'Liked'],
    ['播客', 'Podcast', 'Podcast'],
    ['我的播客', 'Podcast của tôi', 'My podcasts'],
    ['歌曲', 'Bài hát', 'Song'],
    ['歌手', 'Ca sĩ', 'Artist'],
    ['专辑', 'Album', 'Album'],
    ['歌曲详情', 'Chi tiết bài hát', 'Song details'],
    ['歌手详情', 'Chi tiết nghệ sĩ', 'Artist details'],
    ['专辑详情', 'Chi tiết album', 'Album details'],
    ['歌词校准', 'Căn chỉnh lời bài hát', 'Lyric timing'],
    ['歌词提前', 'Lời sớm hơn', 'Advance lyrics'],
    ['歌词延后', 'Lời trễ hơn', 'Delay lyrics'],
    ['重置歌词校准', 'Đặt lại căn chỉnh lời', 'Reset lyric timing'],
    ['没有歌词', 'Không có lời bài hát', 'No lyrics available'],
    ['歌词加载失败', 'Tải lời bài hát thất bại', 'Failed to load lyrics'],
    ['译文', 'Bản dịch', 'Translation'],
    ['原文', 'Nguyên văn', 'Original'],
    ['自定义歌词', 'Lời tùy chỉnh', 'Custom lyrics'],
    ['保存歌词', 'Lưu lời bài hát', 'Save lyrics'],
    ['导入歌词', 'Nhập lời bài hát', 'Import lyrics'],
    ['视觉', 'Hình ảnh', 'Visuals'],
    ['视觉效果', 'Hiệu ứng hình ảnh', 'Visual effects'],
    ['视觉设置', 'Thiết lập hình ảnh', 'Visual settings'],
    ['视觉控制台', 'Bảng điều khiển hình ảnh', 'Visual Console'],
    ['粒子', 'Hạt', 'Particles'],
    ['镜头', 'Camera', 'Camera'],
    ['背景', 'Nền', 'Background'],
    ['封面', 'Ảnh bìa', 'Cover'],
    ['颜色', 'Màu', 'Color'],
    ['透明度', 'Độ trong suốt', 'Opacity'],
    ['位置', 'Vị trí', 'Position'],
    ['大小', 'Kích thước', 'Size'],
    ['速度', 'Tốc độ', 'Speed'],
    ['强度', 'Cường độ', 'Strength'],
    ['亮度', 'Độ sáng', 'Brightness'],
    ['模糊', 'Độ mờ', 'Blur'],
    ['缩放', 'Thu phóng', 'Scale'],
    ['旋转', 'Xoay', 'Rotation'],
    ['角度', 'Góc', 'Angle'],
    ['行距', 'Khoảng cách dòng', 'Line spacing'],
    ['字体', 'Phông chữ', 'Font'],
    ['字重', 'Độ đậm chữ', 'Font weight'],
    ['桌面模式', 'Chế độ desktop', 'Desktop mode'],
    ['桌面控制', 'Điều khiển desktop', 'Desktop controls'],
    ['锁定软件操作', 'Khóa thao tác ứng dụng', 'Lock app interaction'],
    ['显示桌面图标', 'Hiện biểu tượng desktop', 'Show desktop icons'],
    ['退出桌面模式', 'Thoát chế độ desktop', 'Exit desktop mode'],
    ['桌面歌词', 'Lời bài hát trên desktop', 'Desktop lyrics'],
    ['桌面歌词锁定', 'Khóa lời desktop', 'Lock desktop lyrics'],
    ['桌面歌词高亮跟随', 'Highlight lời desktop theo tiến độ', 'Desktop lyric progress highlight'],
    ['摄像头', 'Camera', 'Camera'],
    ['手势', 'Cử chỉ', 'Gesture'],
    ['手势控制', 'Điều khiển cử chỉ', 'Gesture control'],
    ['摄像头权限', 'Quyền camera', 'Camera permission'],
    ['需要摄像头权限', 'Cần quyền truy cập camera', 'Camera permission is required'],
    ['允许', 'Cho phép', 'Allow'],
    ['拒绝', 'Từ chối', 'Deny'],
    ['权限', 'Quyền', 'Permission'],
    ['权限被拒绝', 'Quyền đã bị từ chối', 'Permission denied'],
    ['无法访问摄像头', 'Không thể truy cập camera', 'Unable to access camera'],
    ['自由镜头', 'Camera tự do', 'Free camera'],
    ['全屏', 'Toàn màn hình', 'Fullscreen'],
    ['最小化', 'Thu nhỏ', 'Minimize'],
    ['最大化', 'Phóng to', 'Maximize'],
    ['恢复窗口', 'Khôi phục cửa sổ', 'Restore window'],
    ['窗口', 'Cửa sổ', 'Window'],
    ['错误', 'Lỗi', 'Error'],
    ['警告', 'Cảnh báo', 'Warning'],
    ['提示', 'Thông báo', 'Notice'],
    ['信息', 'Thông tin', 'Information'],
    ['成功', 'Thành công', 'Success'],
    ['失败', 'Thất bại', 'Failed'],
    ['未知错误', 'Lỗi không xác định', 'Unknown error'],
    ['发生错误', 'Đã xảy ra lỗi', 'An error occurred'],
    ['请检查网络连接', 'Vui lòng kiểm tra kết nối mạng', 'Please check your network connection'],
    ['无网络连接', 'Không có kết nối mạng', 'No network connection'],
    ['无法连接服务器', 'Không thể kết nối máy chủ', 'Unable to connect to server'],
    ['请求超时', 'Yêu cầu hết thời gian', 'Request timed out'],
    ['数据异常', 'Dữ liệu không hợp lệ', 'Invalid data'],
    ['格式不支持', 'Định dạng không được hỗ trợ', 'Unsupported format'],
    ['文件不存在', 'Tệp không tồn tại', 'File does not exist'],
    ['文件过大', 'Tệp quá lớn', 'File is too large'],
    ['无法解码', 'Không thể giải mã', 'Unable to decode'],
    ['请重新选择', 'Vui lòng chọn lại', 'Please choose again'],
    ['重新选择', 'Chọn lại', 'Choose again'],
    ['重启应用', 'Khởi động lại ứng dụng', 'Restart app'],
    ['需要重启', 'Cần khởi động lại', 'Restart required'],
    ['稍后', 'Để sau', 'Later'],
    ['立即重启', 'Khởi động lại ngay', 'Restart now'],
    ['语言', 'Ngôn ngữ', 'Language'],
    ['英文', 'Tiếng Anh', 'English'],
    ['英语', 'Tiếng Anh', 'English'],
    ['越南语', 'Tiếng Việt', 'Vietnamese']
  ];

  const strictTranslations = Object.create(null);
  const originalText = new WeakMap();
  const lastTextOutput = new WeakMap();
  const originalAttrs = new WeakMap();
  const lastAttrOutput = new WeakMap();
  let observer = null;
  let applying = false;
  let phraseCache = { vi: null, en: null };

  function language() {
    try {
      if (window.MineradioI18n && typeof window.MineradioI18n.getLanguage === 'function') {
        return window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
      }
      return localStorage.getItem('mineradio.language') === 'en' ? 'en' : 'vi';
    } catch (_error) {
      return 'vi';
    }
  }

  function registerRows(rows) {
    rows.forEach(function (row) {
      strictTranslations[row[0]] = { vi: row[1], en: row[2] };
    });
    phraseCache.vi = null;
    phraseCache.en = null;
  }

  registerRows(STRICT_ROWS);

  function phraseTable(lang) {
    if (phraseCache[lang]) return phraseCache[lang];
    const table = new Map();
    function add(source, target) {
      source = String(source == null ? '' : source);
      target = String(target == null ? '' : target);
      if (!source || !target || source === target) return;
      table.set(source, target);
    }

    const base = window.MineradioI18n && window.MineradioI18n.translations
      ? window.MineradioI18n.translations
      : {};
    Object.keys(base).forEach(function (source) {
      const entry = base[source] || {};
      const target = String(entry[lang] || source);
      add(source, target);
      add(entry.vi, target);
      add(entry.en, target);
    });
    Object.keys(strictTranslations).forEach(function (source) {
      const entry = strictTranslations[source] || {};
      const target = String(entry[lang] || source);
      add(source, target);
      add(entry.vi, target);
      add(entry.en, target);
    });
    phraseCache[lang] = Array.from(table.entries()).sort(function (a, b) {
      return b[0].length - a[0].length;
    });
    return phraseCache[lang];
  }

  function normalizeDynamicPatterns(value, lang) {
    let result = String(value == null ? '' : value);
    result = result.replace(/(\d+)\s*分钟/g, function (_m, n) { return lang === 'vi' ? n + ' phút' : n + ' min'; });
    result = result.replace(/(\d+)\s*首/g, function (_m, n) { return lang === 'vi' ? n + ' bài' : n + ' tracks'; });
    result = result.replace(/(\d+)\s*项内容/g, function (_m, n) { return lang === 'vi' ? n + ' mục nội dung' : n + ' items'; });
    result = result.replace(/(\d+)\s*项/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });
    result = result.replace(/(\d+)\s*秒/g, function (_m, n) { return lang === 'vi' ? n + ' giây' : n + ' s'; });
    result = result.replace(/(\d+)\s*个/g, function (_m, n) { return lang === 'vi' ? n + ' mục' : n + ' items'; });

    const weekdays = {
      '星期一': ['Thứ Hai', 'Monday'], '星期二': ['Thứ Ba', 'Tuesday'],
      '星期三': ['Thứ Tư', 'Wednesday'], '星期四': ['Thứ Năm', 'Thursday'],
      '星期五': ['Thứ Sáu', 'Friday'], '星期六': ['Thứ Bảy', 'Saturday'],
      '星期日': ['Chủ Nhật', 'Sunday'], '星期天': ['Chủ Nhật', 'Sunday']
    };
    Object.keys(weekdays).forEach(function (key) {
      result = result.split(key).join(weekdays[key][lang === 'vi' ? 0 : 1]);
    });
    result = result.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g, function (_m, y, m, d) {
      return lang === 'vi' ? d + '/' + m + '/' + y : m + '/' + d + '/' + y;
    });
    return result;
  }

  function translateLoose(value, lang) {
    let result = normalizeDynamicPatterns(value, lang);
    phraseTable(lang).forEach(function (pair) {
      if (result.indexOf(pair[0]) >= 0) result = result.split(pair[0]).join(pair[1]);
    });
    return result;
  }

  function closestElement(node) {
    return node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement;
  }

  function isHardProtected(node) {
    const el = closestElement(node);
    return !!(el && el.closest && el.closest(HARD_PROTECTED));
  }

  function isSoftProtected(node) {
    const el = closestElement(node);
    return !!(el && el.closest && el.closest(SOFT_PROTECTED));
  }

  function fallbackWord(el, lang) {
    const tag = String(el && el.tagName || '').toLowerCase();
    const role = String(el && el.getAttribute && el.getAttribute('role') || '').toLowerCase();
    if (tag === 'button' || role === 'button' || role === 'tab' || role === 'switch') return lang === 'vi' ? 'Tùy chọn' : 'Option';
    if (tag === 'label' || role === 'checkbox' || role === 'radio') return lang === 'vi' ? 'Thiết lập' : 'Setting';
    if (/^h[1-6]$/.test(tag) || (el && el.classList && (el.classList.contains('modal-title') || el.classList.contains('fx-title')))) return lang === 'vi' ? 'Thông tin' : 'Information';
    return lang === 'vi' ? 'Nội dung' : 'Content';
  }

  function strictScrub(value, node, allowFallback) {
    const lang = language();
    let result = translateLoose(value, lang);
    if (allowFallback && HAN_RE.test(result)) {
      const el = closestElement(node);
      const fallback = fallbackWord(el, lang);
      result = result.replace(HAN_RUN_RE, fallback)
        .replace(/\s{2,}/g, ' ')
        .replace(/([·•|/,:;，。；：])\s*([·•|/,:;，。；：])/g, '$1')
        .trim();
    }
    return result;
  }

  function translateTextNode(node, fromMutation) {
    if (!node || node.nodeType !== Node.TEXT_NODE || isHardProtected(node)) return;
    const current = String(node.nodeValue || '');
    if (!current.trim()) return;
    const last = lastTextOutput.get(node);
    if (!originalText.has(node) || (fromMutation && current !== last)) originalText.set(node, current);
    const source = originalText.get(node);
    const output = strictScrub(source, node, !isSoftProtected(node));
    lastTextOutput.set(node, output);
    if (current !== output) node.nodeValue = output;
  }

  function attrMaps(element) {
    let originals = originalAttrs.get(element);
    if (!originals) { originals = new Map(); originalAttrs.set(element, originals); }
    let outputs = lastAttrOutput.get(element);
    if (!outputs) { outputs = new Map(); lastAttrOutput.set(element, outputs); }
    return { originals: originals, outputs: outputs };
  }

  function translateAttributes(element, fromMutation, changedAttribute) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE || isHardProtected(element)) return;
    const maps = attrMaps(element);
    ATTRS.forEach(function (attr) {
      if (changedAttribute && changedAttribute !== attr) return;
      if (!element.hasAttribute(attr)) return;
      const current = String(element.getAttribute(attr) || '');
      const last = maps.outputs.get(attr);
      if (!maps.originals.has(attr) || (fromMutation && current !== last)) maps.originals.set(attr, current);
      const source = maps.originals.get(attr);
      const output = strictScrub(source, element, !isSoftProtected(element));
      maps.outputs.set(attr, output);
      if (current !== output) element.setAttribute(attr, output);
    });
  }

  function walk(root, fromMutation) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, fromMutation);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root, fromMutation);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, fromMutation);
      else translateAttributes(node, fromMutation);
      node = walker.nextNode();
    }
  }

  function refreshAll() {
    if (applying || !document.documentElement) return;
    applying = true;
    try { walk(document.documentElement, false); } finally { applying = false; }
  }

  function startObserver() {
    if (!document.documentElement) return;
    if (!observer) {
      observer = new MutationObserver(function (mutations) {
        if (applying) return;
        applying = true;
        try {
          mutations.forEach(function (mutation) {
            if (mutation.type === 'characterData') {
              translateTextNode(mutation.target, true);
            } else if (mutation.type === 'attributes') {
              translateAttributes(mutation.target, true, mutation.attributeName);
            } else if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(function (node) { walk(node, true); });
            }
          });
        } finally {
          applying = false;
        }
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

  function wrapDialog(name) {
    const original = window[name];
    if (typeof original !== 'function' || original.__mineradioLocalized) return;
    const wrapped = function (message, defaultValue) {
      const translated = strictScrub(String(message == null ? '' : message), document.body, true);
      if (name === 'prompt') return original.call(window, translated, defaultValue);
      return original.call(window, translated);
    };
    wrapped.__mineradioLocalized = true;
    window[name] = wrapped;
  }

  function countVisibleChineseUi() {
    let count = 0;
    const samples = [];
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = String(node.nodeValue || '').trim();
      if (value && HAN_RE.test(value) && !isHardProtected(node)) {
        count += 1;
        if (samples.length < 20) samples.push(value.slice(0, 120));
      }
      node = walker.nextNode();
    }
    return { count: count, samples: samples };
  }

  window.MineradioStrictI18n = {
    translate: function (value, lang) { return translateLoose(value, lang === 'en' ? 'en' : 'vi'); },
    refresh: refreshAll,
    audit: countVisibleChineseUi,
    rows: STRICT_ROWS
  };

  wrapDialog('alert');
  wrapDialog('confirm');
  wrapDialog('prompt');
  refreshAll();
  startObserver();

  window.addEventListener('mineradio:languagechange', function () {
    // Existing i18n updates first; run after the event stack so aliases from both
    // VI and EN are normalized into the newly selected language.
    setTimeout(refreshAll, 0);
    setTimeout(refreshAll, 80);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      refreshAll();
      startObserver();
      setTimeout(refreshAll, 250);
      setTimeout(refreshAll, 900);
    }, { once: true });
  } else {
    setTimeout(refreshAll, 0);
    setTimeout(refreshAll, 250);
    setTimeout(refreshAll, 900);
  }
})();
