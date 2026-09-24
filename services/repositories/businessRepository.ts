import { Business } from '../../types';
import { DataRepository } from '../../src/repositories/persistence/DataRepository';

export class BusinessRepository {
  private static repository = new DataRepository<Business>('businesses');

  static async upsert(business: Business): Promise<void> {
    await this.repository.upsert(business);
  }

  static async upsertMany(businesses: Business[]): Promise<void> {
    for (const business of businesses) {
      await this.repository.upsert(business);
    }
  }

  static async findById(id: string): Promise<Business | null> {
    return this.repository.findById(id);
  }
}
