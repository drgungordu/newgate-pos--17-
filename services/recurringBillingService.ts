import { Invoice, RecurringPlan } from '../types';
import { SqliteDbService } from './sqliteDbService';
import { AuditService } from './auditService';

export type BillingStatus = 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'PAST_DUE' | 'RETRYING';

export interface BillingRecord extends RecurringPlan {
  status: BillingStatus;
  retryCount: number;
  lastAttemptAt?: string;
  processorReference?: string;
}

export class RecurringBillingService {
  static async create(plan: RecurringPlan): Promise<BillingRecord> {
    const record: BillingRecord = { ...plan, status: 'ACTIVE', retryCount: 0 };
    await SqliteDbService.setValue(`billing:${record.id}`, record);
    return record;
  }

  static async transition(id: string, status: BillingStatus, actorId = 'system'): Promise<BillingRecord> {
    const record = await SqliteDbService.getValue<BillingRecord>(`billing:${id}`);
    if (!record) throw new Error('Recurring billing plan not found.');
    const updated = { ...record, status, lastAttemptAt: new Date().toISOString() };
    await SqliteDbService.setValue(`billing:${id}`, updated);
    await AuditService.log({ actorId, action: 'RECURRING_BILLING_STATUS_CHANGED', targetType: 'BILLING_PLAN', targetId: id, details: { status }, status: 'SUCCESS' });
    return updated;
  }

  static async createInvoice(id: string): Promise<Invoice> {
    const record = await SqliteDbService.getValue<BillingRecord>(`billing:${id}`);
    if (!record) throw new Error('Recurring billing plan not found.');
    return { id: `INV-${Date.now()}`, customerName: record.customerName, dateIssued: new Date().toISOString(), dueDate: record.nextRun, status: 'Pending', amount: record.amount };
  }
}
