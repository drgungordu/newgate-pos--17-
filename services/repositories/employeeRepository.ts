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
    return (await this.repository.find()).filter(employee => employee.businessId === businessId);
  }
}
