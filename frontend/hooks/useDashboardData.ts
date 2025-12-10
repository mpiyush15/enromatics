import useSWR from 'swr';

// 🔒 SAFE API Fetcher - Handles auth cookies and tokens
const safeFetcher = async (url: string) => {
  // Get token from localStorage (where frontend stores it after login)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(url, {
    credentials: 'include', // ✅ Include auth cookies (httpOnly)
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }), // ✅ Add Bearer token if available
    },
  });

  // Handle auth errors
  if (response.status === 401) {
    // User not authenticated - redirect will be handled by middleware or useAuth
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Custom hook for dashboard data fetching with SWR caching
 * 
 * Benefits:
 * - Automatic caching & revalidation every 30 seconds
 * - Automatic refetch on window focus
 * - Deduplication (same URL fetched once)
 * - Built-in error handling
 * 
 * ✅ SAFE for: Dashboard pages, data pages, analytics
 * ❌ NOT for: Login, auth, sensitive pages
 */
export function useDashboardData<T = any>(url: string | null, options = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url, // null if not ready to fetch
    safeFetcher,
    {
      revalidateOnFocus: false,      // Don't refetch on window focus
      revalidateOnReconnect: true,   // Refetch when network reconnects
      dedupingInterval: 30000,       // 30-second deduplication window
      focusThrottleInterval: 300000, // 5-minute focus throttle
      errorRetryCount: 2,            // Retry failed requests twice
      errorRetryInterval: 5000,      // Wait 5 seconds between retries
      ...options,
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate, // Manual revalidation function
  };
}

/**
 * Alternative: useDashboardDataWithRefresh
 * Auto-refetches every N seconds
 */
export function useDashboardDataWithRefresh<T = any>(
  url: string | null,
  refreshInterval = 30000, // 30 seconds
  options = {}
) {
  return useSWR<T>(url, safeFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: refreshInterval,
    refreshInterval, // Auto-refresh at this interval
    errorRetryCount: 2,
    errorRetryInterval: 5000,
    ...options,
  });
}
