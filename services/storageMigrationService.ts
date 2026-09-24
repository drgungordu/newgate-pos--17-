const STORAGE_MIGRATION_KEY = 'newgate_storage_migration_v1';

const KEY_MIGRATIONS: Record<string, string> = {
  omni_removed_items: 'newgate_removed_items',
  omni_removal_reasons: 'newgate_removal_reasons',
  byte_dining_order_settings: 'newgate_dining_order_settings',
};

export class StorageMigrationService {
  static run(): void {
    if (typeof window === 'undefined' || localStorage.getItem(STORAGE_MIGRATION_KEY) === 'complete') return;
    for (const [legacyKey, newKey] of Object.entries(KEY_MIGRATIONS)) {
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue !== null && localStorage.getItem(newKey) === null) localStorage.setItem(newKey, legacyValue);
      if (legacyValue !== null) localStorage.removeItem(legacyKey);
    }
    localStorage.setItem(STORAGE_MIGRATION_KEY, 'complete');
  }
}
