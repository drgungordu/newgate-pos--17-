import { SqliteDbService } from './sqliteDbService';
import { SyncService } from './syncService';

export interface RefundLedgerEntry {
  id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  reason?: string;
  actorId: string;
  status: 'PENDING' | 'APPROVED' | 'FAILED';
  createdAt: string;
}

export class RefundLedgerService {
  static async create(entry: Omit<RefundLedgerEntry, 'id' | 'createdAt' | 'status'>): Promise<RefundLedgerEntry> {
    const refund: RefundLedgerEntry = { ...entry, id: `REF-${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString() };
    const current = await SqliteDbService.getValue<RefundLedgerEntry[]>('refund_ledger') || [];
    await SqliteDbService.setValue('refund_ledger', [refund, ...current].slice(0, 10000));
    SyncService.enqueue('PAYMENT', { kind: 'REFUND', refund });
    return refund;
  }
}
