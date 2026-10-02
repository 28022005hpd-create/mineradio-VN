'use strict';

// Vietnamese-only native-process localization bootstrap. This patches Electron
// surfaces that the renderer cannot reach, then starts the original main process.
const electron = require('electron');
const { app, dialog, Menu, Tray, ipcMain } = electron;

const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;
const desktopLyricsWindows = new Set();

const ROWS = [
  ['选择 Mineradio 缓存目录', 'Chọn thư mục cache Mineradio'],
  ['识别并导入 Wallpaper Engine 项目', 'Nhận diện và nhập dự án Wallpaper Engine'],
  ['识别此目录', 'Nhận diện thư mục này'],
  ['Wallpaper Engine 项目', 'Dự án Wallpaper Engine'],
  ['导入 Mineradio 存档', 'Nhập bản lưu Mineradio'],
  ['导出 Mineradio 存档', 'Xuất bản lưu Mineradio'],
  ['网易云音乐登录', 'Đăng nhập NetEase Cloud Music'],
  ['QQ 音乐登录', 'Đăng nhập QQ Music'],
  ['QQ音乐登录', 'Đăng nhập QQ Music'],
  ['酷狗音乐登录', 'Đăng nhập Kugou Music'],
  ['汽水音乐登录', 'Đăng nhập Qishui Music'],
  ['网易云登录窗口已关闭', 'Cửa sổ đăng nhập NetEase Cloud Music đã đóng'],
  ['QQ 登录窗口已关闭', 'Cửa sổ đăng nhập QQ Music đã đóng'],
  ['酷狗登录窗口已关闭', 'Cửa sổ đăng nhập Kugou Music đã đóng'],
  ['选择文件', 'Chọn tệp'],
  ['选择目录', 'Chọn thư mục'],
  ['选择文件夹', 'Chọn thư mục'],
  ['保存文件', 'Lưu tệp'],
  ['显示', 'Hiển thị'],
  ['隐藏', 'Ẩn'],
  ['退出完整桌面模式', 'Thoát chế độ desktop đầy đủ'],
  ['退出', 'Thoát'],
  ['取消', 'Hủy'],
  ['确定', 'Xác nhận'],
  ['确认', 'Xác nhận'],
  ['保存', 'Lưu'],
  ['打开', 'Mở'],
  ['导入', 'Nhập'],
  ['导出', 'Xuất'],
  ['错误', 'Lỗi'],
  ['警告', 'Cảnh báo'],
  ['提示', 'Thông báo'],
  ['信息', 'Thông tin'],
  ['重试', 'Thử lại'],
  ['网易云音乐', 'NetEase Cloud Music'],
  ['网易云', 'NetEase Cloud'],
  ['QQ音乐', 'QQ Music'],
  ['QQ 音乐', 'QQ Music'],
  ['酷狗音乐', 'Kugou Music'],
  ['汽水音乐', 'Qishui Music'],
  ['缓存', 'cache'],
  ['目录', 'thư mục'],
  ['项目', 'dự án'],
  ['文件', 'tệp'],
  ['登录', 'đăng nhập'],
  ['账号', 'tài khoản'],
  ['更新', 'cập nhật'],
  ['下载', 'tải xuống']
];

function table() {
  return ROWS.slice().sort((a, b) => b[0].length - a[0].length);
}

function translate(value) {
  if (typeof value !== 'string' || !value) return value;
  let output = value;
  for (const [source, target] of table()) {
    if (output.includes(source)) output = output.split(source).join(target);
  }
  // Native app-owned strings must never expose untranslated Han characters.
  // Provider/user content is not passed through this bootstrap.
  if (HAN_RE.test(output)) {
    output = output.replace(HAN_RUN_RE, 'Thông tin').replace(/\s{2,}/g, ' ').trim();
  }
  return output;
}

function localizeOptions(value, seen) {
  if (!value || typeof value !== 'object') return value;
  if (typeof value === 'function') return value;
  seen = seen || new WeakSet();
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => localizeOptions(item, seen));

  const copy = {};
  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (typeof item === 'string' && [
      'title', 'message', 'detail', 'buttonLabel', 'name', 'label', 'sublabel',
      'toolTip', 'tooltip', 'description', 'placeholderLabel', 'checkboxLabel'
    ].includes(key)) {
      copy[key] = translate(item);
    } else if (Array.isArray(item) || (item && typeof item === 'object' && typeof item !== 'function')) {
      copy[key] = localizeOptions(item, seen);
    } else {
      copy[key] = item;
    }
  });
  return copy;
}

