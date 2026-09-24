import { Employee } from '../types';
import { DeviceIdentityService } from './deviceIdentityService';
import { PermissionService } from './permissionService';
import { AuditService } from './auditService';
import { DeviceRecord, MerchantMode } from '../types/device';

export interface DemoRegistrationResult {
  device: DeviceRecord;
  employees: Employee[];
}

const MODE_ROLES: Record<Exclude<MerchantMode, 'HYBRID'>, string[]> = {
  RESTAURANT: ['Admin', 'Manager', 'Server', 'Server Lead', 'Kitchen', 'Host'],
  RETAIL: ['Admin', 'Manager', 'Sales'],
  NONPROFIT: ['Admin', 'Manager', 'Sales'],
};

const ROLE_PINS: Record<string, string> = {
  Admin: '2468',
  Manager: '1357',
  Server: '4826',
  'Server Lead': '5739',
  Kitchen: '6842',
  Host: '7953',
  Sales: '8642',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Kitchen: ['pos.kds.access', 'pos.shifts.access', 'pos.86.access'],
  Host: ['pos.tables.access', 'pos.reservations.access', 'pos.customers.access', 'pos.orders.access', 'pos.shifts.access'],
  Sales: ['pos.register.access', 'pos.orders.access', 'pos.customers.access', 'pos.shifts.access'],
};

const slugify = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

export class PosDemoRegistrationService {
  static async register(
    merchantMode: Exclude<MerchantMode, 'HYBRID'>,
    merchantId = 'B001',
    merchantName = 'Newgate Demo Merchant'
  ): Promise<DemoRegistrationResult> {
    if (!DeviceIdentityService.isDevOrDemoMode()) {
      throw new Error('Demo registration is disabled outside development mode.');
    }

    const roles = MODE_ROLES[merchantMode];
    const employees = roles.map((role, index): Employee => ({
      id: `DEMO-${slugify(merchantMode)}-${slugify(role)}`,
      name: `${merchantMode.charAt(0)}${merchantMode.slice(1).toLowerCase()} ${role}`,
      role,
      email: `${slugify(role).toLowerCase()}@demo.newgatepos.local`,
      hourlyRate: role === 'Manager' || role === 'Admin' ? 30 : 18,
      hoursWorked: 0,
      status: 'Active',
      businessId: merchantId,
      deviceAccess: true,
      passcode: ROLE_PINS[role] || `9${(index + 1).toString().padStart(3, '0')}`,
      permissions: ROLE_PERMISSIONS[role] || PermissionService.getRoleDefaultPermissions(role),
    }));

    const device = await DeviceIdentityService.provisionDeviceFromPayload({
      merchantId,
      locationId: 'DEMO-LOCATION',
      deviceId: `DEV-DEMO-${slugify(merchantMode)}`,
      deviceRole: 'REGISTER',
      merchantMode,
      terminalName: `${merchantName} Demo Register`,
      apiBaseUrl: 'https://api.newgatepos.com',
      wsUrl: 'wss://ws.newgatepos.com',
      requireEmployeeLogin: true,
      initialSyncAt: new Date().toISOString(),
    });

    await AuditService.log({
      actorId: device.id,
      actorName: device.name,
      action: 'DEMO_POS_REGISTERED',
      targetType: 'DEVICE',
      targetId: device.id,
      details: {
        merchantId,
        merchantMode,
        employeeIds: employees.map(employee => employee.id),
        source: 'DEV_ONLY_DEMO_REGISTRATION',
      },
      status: 'EXECUTED',
      merchantId,
    });

    return { device, employees };
  }
}
