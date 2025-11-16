/**
 * Client-side caching utility with TTL (Time To Live)
 * Caches API responses in sessionStorage for faster page loads
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export const cache = {
  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },

  /**
   * Remove specific cache entry
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },

  /**
   * Clear all cache
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  },

  /**
   * Clear all cache entries matching a pattern
   */
  clearPattern(pattern: string): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes(pattern)) {
        sessionStorage.removeItem(key);
      }
    });
  },
};

/**
 * Cache keys for different resources
 */
export const CACHE_KEYS = {
  AUTH_USER: 'auth:user',
  AUTH_SESSION: 'auth:session',
  DASHBOARD_STATS: 'dashboard:stats',
  STUDENTS_LIST: 'students:list',
  TENANTS_LIST: 'tenants:list',
  ATTENDANCE: (date: string) => `attendance:${date}`,
  PAYMENTS: (studentId: string) => `payments:${studentId}`,
};

/**
 * Cache TTL presets (in milliseconds)
 */
export const CACHE_TTL = {
  VERY_SHORT: 30 * 1000,      // 30 seconds
  SHORT: 2 * 60 * 1000,        // 2 minutes
  MEDIUM: 5 * 60 * 1000,       // 5 minutes
  LONG: 15 * 60 * 1000,        // 15 minutes
  VERY_LONG: 60 * 60 * 1000,   // 1 hour
};
