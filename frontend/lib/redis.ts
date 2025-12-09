/**
 * Redis Cache Utility for BFF Layer
 * 
 * Features:
 * - Upstash Redis / Redis Cloud compatible
 * - Automatic fallback to in-memory cache if Redis unavailable
 * - Connection pooling and error handling
 * - TTL-based caching with pattern invalidation
 * 
 * Setup:
 * 1. Sign up at https://upstash.com (free tier: 10K requests/day)
 * 2. Create a Redis database
 * 3. Add REDIS_URL to your .env.local
 * 
 * @example
 * REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
 */

import Redis from 'ioredis';

// ============================================
// Types
// ============================================

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RedisCache {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, data: T, ttlMs?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  delPattern: (pattern: string) => Promise<number>;
  clear: () => Promise<void>;
  isConnected: () => boolean;
  getStats: () => { type: 'redis' | 'memory'; keys: number };
}

// ============================================
// In-Memory Fallback Cache
// ============================================

class MemoryCache implements RedisCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    // Limit cache size to prevent memory issues
    if (this.cache.size > 1000) {
      this.cleanup();
      // If still too large, remove oldest entries
      if (this.cache.size > 800) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, 200).forEach(([k]) => this.cache.delete(k));
      }
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<number> {
    let deleted = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    return deleted;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  isConnected(): boolean {
    return true; // Memory cache is always "connected"
  }

  getStats() {
    return {
      type: 'memory' as const,
      keys: this.cache.size,
    };
  }
}

// ============================================
// Redis Cache Implementation
// ============================================

class RedisCacheImpl implements RedisCache {
  private client: Redis | null = null;
  private connected = false;
  private fallback = new MemoryCache();
  private connectionAttempted = false;

  constructor() {
    this.initConnection();
  }

  private async initConnection() {
    if (this.connectionAttempted) return;
    this.connectionAttempted = true;

    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('[Redis] No REDIS_URL found, using in-memory cache fallback');
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.log('[Redis] Max retries reached, falling back to memory cache');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
        enableReadyCheck: true,
        connectTimeout: 5000,
      });

      this.client.on('connect', () => {
        console.log('[Redis] ✅ Connected successfully');
        this.connected = true;
      });

      this.client.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
        this.connected = false;
      });

      this.client.on('close', () => {
        console.log('[Redis] Connection closed');
        this.connected = false;
      });

      // Try to connect
      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Failed to initialize:', error);
      this.connected = false;
    }
  }

  private getClient(): Redis | null {
    if (this.connected && this.client) {
      return this.client;
    }
    return null;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    
    if (!client) {
      return this.fallback.get<T>(key);
    }

    try {
      const data = await client.get(key);
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('[Redis] Get error:', error);
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    const client = this.getClient();
    const ttlSeconds = Math.floor(ttlMs / 1000);

    // Always set in fallback for redundancy
    await this.fallback.set(key, data, ttlMs);

    if (!client) {
      return;
    }

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('[Redis] Set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    await this.fallback.del(key);

    const client = this.getClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      console.error('[Redis] Del error:', error);
    }
  }

  async delPattern(pattern: string): Promise<number> {
    let deleted = await this.fallback.delPattern(pattern);

    const client = this.getClient();
    if (!client) return deleted;

    try {
      // Use SCAN to find keys matching pattern (safe for production)
      let cursor = '0';
      const keysToDelete: string[] = [];
      
      do {
        const [newCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = newCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await client.del(...keysToDelete);
        deleted = keysToDelete.length;
      }
    } catch (error) {
      console.error('[Redis] DelPattern error:', error);
    }

    return deleted;
  }

  async clear(): Promise<void> {
    await this.fallback.clear();

    const client = this.getClient();
    if (!client) return;

    try {
      await client.flushdb();
    } catch (error) {
      console.error('[Redis] Clear error:', error);
    }
  }

  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  getStats() {
    return {
      type: this.connected ? 'redis' as const : 'memory' as const,
      keys: this.fallback.getStats().keys, // Memory cache count as approximation
    };
  }
}

// ============================================
// Singleton Export
// ============================================

// Create a singleton instance
let cacheInstance: RedisCache | null = null;

export function getCache(): RedisCache {
  if (!cacheInstance) {
    // In development without Redis, use memory cache
    // In production, try Redis first
    if (process.env.REDIS_URL) {
      cacheInstance = new RedisCacheImpl();
    } else {
      cacheInstance = new MemoryCache();
    }
  }
  return cacheInstance;
}

// Export the cache instance for direct use
export const redisCache = {
  get: async <T>(key: string): Promise<T | null> => getCache().get<T>(key),
  set: async <T>(key: string, data: T, ttlMs?: number): Promise<void> => getCache().set(key, data, ttlMs),
  del: async (key: string): Promise<void> => getCache().del(key),
  delPattern: async (pattern: string): Promise<number> => getCache().delPattern(pattern),
  clear: async (): Promise<void> => getCache().clear(),
  isConnected: (): boolean => getCache().isConnected(),
  getStats: () => getCache().getStats(),
};

// ============================================
// Cache Key Helpers
// ============================================

export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD_OVERVIEW: (tenantId: string) => `dashboard:overview:${tenantId}`,
  
  // Students
  STUDENTS_LIST: (tenantId: string, query: string) => `students:list:${tenantId}:${query}`,
  STUDENT_DETAIL: (tenantId: string, id: string) => `students:detail:${tenantId}:${id}`,
  
  // Staff
  STAFF_LIST: (tenantId: string, query: string) => `staff:list:${tenantId}:${query}`,
  STAFF_DETAIL: (tenantId: string, id: string) => `staff:detail:${tenantId}:${id}`,
  
  // Batches
  BATCHES_LIST: (tenantId: string) => `batches:list:${tenantId}`,
  
  // Accounts
  ACCOUNTS_OVERVIEW: (tenantId: string, query: string) => `accounts:overview:${tenantId}:${query}`,
  EXPENSES_LIST: (tenantId: string, query: string) => `expenses:list:${tenantId}:${query}`,
  RECEIPTS_LIST: (tenantId: string, query: string) => `receipts:list:${tenantId}:${query}`,
  
  // WhatsApp
  WHATSAPP_STATS: (tenantId: string) => `whatsapp:stats:${tenantId}`,
  WHATSAPP_CONTACTS: (tenantId: string, query: string) => `whatsapp:contacts:${tenantId}:${query}`,
  WHATSAPP_TEMPLATES: (tenantId: string) => `whatsapp:templates:${tenantId}`,
  
  // Social Media
  SOCIAL_INSIGHTS: (tenantId: string) => `social:insights:${tenantId}`,
  
  // Settings
  TENANT_PROFILE: (tenantId: string) => `settings:profile:${tenantId}`,
  SIDEBAR_CONFIG: (tenantId: string) => `settings:sidebar:${tenantId}`,
};

