import { Employee } from '../types';
import { EmployeeAuthService } from './employeeAuthService';
import { EmployeeRepository } from './repositories/employeeRepository';
import { LocalDbService } from './localDbService';
import { PermissionService } from './permissionService';

export interface PinLoginRequest {
  merchantId: string;
  deviceId: string;
  pin: string;
}

export interface AuthSession {
  employee: Employee;
  effectivePermissions: string[];
  sessionId: string;
}

export class AuthService {
  static async loginWithPin({ merchantId, deviceId, pin }: PinLoginRequest): Promise<AuthSession> {
    const repositoryEmployees = await EmployeeRepository.findByBusinessId(merchantId);
    const cachedEmployees = LocalDbService.getCachedEmployees().filter(employee => employee.businessId === merchantId);
    const employees = Array.from(new Map(
      [...repositoryEmployees, ...cachedEmployees].map(employee => [employee.id, employee])
    ).values());

    const result = await EmployeeAuthService.authenticateByPin(pin, deviceId, employees);
    if (!result.success || !result.employee) {
      throw new Error(result.errorMessage || 'Invalid PIN.');
    }

    return {
      employee: result.employee,
      effectivePermissions: PermissionService.getEffectivePermissions(result.employee),
      sessionId: `POS-${deviceId}-${Date.now().toString(36)}`,
    };
  }
}
