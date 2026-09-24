export class DataRepository<T extends { id: string }> {
  private collectionName: string;
  private storageKey: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.storageKey = `newgate_repo_${collectionName}`;
  }

  private getItems(): T[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private saveItems(items: T[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
      }
    } catch {
      // Fallback
    }
  }

  async upsert(entity: T): Promise<void> {
    const items = this.getItems();
    const idx = items.findIndex((item) => item.id === entity.id);
    if (idx >= 0) {
      items[idx] = entity;
    } else {
      items.push(entity);
    }
    this.saveItems(items);
  }

  async findById(id: string): Promise<T | null> {
    const items = this.getItems();
    const found = items.find((item) => item.id === id);
    return found || null;
  }

  async find(query?: { limit?: number }): Promise<T[]> {
    const items = this.getItems();
    if (query?.limit) {
      return items.slice(0, query.limit);
    }
    return items;
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter((item) => item.id !== id);
    this.saveItems(items);
  }
}
