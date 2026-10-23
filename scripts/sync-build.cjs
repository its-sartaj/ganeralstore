const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distAssets = path.join(rootDir, 'dist', 'assets');
const rootAssets = path.join(rootDir, 'assets');
const rootIndexHtml = path.join(rootDir, 'index.html');
const distIndexHtml = path.join(rootDir, 'dist', 'index.html');

const root404Html = path.join(rootDir, '404.html');
const dist404Html = path.join(rootDir, 'dist', '404.html');
const public404Html = path.join(rootDir, 'public', '404.html');

if (fs.existsSync(distAssets)) {
  fs.cpSync(distAssets, rootAssets, { recursive: true });
  console.log('[sync-build] Synchronized dist/assets -> assets');
}

const rootFirebaseSync = path.join(rootAssets, 'firebase-sync.js');
const distFirebaseSync = path.join(distAssets, 'firebase-sync.js');
if (fs.existsSync(rootFirebaseSync)) {
  fs.copyFileSync(rootFirebaseSync, distFirebaseSync);
}

if (fs.existsSync(rootIndexHtml)) {
  fs.copyFileSync(rootIndexHtml, distIndexHtml);
  console.log('[sync-build] Synchronized index.html -> dist/index.html');
}

if (fs.existsSync(root404Html)) {
  fs.copyFileSync(root404Html, dist404Html);
  fs.copyFileSync(root404Html, public404Html);
  console.log('[sync-build] Synchronized 404.html -> dist/404.html & public/404.html');
}
