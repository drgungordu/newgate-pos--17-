import fs from 'node:fs';

const requiredFiles = [
  'services/apiClient.ts',
  'services/syncService.ts',
  'services/realtimeTransport.ts',
  'services/paymentProviders.ts',
  'services/printerService.ts',
  'services/refundLedgerService.ts',
  'services/inventoryLedgerService.ts',
  'services/storageMigrationService.ts',
  'components/pos/RetailReturnsRoute.tsx',
  'components/pos/shell/PosShellTypes.ts',
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));
if (missing.length) {
  console.error('[Workflow Verification] Missing required files:');
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

const source = fs.readFileSync('components/pos/shell/PosShellRouteDispatcher.tsx', 'utf8');
const kdsSource = fs.readFileSync('components/pos/KitchenDisplay.tsx', 'utf8');
const assertions = [
  ['Retail Returns route is wired', /RetailReturnsRoute/],
  ['Customer handlers are wired', /onAddCustomer=\{props\.onAddCustomer\}/],
  ['EOD uses BusinessDayService', /BusinessDayService\.closeBusinessDay/],
];
const failures = assertions.filter(([, pattern]) => !pattern.test(source));
if (!/stationIds/.test(kdsSource)) failures.push(['KDS uses station IDs']);
if (failures.length) {
  console.error('[Workflow Verification] Failed:');
  failures.forEach(([label]) => console.error(`- ${label}`));
  process.exit(1);
}
console.log('[Workflow Verification] Core POS workflow wiring is present.');
