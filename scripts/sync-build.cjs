const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distAssets = path.join(rootDir, 'dist', 'assets');
const rootAssets = path.join(rootDir, 'assets');
const rootIndexHtml = path.join(rootDir, 'index.html');
const distIndexHtml = path.join(rootDir, 'dist', 'index.html');

if (fs.existsSync(distAssets)) {
  fs.cpSync(distAssets, rootAssets, { recursive: true });
  console.log('[sync-build] Synchronized dist/assets -> assets');
}

if (fs.existsSync(rootIndexHtml)) {
  fs.copyFileSync(rootIndexHtml, distIndexHtml);
  console.log('[sync-build] Synchronized index.html -> dist/index.html');
}
