import { MerchantMode, DeviceRole } from '../types/device';

export interface FeatureContext {
  merchantMode: MerchantMode;
  deviceRole: DeviceRole;
  capabilities?: Record<string, boolean>;
}

export const FEATURE_REGISTRY = {
  restaurantTables: { modes: ['RESTAURANT'] as MerchantMode[], roles: ['REGISTER', 'HANDHELD', 'HOST', 'MANAGER_STATION'] as DeviceRole[] },
  retailReturns: { modes: ['RETAIL'] as MerchantMode[], roles: ['REGISTER', 'MANAGER_STATION'] as DeviceRole[] },
  nonprofitGiving: { modes: ['NONPROFIT'] as MerchantMode[], roles: ['REGISTER', 'DONATION_KIOSK', 'MEMBERSHIP_DESK'] as DeviceRole[] },
  kds: { modes: ['RESTAURANT'] as MerchantMode[], roles: ['KDS', 'EXPO', 'REGISTER', 'MANAGER_STATION'] as DeviceRole[] },
};

export function isFeatureEnabled(feature: keyof typeof FEATURE_REGISTRY, context: FeatureContext): boolean {
  const definition = FEATURE_REGISTRY[feature];
  return definition.modes.includes(context.merchantMode) && definition.roles.includes(context.deviceRole) && (context.capabilities?.[feature] ?? true);
}
