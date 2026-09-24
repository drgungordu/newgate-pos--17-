import { SqliteDbService } from './sqliteDbService';

export interface AuditLogEntry {
  actorId?: string;
  actorName?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  status?: 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED' | 'EXECUTED';
  merchantId?: string;
  locationId?: string;
  timestamp?: string;
  [key: string]: any;
}

export class AuditService {
  private static logs: AuditLogEntry[] = [];

  static async log(entry: AuditLogEntry): Promise<void> {
    const enriched = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString()
    };
    this.logs.unshift(enriched);
    await SqliteDbService.setValue('audit_logs', this.logs.slice(0, 1000));
    console.log(`[AuditService] [${enriched.action}]`, enriched);
  }

  static async getLogs(): Promise<AuditLogEntry[]> {
    const persisted = await SqliteDbService.getValue<AuditLogEntry[]>('audit_logs');
    if (persisted?.length) this.logs = persisted;
    return [...this.logs];
  }
}
