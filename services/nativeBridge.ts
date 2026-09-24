import { registerPlugin } from '@capacitor/core';

interface NewgatePlugin {
  getBatteryLevel(): Promise<{ batteryLevel: number }>;
  beep(options: { toneFrequency: number; durationMs: number }): Promise<void>;
  printReceipt(options: { rawText: string; printerIp?: string; printerPort?: number; transport?: string; deviceAddress?: string; vendor?: string }): Promise<{ status: 'PRINTED' | 'OFFLINE' | 'TIMEOUT' | 'FAILED' }>;
  pulseCashDrawer(options: { printerIp?: string; printerPort?: number }): Promise<{ success: boolean }>;
  sendCustomerDisplay(options: { line1: string; line2: string }): Promise<{ success: boolean }>;
  secureSet(options: { key: string; value: string }): Promise<void>;
  secureGet(options: { key: string }): Promise<{ value?: string | null }>;
}

const NativePlugin = registerPlugin<NewgatePlugin>('NewgatePosPlugin');

export class NativeBridge {
  static async secureSet(key: string, value: string): Promise<boolean> {
    try { await NativePlugin.secureSet({ key, value }); return true; } catch { return false; }
  }

  static async secureGet(key: string): Promise<string | null> {
    try { return (await NativePlugin.secureGet({ key })).value || null; } catch { return null; }
  }

  static async sendCustomerDisplay(line1: string, line2: string): Promise<boolean> {
    try {
      const result = await NativePlugin.sendCustomerDisplay({ line1, line2 });
      return result.success;
    } catch {
      return false;
    }
  }

  static async getBatteryLevel(): Promise<number> {
    try {
      const result = await NativePlugin.getBatteryLevel();
      return result.batteryLevel;
    } catch {
      // Browser fallback below.
    }
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        return Math.round(battery.level * 100);
      }
    } catch {
      // Fallback
    }
    return 100;
  }

  static beep(freq = 2000, durationMs = 50): void {
    NativePlugin.beep({ toneFrequency: freq, durationMs }).catch(() => undefined);
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
      }
    } catch {
      // Audio not allowed or unavailable
    }
  }

  static async printReceipt(payload: any): Promise<'PRINTED' | 'OFFLINE' | 'TIMEOUT' | 'FAILED'> {
    try {
      const result = await NativePlugin.printReceipt({
        rawText: String(payload?.rawText || payload?.text || payload || ''),
        printerIp: payload?.printerIp,
        printerPort: payload?.printerPort,
        transport: payload?.transport,
        deviceAddress: payload?.deviceAddress,
        vendor: payload?.vendor,
      });
      return result.status;
    } catch {
      return 'FAILED';
    }
  }
}
