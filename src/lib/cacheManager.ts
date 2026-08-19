/**
 * Efficient API Caching Manager
 * 
 * Implements multi-layer caching strategy:
 * - Memory cache for frequently accessed data
 * - TTL-based automatic expiration
 * - Request deduplication
 * - Cache invalidation patterns
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private requestDeduplicationWindow = 1000; // 1 second

  /**
   * Get cached data or fetch from provider
   * @param key - Unique cache key
   * @param ttlMs - Time to live in milliseconds
   * @param fetcher - Async function to fetch data
   * @returns Cached or fresh data
   */
  async get<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check if data is already cached and valid
    const cached = this.getCached<T>(key);
    if (cached !== undefined) {
      console.log(`[Cache HIT] ${key}`);
      return cached;
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(key)) {
      console.log(`[Cache DEDUPE] ${key}`);
      return this.pendingRequests.get(key)!.promise;
    }

    // Fetch fresh data
    console.log(`[Cache MISS] ${key}`);
    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttlMs);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    console.log(`[Cache SET] ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Get cached data if valid, undefined otherwise
   */
  private getCached<T>(key: string): T | undefined {
    const entry = this.memoryCache.get(key);
    if (!entry) return undefined;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.memoryCache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    console.log(`[Cache INVALIDATE] ${key}`);
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    let count = 0;
    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    console.log(`[Cache INVALIDATE PATTERN] Removed ${count} entries`);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
    console.log(`[Cache CLEAR] All entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache TTL Presets (in milliseconds)
 */
export const CACHE_TTL = {
  VERY_SHORT: 10 * 1000,      // 10 seconds - for frequently changing data
  SHORT: 30 * 1000,            // 30 seconds
  MEDIUM: 5 * 60 * 1000,       // 5 minutes
  LONG: 30 * 60 * 1000,        // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for stable data
} as const;

/**
 * Cache key generator utilities
 */
export const cacheKeys = {
  googleDocs: (token: string) => `google:docs:${token}`,
  googleDocContent: (docId: string) => `google:doc:${docId}`,
  accountData: (accountId: string) => `account:${accountId}`,
  transactions: (accountId: string) => `transactions:${accountId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
};
