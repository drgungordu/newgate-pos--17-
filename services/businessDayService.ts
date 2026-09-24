import { SqliteDbService } from './sqliteDbService';
import { AuditService } from './auditService';

export interface BusinessDay {
  id: string;
  date: string;
  businessDate: string;
  openedAt: string;
  status: 'OPEN' | 'CLOSED';
}

export class BusinessDayService {
  static async getCurrentBusinessDay(): Promise<BusinessDay> {
    const businessDate = new Date().toISOString().split('T')[0];
    const stored = await SqliteDbService.getValue<BusinessDay>(`business_day:${businessDate}`);
    if (stored) return stored;
    return {
      id: `BDAY-${new Date().toISOString().split('T')[0]}`,
      date: new Date().toLocaleDateString(),
      businessDate,
      openedAt: new Date().toISOString(),
      status: 'OPEN'
    };
  }

  static async closeBusinessDay(actual: number, variance: number, actor: { id: string; name: string }): Promise<BusinessDay> {
    const current = await this.getCurrentBusinessDay();
    const closed = { ...current, status: 'CLOSED' as const, closedAt: new Date().toISOString(), actual, variance };
    await SqliteDbService.setValue(`business_day:${current.businessDate}`, closed);
    await AuditService.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BUSINESS_DAY_CLOSED',
      targetType: 'BUSINESS_DAY',
      targetId: current.businessDate,
      details: { actual, variance },
      status: 'SUCCESS',
    });
    return closed;
  }
}
