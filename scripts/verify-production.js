import fs from 'node:fs';
import path from 'node:path';

const roots = ['components', 'services', 'api', 'src', 'App.tsx', 'index.tsx', 'constants.ts'];
const forbidden = [
  { pattern: /return\s+isDevEnv\s*\|\|\s*true/, label: 'always-on dev bypass' },
  { pattern: /DEMO-AUTO-ENROLLED/, label: 'demo device credential' },
  { pattern: /0\.0825|8\.25%/, label: 'hard-coded tax rate' },
  { pattern: /Manager Bypass|Quick Shift Unlock/, label: 'authentication bypass UI' },
];

function filesUnder(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap(entry => filesUnder(path.join(target, entry.name)));
}

const violations = [];
for (const root of roots) {
  for (const file of filesUnder(root)) {
    if (!/\.(ts|tsx|js)$/.test(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const rule of forbidden) {
      if (rule.pattern.test(content)) violations.push(`${file}: ${rule.label}`);
    }
  }
}

if (violations.length) {
  console.error('[Production Verification] Failed:');
  violations.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('[Production Verification] No known demo bypass or hard-coded tax patterns found.');
