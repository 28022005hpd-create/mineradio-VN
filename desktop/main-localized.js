'use strict';

// Native-process localization bootstrap. This file patches Electron surfaces that
// the renderer cannot reach (open/save/message dialogs, tray menus and tooltips),
// then starts the original main process unchanged.
const electron = require('electron');
const { dialog, Menu, Tray, ipcMain } = electron;

let currentLanguage = 'vi';
const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
const HAN_RUN_RE = /[\u3400-\u9fff\uf900-\ufaff]+/g;

const ROWS = [
  ['选择 Mineradio 缓存目录', 'Chọn thư mục cache Mineradio', 'Choose Mineradio cache directory'],
  ['识别并导入 Wallpaper Engine 项目', 'Nhận diện và nhập dự án Wallpaper Engine', 'Detect and import Wallpaper Engine project'],
  ['识别此目录', 'Nhận diện thư mục này', 'Detect this directory'],
  ['Wallpaper Engine 项目', 'Dự án Wallpaper Engine', 'Wallpaper Engine project'],
  ['导入 Mineradio 存档', 'Nhập bản lưu Mineradio', 'Import Mineradio archive'],
  ['导出 Mineradio 存档', 'Xuất bản lưu Mineradio', 'Export Mineradio archive'],
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

// The preload already exposes this harmless one-way channel. The renderer sends
// only __mineradioLanguage without a Wallpaper Engine session id, so the original
// WE listener ignores the packet while this bootstrap receives the locale.
ipcMain.on('mineradio-wallpaper-engine-visual-settings', (_event, payload) => {
  const language = payload && payload.__mineradioLanguage;
  if (language === 'vi' || language === 'en') currentLanguage = language;
});

module.exports = require('./main');
