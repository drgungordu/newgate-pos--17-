
import { MOCK_EMPLOYEES, MOCK_INVENTORY_ITEMS, MOCK_CATEGORIES, MOCK_FLOOR_TABLES } from '../constants';

const DB_NAME = 'NewgatePOSDB';
const DB_VERSION = 4;

export const db = {
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const d = e.target.result;
        const stores = [
          'employees', 'inventory', 'categories', 'orders', 'transactions', 
          'customers', 'tables', 'cashlog', 'deposits', 'taxes', 'invoices', 
          'schedules', 'apps', 'discounts', 'permissions', 'batches'
        ];
        stores.forEach(s => {
          if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async seed() {
    const d = await this.init();
    const stores = {
      employees: MOCK_EMPLOYEES,
      inventory: MOCK_INVENTORY_ITEMS,
      categories: MOCK_CATEGORIES,
      tables: MOCK_FLOOR_TABLES
    };
    for (const [name, data] of Object.entries(stores)) {
      const tx = d.transaction(name, 'readwrite');
      const store = tx.objectStore(name);
      const count = await new Promise(res => {
          const req = store.count();
          req.onsuccess = () => res(req.result);
      });
      if (count === 0) {
          data.forEach(item => store.put(item));
      }
    }
  },

  async getAll<T>(storeName: string): Promise<T[]> {
    const d = await this.init();
    return new Promise((resolve) => {
      const tx = d.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async put(storeName: string, item: any): Promise<void> {
    const d = await this.init();
    const tx = d.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
  },

  async delete(storeName: string, id: string): Promise<void> {
    const d = await this.init();
    const tx = d.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
  }
};
