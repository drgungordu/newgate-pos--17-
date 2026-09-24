export class SqliteDbService {
  private static getBridge(): {
    sqliteSet?: (key: string, value: string) => boolean;
    sqliteGet?: (key: string) => string | null;
  } | null {
    if (typeof window === 'undefined') return null;
    return (window as any).NewgateNativeBridge || null;
  }

  private static set(key: string, value: unknown): void {
    this.getBridge()?.sqliteSet?.(key, JSON.stringify(value));
  }

  private static get<T>(key: string): T | null {
    const value = this.getBridge()?.sqliteGet?.(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  static async setValue(key: string, value: unknown): Promise<void> {
    this.set(key, value);
  }

  static async getValue<T>(key: string): Promise<T | null> {
    return this.get<T>(key);
  }

  static async init(): Promise<void> {}

  static async restoreAll(): Promise<any> {
    return {
      openOrders: this.get<any[]>('open_orders') || [],
      tablesState: this.get<any>('tables_state'),
      employees: this.get<any[]>('employee_permission_snapshot') || [],
      kdsTickets: this.get<any[]>('kds_tickets') || [],
      printJobs: this.get<any[]>('print_queue') || [],
      businessDay: this.get<any>('business_day'),
      deviceConfig: this.get<any>('device_config_record'),
      syncQueue: this.get<any[]>('sync_queue') || [],
    };
  }

  static async saveEmployeeSnapshot(employees: any): Promise<void> {
    this.set('employee_permission_snapshot', employees);
  }

  static async saveOpenOrders(orders: any): Promise<void> {
    this.set('open_orders', orders);
  }

  static async saveTables(tables: any, activeTableOrders: any): Promise<void> {
    this.set('tables_state', { tables, activeTableOrders });
  }

  static async saveKdsTickets(tickets: any): Promise<void> {
    this.set('kds_tickets', tickets);
  }

  static async savePrintQueue(jobs: any): Promise<void> {
    this.set('print_queue', jobs);
  }

  static async saveBusinessDay(bday: any): Promise<void> {
    this.set('business_day', bday);
  }

  static async saveDeviceConfig(config: any): Promise<void> {
    this.set('device_config_record', config);
  }

  static async saveSyncQueue(queue: any): Promise<void> {
    this.set('sync_queue', queue);
  }
}
