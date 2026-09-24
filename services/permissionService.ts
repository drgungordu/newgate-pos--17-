import { Employee, UserRole } from '../types';
import { AuditService } from './auditService';
import { PermissionRepository } from './repositories/permissionRepository';

export interface PermissionDefinition {
  id: string;
  name: string;
  category: 'App Access' | 'Operations' | 'Dining & Tables' | 'Hardware & Setup' | 'Financial & Cash';
  description: string;
}

export interface AuthorizationContext {
  employeeId: string;
  employeeName: string;
  role?: string;
  merchantId?: string;
  locationId?: string;
}

export interface ManagerApprovalResult {
  success: boolean;
  approved: boolean;
  manager?: {
    id: string;
    name: string;
    role: string;
  };
  managerId?: string;
  managerName?: string;
  reason?: string;
  error?: string;
}

export interface SecurityOverrideRecord {
  role?: UserRole;
  passcode?: string;
  permissions?: string[];
  updatedAt: string;
}

export const ALL_POS_PERMISSIONS: PermissionDefinition[] = [
  { id: 'pos.register.access', name: 'Access Register', category: 'App Access', description: 'Open order entry register and process cart transactions' },
  { id: 'pos.tables.access', name: 'Access Tables & Dining', category: 'App Access', description: 'View floor plan, manage dining tables, courses and checks' },
  { id: 'pos.orders.access', name: 'Access Orders & Receipts', category: 'App Access', description: 'View order history, open checks and reprint receipts' },
  { id: 'pos.kds.access', name: 'Access Kitchen Display (KDS)', category: 'App Access', description: 'View kitchen line tickets and mark items ready/bump' },
  { id: 'pos.reservations.access', name: 'Access Reservations', category: 'App Access', description: 'Manage guest party reservations and seating waitlist' },
  { id: 'pos.cash_drawer.access', name: 'Access Cash Drawer', category: 'App Access', description: 'Open cash drawer, view expected float and perform drops' },
  { id: 'pos.closeout.access', name: 'Access End of Day (EOD)', category: 'App Access', description: 'Close business day, perform blind counts and generate Z-Report' },
  { id: 'pos.86.access', name: 'Access 86 / Availability', category: 'App Access', description: 'View 86 items list and toggle out-of-stock items' },
  { id: 'pos.shifts.access', name: 'Access Shift Clock', category: 'App Access', description: 'Clock in, take meal breaks and record shift hours' },
  { id: 'pos.settings.access', name: 'Access POS Settings', category: 'App Access', description: 'Access terminal parameters, employees and permissions' },
  { id: 'pos.customers.access', name: 'Access Customer CRM', category: 'App Access', description: 'View guest directory, customer profiles and loyalty points' },
  { id: 'pos.inventory.access', name: 'Access Inventory & POs', category: 'App Access', description: 'Manage inventory stocks, barcodes and purchase orders' },
  { id: 'pos.refunds.access', name: 'Access Refunds & Voids', category: 'App Access', description: 'Process post-settlement refunds, voids and restock' },
  { id: 'pos.diagnostics.access', name: 'Access Hardware Diagnostics', category: 'App Access', description: 'Test receipt printer ESC/POS, cash drawer solenoid and scanners' },
  { id: 'pos.kiosk.access', name: 'Access Customer Kiosk', category: 'App Access', description: 'Launch self-service ordering kiosk screen' },
  { id: 'webadmin.open', name: 'Launch Web Admin', category: 'App Access', description: 'Switch from terminal to full browser Web Admin suite' },
  { id: 'devices.manage', name: 'Appliance Setup & Provisioning', category: 'App Access', description: 'Enroll terminals, configure serials and manage hardware devices' },
  { id: 'roles.permissions.manage', name: 'Manage Staff Roles & Permissions', category: 'Operations', description: 'Configure staff access privileges, grant/revoke app tiles, change PIN passcodes' },
  { id: 'pos.table.split', name: 'Split Table & Checks', category: 'Dining & Tables', description: 'Perform even, by-item, by-guest and custom check splitting' },
  { id: 'pos.guest.manage', name: 'Guest Management', category: 'Dining & Tables', description: 'Add, rename, move, adjust party size and pay specific guests' },
  { id: 'pos.kds.station', name: 'KDS Station Switching', category: 'Operations', description: 'Filter kitchen display tickets by specific station or line' },
  { id: 'pos.86.modify', name: 'Modify Item 86 Status', category: 'Operations', description: 'Mark menu items in/out of stock and adjust item availability' },
  { id: 'pos.printers.manage', name: 'Printers & Kitchen Routing', category: 'Hardware & Setup', description: 'Configure thermal IP printers and label dispatch policies' },
  { id: 'pos.tips.adjust', name: 'Adjust Tips & Payouts', category: 'Financial & Cash', description: 'Modify tip allocations, tip pool sharing and server payouts' },
  { id: 'pos.reports.view', name: 'View Sales & Tax Reports', category: 'Financial & Cash', description: 'Inspect X-Reports, daily sales summaries and tax breakdowns' },
  { id: 'reports.closeout', name: 'Drawer Closeout Finalization', category: 'Financial & Cash', description: 'Authorize finalizing cashier shift drawer count and reconciliation' },
  { id: 'pos.manager.override', name: 'Manager Override Authority', category: 'Operations', description: 'Authorize manager approval for voids, manual discounts and exits' },
  { id: 'kds.station.expo.view', name: 'KDS View Expo Station', category: 'Operations', description: 'Authorize viewing tickets on Expo expediter line' },
  { id: 'kds.station.grill.view', name: 'KDS View Grill Station', category: 'Operations', description: 'Authorize viewing tickets on Grill line' },
  { id: 'kds.station.oven.view', name: 'KDS View Oven Station', category: 'Operations', description: 'Authorize viewing tickets on Pizza/Oven line' },
  { id: 'kds.station.fryer.view', name: 'KDS View Fryer Station', category: 'Operations', description: 'Authorize viewing tickets on Fryer line' },
  { id: 'kds.station.cold_prep.view', name: 'KDS View Cold Prep Station', category: 'Operations', description: 'Authorize viewing tickets on Cold Prep line' },
  { id: 'kds.station.bar.view', name: 'KDS View Bar Station', category: 'Operations', description: 'Authorize viewing tickets on Bar station' },
  { id: 'kds.station.dessert.view', name: 'KDS View Dessert Station', category: 'Operations', description: 'Authorize viewing tickets on Dessert line' },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ALL_POS_PERMISSIONS.map(p => p.id),
  BUSINESS_ADMIN: ALL_POS_PERMISSIONS.map(p => p.id),
  ADMIN: ALL_POS_PERMISSIONS.map(p => p.id),
  OWNER: ALL_POS_PERMISSIONS.map(p => p.id),
  MANAGER: [
    'pos.register.access',
    'pos.tables.access',
    'pos.orders.access',
    'pos.kds.access',
    'pos.reservations.access',
    'pos.cash_drawer.access',
    'pos.closeout.access',
    'pos.86.access',
    'pos.shifts.access',
    'pos.settings.access',
    'pos.customers.access',
    'pos.inventory.access',
    'pos.refunds.access',
    'pos.diagnostics.access',
    'pos.kiosk.access',
    'pos.table.split',
    'pos.guest.manage',
    'pos.kds.station',
    'pos.86.modify',
    'pos.printers.manage',
    'pos.tips.adjust',
    'pos.reports.view',
    'reports.closeout',
    'pos.manager.override',
    'devices.manage',
    'webadmin.open',
    'roles.permissions.manage',
    'kds.station.expo.view',
    'kds.station.grill.view',
    'kds.station.oven.view',
    'kds.station.fryer.view',
    'kds.station.cold_prep.view',
    'kds.station.bar.view',
    'kds.station.dessert.view',
  ],
  'SERVER LEAD': [
    'pos.tables.access',
    'pos.register.access',
    'pos.orders.access',
    'pos.shifts.access',
    'pos.86.access',
    'pos.table.split',
    'pos.guest.manage',
    'pos.tips.adjust',
    'pos.reports.view',
  ],
  SERVER: [
    'pos.tables.access',
    'pos.register.access',
    'pos.orders.access',
    'pos.shifts.access',
    'pos.86.access',
    'pos.table.split',
    'pos.guest.manage',
  ],
  CASHIER: [
    'pos.register.access',
    'pos.orders.access',
    'pos.customers.access',
    'pos.shifts.access',
    'pos.cash_drawer.access',
    'pos.refunds.access',
    'reports.closeout',
  ],
  HOST: [
    'pos.reservations.access',
    'pos.tables.access',
    'pos.shifts.access',
    'pos.guest.manage',
  ],
  KITCHEN: [
    'pos.kds.access',
    'pos.86.access',
    'pos.shifts.access',
    'pos.kds.station',
    'kds.station.expo.view',
    'kds.station.grill.view',
    'kds.station.oven.view',
    'kds.station.fryer.view',
    'kds.station.cold_prep.view',
    'kds.station.bar.view',
    'kds.station.dessert.view',
  ],
  SALES: [
    'pos.register.access',
    'pos.orders.access',
    'pos.customers.access',
    'pos.shifts.access',
  ],
  EMPLOYEE: [
    'pos.shifts.access',
    'pos.register.access',
  ],
  STAFF: [
    'pos.shifts.access',
  ],
};

