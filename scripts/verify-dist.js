import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

console.log('[Dist Verification] Verifying dist/index.html...');

if (!fs.existsSync(INDEX_HTML)) {
  console.error('[Dist Verification Error] dist/index.html does not exist!');
  process.exit(1);
}

const htmlStat = fs.statSync(INDEX_HTML);
if (htmlStat.size === 0) {
  console.error('[Dist Verification Error] dist/index.html is 0 bytes!');
  process.exit(1);
}

console.log(`[Dist Verification] dist/index.html OK (${htmlStat.size} bytes)`);

const htmlContent = fs.readFileSync(INDEX_HTML, 'utf-8');
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
  console.error('[Dist Verification Error] No local script tags found in dist/index.html!');
  process.exit(1);
}

for (const src of jsFiles) {
  const cleanSrc = src.replace(/^\/+/, '').split('?')[0].split('#')[0];
  const fullPath = path.join(DIST_DIR, cleanSrc);

  if (!fs.existsSync(fullPath)) {
    console.error(`[Dist Verification Error] Missing dist JS file: ${cleanSrc} at ${fullPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    console.error(`[Dist Verification Error] dist JS file is 0 bytes: ${cleanSrc}`);
    process.exit(1);
  }

  console.log(`[Dist Verification] dist JS OK: ${cleanSrc} (${stat.size} bytes)`);
}

// Görev 4: Check for orphan/stale index-*.js files in dist/assets
const assetsDir = path.join(DIST_DIR, 'assets');
if (fs.existsSync(assetsDir)) {
  const distFiles = fs.readdirSync(assetsDir);
  const referencedNames = new Set(jsFiles.map(s => path.basename(s.split('?')[0].split('#')[0])));
  for (const file of distFiles) {
    if (file.startsWith('index-') && file.endsWith('.js')) {
      if (!referencedNames.has(file)) {
        console.warn(`[Dist Verification Warning] Removing unreferenced old bundle from dist: ${file}`);
        fs.unlinkSync(path.join(assetsDir, file));
      }
    }
  }
}

console.log('[Dist Verification] dist verification completed successfully.');
