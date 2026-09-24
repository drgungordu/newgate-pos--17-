import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('android/app/src/main/assets/public');
const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');
const RES_DIR = path.resolve('android/app/src/main/res');

console.log('[Asset Verification] Checking Android public assets in:', PUBLIC_DIR);

// 1. Verify index.html existence and non-zero size
if (!fs.existsSync(INDEX_HTML)) {
  console.error('[Asset Verification Error] android/app/src/main/assets/public/index.html does not exist!');
  process.exit(1);
}

const htmlStat = fs.statSync(INDEX_HTML);
if (htmlStat.size === 0) {
  console.error('[Asset Verification Error] android/app/src/main/assets/public/index.html is 0 bytes!');
  process.exit(1);
}

console.log(`[Asset Verification] Android public/index.html OK (${htmlStat.size} bytes)`);

const htmlContent = fs.readFileSync(INDEX_HTML, 'utf-8');

// 2. Find and verify all script tags
const scriptSrcRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
let match;
const jsFiles = [];

while ((match = scriptSrcRegex.exec(htmlContent)) !== null) {
  const src = match[1];
  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
    jsFiles.push(src);
  }
}

if (jsFiles.length === 0) {
  console.error('[Asset Verification Error] No script tags found in android/app/src/main/assets/public/index.html!');
  process.exit(1);
}

const activeBundleBasenames = new Set();

for (const src of jsFiles) {
  const cleanSrc = src.replace(/^\/+/, '').split('?')[0].split('#')[0];
  const fullPath = path.join(PUBLIC_DIR, cleanSrc);
  activeBundleBasenames.add(path.basename(cleanSrc));

  if (!fs.existsSync(fullPath)) {
    console.error(`[Asset Verification Error] Referenced JS file missing in Android assets: ${cleanSrc}`);
    process.exit(1);
  }

  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    console.error(`[Asset Verification Error] Referenced JS file is 0 bytes: ${cleanSrc}`);
    process.exit(1);
  }

  console.log(`[Asset Verification] Android JS OK: ${cleanSrc} (${stat.size} bytes)`);
}

// 3. Görev 4 — Ensure NO stale hash bundles exist in Android public assets
const publicAssetsDir = path.join(PUBLIC_DIR, 'assets');
if (fs.existsSync(publicAssetsDir)) {
  const assetFiles = fs.readdirSync(publicAssetsDir);
  for (const file of assetFiles) {
    if (file.startsWith('index-') && file.endsWith('.js')) {
      if (!activeBundleBasenames.has(file)) {
        console.log(`[Asset Cleanup] Removing stale hash bundle: ${file}`);
        fs.unlinkSync(path.join(publicAssetsDir, file));
      }
    }
  }
}

// Ensure cordova stubs created by Capacitor have non-zero content
for (const stubFile of ['cordova.js', 'cordova_plugins.js']) {
  const stubPath = path.join(PUBLIC_DIR, stubFile);
  if (fs.existsSync(stubPath) && fs.statSync(stubPath).size === 0) {
    fs.writeFileSync(stubPath, `// Capacitor Cordova compatibility stub: ${stubFile}\n`);
  }
}

// 4. Görev 6 — AI Studio "Failed to download file" or 0-byte placeholder detection
function scanForZeroByteOrFailedAssets(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanForZeroByteOrFailedAssets(fullPath);
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        console.error(`[Asset Verification Fatal] 0-byte asset detected: ${fullPath}`);
        console.error('AI Studio failed to materialize or download a generated asset (0 bytes). Build marked as failed.');
        process.exit(1);
      }

      // Check text or small metadata files for download failure messages
      if (stat.size < 1024) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('Failed to download file') || content.includes('Error downloading asset')) {
            console.error(`[Asset Verification Fatal] Corrupted asset detected with download failure message: ${fullPath}`);
            process.exit(1);
          }
        } catch {
          // Binary files may throw on utf-8 read; ignore
        }
      }
    }
  }
}

// Scan both Android res and public assets directories
scanForZeroByteOrFailedAssets(path.join(RES_DIR, 'drawable'));
scanForZeroByteOrFailedAssets(path.join(RES_DIR, 'drawable-v24'));
scanForZeroByteOrFailedAssets(publicAssetsDir);

console.log('[Asset Verification] All checks passed: valid non-zero assets verified and old hash files purged.');