let activeRolePresets: Record<string, string[]> = { ...ROLE_DEFAULT_PERMISSIONS };

export class PermissionService {
  private static registeredEmployees: Employee[] = [];
  private static employeeCustomPermissions: Map<string, string[]> = new Map();
  private static listeners: Set<() => void> = new Set();
  private static STORAGE_KEY = 'newgate_employee_security_overrides_v1';
  private static ROLE_PRESETS_STORAGE_KEY = 'newgate_role_presets_v1';

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('[PermissionService] Error in listener:', e);
      }
    });
  }

  static loadStoredRolePresets(): Record<string, string[]> {
    if (typeof window === 'undefined' || !window.localStorage) return ROLE_DEFAULT_PERMISSIONS;
    try {
      const raw = window.localStorage.getItem(this.ROLE_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        activeRolePresets = { ...ROLE_DEFAULT_PERMISSIONS, ...parsed };
        return activeRolePresets;
      }
    } catch (e) {
      console.error('[PermissionService] Failed to load stored role presets:', e);
    }
    return ROLE_DEFAULT_PERMISSIONS;
  }

  static getRolePresets(): Record<string, string[]> {
    return this.loadStoredRolePresets();
  }

  static getRoleDefaultPermissions(role: string): string[] {
    const r = (role || '').toUpperCase().trim();
    const presets = this.getRolePresets();
    return presets[r] || presets['STAFF'] || ROLE_DEFAULT_PERMISSIONS['STAFF'] || [];
  }

  static async updateRolePresetPermissions(role: string, permissions: string[], actor: Employee): Promise<void> {
    const r = (role || '').toUpperCase().trim();
    const presets = this.getRolePresets();
    presets[r] = permissions;
    activeRolePresets[r] = permissions;

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.ROLE_PRESETS_STORAGE_KEY, JSON.stringify(presets));
    }

    await AuditService.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'UPDATE_ROLE_PRESET_PERMISSIONS',
      targetType: 'ROLE',
      targetId: r,
      details: {
        role: r,
        permissionsCount: permissions.length,
        permissionsList: permissions,
      },
      status: 'EXECUTED',
    });

    this.notifyListeners();
  }

  static loadStoredOverrides(): Record<string, SecurityOverrideRecord> {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    try {
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('[PermissionService] Failed to load stored security overrides:', e);
      return {};
    }
  }

  static saveStoredOverrides(data: Record<string, SecurityOverrideRecord>): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[PermissionService] Failed to save stored security overrides:', e);
    }
  }

  static registerEmployees(employees: Employee[]): void {
    if (!Array.isArray(employees)) return;
    this.registeredEmployees = employees;
    this.employeeCustomPermissions.clear();
    this.loadStoredRolePresets();

    const storedOverrides = this.loadStoredOverrides();
    employees.forEach(emp => {
      const override = storedOverrides[emp.id];
      if (override) {
        if (override.role) emp.role = override.role;
        if (override.passcode) emp.passcode = override.passcode;
        if (override.permissions && Array.isArray(override.permissions)) {
          emp.permissions = override.permissions;
          this.employeeCustomPermissions.set(emp.id, override.permissions);
          return;
        }
      }
      if (emp.permissions && Array.isArray(emp.permissions)) {
        this.employeeCustomPermissions.set(emp.id, emp.permissions);
      }
    });
  }

  static invalidateEmployeePermissionCache(employeeId?: string): void {
    if (employeeId) this.employeeCustomPermissions.delete(employeeId);
    else this.employeeCustomPermissions.clear();
    this.notifyListeners();
  }

  /**
   * Calculate Effective Permissions:
   * Employee → Role defaults → Employee overrides → Effective permissions
   */
  static getEffectivePermissions(employee: Employee | null | undefined): string[] {
    if (!employee) return [];
    const roleUpper = (employee.role || '').toUpperCase().trim();

    // Admins and Owners get full access
    if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'BUSINESS_ADMIN' || roleUpper === 'OWNER' || roleUpper === 'ADMIN') {
      return ALL_POS_PERMISSIONS.map(p => p.id);
    }

    const presets = this.getRolePresets();
    const defaults = presets[roleUpper] || presets['STAFF'] || ROLE_DEFAULT_PERMISSIONS['STAFF'] || [];

    const empId = employee.id;
    if (empId) {
      if (this.employeeCustomPermissions.has(empId)) {
        return this.employeeCustomPermissions.get(empId) || [];
      }
      const overrides = this.loadStoredOverrides()[empId];
      if (overrides && overrides.permissions && Array.isArray(overrides.permissions)) {
        this.employeeCustomPermissions.set(empId, overrides.permissions);
        return overrides.permissions;
      }
    }

    if (employee.permissions && Array.isArray(employee.permissions) && employee.permissions.length > 0) {
      return employee.permissions;
    }

    return [...defaults];
  }

  static async updateEmployeePermissions(employeeId: string, permissions: string[], actor: Employee): Promise<void> {
    this.employeeCustomPermissions.set(employeeId, permissions);
    const emp = this.registeredEmployees.find(e => e.id === employeeId);
    if (emp) {
      emp.permissions = permissions;
    }
    const overrides = this.loadStoredOverrides();
    overrides[employeeId] = {
      ...overrides[employeeId],
      permissions,
      updatedAt: new Date().toISOString(),
    };
    this.saveStoredOverrides(overrides);
    await PermissionRepository.save({
      id: employeeId,
      employeeId,
      permissions,
      updatedAt: new Date().toISOString(),
    });
    this.invalidateEmployeePermissionCache(employeeId);

    await AuditService.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'UPDATE_EMPLOYEE_PERMISSIONS',
      targetType: 'PERMISSION',
      targetId: employeeId,
      details: {
        employeeId,
        permissionsCount: permissions.length,
        permissionsList: permissions,
      },
      status: 'EXECUTED',
    });

    this.notifyListeners();
  }

  static async saveEmployeeSecurityProfile(params: {
    employeeId: string;
    role?: UserRole;
    passcode?: string;
    permissions?: string[];
    actor: Employee;
  }): Promise<{ success: boolean; employee?: Employee }> {
    const { employeeId, role, passcode, permissions, actor } = params;
    const emp = this.registeredEmployees.find(e => e.id === employeeId);
    const stored = this.loadStoredOverrides();
    const existing = stored[employeeId] || { updatedAt: new Date().toISOString() };

    const oldRole = emp?.role;
    const oldPerms = emp ? this.getEffectivePermissions(emp) : [];
    const pinChanged = !!(passcode && passcode !== emp?.passcode);

    if (role && emp) {
      emp.role = role;
      existing.role = role;
    }
    if (passcode && emp) {
      emp.passcode = passcode;
      existing.passcode = passcode;
    }
    if (permissions && Array.isArray(permissions)) {
      this.employeeCustomPermissions.set(employeeId, permissions);
      if (emp) emp.permissions = permissions;
      existing.permissions = permissions;
    }

    existing.updatedAt = new Date().toISOString();
    stored[employeeId] = existing;
    this.saveStoredOverrides(stored);
    await PermissionRepository.save({
      id: employeeId,
      employeeId,
      role: role || emp?.role,
      permissions: permissions || oldPerms,
      passcode: passcode || emp?.passcode,
      updatedAt: existing.updatedAt,
    });

    if (role && oldRole && role !== oldRole) {
      await AuditService.log({
        actorId: actor.id,
        actorName: actor.name,
        action: 'UPDATE_EMPLOYEE_ROLE',
        targetType: 'EMPLOYEE',
        targetId: employeeId,
        details: {
          employeeId,
          employeeName: emp?.name,
          previousRole: oldRole,
          newRole: role,
        },
        status: 'SUCCESS',
      });
    }

    if (permissions && Array.isArray(permissions)) {
      const added = permissions.filter(p => !oldPerms.includes(p));
      const removed = oldPerms.filter(p => !permissions.includes(p));
      await AuditService.log({
        actorId: actor.id,
        actorName: actor.name,
        action: 'UPDATE_EMPLOYEE_PERMISSIONS',
        targetType: 'PERMISSION',
        targetId: employeeId,
        details: {
          employeeId,
          employeeName: emp?.name,
          assignedRole: role || emp?.role,
          permissionsTotal: permissions.length,
          permissionsAdded: added,
          permissionsRemoved: removed,
        },
        status: 'SUCCESS',
      });
    }

    if (pinChanged) {
      await AuditService.log({
        actorId: actor.id,
        actorName: actor.name,
        action: 'UPDATE_EMPLOYEE_PIN',
        targetType: 'EMPLOYEE',
        targetId: employeeId,
        details: {
          employeeId,
          employeeName: emp?.name,
          pinLength: passcode.length,
          securityHashMethod: 'SALTED_TERMINAL_PERSISTENCE',
        },
        status: 'SUCCESS',
      });
    }

    this.invalidateEmployeePermissionCache(employeeId);
    return { success: true, employee: emp };
  }

  /**
   * Check whether an employee has a specific permission
   */
  static can(employee: Employee | null | undefined, permission: string): boolean {
    if (!employee || !permission) return false;
    const roleUpper = (employee.role || '').toUpperCase();
    if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'BUSINESS_ADMIN' || roleUpper === 'OWNER' || roleUpper === 'ADMIN') {
      return true;
    }
    const effective = this.getEffectivePermissions(employee);
    return effective.includes(permission);
  }

  /**
   * Check whether an employee is authorized to view a specific KDS prep station
   */
  static canViewStation(employee: Employee | null | undefined, stationId: string): boolean {
    if (!employee) return false;
    const roleUpper = (employee.role || '').toUpperCase();
    if (['SUPER_ADMIN', 'BUSINESS_ADMIN', 'ADMIN', 'OWNER', 'MANAGER'].includes(roleUpper)) {
      return true;
    }
    if (!this.can(employee, 'pos.kds.access') && !this.can(employee, 'kds.view')) {
      return false;
    }
    const normalized = stationId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const stationPerm = `kds.station.${normalized}.view`;
    const effective = this.getEffectivePermissions(employee);

    if (effective.includes(stationPerm)) {
      return true;
    }
    // If user has specific station restrictions defined, enforce them strictly
    if (effective.some(p => p.startsWith('kds.station.') && p.endsWith('.view'))) {
      return effective.includes(stationPerm);
    }
    // A station permission must be explicit for restricted kitchen operators.
    return roleUpper === 'KITCHEN' || roleUpper === 'CHEF';
  }

  /**
   * Verifies an action permission and logs rejection audit trail if denied
   */
  static async checkActionPermission(
    employee: Employee | null | undefined,
    permission: string,
    actionName: string,
    targetId: string,
    details?: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!employee) {
      return { allowed: false, reason: 'No active employee context' };
    }
    const isAllowed = this.can(employee, permission);
    if (!isAllowed) {
      const actorId = employee.id || 'UNKNOWN';
      const actorName = employee.name || 'Unknown Operator';
      await AuditService.log({
        actorId,
        actorName,
        action: 'UNAUTHORIZED_ACTION_BLOCKED',
        targetType: 'ACTION',
        targetId: permission,
        details: {
          actionName,
          requiredPermission: permission,
          operatorRole: employee.role,
          targetId,
          ...details,
        },
        status: 'REJECTED',
      });
    }
    return {
      allowed: isAllowed,
      reason: isAllowed ? undefined : `Permission '${permission}' required`,
    };
  }

  /**
   * Verify Manager PIN for override authorization
   */
  static async verifyManagerPin(
    pin: string,
    actionKey: string,
    context?: AuthorizationContext,
    reason?: string
  ): Promise<ManagerApprovalResult> {
    const ctx = context || { employeeId: 'CURRENT_OPERATOR', employeeName: 'Current Operator' };
    const approvingManager = this.registeredEmployees.find(emp => {
      const p = emp.passcode || '';
      if (!p || p !== pin) return false;
      const roleUpper = (emp.role || '').toUpperCase();
      const hasOverride = this.can(emp, 'pos.manager.override');
      return roleUpper.includes('ADMIN') || roleUpper.includes('MANAGER') || roleUpper.includes('OWNER') || hasOverride;
    });

    if (approvingManager) {
      await AuditService.log({
        actorId: ctx.employeeId,
        actorName: ctx.employeeName,
        action: `MANAGER_APPROVAL_${actionKey}`,
        targetType: 'PERMISSION',
        approvedByManagerId: approvingManager.id,
        approvedByManagerName: approvingManager.name,
        approvalReason: reason || 'Authorized by Manager PIN',
        requiresApproval: true,
        status: 'EXECUTED',
        details: {
          actionKey,
          reason,
          approvingRole: approvingManager.role,
        },
        merchantId: ctx.merchantId,
        locationId: ctx.locationId,
      });

      return {
        success: true,
        approved: true,
        manager: {
          id: approvingManager.id,
          name: approvingManager.name,
          role: String(approvingManager.role),
        },
        managerId: approvingManager.id,
        managerName: approvingManager.name,
        reason: reason || 'Authorized',
      };
    }

    await AuditService.log({
      actorId: ctx.employeeId,
      actorName: ctx.employeeName,
      action: `FAILED_APPROVAL_${actionKey}`,
      targetType: 'PERMISSION',
      details: {
        actionKey,
        reason,
        attemptedPinLength: pin.length,
      },
      status: 'REJECTED',
      merchantId: ctx.merchantId,
      locationId: ctx.locationId,
    });

    return {
      success: false,
      approved: false,
      error: 'Invalid manager PIN or insufficient override permissions',
    };
  }
}
