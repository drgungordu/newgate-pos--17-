import { LocalOutboxMutation, LocalDbService } from './localDbService';
import { ApiClient } from './apiClient';

export type SyncState = 'PENDING' | 'SENDING' | 'SYNCED' | 'FAILED';

export class SyncService {
  private static api: ApiClient | null = null;
  private static running = false;

  static configure(api: ApiClient): void { this.api = api; }

  static enqueue(type: LocalOutboxMutation['type'], payload: unknown): LocalOutboxMutation {
    return LocalDbService.enqueueOutbox(type, payload);
  }

  static async flush(): Promise<{ synced: number; failed: number }> {
    if (this.running || !this.api) return { synced: 0, failed: 0 };
    this.running = true;
    let synced = 0;
    let failed = 0;
    try {
      for (const mutation of LocalDbService.getOutbox()) {
        try {
          await this.api.post(`/sync/${mutation.type.toLowerCase()}`, {
            mutation,
            idempotencyKey: mutation.idempotencyKey,
          });
          LocalDbService.markSynced(mutation.id);
          synced += 1;
        } catch {
          failed += 1;
        }
      }
    } finally {
      this.running = false;
    }
    return { synced, failed };
  }

  static async flushIfOnline(): Promise<{ synced: number; failed: number }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return { synced: 0, failed: 0 };
    return this.flush();
  }
}
