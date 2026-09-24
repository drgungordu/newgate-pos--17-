import { Employee } from '../types';
import { PermissionService } from './permissionService';

export class ManagerApprovalService {
  static async require(employee: Employee, action: string, reason: string): Promise<void> {
    const result = await PermissionService.checkActionPermission(employee, 'pos.manager.override', action, employee.id, { reason });
    if (result.allowed) return;
    throw new Error(`Manager approval required for ${action}: ${reason}`);
  }

  static async verifyPin(pin: string, action: string, employee: Employee, reason: string) {
    return PermissionService.verifyManagerPin(pin, action, { employeeId: employee.id, employeeName: employee.name, merchantId: employee.businessId }, reason);
  }
}
