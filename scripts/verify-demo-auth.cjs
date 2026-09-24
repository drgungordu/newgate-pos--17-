const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const demoSeed = read('services/posDemoRegistrationService.ts');
const authService = read('services/authService.ts');
const permissionService = read('services/permissionService.ts');
const tileConfig = read('components/pos/shell/PosShellTileConfigs.tsx');
const superAdmin = read('components/SuperAdmin.tsx');
const app = read('App.tsx');
const deviceIdentity = read('services/deviceIdentityService.ts');

const scenarios = [
  {
    name: 'Restaurant Server 1004',
    run() {
      assert(demoSeed.includes("Server: '1004'"), 'Restaurant Server PIN is missing.');
      assert(demoSeed.includes("id: 'DEMO-RESTAURANT'"), 'Restaurant demo merchant is missing.');
      assert(authService.includes('effectivePermissions') && authService.includes('sessionId'), 'PIN auth session result is incomplete.');
      assert(tileConfig.includes("currentMode === 'RETAIL'") && tileConfig.includes("currentMode === 'NONPROFIT'"), 'Merchant-mode register routing is missing.');
    },
  },
  {
    name: 'Restaurant Admin changes Server permissions',
    run() {
      assert(permissionService.includes('saveEmployeeSecurityProfile'), 'Employee permission save path is missing.');
      assert(permissionService.includes('PermissionRepository.save'), 'Permission repository persistence is missing.');
      assert(permissionService.includes('invalidateEmployeePermissionCache'), 'Permission cache invalidation is missing.');
      assert(app.includes('onEmployeesSeeded={handleRegisterEmployees}'), 'Shared employee state bridge is missing.');
    },
  },
  {
    name: 'Retail Sales 2003 and Nonprofit Sales 3003',
    run() {
      assert(demoSeed.includes("Sales: '2003'"), 'Retail Sales PIN is missing.');
      assert(demoSeed.includes("Sales: '3003'"), 'Nonprofit Sales PIN is missing.');
      assert(demoSeed.includes("id: 'DEMO-RETAIL'"), 'Retail demo merchant is missing.');
      assert(demoSeed.includes("id: 'DEMO-NONPROFIT'"), 'Nonprofit demo merchant is missing.');
      assert(superAdmin.includes('System Health') && superAdmin.includes('Feature Flags'), 'Platform SuperAdmin sections are incomplete.');
    },
  },
  {
    name: 'Super Admin platform login',
    run() {
      assert(fs.existsSync(path.join(root, 'services/platformAuthService.ts')), 'Platform auth service is missing.');
      assert(!read('constants.ts').includes("id: 'E_SUPER'"), 'Super Admin is still seeded as an employee.');
      assert(deviceIdentity.includes("env?.DEV || env?.VITE_DEMO_ENTRY === 'true'"), 'Demo entry gate is not explicit.');
    },
  },
];

for (const scenario of scenarios) {
  scenario.run();
  console.log(`[Demo Auth] PASS: ${scenario.name}`);
}
console.log(`[Demo Auth] ${scenarios.length} scenarios passed.`);
