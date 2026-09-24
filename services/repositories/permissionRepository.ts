import { DataRepository } from '../../src/repositories/persistence/DataRepository';

export interface PermissionSnapshot {
  id: string;
  employeeId: string;
  role?: string;
  permissions: string[];
  passcode?: string;
  updatedAt: string;
}

export class PermissionRepository {
  private static repository = new DataRepository<PermissionSnapshot>('employee_permissions');

  static async save(snapshot: PermissionSnapshot): Promise<void> {
    await this.repository.upsert(snapshot);
  }

  static async findByEmployeeId(employeeId: string): Promise<PermissionSnapshot | null> {
    return this.repository.findById(employeeId);
  }
}
