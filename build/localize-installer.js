'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'installer.nsh');
let source = fs.readFileSync(file, 'utf8');

const replacements = [
  ['Mineradio 安装', 'Mineradio Setup'],
  [
    '检测到这台电脑还有 D-Z 盘，Mineradio 不安装到 C 盘。请改选 D 盘或其它非 C 盘的 Mineradio 文件夹。$\\r$\\n$\\r$\\n如果电脑只有 C 盘，安装器会自动放行 C:\\Mineradio。',
    'A D-Z drive is available, so Mineradio will not be installed on C:. Choose D: or another non-C: Mineradio folder.$\\r$\\n$\\r$\\nIf this PC only has C:, the installer will allow C:\\Mineradio.'
  ],
  [
    '安装目录必须是独立的 Mineradio 文件夹。请选择一个上级目录，安装器会自动创建 Mineradio 子文件夹。',
    'The installation directory must be a dedicated Mineradio folder. Choose a parent directory and the installer will create the Mineradio subfolder automatically.'
  ],
  [
    '为避免卸载时误删其它文件，Mineradio 不能安装到已有文件的非专属目录。请新建或选择一个空的 Mineradio 文件夹。$\\r$\\n$\\r$\\n当前路径：$INSTDIR',
    'To prevent unrelated files from being removed during uninstall, Mineradio cannot use a non-dedicated folder that already contains files. Create or choose an empty Mineradio folder.$\\r$\\n$\\r$\\nCurrent path: $INSTDIR'
  ],
  [
    '为这台电脑安装 ${PRODUCT_NAME}。默认安装到 D:\\${MINERADIO_INSTALL_DIR_NAME}，下一步可以自由选择其它位置。',
    'Install ${PRODUCT_NAME} on this PC. The default location is D:\\${MINERADIO_INSTALL_DIR_NAME}; you can choose another location on the next page.'
  ],
  ['默认位置：$INSTDIR', 'Default location: $INSTDIR'],
  ['选择 ${PRODUCT_NAME} 安装文件夹', 'Choose the ${PRODUCT_NAME} installation folder'],
  ['选择安装位置', 'Choose installation location'],
  [
    '你可以使用默认路径，也可以选择其它磁盘或文件夹。安装器会自动创建缺失的目录。',
    'Use the default path or choose another drive or folder. The installer will create missing directories automatically.'
  ],
  ['安装目录', 'Installation directory'],
  ['浏览...', 'Browse...'],
  ['默认推荐：D:\\${MINERADIO_INSTALL_DIR_NAME}；选盘符会自动建文件夹。', 'Recommended: D:\\${MINERADIO_INSTALL_DIR_NAME}; choosing a drive creates the folder automatically.'],
  ['请选择安装文件夹。', 'Choose an installation folder.'],
  [
    '当前卸载路径不是 Mineradio 专属目录，已阻止卸载以避免误删其它文件。$\\r$\\n$\\r$\\n当前路径：$INSTDIR$\\r$\\n安全路径应为：$0',
    'The current uninstall path is not a dedicated Mineradio directory. Uninstall was blocked to protect unrelated files.$\\r$\\n$\\r$\\nCurrent path: $INSTDIR$\\r$\\nExpected safe path: $0'
  ],
  [
    '无法确认当前目录属于 Mineradio，已阻止卸载以避免误删其它文件。$\\r$\\n$\\r$\\n当前路径：$INSTDIR',
    'The current directory could not be verified as a Mineradio installation. Uninstall was blocked to protect unrelated files.$\\r$\\n$\\r$\\nCurrent path: $INSTDIR'
  ]
];

for (const [from, to] of replacements) {
  source = source.split(from).join(to);
}

const han = /[\u3400-\u9fff\uf900-\ufaff]/;
if (han.test(source)) {
  const remaining = source.split(/\r?\n/).filter((line) => han.test(line));
  console.error('Untranslated Han text remains in build/installer.nsh:');
  remaining.forEach((line) => console.error('  ' + line.trim()));
  process.exit(2);
}

fs.writeFileSync(file, source, 'utf8');
console.log('Windows installer UI localized: no Han characters remain.');