function patchDialogMethod(name) {
  const original = dialog && dialog[name];
  if (typeof original !== 'function') return;
  dialog[name] = function (...args) {
    if (args.length) {
      const last = args.length - 1;
      if (args[last] && typeof args[last] === 'object') args[last] = localizeOptions(args[last]);
    }
    return original.apply(dialog, args);
  };
}

[
  'showOpenDialog',
  'showOpenDialogSync',
  'showSaveDialog',
  'showSaveDialogSync',
  'showMessageBox',
  'showMessageBoxSync'
].forEach(patchDialogMethod);

if (dialog && typeof dialog.showErrorBox === 'function') {
  const originalShowErrorBox = dialog.showErrorBox.bind(dialog);
  dialog.showErrorBox = (title, content) => originalShowErrorBox(translate(String(title || '')), translate(String(content || '')));
}

if (Menu && typeof Menu.buildFromTemplate === 'function') {
  const originalBuildFromTemplate = Menu.buildFromTemplate.bind(Menu);
  Menu.buildFromTemplate = (template) => originalBuildFromTemplate(localizeOptions(template));
}

try {
  if (Tray && Tray.prototype && typeof Tray.prototype.setToolTip === 'function') {
    const originalSetToolTip = Tray.prototype.setToolTip;
    Tray.prototype.setToolTip = function (text) {
      return originalSetToolTip.call(this, translate(String(text || '')));
    };
  }
} catch (_) { }

function desktopLyricsLocaleScript() {
  const payload = {
    lang: 'vi',
    locked: 'Nhấn chuột giữa để mở khóa',
    unlocked: 'Nhấn chuột giữa để khóa',
    close: 'Đóng lời bài hát trên màn hình'
  };
  return `(function(){
    var p=${JSON.stringify(payload)};
    window.__mineradioUiLanguage='vi';
    document.documentElement.lang='vi';
    function applyLocale(){
      var locked=!(document.body&&document.body.classList.contains('unlocked'));
      var text=document.getElementById('lockText');
      if(text) text.textContent=locked?p.locked:p.unlocked;
      var close=document.getElementById('closeLyricsBtn');
      if(close){close.textContent=p.close;close.setAttribute('aria-label',p.close);close.title=p.close;}
    }
    if(typeof window.syncLockClasses==='function'&&!window.__mineradioSyncLockClassesLocalized){
      var original=window.syncLockClasses;
      window.syncLockClasses=function(){var r=original.apply(this,arguments);applyLocale();return r;};
      window.__mineradioSyncLockClassesLocalized=true;
    }
    applyLocale();
    setTimeout(applyLocale,80);
    setTimeout(applyLocale,350);
  })();`;
}

function applyDesktopLyricsLocale(win) {
  if (!win || win.isDestroyed() || !win.webContents || win.webContents.isDestroyed()) return;
  win.webContents.executeJavaScript(desktopLyricsLocaleScript(), true).catch(() => {});
}

function localizeAuxiliaryWindow(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const title = win.getTitle && win.getTitle();
    const localized = translate(String(title || ''));
    if (localized && localized !== title) win.setTitle(localized);
  } catch (_) { }
  let url = '';
  try { url = win.webContents && win.webContents.getURL ? win.webContents.getURL() : ''; } catch (_) { }
  if (/desktop-lyrics\.html(?:[?#]|$)/i.test(url)) {
    desktopLyricsWindows.add(win);
    applyDesktopLyricsLocale(win);
  }
}

app.on('browser-window-created', (_event, win) => {
  if (!win) return;
  win.on('closed', () => desktopLyricsWindows.delete(win));
  if (win.webContents) {
    win.webContents.on('did-finish-load', () => localizeAuxiliaryWindow(win));
    win.webContents.on('page-title-updated', (event, title) => {
      const localized = translate(String(title || ''));
      if (localized && localized !== title) {
        event.preventDefault();
        try { win.setTitle(localized); } catch (_) { }
      }
    });
  }
  setTimeout(() => localizeAuxiliaryWindow(win), 0);
});

function refreshNativeLocaleSurfaces() {
  try {
    for (const win of electron.BrowserWindow.getAllWindows()) localizeAuxiliaryWindow(win);
  } catch (_) { }
  for (const win of Array.from(desktopLyricsWindows)) {
    if (!win || win.isDestroyed()) desktopLyricsWindows.delete(win);
    else applyDesktopLyricsLocale(win);
  }
}

// Renderer can still reuse the existing one-way IPC channel, but the native
// locale is permanently Vietnamese. English locale requests are ignored.
ipcMain.on('mineradio-wallpaper-engine-visual-settings', (_event, payload) => {
  if (payload && Object.prototype.hasOwnProperty.call(payload, '__mineradioLanguage')) {
    refreshNativeLocaleSurfaces();
  }
});

module.exports = require('./main');
