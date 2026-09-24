import { SqliteDbService } from './sqliteDbService';

export type KDSRoutingMode = 'ALL' | 'STATION' | 'EXPO' | 'KDS_ONLY' | 'PRINTER_ONLY' | 'BOTH';

export interface StationConfig {
  id: string;
  name: string;
  deliveryMode: 'BOTH' | 'KDS_ONLY' | 'PRINTER_ONLY';
  categories?: string[];
  printerIp?: string;
  printerPort?: number;
  color?: string;
}

export class KitchenRoutingService {
  static STATIONS: StationConfig[] = [
    { id: 'expo', name: 'Expediter', deliveryMode: 'BOTH' },
    { id: 'grill', name: 'Grill Station', deliveryMode: 'KDS_ONLY' },
    { id: 'fry', name: 'Fry Station', deliveryMode: 'KDS_ONLY' },
    { id: 'salad', name: 'Salad & Cold Prep', deliveryMode: 'KDS_ONLY' },
    { id: 'bar', name: 'Bar & Beverages', deliveryMode: 'BOTH' },
  ];

  static async getStations(): Promise<StationConfig[]> {
    const stored = await SqliteDbService.getValue<StationConfig[]>('kds_stations');
    if (stored?.length) this.STATIONS = stored;
    return [...this.STATIONS];
  }

  static async addCustomStation(station: StationConfig): Promise<StationConfig[]> {
    this.STATIONS.push(station);
    await SqliteDbService.setValue('kds_stations', this.STATIONS);
    return [...this.STATIONS];
  }

  static async registerCustomStation(station: StationConfig): Promise<StationConfig[]> {
    return this.addCustomStation(station);
  }
}
