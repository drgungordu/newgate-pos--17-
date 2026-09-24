/**
 * Device and Appliance Provisioning Types
 * Implements Section 4 & 5 of the Newgate Platform Architecture.
 */

export type MerchantMode = 'RESTAURANT' | 'RETAIL' | 'NONPROFIT' | 'HYBRID';

export type DeviceRole =
  | 'REGISTER'
  | 'KDS'
  | 'HOST'
  | 'EXPO'
  | 'KIOSK'
  | 'SELF_SERVICE_KIOSK'
  | 'HANDHELD'
  | 'SCANNER'
  | 'DONATION_KIOSK'
  | 'MEMBERSHIP_DESK'
  | 'MANAGER_STATION';

export interface DeviceHardwareCapabilities {
  hasBuiltInPrinter: boolean;
  hasBuiltInScanner: boolean;
  hasCashDrawerPort: boolean;
  hasCustomerDisplay: boolean;
  hasNfcEmv: boolean;
  screenSizeInches: number;
}

export interface DeviceFingerprint {
  manufacturer: string;
  model: string;
  buildNumber: string;
  firmwareVersion: string;
  installIdentity: string;
  androidId?: string;
  capabilities: DeviceHardwareCapabilities;
}

export interface DeviceRecord {
  id: string;
  name: string;
  merchantId: string;
  locationId: string;
  merchantMode: MerchantMode;
  role: DeviceRole;
  fingerprint: DeviceFingerprint;
  pairingToken?: string;
  isEnrolled: boolean;
  isRevoked: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  appVersion: string;
  lastHeartbeat: string;
  registeredAt: string;
  assignedStationId?: string;
  isKioskLocked: boolean;
  pinRequired?: boolean;
  ipAddress?: string;
  apiBaseUrl?: string;
  wsUrl?: string;
  requireEmployeeLogin?: boolean;
  initialSyncAt?: string;
}

export interface ProvisioningPayload {
  merchantId: string;
  locationId: string;
  deviceId: string;
  deviceRole: DeviceRole;
  merchantMode: MerchantMode;
  apiBaseUrl?: string;
  wsUrl?: string;
  terminalName: string;
  requireEmployeeLogin: boolean;
  initialSyncAt?: string;
  token?: string;
}

export interface ProvisioningToken {
  token: string;
  merchantId: string;
  locationId: string;
  merchantMode: MerchantMode;
  deviceRole: DeviceRole;
  deviceName: string;
  expiresAt: string;
  singleUse: boolean;
  isUsed: boolean;
  apiBaseUrl?: string;
  wsUrl?: string;
  requireEmployeeLogin?: boolean;
}
