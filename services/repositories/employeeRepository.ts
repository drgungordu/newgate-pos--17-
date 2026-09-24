import { Employee } from '../../types';
import { DataRepository } from '../../src/repositories/persistence/DataRepository';
import { LocalDbService } from '../localDbService';

export class EmployeeRepository {
  private static repository = new DataRepository<Employee>('employees');

  static async upsert(employee: Employee): Promise<void> {
    await this.repository.upsert(employee);
    const employees = await this.repository.find();
    LocalDbService.cacheEmployeeSnapshot(employees);
  }

  static async upsertMany(employees: Employee[]): Promise<void> {
    for (const employee of employees) {
      await this.repository.upsert(employee);
    }
    LocalDbService.cacheEmployeeSnapshot(await this.repository.find());
  }

  static async findByBusinessId(businessId: string): Promise<Employee[]> {
    const repositoryEmployees = await this.repository.find();
    const cachedEmployees = LocalDbService.getCachedEmployees();
    const employees = Array.from(new Map(
      [...repositoryEmployees, ...cachedEmployees].map(employee => [employee.id, employee])
    ).values());
    return employees.filter(employee => employee.businessId === businessId);
  }
}
