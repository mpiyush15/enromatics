/**
 * 🔒 UNIFIED API CLIENT - SSOT Enforcement
 * 
 * This is the ONLY way frontend should communicate with backend.
 * All pages must use this client - NO direct fetch() calls allowed.
 * 
 * Part of: stabilization/ssot-bff
 * Created: 21 Dec 2025
 */

import { API_BASE_URL } from './apiConfig';

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

/**
 * Unified API client with:
 * - Automatic credential inclusion
 * - Consistent error handling
 * - Response normalization
 * - Timeout support
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, timeout = 30000, ...fetchOptions } = options;

  // ✅ Smart routing: If endpoint starts with /api/, use BFF (same domain)
  // Otherwise, use backend directly
  let fullUrl: string;
  
  if (endpoint.startsWith('/api/')) {
    // Use local BFF routes (same domain - no CORS needed)
    // This covers ALL /api/* endpoints: whatsapp, dashboard, auth, etc.
    fullUrl = endpoint;
    console.log('🔗 BFF Request (local):', { method: fetchOptions.method || 'GET', url: fullUrl });
  } else {
    // Use backend directly for endpoints without /api/ prefix
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    fullUrl = `${baseUrl}${cleanEndpoint}`;
    console.log('🔗 Backend Request:', { method: fetchOptions.method || 'GET', url: fullUrl });
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      credentials: skipAuth ? 'omit' : 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
      signal: controller.signal,
      ...fetchOptions,
    });

    clearTimeout(timeoutId);

    // Try to parse JSON response
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // Non-JSON response (e.g., file download)
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = 
        data?.error || 
        data?.message || 
        `API Error: ${response.status} ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    // Return normalized data
    // If response has a 'data' field, unwrap it
    return (data?.data !== undefined ? data.data : data) as T;

  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { method: 'GET', ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { method: 'DELETE', ...options }),
};

/**
 * Type-safe error handling wrapper
 * 
 * Usage:
 * const [data, error] = await safeApiCall(() => api.get('/endpoint'));
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await apiCall();
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
