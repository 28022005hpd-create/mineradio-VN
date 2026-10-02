'use strict';

(function extendMineradioVietnameseRows() {
  var rows = [
    // Home/dashboard English labels that are part of Mineradio UI, not metadata.
    ['CONTINUE', 'TIẾP TỤC', 'CONTINUE'],
    ['LIBRARY', 'THƯ VIỆN', 'LIBRARY'],
    ['DAILY MIX', 'GỢI Ý HẰNG NGÀY', 'DAILY MIX'],
    ['RECENT', 'GẦN ĐÂY', 'RECENT'],
    ['FOR YOU', 'DÀNH CHO BẠN', 'FOR YOU'],
    ['DISCOVER', 'KHÁM PHÁ', 'DISCOVER'],
    ['PLATFORM PICKS', 'GỢI Ý NỀN TẢNG', 'PLATFORM PICKS'],
    ['NEXT UP', 'TIẾP THEO', 'NEXT UP'],
    ['LISTENING TODAY', 'NGHE HÔM NAY', 'LISTENING TODAY'],

    // Playback quality UI. Keep codec/bitrate names technical and translate only UI copy.
    ['超清母带', 'Master chất lượng cao', 'Studio master'],
    ['高清臻音', 'Hi-Res', 'Hi-Res'],
    ['无损 FLAC', 'Lossless FLAC', 'Lossless FLAC'],
    ['无损 SQ', 'Lossless (SQ)', 'Lossless (SQ)'],
    ['无损', 'Lossless', 'Lossless'],
    ['极高 HQ', '320 kbps (HQ)', '320 kbps (HQ)'],
    ['极高', 'Chất lượng cao', 'High quality'],
    ['标准', 'Tiêu chuẩn', 'Standard'],
    ['最高规格', 'chất lượng tối đa', 'maximum quality'],
    ['细节优先', 'ưu tiên chi tiết', 'detail priority'],
    ['FLAC 优先', 'ưu tiên FLAC', 'prefer FLAC'],
    ['高解析 / 优先尝试', 'Hi-Res · ưu tiên thử', 'Hi-Res · try first'],
    ['稳定优先', 'ưu tiên ổn định', 'stability priority'],
    ['高品质', 'chất lượng cao', 'high quality'],
    ['兼容优先', 'ưu tiên tương thích', 'compatibility priority'],
    ['汽水匹配源', 'Nguồn khớp Qishui', 'Qishui matched source'],
    ['Spotify 匹配源', 'Spotify', 'Spotify'],
    ['音质已锁定上限', 'Bài hiện tại có giới hạn chất lượng', 'Current track has a quality limit'],
    ['当前歌曲最高可播', 'Bài hiện tại phát tối đa', 'Current track plays up to'],
    ['更高档位已禁用', 'mức cao hơn sẽ tự hạ xuống', 'higher levels will fall back automatically'],
    ['当前歌曲最高', 'Bài hiện tại tối đa', 'Current track maximum'],
    ['需要网易云 SVIP 账号', 'Cần tài khoản NetEase SVIP', 'NetEase SVIP required'],
    ['超清母带需要网易云 SVIP', 'Master chất lượng cao cần NetEase SVIP', 'Studio master requires NetEase SVIP'],
    ['登录网易云 SVIP 后可用超清母带', 'Đăng nhập NetEase SVIP để dùng Master chất lượng cao', 'Sign in with NetEase SVIP for studio master'],
    ['音质偏好', 'Ưu tiên chất lượng', 'Quality preference'],
    ['下次播放生效', 'áp dụng từ lần phát tiếp theo', 'applies on next playback'],
    ['正在切换音质', 'Đang chuyển chất lượng', 'Switching quality'],
    ['音质切换失败，已保留偏好', 'Chuyển chất lượng thất bại; đã giữ mức ưu tiên', 'Quality switch failed; preference kept'],

    // Repair strings produced by older destructive fallback builds.
    ['HDNội dung', 'Hi-Res', 'Hi-Res'],
    ['Nội dung SQ', 'Lossless (SQ)', 'Lossless (SQ)'],
    ['Nội dungCao HQ', '320 kbps (HQ)', '320 kbps (HQ)'],
    ['Nội dung SQ / Nội dungCaoNội dung', 'Lossless (SQ) · ưu tiên ổn định', 'Lossless (SQ) · stability priority']
  ];

  function append(target) {
    if (!target || !Array.isArray(target.rows)) return;
    var known = new Set(target.rows.map(function (row) { return String(row && row[0] || ''); }));
    rows.forEach(function (row) {
      if (!known.has(row[0])) {
        target.rows.push(row.slice());
        known.add(row[0]);
      }
    });
  }

  append(window.MineradioFinalI18n);
  append(window.MineradioStrictI18n);
})();
