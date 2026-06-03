interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class GlobalCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly TTL = 10 * 60 * 1000;

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  clearKey(key: string): void {
    this.cache.delete(key);
  }
}

export const globalCache = new GlobalCache();
