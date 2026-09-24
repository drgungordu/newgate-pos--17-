import { NativeBridge } from './nativeBridge';

export type PrinterTransport = 'NETWORK_ESCPOS' | 'BUILTIN_ESCPOS' | 'USB_ESCPOS' | 'BLUETOOTH_ESCPOS';
export type PrinterVendor = 'GENERIC' | 'EPSON' | 'STAR' | 'BIXOLON' | 'CITIZEN' | 'ZEBRA';
export type PrinterResult = 'PRINTED' | 'OFFLINE' | 'TIMEOUT' | 'FAILED';

export interface PrinterProfile {
  id: string;
  name: string;
  vendor: PrinterVendor;
  transport: PrinterTransport;
  ip?: string;
  port?: number;
  deviceAddress?: string;
  enabled: boolean;
}

export interface PrinterJob {
  rawText: string;
  profile: PrinterProfile;
}

export const PRINTER_VENDOR_PROFILES: Record<PrinterVendor, { transports: PrinterTransport[]; notes: string }> = {
  GENERIC: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'Generic ESC/POS compatible printer' },
  EPSON: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'TM/TM-m series ESC/POS profile' },
  STAR: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'TSP/mC series requires Star command mode configuration' },
  BIXOLON: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'SR/SP series ESC/POS profile' },
  CITIZEN: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'CT/CT-S series ESC/POS profile' },
  ZEBRA: { transports: ['NETWORK_ESCPOS', 'USB_ESCPOS', 'BLUETOOTH_ESCPOS'], notes: 'Receipt mode only; label ZPL requires a dedicated label provider' },
};

export class PrinterService {
  static async print(job: PrinterJob): Promise<PrinterResult> {
    if (!job.profile.enabled) return 'FAILED';
    if (!PRINTER_VENDOR_PROFILES[job.profile.vendor].transports.includes(job.profile.transport)) return 'FAILED';
    return NativeBridge.printReceipt({
      rawText: job.rawText,
      printerIp: job.profile.ip,
      printerPort: job.profile.port,
      transport: job.profile.transport,
      deviceAddress: job.profile.deviceAddress,
      vendor: job.profile.vendor,
    });
  }
}