// Cache TTL presets (in milliseconds)
export const CACHE_TTL = {
  VERY_SHORT: 30 * 1000,        // 30 seconds - real-time data
  SHORT: 2 * 60 * 1000,         // 2 minutes - frequently updated
  MEDIUM: 5 * 60 * 1000,        // 5 minutes - standard data
  LONG: 10 * 60 * 1000,         // 10 minutes - stable data
  VERY_LONG: 30 * 60 * 1000,    // 30 minutes - rarely changes
  HOUR: 60 * 60 * 1000,         // 1 hour - config/static data
};

// ============================================
// Cache Invalidation Helpers
// ============================================

/**
 * Invalidate all cache entries for a tenant
 */
export async function invalidateTenantCache(tenantId: string): Promise<number> {
  return redisCache.delPattern(`*:${tenantId}:*`);
}

/**
 * Invalidate cache after student mutation
 */
export async function invalidateStudentCache(tenantId: string): Promise<void> {
  await Promise.all([
    redisCache.delPattern(`students:*:${tenantId}:*`),
    redisCache.delPattern(`dashboard:*:${tenantId}*`),
  ]);
}

/**
 * Invalidate cache after staff mutation
 */
export async function invalidateStaffCache(tenantId: string): Promise<void> {
  await Promise.all([
    redisCache.delPattern(`staff:*:${tenantId}:*`),
    redisCache.delPattern(`dashboard:*:${tenantId}*`),
  ]);
}

/**
 * Invalidate cache after account/payment mutation
 */
export async function invalidateAccountsCache(tenantId: string): Promise<void> {
  await Promise.all([
    redisCache.delPattern(`accounts:*:${tenantId}:*`),
    redisCache.delPattern(`dashboard:*:${tenantId}*`),
    redisCache.delPattern(`receipts:*:${tenantId}:*`),
    redisCache.delPattern(`expenses:*:${tenantId}:*`),
  ]);
}

/**
 * Invalidate cache after settings change
 */
export async function invalidateSettingsCache(tenantId: string): Promise<void> {
  await Promise.all([
    redisCache.delPattern(`settings:*:${tenantId}*`),
    redisCache.delPattern(`sidebar:*:${tenantId}*`),
  ]);
}

export default redisCache;
