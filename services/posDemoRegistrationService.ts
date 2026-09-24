import { Business, Employee } from '../types';
import { DeviceIdentityService } from './deviceIdentityService';
import { PermissionService } from './permissionService';
import { AuditService } from './auditService';
import { DeviceRecord, MerchantMode } from '../types/device';
import { BusinessRepository } from './repositories/businessRepository';
import { EmployeeRepository } from './repositories/employeeRepository';

export interface DemoRegistrationResult {
  device: DeviceRecord;
  employees: Employee[];
}

const MODE_ROLES: Record<Exclude<MerchantMode, 'HYBRID'>, string[]> = {
  RESTAURANT: ['Admin', 'Manager', 'Server', 'Server Lead', 'Kitchen', 'Host'],
  RETAIL: ['Admin', 'Manager', 'Sales'],
  NONPROFIT: ['Admin', 'Manager', 'Sales'],
};

const DEMO_MERCHANTS: Record<Exclude<MerchantMode, 'HYBRID'>, Business> = {
  RESTAURANT: {
    id: 'DEMO-RESTAURANT',
    name: 'Newgate Demo Restaurant',
    ownerName: 'Restaurant Demo Admin',
    plan: 'Enterprise',
    status: 'Active',
    nextBillingDate: '2099-01-01',
    revenueYTD: 0,
    merchantMode: 'RESTAURANT',
    varConfig: { provider: 'None', merchantId: 'DEMO-RESTAURANT', status: 'Not Configured' },
  },
  RETAIL: {
    id: 'DEMO-RETAIL',
    name: 'Newgate Demo Retail',
    ownerName: 'Retail Demo Admin',
    plan: 'Enterprise',
    status: 'Active',
    nextBillingDate: '2099-01-01',
    revenueYTD: 0,
    merchantMode: 'RETAIL',
    varConfig: { provider: 'None', merchantId: 'DEMO-RETAIL', status: 'Not Configured' },
  },
  NONPROFIT: {
    id: 'DEMO-NONPROFIT',
    name: 'Newgate Demo Nonprofit',
    ownerName: 'Nonprofit Demo Admin',
    plan: 'Enterprise',
    status: 'Active',
    nextBillingDate: '2099-01-01',
    revenueYTD: 0,
    merchantMode: 'NONPROFIT',
    varConfig: { provider: 'None', merchantId: 'DEMO-NONPROFIT', status: 'Not Configured' },
  },
};

const ROLE_PINS: Record<Exclude<MerchantMode, 'HYBRID'>, Record<string, string>> = {
  RESTAURANT: {
    Admin: '1001', Manager: '1002', 'Server Lead': '1003', Server: '1004', Kitchen: '1005', Host: '1006',
  },
  RETAIL: { Admin: '2001', Manager: '2002', Sales: '2003' },
  NONPROFIT: { Admin: '3001', Manager: '3002', Sales: '3003' },
};

const slugify = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

export class PosDemoRegistrationService {
  static getDemoMerchants(): Business[] {
    return Object.values(DEMO_MERCHANTS).map(merchant => ({ ...merchant, varConfig: merchant.varConfig && { ...merchant.varConfig } }));
  }

  static getDemoEmployees(merchantMode: Exclude<MerchantMode, 'HYBRID'>): Employee[] {
    const merchant = DEMO_MERCHANTS[merchantMode];
    return MODE_ROLES[merchantMode].map((role): Employee => ({
      id: `${merchant.id}-${slugify(role)}`,
      name: `${merchant.name} ${role}`,
      role,
      email: `${slugify(role).toLowerCase()}@${merchant.id.toLowerCase()}.local`,
      hourlyRate: role === 'Manager' || role === 'Admin' ? 30 : 18,
      hoursWorked: 0,
      status: 'Active',
      businessId: merchant.id,
      deviceAccess: true,
      passcode: ROLE_PINS[merchantMode][role],
      permissions: PermissionService.getRoleDefaultPermissions(role),
    }));
  }

  static async seed(): Promise<{ businesses: Business[]; employees: Employee[] }> {
    if (!DeviceIdentityService.isDevOrDemoMode()) {
      throw new Error('Demo seed is disabled outside development mode.');
    }

    const businesses = this.getDemoMerchants();
    const employees = (['RESTAURANT', 'RETAIL', 'NONPROFIT'] as const)
      .flatMap(mode => this.getDemoEmployees(mode));
    await BusinessRepository.upsertMany(businesses);
    await EmployeeRepository.upsertMany(employees);
    return { businesses, employees };
  }

  static async register(
    merchantMode: Exclude<MerchantMode, 'HYBRID'>,
    merchantId = 'B001',
    merchantName = 'Newgate Demo Merchant'
  ): Promise<DemoRegistrationResult> {
    if (!DeviceIdentityService.isDevOrDemoMode()) {
      throw new Error('Demo registration is disabled outside development mode.');
    }

    await this.seed();
    const employees = this.getDemoEmployees(merchantMode).map(employee => ({ ...employee, businessId: merchantId }));

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

export const DemoSeedService = PosDemoRegistrationService;
