/**
 * DeviceIdentityService
 * Implements Device Provisioning, Fingerprint Attestation, Heartbeat, and Appliance Lifecycle (Sections 4 & 5).
 */

import { DeviceRecord, DeviceFingerprint, ProvisioningToken, ProvisioningPayload, DeviceRole, MerchantMode } from '../types/device';
import { DataRepository } from '../src/repositories/persistence/DataRepository';
import { AuditService } from './auditService';
import { LocalDbService } from './localDbService';
import { NativeBridge } from './nativeBridge';

export class DeviceIdentityService {
  private static deviceRepo = new DataRepository<DeviceRecord & { id: string }>('provisioned_devices');
  private static tokenRepo = new DataRepository<ProvisioningToken & { id: string }>('provisioning_tokens');

  private static currentLocalDevice: DeviceRecord | null = null;

  /**
   * Generates a short-lived, single-use provisioning token in Web Admin
   */
  static async generateProvisioningToken(params: {
    merchantId: string;
    locationId: string;
    merchantMode: MerchantMode;
    deviceRole: DeviceRole;
    deviceName: string;
    apiBaseUrl?: string;
    wsUrl?: string;
    requireEmployeeLogin?: boolean;
  }): Promise<ProvisioningToken> {
    const rawToken = `NG-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const tokenRecord: ProvisioningToken = {
      token: rawToken,
      merchantId: params.merchantId,
      locationId: params.locationId,
      merchantMode: params.merchantMode,
      deviceRole: params.deviceRole,
      deviceName: params.deviceName,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      singleUse: true,
      isUsed: false,
      apiBaseUrl: params.apiBaseUrl,
      wsUrl: params.wsUrl,
      requireEmployeeLogin: params.requireEmployeeLogin ?? true,
    };

    await this.tokenRepo.upsert({ id: rawToken, ...tokenRecord });

    await AuditService.log({
      actorId: 'ADMIN',
      actorName: 'Web Admin',
      action: 'DEVICE_TOKEN_GENERATED',
      targetType: 'DEVICE',
      targetId: params.deviceName,
      details: { role: params.deviceRole, token: rawToken },
    });

    return tokenRecord;
  }

  /**
   * Complete appliance binding from a canonical ProvisioningPayload
   * (Scanned from QR, parsed from activation code, or entered via manual config)
   */
  static async provisionDeviceFromPayload(
    payload: ProvisioningPayload,
    customFingerprint?: DeviceFingerprint
  ): Promise<DeviceRecord> {
    if (!payload.merchantId || !payload.locationId || !payload.deviceId || !payload.deviceRole || !payload.merchantMode) {
      throw new Error('Provisioning failed: Missing required fields (merchantId, locationId, deviceId, deviceRole, merchantMode).');
    }

    const fingerprint: DeviceFingerprint = customFingerprint || {
      manufacturer: 'Newgate Appliance Hardware',
      model: 'NG-Terminal-Pro-15',
      buildNumber: 'NG-OS-2026.9',
      firmwareVersion: '1.4.2',
      installIdentity: `inst-${Math.random().toString(36).substring(2, 8)}`,
      capabilities: {
        hasBuiltInPrinter: true,
        hasBuiltInScanner: true,
        hasCashDrawerPort: true,
        hasCustomerDisplay: true,
        hasNfcEmv: true,
        screenSizeInches: 15.6,
      },
    };

    const newDevice: DeviceRecord = {
      id: payload.deviceId,
      name: payload.terminalName || `Terminal ${payload.deviceId}`,
      merchantId: payload.merchantId,
      locationId: payload.locationId,
      merchantMode: payload.merchantMode,
      role: payload.deviceRole,
      fingerprint,
      pairingToken: payload.token,
      isEnrolled: true,
      isRevoked: false,
      status: 'ONLINE',
      appVersion: '2.4.0-newgate',
      lastHeartbeat: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      isKioskLocked: payload.deviceRole === 'KIOSK' || payload.deviceRole === 'DONATION_KIOSK',
      apiBaseUrl: payload.apiBaseUrl || 'https://api.newgatepos.com',
      wsUrl: payload.wsUrl || 'wss://ws.newgatepos.com',
      requireEmployeeLogin: payload.requireEmployeeLogin ?? true,
      initialSyncAt: payload.initialSyncAt || new Date().toISOString(),
    };

    await this.deviceRepo.upsert(newDevice);
    this.currentLocalDevice = newDevice;
    LocalDbService.saveDeviceConfig(newDevice);
    if (payload.token) await NativeBridge.secureSet('device_pairing_token', payload.token);

    await AuditService.log({
      actorId: newDevice.id,
      actorName: newDevice.name,
      action: 'DEVICE_PROVISIONED',
      targetType: 'DEVICE',
      targetId: newDevice.id,
      details: {
        merchantId: newDevice.merchantId,
        locationId: newDevice.locationId,
        role: newDevice.role,
        mode: newDevice.merchantMode,
        requireLogin: newDevice.requireEmployeeLogin,
      },
    });

    return newDevice;
  }

  /**
   * Device scans/enters the provisioning token to complete appliance binding
   */
  static async redeemProvisioningToken(
    tokenString: string,
    fingerprint: DeviceFingerprint
  ): Promise<DeviceRecord> {
    const tokenRecord = await this.tokenRepo.findById(tokenString);
    if (!tokenRecord) {
      throw new Error('Invalid or expired provisioning token.');
    }
    if (tokenRecord.isUsed) {
      throw new Error('This provisioning token has already been used.');
    }
    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      throw new Error('Provisioning token has expired.');
    }

    const deviceId = `DEV-${tokenRecord.merchantId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newDevice: DeviceRecord = {
      id: deviceId,
      name: tokenRecord.deviceName,
      merchantId: tokenRecord.merchantId,
      locationId: tokenRecord.locationId,
      merchantMode: tokenRecord.merchantMode,
      role: tokenRecord.deviceRole,
      fingerprint,
      isEnrolled: true,
      isRevoked: false,
      status: 'ONLINE',
      appVersion: '2.4.0-newgate',
      lastHeartbeat: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      isKioskLocked: tokenRecord.deviceRole === 'KIOSK' || tokenRecord.deviceRole === 'DONATION_KIOSK',
      apiBaseUrl: tokenRecord.apiBaseUrl || 'https://api.newgatepos.com',
      wsUrl: tokenRecord.wsUrl || 'wss://ws.newgatepos.com',
      requireEmployeeLogin: tokenRecord.requireEmployeeLogin ?? true,
      initialSyncAt: new Date().toISOString(),
    };

    tokenRecord.isUsed = true;
    await this.tokenRepo.upsert({ id: tokenRecord.token, ...tokenRecord });
    await this.deviceRepo.upsert(newDevice);

    this.currentLocalDevice = newDevice;
    LocalDbService.saveDeviceConfig(newDevice);
    await NativeBridge.secureSet('device_pairing_token', tokenRecord.token);

    await AuditService.log({
      actorId: deviceId,
      actorName: tokenRecord.deviceName,
      action: 'DEVICE_PROVISIONED',
      targetType: 'DEVICE',
      targetId: deviceId,
      details: { model: fingerprint.model, role: newDevice.role },
    });

    return newDevice;
  }

  /**
   * Get current device identity for this terminal.
   * Returns null if device has not been provisioned/enrolled (P0 requirement).
   */
  static async getCurrentDevice(): Promise<DeviceRecord | null> {
    if (this.currentLocalDevice && this.currentLocalDevice.isEnrolled) {
      return this.currentLocalDevice;
    }

    // Check SQLite / Room persistence first
    const sqliteDevice = LocalDbService.getDeviceConfig();
    if (sqliteDevice && sqliteDevice.isEnrolled && !sqliteDevice.isRevoked) {
      this.currentLocalDevice = sqliteDevice;
      return sqliteDevice;
    }

    const all = await this.deviceRepo.find({ limit: 1 });
    if (all.length > 0 && all[0].isEnrolled && !all[0].isRevoked) {
      this.currentLocalDevice = all[0];
      LocalDbService.saveDeviceConfig(all[0]);
      return all[0];
    }

    return null;
  }

  /**
   * Check if the application is running under DEV or DEMO mode flag.
   */
  static isDevOrDemoMode(): boolean {
    return Boolean(typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV);
  }

  /**
   * Quick-enroll standard appliance terminal for development or demo environments.
   * GATED: strictly disabled in production flow. Production terminals MUST be
   * enrolled through genuine Setup QR or one-time Setup Code token redemption.
   */
  static async enrollDefaultDevice(merchantMode: MerchantMode = 'RESTAURANT', merchantId: string = 'B001'): Promise<DeviceRecord> {
    if (!this.isDevOrDemoMode()) {
      throw new Error('Default device enrollment is strictly disabled in production. Terminals must be provisioned via Setup QR or Setup Code.');
    }

    const dev: DeviceRecord = {
      id: 'DEV-POS-01',
      name: 'Main Counter Register',
      merchantId,
      locationId: '',
      merchantMode,
      role: 'REGISTER',
      fingerprint: {
        manufacturer: 'Newgate Appliance',
        model: 'NG-Terminal-Pro-15',
        buildNumber: 'NG-OS-2026.9',
        firmwareVersion: '1.4.2',
        installIdentity: 'inst-019284',
        capabilities: {
          hasBuiltInPrinter: true,
          hasBuiltInScanner: true,
          hasCashDrawerPort: true,
          hasCustomerDisplay: true,
          hasNfcEmv: true,
          screenSizeInches: 15.6,
        },
      },
      isEnrolled: true,
      isRevoked: false,
      status: 'ONLINE',
      appVersion: '2.4.0-newgate',
      lastHeartbeat: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      isKioskLocked: false,
    };

    await this.deviceRepo.upsert(dev);
    this.currentLocalDevice = dev;
    return dev;
  }

  /**
   * List all provisioned devices for Web Admin
   */
  static async listDevices(merchantId: string = ''): Promise<DeviceRecord[]> {
    const list = await this.deviceRepo.find();
    return list;
  }

  /**
   * Revoke device workflow
   */
  static async revokeDevice(deviceId: string, adminId: string, reason: string): Promise<void> {
    const dev = await this.deviceRepo.findById(deviceId);
    if (!dev) throw new Error('Device not found');

    dev.isRevoked = true;
    dev.status = 'OFFLINE';
    await this.deviceRepo.upsert(dev);

    if (this.currentLocalDevice?.id === deviceId) {
      this.currentLocalDevice = null;
      LocalDbService.saveDeviceConfig(null);
    }

    await AuditService.log({
      actorId: adminId,
      actorName: 'Admin',
      action: 'DEVICE_REVOKED',
      targetType: 'DEVICE',
      targetId: deviceId,
      details: { reason },
    });
  }

  /**
   * Hardware diagnostic self-test querying peripheral capabilities
   * Disconnected / unverified peripherals return appropriate status instead of fake OK (P1 requirement)
   */
  static async runHardwareDiagnostics(): Promise<{
    printer: { ok: boolean; state: 'SUPPORTED' | 'CONNECTED' | 'UNAVAILABLE'; status: string; latencyMs?: number };
    scanner: { ok: boolean; state: 'SUPPORTED' | 'UNAVAILABLE'; status: string };
    cashDrawer: { ok: boolean; state: 'SUPPORTED' | 'UNAVAILABLE'; status: string };
    customerDisplay: { ok: boolean; state: 'SUPPORTED' | 'UNAVAILABLE'; status: string };
    cardReader: { ok: boolean; state: 'SUPPORTED' | 'UNAVAILABLE'; status: string };
  }> {
    const current = await this.getCurrentDevice();
    const caps = current?.fingerprint?.capabilities;
    const printerTest = caps?.hasBuiltInPrinter
      ? await NativeBridge.printReceipt({ rawText: 'NEWGATE POS DIAGNOSTIC\n' })
      : null;

    return {
      printer: printerTest === 'PRINTED'
        ? { ok: true, state: 'CONNECTED', status: 'Connected (Integrated Thermal 80mm)' }
        : caps?.hasBuiltInPrinter
        ? { ok: false, state: 'SUPPORTED', status: `Supported; printer test returned ${printerTest || 'NO_RESULT'}` }
        : { ok: false, state: 'UNAVAILABLE', status: 'Unavailable: No ESC/POS printer registered' },
      scanner: caps?.hasBuiltInScanner
        ? { ok: false, state: 'SUPPORTED', status: 'Supported (2D wedge scanner)' }
        : { ok: false, state: 'UNAVAILABLE', status: 'Unavailable: No scanner capability detected' },
      cashDrawer: caps?.hasCashDrawerPort
        ? { ok: false, state: 'SUPPORTED', status: 'Supported (RJ12 24V kick circuit)' }
        : { ok: false, state: 'UNAVAILABLE', status: 'Unavailable: No drawer kick port' },
      customerDisplay: caps?.hasCustomerDisplay
        ? { ok: false, state: 'SUPPORTED', status: 'Supported (Secondary 10.1" display)' }
        : { ok: false, state: 'UNAVAILABLE', status: 'Unavailable: No secondary display capability detected' },
      cardReader: caps?.hasNfcEmv
        ? { ok: false, state: 'SUPPORTED', status: 'Supported (Integrated EMV/NFC reader)' }
        : { ok: false, state: 'UNAVAILABLE', status: 'Unavailable: No EMV/NFC capability detected' },
    };
  }

  /**
   * Determine if employee PIN login is required for this terminal based on Device Role and Merchant Policy.
   * - REGISTER, HANDHELD, MANAGER_STATION: Employee PIN required.
   * - DONATION_KIOSK, SELF_SERVICE_KIOSK / KIOSK: No PIN required (unattended flow).
   * - Pinned KDS (and EXPO): Optional based on merchant setting (defaults to false for kitchen stations).
   */
  static isPinRequired(
    role: DeviceRole = 'REGISTER',
    merchant?: { kdsPinRequired?: boolean; requirePinForKds?: boolean } | null,
    device?: { pinRequired?: boolean } | null
  ): boolean {
    if (typeof device?.pinRequired === 'boolean') {
      return device.pinRequired;
    }

    switch (role) {
      case 'REGISTER':
      case 'HANDHELD':
      case 'MANAGER_STATION':
        return true;

      case 'DONATION_KIOSK':
      case 'KIOSK':
      case 'SELF_SERVICE_KIOSK':
        return false;

      case 'KDS':
      case 'EXPO':
        // Pinned KDS: optional based on merchant settings
        return Boolean(merchant?.kdsPinRequired || merchant?.requirePinForKds || LocalDbService.getKdsPinRequired());

      case 'HOST':
      case 'SCANNER':
      case 'MEMBERSHIP_DESK':
        return false;

      default:
        return true;
    }
  }

  /**
   * Returns direct operational route for unattended or specialized hardware appliances
   */
  static getInitialRouteForRole(
    role: DeviceRole = 'REGISTER',
    mode: MerchantMode = 'RESTAURANT'
  ): 'HUB' | 'KDS' | 'KIOSK' | 'GIVING_KIOSK' | 'RESERVATIONS' {
    switch (role) {
      case 'DONATION_KIOSK':
        return 'GIVING_KIOSK';
      case 'KIOSK':
      case 'SELF_SERVICE_KIOSK':
        return mode === 'NONPROFIT' ? 'GIVING_KIOSK' : 'KIOSK';
      case 'KDS':
      case 'EXPO':
        return 'KDS';
      case 'HOST':
        return 'RESERVATIONS';
      default:
        return 'HUB';
    }
  }
}
