'use strict';

(function initMineradioI18n() {
  const STORAGE_KEY = 'mineradio.language';
  const DEFAULT_LANGUAGE = 'vi';
  const SUPPORTED_LANGUAGES = ['vi', 'en'];

  const translations = {
    '查看使用引导': { vi: 'Xem hướng dẫn sử dụng', en: 'View usage guide' },
    '发现新版本': { vi: 'Có phiên bản mới', en: 'New version available' },
    '开启 DIY 玩家模式': { vi: 'Bật chế độ DIY', en: 'Enable DIY mode' },
    '最小化': { vi: 'Thu nhỏ', en: 'Minimize' },
    '全屏': { vi: 'Toàn màn hình', en: 'Fullscreen' },
    '关闭': { vi: 'Đóng', en: 'Close' },
    '点击进入': { vi: 'Nhấp để vào', en: 'Click to enter' },
    '搜索歌曲、歌手...': { vi: 'Tìm bài hát, ca sĩ...', en: 'Search songs, artists...' },
    '导入音乐或封面': { vi: 'Nhập nhạc hoặc ảnh bìa', en: 'Import music or cover' },
    '取消自定义封面': { vi: 'Bỏ ảnh bìa tùy chỉnh', en: 'Remove custom cover' },
    '导入面板': { vi: 'Bảng nhập dữ liệu', en: 'Import panel' },
    '封面图片': { vi: 'Ảnh bìa', en: 'Cover image' },
    '给当前歌曲换封面': { vi: 'Đổi ảnh bìa cho bài hiện tại', en: 'Change the current song cover' },
    '单曲文件': { vi: 'Tệp bài hát', en: 'Song file' },
    '导入并立即播放': { vi: 'Nhập và phát ngay', en: 'Import and play now' },
    '多曲文件夹': { vi: 'Thư mục nhiều bài', en: 'Multi-song folder' },
    '批量导入到队列': { vi: 'Nhập hàng loạt vào hàng đợi', en: 'Batch import to queue' },
    '关闭提示': { vi: 'Đóng gợi ý', en: 'Close tip' },
    '导入入口': { vi: 'Nhập nội dung', en: 'Import' },
    '这里支持上传歌曲，也可以给当前曲目换自定义封面。': { vi: 'Bạn có thể tải bài hát lên hoặc đổi ảnh bìa tùy chỉnh cho bài hiện tại.', en: 'Upload songs here or set a custom cover for the current track.' },
    'Mineradio 音乐首页': { vi: 'Trang chủ nhạc Mineradio', en: 'Mineradio music home' },
    '“让今天的声音，从你喜欢的地方开始。”': { vi: '“Hãy bắt đầu âm thanh hôm nay từ nơi bạn yêu thích.”', en: '“Let today’s sound begin where you love.”' },
    '换一条': { vi: 'Đổi câu khác', en: 'Another one' },
    '选择 MP4': { vi: 'Chọn MP4', en: 'Choose MP4' },
    '移除视频': { vi: 'Xóa video', en: 'Remove video' },
    '展开播放器控制台': { vi: 'Mở bảng điều khiển trình phát', en: 'Open player console' },
    '常用音乐入口': { vi: 'Lối tắt âm nhạc', en: 'Music shortcuts' },
    '继续播放': { vi: 'Tiếp tục phát', en: 'Continue playing' },
    '从当前队列或最近播放继续': { vi: 'Tiếp tục từ hàng đợi hoặc lịch sử gần đây', en: 'Continue from the current queue or recent playback' },
    '音乐库': { vi: 'Thư viện nhạc', en: 'Music library' },
    '歌单、本地音乐和已登录平台': { vi: 'Playlist, nhạc cục bộ và nền tảng đã đăng nhập', en: 'Playlists, local music, and signed-in platforms' },
    '每日推荐': { vi: 'Gợi ý hằng ngày', en: 'Daily mix' },
    '使用当前 Mineradio 推荐数据': { vi: 'Dùng dữ liệu gợi ý hiện tại của Mineradio', en: 'Use current Mineradio recommendation data' },
    '最近播放': { vi: 'Đã phát gần đây', en: 'Recently played' },
    '播放过的歌曲会出现在这里': { vi: 'Các bài đã phát sẽ xuất hiện ở đây', en: 'Songs you played will appear here' },
    '今日聆听': { vi: 'Nghe hôm nay', en: 'Listening today' },
    '查看偏好': { vi: 'Xem sở thích', en: 'View preferences' },
    '聆听时长': { vi: 'Thời gian nghe', en: 'Listening time' },
    '今日歌曲': { vi: 'Bài hát hôm nay', en: 'Songs today' },
    '等待记录': { vi: 'Chờ dữ liệu', en: 'Waiting for data' },
    '开始播放后生成': { vi: 'Tạo sau khi bắt đầu phát', en: 'Generated after playback starts' },
    '播放下一首': { vi: 'Phát bài tiếp theo', en: 'Play next' },
    '自定义颜色': { vi: 'Màu tùy chỉnh', en: 'Custom colors' },
    '界面高亮色': { vi: 'Màu nhấn giao diện', en: 'UI accent color' },
    '界面高亮': { vi: 'Màu nhấn giao diện', en: 'UI accent' },
    '默认': { vi: 'Mặc định', en: 'Default' },
    '视觉主色': { vi: 'Màu hình ảnh chính', en: 'Primary visual color' },
    '封面取色': { vi: 'Lấy màu từ bìa', en: 'Sample from cover' },
    '封面': { vi: 'Bìa', en: 'Cover' },
    '点击专辑封面任意位置取色，或使用下方推荐色。': { vi: 'Nhấp vào vị trí bất kỳ trên ảnh bìa để lấy màu, hoặc dùng màu gợi ý bên dưới.', en: 'Click anywhere on the album cover to sample a color, or use a suggested color below.' },
    'Home 填充色': { vi: 'Màu nền Home', en: 'Home fill color' },
    'Home 填充': { vi: 'Màu nền Home', en: 'Home fill' },
    '主页图标': { vi: 'Biểu tượng trang chủ', en: 'Home icon' },
    '视觉图标': { vi: 'Biểu tượng hình ảnh', en: 'Visual icon' },
    '背景颜色': { vi: 'Màu nền', en: 'Background color' },
    '背景媒体': { vi: 'Nền đa phương tiện', en: 'Background media' },
    '未设置': { vi: 'Chưa đặt', en: 'Not set' },
    '使用当前封面原图': { vi: 'Dùng ảnh bìa hiện tại', en: 'Use current cover image' },
    '选择': { vi: 'Chọn', en: 'Choose' },
    '裁切': { vi: 'Cắt', en: 'Crop' },
    '清除': { vi: 'Xóa', en: 'Clear' },
    '未启用 · 原背景保留': { vi: 'Chưa bật · Giữ nền gốc', en: 'Disabled · Original background kept' },
    '识别 / 导入': { vi: 'Nhận diện / Nhập', en: 'Detect / Import' },
    '恢复原背景': { vi: 'Khôi phục nền gốc', en: 'Restore original background' },
    'WE 壁纸透明度': { vi: 'Độ trong suốt hình nền WE', en: 'WE wallpaper opacity' },
    'WE 水平位置': { vi: 'Vị trí ngang WE', en: 'WE horizontal position' },
    'WE 垂直位置': { vi: 'Vị trí dọc WE', en: 'WE vertical position' },
    'WE 壁纸缩放': { vi: 'Thu phóng hình nền WE', en: 'WE wallpaper scale' },
    '背景透明度': { vi: 'Độ trong suốt nền', en: 'Background opacity' },
    '裁切左右': { vi: 'Cắt trái/phải', en: 'Horizontal crop' },
    '裁切上下': { vi: 'Cắt trên/dưới', en: 'Vertical crop' },
    '裁切缩放': { vi: 'Thu phóng vùng cắt', en: 'Crop zoom' },
    '窗口背景透明': { vi: 'Độ trong suốt nền cửa sổ', en: 'Window background opacity' },
    '毛玻璃透明': { vi: 'Độ trong suốt kính mờ', en: 'Frosted glass opacity' },
    '控制台玻璃色差': { vi: 'Quang sai kính bảng điều khiển', en: 'Console glass aberration' },
    '左栏雾面': { vi: 'Độ mờ cột trái', en: 'Left panel blur' },
    '左栏遮挡': { vi: 'Mật độ cột trái', en: 'Left panel density' },
    '左栏唤出': { vi: 'Tốc độ mở cột trái', en: 'Left panel open speed' },
    '左栏收起': { vi: 'Tốc độ đóng cột trái', en: 'Left panel close speed' },
    '主控': { vi: 'Điều khiển chính', en: 'Master controls' },
    '律动强度': { vi: 'Cường độ nhịp', en: 'Motion intensity' },
    '立体感': { vi: 'Độ sâu 3D', en: 'Depth' },
    '封面清晰度': { vi: 'Độ nét ảnh bìa', en: 'Cover sharpness' },
    '镜头晃动': { vi: 'Rung camera', en: 'Camera shake' },
    '歌词溢光': { vi: 'Glow lời bài hát', en: 'Lyric glow' },
    '亮底避光': { vi: 'Thích ứng nền sáng', en: 'Bright-background adaptation' },
    '音域地形': { vi: 'Địa hình âm thanh', en: 'Sonic terrain' },
    '地面起伏': { vi: 'Độ gợn mặt đất', en: 'Ground amplitude' },
    '起伏速度': { vi: 'Tốc độ gợn', en: 'Wave speed' },
    '地形密度': { vi: 'Mật độ địa hình', en: 'Terrain density' },
    '地面范围': { vi: 'Phạm vi mặt đất', en: 'Ground range' },
    '歌词避让': { vi: 'Tránh vùng lời bài hát', en: 'Lyric avoidance' },
    '地面远近': { vi: 'Độ sâu mặt đất', en: 'Ground depth' },
    '地形自转': { vi: 'Tự xoay địa hình', en: 'Terrain auto-rotate' },
    '音域频谱': { vi: 'Phổ âm thanh', en: 'Audio spectrum' },
    '实时频谱': { vi: 'Phổ thời gian thực', en: 'Live spectrum' },
    'Kick 自动': { vi: 'Kick tự động', en: 'Auto kick' },
    '频谱面板': { vi: 'Bảng phổ', en: 'Spectrum panel' },
    'Kick 灵敏': { vi: 'Độ nhạy Kick', en: 'Kick sensitivity' },
    '范围起点': { vi: 'Điểm đầu dải', en: 'Range start' },
    '范围终点': { vi: 'Điểm cuối dải', en: 'Range end' },
    '触发阈值': { vi: 'Ngưỡng kích hoạt', en: 'Trigger threshold' },
    '触发力度': { vi: 'Cường độ kích hoạt', en: 'Trigger strength' },
    '切片幅度': { vi: 'Biên độ lát cắt', en: 'Slice amount' },
    '色散强度': { vi: 'Cường độ tán sắc', en: 'Chromatic strength' },
    '触发速度': { vi: 'Tốc độ kích hoạt', en: 'Trigger rate' },
    '抖动幅度': { vi: 'Biên độ rung', en: 'Jitter amount' },
    '上下句清晰': { vi: 'Độ rõ câu lân cận', en: 'Context clarity' },
    '上下句间距': { vi: 'Khoảng cách câu lân cận', en: 'Context spacing' },
    '译文间距': { vi: 'Khoảng cách bản dịch', en: 'Translation spacing' },
    '边缘渐隐': { vi: 'Mờ dần ở mép', en: 'Edge fade' },
    '动画柔顺': { vi: 'Độ mượt chuyển động', en: 'Motion smoothness' },
    '歌词字体': { vi: 'Phông lời bài hát', en: 'Lyric font' },
    '歌词纹理清晰度': { vi: 'Độ nét texture lời bài hát', en: 'Lyric texture clarity' },
    '标清': { vi: 'Tiêu chuẩn', en: 'Standard' },
    '高清': { vi: 'HD', en: 'HD' },
    '超清': { vi: 'Siêu nét', en: 'Ultra' },
    '极致': { vi: 'Tối đa', en: 'Max' },
    '黑体': { vi: 'Hei', en: 'Hei' },
    '宋体': { vi: 'Song', en: 'Song' },
    '粗宋': { vi: 'Song đậm', en: 'Bold Song' },
    '石印宋': { vi: 'Stone Song', en: 'Stone Song' },
    '楷宋': { vi: 'Kai Song', en: 'Kai Song' },
    '等宽': { vi: 'Đơn cách', en: 'Monospace' },
    '标题': { vi: 'Tiêu đề', en: 'Display' },
    '上传字体': { vi: 'Tải phông lên', en: 'Upload font' },
    '字间距': { vi: 'Khoảng cách chữ', en: 'Letter spacing' },
    '行距': { vi: 'Khoảng cách dòng', en: 'Line spacing' },
    '字重': { vi: 'Độ đậm chữ', en: 'Font weight' },
    '歌词布局': { vi: 'Bố cục lời bài hát', en: 'Lyric layout' },
    '歌词大小': { vi: 'Cỡ lời bài hát', en: 'Lyric size' },
    '水平位置': { vi: 'Vị trí ngang', en: 'Horizontal position' },
    '垂直位置': { vi: 'Vị trí dọc', en: 'Vertical position' },
    '景深位置': { vi: 'Vị trí chiều sâu', en: 'Depth position' },
    '上下角度': { vi: 'Góc dọc', en: 'Vertical angle' },
    '左右角度': { vi: 'Góc ngang', en: 'Horizontal angle' },
    '叠加效果': { vi: 'Hiệu ứng lớp phủ', en: 'Overlay effects' },
    '粒子 / 镜头 / 溢光': { vi: 'Hạt / Camera / Glow', en: 'Particles / Camera / Glow' },
    '浮空粒子层': { vi: 'Lớp hạt lơ lửng', en: 'Floating particle layer' },
    '电影镜头': { vi: 'Camera điện ảnh', en: 'Cinema camera' },
    '鼓点溢光': { vi: 'Glow theo nhịp', en: 'Beat glow' },
    '歌词光粒': { vi: 'Hạt sáng lời bài hát', en: 'Lyric light particles' },
    '背景星河': { vi: 'Dải sao nền', en: 'Background star river' },
    '歌词上下浮动': { vi: 'Lời bài hát trôi dọc', en: 'Vertical lyric float' },
    '暂停保留歌词': { vi: 'Giữ lời khi tạm dừng', en: 'Keep lyrics on pause' },
    '歌词镜头绑定': { vi: 'Khóa camera vào lời', en: 'Lyric camera lock' },
    '粒子溢光': { vi: 'Glow hạt', en: 'Particle bloom' },
    '轮廓高亮': { vi: 'Viền nổi bật', en: 'Edge highlight' },
    '桌面歌词': { vi: 'Lời bài hát trên desktop', en: 'Desktop lyrics' },
    '全屏幕置顶歌词': { vi: 'Lời bài hát luôn nổi trên toàn màn hình', en: 'Always-on-top lyrics across the screen' },
    '桌面歌词锁定': { vi: 'Khóa lời desktop', en: 'Lock desktop lyrics' },
    '桌面歌词电影震动': { vi: 'Rung điện ảnh cho lời desktop', en: 'Desktop lyric cinema shake' },
    '桌面歌词高亮跟随': { vi: 'Highlight lời desktop theo tiến độ', en: 'Desktop lyric progress highlight' },
    '完整桌面模式': { vi: 'Chế độ desktop đầy đủ', en: 'Full desktop mode' },
    '试验': { vi: 'Thử nghiệm', en: 'Experimental' },
    '桌面 / 壁纸': { vi: 'Desktop / Hình nền', en: 'Desktop / Wallpaper' },
    '桌面歌词大小': { vi: 'Cỡ lời desktop', en: 'Desktop lyric size' },
    '桌面歌词透明': { vi: 'Độ trong suốt lời desktop', en: 'Desktop lyric opacity' },
    '桌面歌词高度': { vi: 'Chiều cao lời desktop', en: 'Desktop lyric height' },
    '桌面帧数': { vi: 'FPS desktop', en: 'Desktop FPS' },
    '无上限': { vi: 'Không giới hạn', en: 'Unlimited' },
    '开启后可在右上控制器显示或隐藏 Windows 桌面图标；按 Esc 直接退出。重启默认关闭。': { vi: 'Khi bật, dùng bộ điều khiển góc trên phải để hiện/ẩn biểu tượng desktop Windows; nhấn Esc để thoát. Chế độ mặc định tắt sau khi khởi động lại.', en: 'When enabled, use the top-right controller to show or hide Windows desktop icons; press Esc to exit. It is disabled by default after restart.' },
    '3D / 手势': { vi: '3D / Cử chỉ', en: '3D / Gestures' },
    '歌单架 / 摄像头交互': { vi: 'Kệ playlist / Tương tác camera', en: 'Playlist shelf / Camera interaction' },
    '3D 歌单架': { vi: 'Kệ playlist 3D', en: '3D playlist shelf' },
    '侧栏': { vi: 'Thanh bên', en: 'Sidebar' },
    '舞台': { vi: 'Sân khấu', en: 'Stage' },
    '歌单架镜头': { vi: 'Camera kệ playlist', en: 'Playlist shelf camera' },
    '动态镜头': { vi: 'Camera động', en: 'Dynamic camera' },
    '静态镜头': { vi: 'Camera tĩnh', en: 'Static camera' },
    '歌单架显示': { vi: 'Hiển thị kệ playlist', en: 'Playlist shelf visibility' },
    '自动隐藏': { vi: 'Tự động ẩn', en: 'Auto hide' },
    '常驻': { vi: 'Luôn hiển thị', en: 'Always visible' },
    '歌单架内容': { vi: 'Nội dung kệ playlist', en: 'Playlist shelf content' },
    '低优先待机': { vi: 'Chờ ưu tiên thấp', en: 'Low-priority standby' },
    '定时释放(分)': { vi: 'Giải phóng định kỳ (phút)', en: 'Scheduled release (min)' },
    '占用阈值(%)': { vi: 'Ngưỡng sử dụng (%)', en: 'Usage threshold (%)' },
    '压缩播放器': { vi: 'Giảm bộ nhớ trình phát', en: 'Trim player memory' },
    '系统释放': { vi: 'Giải phóng hệ thống', en: 'System release' },
    '提权释放': { vi: 'Giải phóng với quyền cao', en: 'Elevated release' },
    '本地缓存': { vi: 'Bộ nhớ đệm cục bộ', en: 'Local cache' },
    '统一缓存目录': { vi: 'Thư mục cache chung', en: 'Unified cache directory' },
    '读取中...': { vi: 'Đang đọc...', en: 'Reading...' },
    '桌面版启动后读取': { vi: 'Đọc sau khi ứng dụng desktop khởi động', en: 'Read after desktop app starts' },
    '更改目录': { vi: 'Đổi thư mục', en: 'Change directory' },
    '刷新占用': { vi: 'Làm mới dung lượng', en: 'Refresh usage' },
    '重启生效': { vi: 'Khởi động lại để áp dụng', en: 'Restart to apply' },
    '歌词 / 译文缓存': { vi: 'Cache lời / bản dịch', en: 'Lyrics / translation cache' },
    '封面、网络与音频分片缓存': { vi: 'Cache ảnh bìa, mạng và đoạn âm thanh', en: 'Cover, network, and audio chunk cache' },
    '节奏分析缓存': { vi: 'Cache phân tích nhịp', en: 'Beat analysis cache' },
    'Wallpaper Engine 静音场景缓存': { vi: 'Cache cảnh Wallpaper Engine không âm thanh', en: 'Wallpaper Engine muted-scene cache' },
    '设置与登录资料（安全固定）': { vi: 'Cài đặt và dữ liệu đăng nhập (cố định an toàn)', en: 'Settings and login data (safely fixed)' },
    '歌词缓存立即切换；网络、节奏分析与 WE 静音场景缓存目录在下次重启后切换。': { vi: 'Cache lời chuyển ngay; cache mạng, phân tích nhịp và cảnh WE không âm thanh sẽ đổi sau lần khởi động lại tiếp theo.', en: 'Lyrics cache switches immediately; network, beat analysis, and WE muted-scene cache directories switch after the next restart.' },
    '粒子尺寸': { vi: 'Kích thước hạt', en: 'Particle size' },
    '流速': { vi: 'Tốc độ dòng', en: 'Flow speed' },
    '扭曲': { vi: 'Biến dạng', en: 'Twist' },
    '色彩张力': { vi: 'Cường độ màu', en: 'Color tension' },
    '溢光强度': { vi: 'Cường độ bloom', en: 'Bloom intensity' },
    '离散感': { vi: 'Độ phân tán', en: 'Scatter' },
    '背景压缩': { vi: 'Nén nền', en: 'Background compression' },
    '恢复默认': { vi: 'Khôi phục mặc định', en: 'Restore defaults' },
    '歌单 / 队列': { vi: 'Playlist / Hàng đợi', en: 'Playlist / Queue' },
    'QUEUE · 鼠标移开自动隐藏': { vi: 'QUEUE · Tự ẩn khi rời chuột', en: 'QUEUE · Auto-hides when pointer leaves' },
    '常开歌单': { vi: 'Ghim playlist', en: 'Pin playlist' },
    '随机': { vi: 'Ngẫu nhiên', en: 'Shuffle' },
    '当前队列': { vi: 'Hàng đợi hiện tại', en: 'Current queue' },
    '我的歌单': { vi: 'Playlist của tôi', en: 'My playlists' },
    '我的播客': { vi: 'Podcast của tôi', en: 'My podcasts' },
    '顺序循环': { vi: 'Lặp theo thứ tự', en: 'Sequential loop' },
    '切换模式': { vi: 'Đổi chế độ', en: 'Change mode' },
    '清空': { vi: 'Xóa hết', en: 'Clear' },
    '内置歌单可混合全部平台': { vi: 'Playlist tích hợp có thể trộn từ mọi nền tảng', en: 'Built-in playlists can mix all platforms' },
    '+ 新建内置': { vi: '+ Tạo playlist tích hợp', en: '+ New built-in playlist' },
    '刷新': { vi: 'Làm mới', en: 'Refresh' },
    '收藏 / 创建 / 喜欢': { vi: 'Đã lưu / Đã tạo / Yêu thích', en: 'Saved / Created / Liked' },
    '仅播放试听片段': { vi: 'Chỉ phát đoạn nghe thử', en: 'Playing preview only' },
    '扫码登录': { vi: 'Đăng nhập bằng QR', en: 'QR login' },
    'AI 深度估计…': { vi: 'AI đang ước tính độ sâu…', en: 'AI estimating depth…' },
    '分析节奏…': { vi: 'Đang phân tích nhịp…', en: 'Analyzing beat…' },
    '手势：': { vi: 'Cử chỉ:', en: 'Gesture:' },
    '待命': { vi: 'Chờ', en: 'Standby' },
    '将手放进摄像头视野': { vi: 'Đưa tay vào khung hình camera', en: 'Place your hand in the camera view' },
    '张掌推开 · 捏合旋转 · 握拳收束 · 左右滑切歌 · V 手势播放 · 食指音量 · 拇指喜欢 · 三指歌词': { vi: 'Xòe tay đẩy · Chụm tay xoay · Nắm tay thu · Vuốt trái/phải đổi bài · Dấu V phát · Ngón trỏ âm lượng · Ngón cái yêu thích · Ba ngón lời bài hát', en: 'Open palm push · Pinch rotate · Fist gather · Swipe to change track · V sign play · Index volume · Thumb like · Three fingers lyrics' },
    '专辑详情': { vi: 'Chi tiết album', en: 'Album details' },
    '歌曲详情': { vi: 'Chi tiết bài hát', en: 'Song details' },
    '歌手详情': { vi: 'Chi tiết nghệ sĩ', en: 'Artist details' },
    '歌词延后 0.1 秒': { vi: 'Lời trễ 0,1 giây', en: 'Delay lyrics by 0.1 s' },
    '重置当前歌曲歌词校准': { vi: 'Đặt lại căn chỉnh lời cho bài hiện tại', en: 'Reset lyric timing for current song' },
    '歌词提前 0.1 秒': { vi: 'Lời sớm 0,1 giây', en: 'Advance lyrics by 0.1 s' },
    '音量 / 静音': { vi: 'Âm lượng / Tắt tiếng', en: 'Volume / Mute' },
    '音量': { vi: 'Âm lượng', en: 'Volume' },
    '淡入': { vi: 'Fade in', en: 'Fade in' },
    '淡出': { vi: 'Fade out', en: 'Fade out' },
    '音乐淡入秒数': { vi: 'Thời gian fade in (giây)', en: 'Music fade-in seconds' },
    '音乐淡出秒数': { vi: 'Thời gian fade out (giây)', en: 'Music fade-out seconds' },
    '控制条自动隐藏': { vi: 'Tự ẩn thanh điều khiển', en: 'Auto-hide controls' },
    '全沉浸式': { vi: 'Chế độ nhập vai hoàn toàn', en: 'Full immersive mode' },
    '全屏 (F)': { vi: 'Toàn màn hình (F)', en: 'Fullscreen (F)' },
    '拖放音乐或封面': { vi: 'Kéo thả nhạc hoặc ảnh bìa', en: 'Drop music or cover here' },
    '自由镜头': { vi: 'Camera tự do', en: 'Free camera' },
    '登录接入': { vi: 'Kết nối đăng nhập', en: 'Login connection' },
    '拖接口端口到 MR': { vi: 'Kéo cổng kết nối vào MR', en: 'Drag a provider port to MR' },
    '退出登录': { vi: 'Đăng xuất', en: 'Sign out' },
    '清除所有平台登录并重新锁定彩蛋': { vi: 'Xóa đăng nhập mọi nền tảng và khóa lại easter egg', en: 'Clear all platform logins and relock the easter egg' },
    '轻触大小眼': { vi: 'Chạm vào đôi mắt', en: 'Tap the eyes' },
    '心愿是': { vi: 'Điều ước là', en: 'My wish is' },
    '输入四个字的愿望': { vi: 'Nhập điều ước gồm bốn chữ', en: 'Enter a four-character wish' },
    '网易云': { vi: 'NetEase Cloud Music', en: 'NetEase Cloud Music' },
    'QQ 音乐': { vi: 'QQ Music', en: 'QQ Music' },
    '酷狗音乐': { vi: 'Kugou Music', en: 'Kugou Music' },
    '汽水音乐': { vi: 'Qishui Music', en: 'Qishui Music' },
    '官方扫码 / Cookie': { vi: 'QR chính thức / Cookie', en: 'Official QR / Cookie' },
    '官方窗口 / Cookie': { vi: 'Cửa sổ chính thức / Cookie', en: 'Official window / Cookie' },
    '官方扫码 / 抖音确认': { vi: 'QR chính thức / Xác nhận Douyin', en: 'Official QR / Douyin confirmation' },
    '拖到 MR 接入口': { vi: 'Kéo vào cổng MR', en: 'Drag to MR input' },
    'MR 接入口': { vi: 'Cổng MR', en: 'MR input' },
    '等待接入': { vi: 'Chờ kết nối', en: 'Waiting for connection' },
    '扫码': { vi: 'Quét QR', en: 'QR code' },
    '官方窗口': { vi: 'Cửa sổ chính thức', en: 'Official window' },
    '保存会话': { vi: 'Lưu phiên', en: 'Save session' },
    '扫码登录网易云音乐': { vi: 'Quét QR để đăng nhập NetEase Cloud Music', en: 'Scan QR to sign in to NetEase Cloud Music' },
    '拖动接口到 MR 接入口后开始登录。': { vi: 'Kéo cổng nền tảng vào MR để bắt đầu đăng nhập.', en: 'Drag a provider port to MR to start signing in.' },
    '打开官方扫码窗口': { vi: 'Mở cửa sổ QR chính thức', en: 'Open official QR window' },
    '从 y.qq.com 的登录会话导入。': { vi: 'Nhập từ phiên đăng nhập y.qq.com.', en: 'Import from your y.qq.com login session.' },
    '保存': { vi: 'Lưu', en: 'Save' },
    '先搜索一首歌': { vi: 'Tìm một bài trước', en: 'Search for a song first' },
    '手动导入': { vi: 'Nhập thủ công', en: 'Manual import' },
    '开始登录': { vi: 'Bắt đầu đăng nhập', en: 'Start login' },
    '世界和平，点击继续': { vi: 'Hòa bình thế giới, nhấp để tiếp tục', en: 'World peace, click to continue' },
    '已达成成就：世界和平！': { vi: 'Đã mở thành tựu: Hòa bình thế giới!', en: 'Achievement unlocked: World Peace!' },
    '已达成成就': { vi: 'Đã mở thành tựu', en: 'Achievement unlocked' },
    '世界和平！': { vi: 'Hòa bình thế giới!', en: 'World Peace!' },
    '音频路由': { vi: 'Định tuyến âm thanh', en: 'Audio routing' },
    '删除': { vi: 'Xóa', en: 'Delete' },
    '保存使用': { vi: 'Lưu và dùng', en: 'Save and use' },
    '请以本次发布公告中的最新网盘链接为准。': { vi: 'Vui lòng dùng liên kết tải mới nhất trong thông báo phát hành này.', en: 'Please use the latest download link in this release announcement.' },
    '下载线路': { vi: 'Nguồn tải xuống', en: 'Download sources' },
    '查看更新页面': { vi: 'Xem trang cập nhật', en: 'View update page' },
    '取消': { vi: 'Hủy', en: 'Cancel' },
    '将在浏览器打开下载页面，软件不会在本地下载或应用补丁。': { vi: 'Trang tải sẽ mở trong trình duyệt; ứng dụng không tự tải hoặc áp dụng bản vá cục bộ.', en: 'The download page will open in your browser; the app will not download or apply patches locally.' },
    'Cuefield AutoMix 反馈': { vi: 'Phản hồi Cuefield AutoMix', en: 'Cuefield AutoMix feedback' },
    '这次自动过渡顺滑吗？': { vi: 'Lần chuyển tự động này có mượt không?', en: 'Was this automatic transition smooth?' },
    '顺滑': { vi: 'Mượt', en: 'Smooth' },
    '生硬': { vi: 'Gắt', en: 'Harsh' },
    '不确定': { vi: 'Không chắc', en: 'Not sure' },
    '是否导出登录 cookie 到桌面？': { vi: 'Xuất cookie đăng nhập ra desktop?', en: 'Export login cookie to the desktop?' },
    '导出的文件会用于备份当前平台登录态。': { vi: 'Tệp xuất dùng để sao lưu trạng thái đăng nhập của nền tảng hiện tại.', en: 'The exported file backs up the current platform login session.' },
    '暂不导出': { vi: 'Chưa xuất', en: 'Not now' },
    '导出到桌面': { vi: 'Xuất ra desktop', en: 'Export to desktop' },
    '自动换源': { vi: 'Tự đổi nguồn', en: 'Automatic source fallback' },
    '点击空白处也可以继续': { vi: 'Bạn cũng có thể nhấp vùng trống để tiếp tục', en: 'You can also click an empty area to continue' },
    '跳过': { vi: 'Bỏ qua', en: 'Skip' },
    '下一步': { vi: 'Tiếp theo', en: 'Next' },
    '桌面模式控制器': { vi: 'Bộ điều khiển chế độ desktop', en: 'Desktop mode controller' },
    '打开桌面模式控制': { vi: 'Mở điều khiển chế độ desktop', en: 'Open desktop mode controls' },
    '桌面模式开关': { vi: 'Công tắc chế độ desktop', en: 'Desktop mode switches' },
    '桌面控制': { vi: 'Điều khiển desktop', en: 'Desktop controls' },
    'Esc 退出': { vi: 'Esc để thoát', en: 'Esc to exit' },
    '锁定软件操作': { vi: 'Khóa thao tác ứng dụng', en: 'Lock app interaction' },
    '软件可正常操作': { vi: 'Ứng dụng có thể thao tác bình thường', en: 'App interaction enabled' },
    '显示桌面图标': { vi: 'Hiện biểu tượng desktop', en: 'Show desktop icons' },
    '图标已显示': { vi: 'Biểu tượng đang hiển thị', en: 'Icons are visible' }
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let observer = null;
  let currentLanguage = normalizeLanguage(readStoredLanguage());

  function normalizeLanguage(value) {
    return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
  }

  function readStoredLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch (_error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function writeStoredLanguage(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      // Ignore storage failures; language still works for the current session.
    }
  }

  function splitWhitespace(value) {
    const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match ? { lead: match[1], core: match[2], tail: match[3] } : { lead: '', core: String(value), tail: '' };
  }

  function translateCore(core, language) {
    if (!core) return core;
    const exact = translations[core];
    if (exact && exact[language]) return exact[language];

    let match = core.match(/^(\d+)\s*分钟$/);
    if (match) return language === 'vi' ? `${match[1]} phút` : `${match[1]} min`;

    match = core.match(/^(\d+)\s*首$/);
    if (match) return language === 'vi' ? `${match[1]} bài` : `${match[1]} tracks`;

    return core;
  }

  function translateValue(value, language) {
    const parts = splitWhitespace(value);
    return parts.lead + translateCore(parts.core, language) + parts.tail;
  }

  function rememberAttribute(element, attribute) {
    let map = originalAttrs.get(element);
    if (!map) {
      map = new Map();
      originalAttrs.set(element, map);
    }
    if (!map.has(attribute)) map.set(attribute, element.getAttribute(attribute));
    return map;
  }

  function translateElementAttributes(element, refreshOriginal) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    ['title', 'aria-label', 'placeholder'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const map = rememberAttribute(element, attribute);
      if (refreshOriginal) map.set(attribute, element.getAttribute(attribute));
      const source = map.get(attribute);
      if (source == null) return;
      const translated = translateValue(source, currentLanguage);
      if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
    });
  }

  function translateTextNode(node, refreshOriginal) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    if (refreshOriginal || !originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const translated = translateValue(source, currentLanguage);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function walkAndTranslate(root, refreshOriginal) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, refreshOriginal);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root, refreshOriginal);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, refreshOriginal);
      else translateElementAttributes(node, refreshOriginal);
      node = walker.nextNode();
    }
  }

  function observe() {
    if (!document.body) return;
    if (!observer) {
      observer = new MutationObserver((mutations) => {
        observer.disconnect();
        for (const mutation of mutations) {
          if (mutation.type === 'characterData') {
            translateTextNode(mutation.target, true);
          } else if (mutation.type === 'attributes') {
            translateElementAttributes(mutation.target, true);
          } else if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => walkAndTranslate(node, true));
          }
        }
        observe();
      });
    }
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'aria-label', 'placeholder']
    });
  }

  function applyLanguage(language, persist) {
    currentLanguage = normalizeLanguage(language);
    document.documentElement.lang = currentLanguage === 'vi' ? 'vi' : 'en';
    if (persist) writeStoredLanguage(currentLanguage);

    if (observer) observer.disconnect();
    walkAndTranslate(document.body || document.documentElement, false);
    const select = document.getElementById('mineradio-language-select');
    if (select && select.value !== currentLanguage) select.value = currentLanguage;
    observe();

    window.dispatchEvent(new CustomEvent('mineradio:languagechange', { detail: { language: currentLanguage } }));
  }

  function injectLanguageSwitcher() {
    if (document.getElementById('mineradio-language-select')) return;
    const host = document.querySelector('.desktop-window-controls') || document.body;
    if (!host) return;

    const style = document.createElement('style');
    style.id = 'mineradio-i18n-style';
    style.textContent = `
      #mineradio-language-select {
        height: 26px;
        min-width: 58px;
        margin: 0 4px;
        padding: 0 20px 0 8px;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 7px;
        background: rgba(10,12,18,.62);
        color: rgba(255,255,255,.9);
        font: 600 10px/1 Inter, sans-serif;
        letter-spacing: .06em;
        outline: none;
        cursor: pointer;
        -webkit-app-region: no-drag;
      }
      #mineradio-language-select:hover,
      #mineradio-language-select:focus-visible { border-color: rgba(255,255,255,.42); }
      #mineradio-language-select option { color: #111; background: #fff; }
    `;
    document.head.appendChild(style);

    const select = document.createElement('select');
    select.id = 'mineradio-language-select';
    select.setAttribute('aria-label', 'Language / Ngôn ngữ');
    select.innerHTML = '<option value="vi">VI</option><option value="en">EN</option>';
    select.value = currentLanguage;
    select.addEventListener('change', () => applyLanguage(select.value, true));

    const anchor = host.querySelector('#visual-guide-btn');
    if (anchor) host.insertBefore(select, anchor);
    else host.insertBefore(select, host.firstChild);
  }

  window.MineradioI18n = {
    setLanguage(language) { applyLanguage(language, true); },
    getLanguage() { return currentLanguage; },
    t(source, language) { return translateValue(source, normalizeLanguage(language || currentLanguage)); },
    translations
  };

  injectLanguageSwitcher();
  applyLanguage(currentLanguage, false);
})();
