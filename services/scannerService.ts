import { registerPlugin } from '@capacitor/core';

interface ScannerPlugin {
  addListener(eventName: 'barcodeScanned', listener: (event: { barcode: string }) => void): Promise<{ remove: () => Promise<void> }>;
}

const NativeScanner = registerPlugin<ScannerPlugin>('NewgatePosPlugin');

if (typeof window !== 'undefined') {
  (window as any).onNewgateBarcodeScanned = (barcode: string) => ScannerService.emit(barcode);
}

export class ScannerService {
  private static listeners: ((barcode: string) => void)[] = [];
  private static nativeAttached = false;

  static subscribe(callback: (barcode: string) => void): () => void {
    this.listeners.push(callback);
    if (!this.nativeAttached) {
      this.nativeAttached = true;
      NativeScanner.addListener('barcodeScanned', ({ barcode }) => this.emit(barcode)).catch(() => {
        this.nativeAttached = false;
      });
    }
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  static simulateScan(barcode: string): void {
    this.emit(barcode);
  }

  static emit(barcode: string): void {
    if (!barcode) return;
    this.listeners.forEach((cb) => cb(barcode));
  }
}
