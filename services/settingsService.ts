import { SqliteDbService } from './sqliteDbService';
import { AuditService } from './auditService';

export interface EffectiveSettings {
  printerIp?: string;
  printerPort?: number;
  defaultOpeningFloat?: number;
  blindCloseEnabled?: boolean;
  autoLockTimeout?: string;
  requireManagerForVoids?: boolean;
  kioskLockTaskEnabled?: boolean;
  businessDateMode?: string;
  [key: string]: any;
}

export class SettingsService {
  private static settings: EffectiveSettings = {
    printerIp: '192.168.1.200',
    printerPort: 9100,
    defaultOpeningFloat: 200,
    blindCloseEnabled: true,
    autoLockTimeout: '2',
    requireManagerForVoids: true,
    kioskLockTaskEnabled: false,
    businessDateMode: 'AUTO'
  };

  static async resolveEffectiveSettings(scope: { merchantId: string; locationId: string }): Promise<EffectiveSettings> {
    const stored = await SqliteDbService.getValue<EffectiveSettings>(`settings:${scope.merchantId}:${scope.locationId}`);
    if (stored) this.settings = { ...this.settings, ...stored };
    return { ...this.settings };
  }

  static async updateSettings(
    scope: { merchantId: string; locationId: string },
    updates: Partial<EffectiveSettings>,
    userId?: string,
    userName?: string
  ): Promise<EffectiveSettings> {
    this.settings = { ...this.settings, ...updates };
    await SqliteDbService.setValue(`settings:${scope.merchantId}:${scope.locationId}`, this.settings);
    if (userId) {
      await AuditService.log({ actorId: userId, actorName: userName, action: 'SETTINGS_UPDATED', targetType: 'SETTINGS', targetId: `${scope.merchantId}:${scope.locationId}`, details: updates, status: 'SUCCESS', merchantId: scope.merchantId, locationId: scope.locationId });
    }
    return { ...this.settings };
  }
}
