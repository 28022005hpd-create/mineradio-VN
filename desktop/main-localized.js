'use strict';

// Native-process localization bootstrap. This file patches Electron surfaces that
// the renderer cannot reach (open/save/message dialogs, tray menus, auxiliary
// window titles and the standalone desktop-lyrics window), then starts the
// original main process unchanged.
const electron = require('electron');
const { app, dialog, Menu, Tray, ipcMain } = electron;

let currentLanguage = 'vi';
const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;
const desktopLyricsWindows = new Set();

const ROWS = [
  ['选择 Mineradio 缓存目录', 'Chọn thư mục cache Mineradio', 'Choose Mineradio cache directory'],
  ['识别并导入 Wallpaper Engine 项目', 'Nhận diện và nhập dự án Wallpaper Engine', 'Detect and import Wallpaper Engine project'],
  ['识别此目录', 'Nhận diện thư mục này', 'Detect this directory'],
  ['Wallpaper Engine 项目', 'Dự án Wallpaper Engine', 'Wallpaper Engine project'],
  ['导入 Mineradio 存档', 'Nhập bản lưu Mineradio', 'Import Mineradio archive'],
  ['导出 Mineradio 存档', 'Xuất bản lưu Mineradio', 'Export Mineradio archive'],
  ['网易云音乐登录', 'Đăng nhập NetEase Cloud Music', 'NetEase Cloud Music sign-in'],
  ['QQ 音乐登录', 'Đăng nhập QQ Music', 'QQ Music sign-in'],
  ['QQ音乐登录', 'Đăng nhập QQ Music', 'QQ Music sign-in'],
  ['酷狗音乐登录', 'Đăng nhập Kugou Music', 'Kugou Music sign-in'],
  ['汽水音乐登录', 'Đăng nhập Qishui Music', 'Qishui Music sign-in'],
  ['网易云登录窗口已关闭', 'Cửa sổ đăng nhập NetEase Cloud Music đã đóng', 'NetEase Cloud Music sign-in window was closed'],
  ['QQ 登录窗口已关闭', 'Cửa sổ đăng nhập QQ Music đã đóng', 'QQ Music sign-in window was closed'],
  ['酷狗登录窗口已关闭', 'Cửa sổ đăng nhập Kugou Music đã đóng', 'Kugou Music sign-in window was closed'],
  ['选择文件', 'Chọn tệp', 'Choose file'],
  ['选择目录', 'Chọn thư mục', 'Choose directory'],
  ['选择文件夹', 'Chọn thư mục', 'Choose folder'],
  ['保存文件', 'Lưu tệp', 'Save file'],
  ['显示', 'Hiển thị', 'Show'],
  ['隐藏', 'Ẩn', 'Hide'],
  ['退出完整桌面模式', 'Thoát chế độ desktop đầy đủ', 'Exit full desktop mode'],
  ['退出', 'Thoát', 'Exit'],
  ['取消', 'Hủy', 'Cancel'],
  ['确定', 'Xác nhận', 'OK'],
  ['确认', 'Xác nhận', 'Confirm'],
  ['保存', 'Lưu', 'Save'],
  ['打开', 'Mở', 'Open'],
  ['导入', 'Nhập', 'Import'],
  ['导出', 'Xuất', 'Export'],
  ['错误', 'Lỗi', 'Error'],
  ['警告', 'Cảnh báo', 'Warning'],
  ['提示', 'Thông báo', 'Notice'],
  ['信息', 'Thông tin', 'Information'],
  ['重试', 'Thử lại', 'Retry'],
  ['网易云音乐', 'NetEase Cloud Music', 'NetEase Cloud Music'],
  ['网易云', 'NetEase Cloud', 'NetEase Cloud'],
  ['QQ音乐', 'QQ Music', 'QQ Music'],
  ['QQ 音乐', 'QQ Music', 'QQ Music'],
  ['酷狗音乐', 'Kugou Music', 'Kugou Music'],
  ['汽水音乐', 'Qishui Music', 'Qishui Music'],
  ['缓存', 'cache', 'cache'],
  ['目录', 'thư mục', 'directory'],
  ['项目', 'dự án', 'project'],
  ['文件', 'tệp', 'file'],
  ['登录', 'đăng nhập', 'sign-in'],
  ['账号', 'tài khoản', 'account'],
  ['更新', 'cập nhật', 'update'],
  ['下载', 'tải xuống', 'download']
];

function table(language) {
  const index = language === 'en' ? 2 : 1;
  return ROWS.slice().sort((a, b) => b[0].length - a[0].length).map((row) => [row[0], row[index]]);
}

function translate(value) {
  if (typeof value !== 'string' || !value) return value;
  let output = value;
  for (const [source, target] of table(currentLanguage)) {
    if (output.includes(source)) output = output.split(source).join(target);
  }
  // Native app-owned strings must never expose untranslated Han characters.
  // Provider/user content is not passed through this bootstrap.
  if (HAN_RE.test(output)) {
    const fallback = currentLanguage === 'en' ? 'Information' : 'Thông tin';
    output = output.replace(HAN_RUN_RE, fallback).replace(/\s{2,}/g, ' ').trim();
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
  const lang = currentLanguage === 'en' ? 'en' : 'vi';
  const payload = {
    lang,
    locked: lang === 'en' ? 'Middle-click to unlock' : 'Nhấn chuột giữa để mở khóa',
    unlocked: lang === 'en' ? 'Middle-click to lock' : 'Nhấn chuột giữa để khóa',
    close: lang === 'en' ? 'Close desktop lyrics' : 'Đóng lời bài hát trên màn hình'
  };
  return `(function(){
    var p=${JSON.stringify(payload)};
    window.__mineradioUiLanguage=p.lang;
    document.documentElement.lang=p.lang;
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

// BrowserWindow titles are native surfaces too. The original main process creates
// several login/helper windows with Chinese titles. Translate those titles after
// creation and whenever a page tries to replace the title. The provider page body
// itself is intentionally left untouched because it is third-party authentication UI.
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

// The preload already exposes this harmless one-way channel. The renderer sends
// only __mineradioLanguage without a Wallpaper Engine session id, so the original
// WE listener ignores the packet while this bootstrap receives the locale.
ipcMain.on('mineradio-wallpaper-engine-visual-settings', (_event, payload) => {
  const language = payload && payload.__mineradioLanguage;
  if (language === 'vi' || language === 'en') {
    currentLanguage = language;
    refreshNativeLocaleSurfaces();
  }
});

module.exports = require('./main');
