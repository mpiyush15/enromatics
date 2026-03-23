/**
 * 🔄 useConsistentData Hook
 * Universal hook for all modules ensuring consistency promise
 * ✅ Single source of truth with unified cache
 * ✅ Automatic invalidation on related events
 * ✅ Real-time sync across all components
 * ✅ Multi-tenant isolation enforced
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { syncManager, CACHE_KEYS, SYNC_EVENTS, fetchWithCacheAndSync } from '@/lib/syncManager';
import { api } from '@/lib/apiClient';
import useAuth from './useAuth';

interface UseConsistentDataOptions<T> {
  endpoint: string;
  cacheKey: string;
  fallbackData?: T;
  ttl?: number;
  syncEvents?: string[]; // Events that invalidate this cache
  autoRefreshInterval?: number; // Milliseconds between auto-refreshes
  skipCache?: boolean; // Force fetch even if cached
}

/**
 * Universal hook for fetching data with consistency guarantees
 * 
 * Usage:
 * const { data, loading, error, refresh } = useConsistentData({
 *   endpoint: '/api/institute/kpis',
 *   cacheKey: CACHE_KEYS.KPI,
 *   fallbackData: MOCK_DATA.kpi,
 *   syncEvents: [SYNC_EVENTS.STUDENT_CREATED, SYNC_EVENTS.STUDENT_UPDATED]
 * });
 */
export function useConsistentData<T = any>(options: UseConsistentDataOptions<T>) {
  const { user } = useAuth();
  const {
    endpoint,
    cacheKey,
    fallbackData,
    ttl,
    syncEvents = [],
    autoRefreshInterval,
    skipCache = false,
  } = options;

  const [data, setData] = useState<T>(fallbackData || ({} as T));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!user?.tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache if not skipping
      if (!skipCache) {
        const cached = syncManager.getCached<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          setIsSynced(true);
          return;
        }
      }

      // Fetch from API
      const response = await api.get(endpoint);
      const result = response.data?.data || response.data || fallbackData || ({} as T);

      // Cache the result
      syncManager.setCached(cacheKey, result, ttl);
      setData(result);
      setIsSynced(true);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to fetch data';
      setError(errorMsg);
      console.error(`Error fetching ${endpoint}:`, err);
      
      // Fall back to cached data
      const cached = syncManager.getCached<T>(cacheKey);
      if (cached) {
        setData(cached);
        setIsSynced(true);
      } else if (fallbackData) {
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey, user?.tenantId, fallbackData, ttl, skipCache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to sync events
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    syncEvents.forEach(event => {
      const unsubscribe = syncManager.on(event, () => {
        // Invalidate cache and refresh
        syncManager.invalidate(cacheKey);
        fetchData();
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [cacheKey, syncEvents, fetchData]);

  // Auto-refresh if interval specified
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const timer = setInterval(() => {
      fetchData();
    }, autoRefreshInterval);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    isSynced,
    refresh: () => {
      syncManager.invalidate(cacheKey);
      return fetchData();
    },
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE) with automatic cache invalidation
 * 
 * Usage:
 * const { mutate, loading, error } = useConsistentMutation({
 *   endpoint: '/api/enquiries',
 *   method: 'POST',
 *   invalidateCaches: [CACHE_KEYS.ALL_ENQUIRIES, CACHE_KEYS.ENQUIRY_STATS],
 *   syncEvent: SYNC_EVENTS.LEAD_CREATED
 * });
 * 
 * await mutate({ name: 'John', email: 'john@example.com' });
 */
export function useConsistentMutation(options: {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  invalidateCaches?: string[];
  syncEvent?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const {
    endpoint,
    method = 'POST',
    invalidateCaches = [],
    syncEvent,
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload?: any, customEndpoint?: string) => {
      try {
        setLoading(true);
        setError(null);

        const url = customEndpoint || endpoint;
        let response;

        if (method === 'POST') {
          response = await api.post(url, payload);
        } else if (method === 'PUT') {
          response = await api.put(url, payload);
        } else if (method === 'DELETE') {
          response = await api.delete(url);
        } else if (method === 'PATCH') {
          response = await api.patch(url, payload);
        }

        const result = response?.data?.data || response?.data;

        // Invalidate caches
        if (invalidateCaches.length > 0) {
          syncManager.invalidate(invalidateCaches);
        }

        // Emit sync event
        if (syncEvent) {
          syncManager.emit(syncEvent, result);
        }

        // Call success callback
        onSuccess?.(result);

        return result;
      } catch (err: any) {
        const errorMsg = err?.message || `Failed to ${method}`;
        setError(errorMsg);
        console.error(`Error in ${method} ${endpoint}:`, err);

        // Call error callback
        onError?.(err);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, invalidateCaches, syncEvent, onSuccess, onError]
  );

  return { mutate, loading, error };
}

/**
 * Hook for real-time subscription to cache changes
 * 
 * Usage:
 * const { data } = useRealtimeCache(CACHE_KEYS.KPI);
 */
export function useRealtimeCache<T>(cacheKey: string): { data: T | null } {
  const [data, setData] = useState<T | null>(syncManager.getCached<T>(cacheKey));

  useEffect(() => {
    // Check cache on mount
    const cached = syncManager.getCached<T>(cacheKey);
    setData(cached);

    // Subscribe to any changes
    const handleChange = () => {
      const updated = syncManager.getCached<T>(cacheKey);
      setData(updated);
    };

    // This is a simple polling approach - in production, use WebSockets
    const timer = setInterval(handleChange, 1000);

    return () => clearInterval(timer);
  }, [cacheKey]);

  return { data };
}

/**
 * Hook to manually trigger cache invalidation and full refresh
 * 
 * Usage:
 * const invalidateAll = useSyncRefresh();
 * invalidateAll();
 */
export function useSyncRefresh() {
  return useCallback(() => {
    syncManager.emit(SYNC_EVENTS.FORCE_REFRESH);
  }, []);
}

export default useConsistentData;
