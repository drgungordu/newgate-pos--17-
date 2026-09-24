import { SqliteDbService } from './sqliteDbService';
import { SyncService } from './syncService';

export type InventoryMovementType = 'SALE' | 'RETURN' | 'RECEIVING' | 'TRANSFER' | 'WASTE' | 'DAMAGE' | 'COUNT_ADJUSTMENT';

export interface InventoryMovement {
  id: string;
  itemId: string;
  quantity: number;
  type: InventoryMovementType;
  referenceId?: string;
  actorId?: string;
  createdAt: string;
}

export class InventoryLedgerService {
  static async record(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const entry: InventoryMovement = { ...movement, id: `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
    const current = await SqliteDbService.getValue<InventoryMovement[]>('inventory_ledger') || [];
    await SqliteDbService.setValue('inventory_ledger', [entry, ...current].slice(0, 10000));
    SyncService.enqueue('ORDER_UPDATE', { kind: 'INVENTORY_MOVEMENT', movement: entry });
    return entry;
  }

  static async list(): Promise<InventoryMovement[]> {
    return await SqliteDbService.getValue<InventoryMovement[]>('inventory_ledger') || [];
  }
}
