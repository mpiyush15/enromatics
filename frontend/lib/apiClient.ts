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
/**
 * Get subdomain from current hostname
 * e.g., "client" from "client.enromatics.com" or "client.localhost:3000"
 */
function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Check if it's a subdomain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For localhost, subdomain would be in format: client.localhost:3000
    // so we just need to check the port part separately
    return null;
  }
  
  // If more than 2 parts (e.g., client.enromatics.com = 3 parts)
  if (parts.length > 2) {
    return parts[0]; // Return the subdomain part
  }
  
  return null;
}

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
    // Get token from multiple sources:
    // 1. localStorage (if available)
    // 2. Cookies (via fetch credentials: 'include')
    // 3. Session storage (fallback)
    let token = null;
    
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge any additional headers from options
    if (fetchOptions.headers && typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
      Object.assign(headers, fetchOptions.headers);
    }

    // 🏢 Add subdomain header if accessing from a subdomain
    const subdomain = getSubdomain();
    if (subdomain) {
      headers['X-Tenant-Subdomain'] = subdomain;
      console.log('🏢 Added subdomain header:', subdomain);
    }

    // Add Authorization header if token exists
    if (token && !skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Added Authorization header from storage');
    } else if (!skipAuth) {
      console.warn('⚠️ No auth token found - relying on cookies via credentials: include');
    }

    const response = await fetch(fullUrl, {
      credentials: skipAuth ? 'omit' : 'include',
      headers,
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

    // Handle error responses - but don't throw, let the calling code handle it
    if (!response.ok) {
      const errorMessage = 
        data?.error || 
        data?.message || 
        `API Error: ${response.status} ${response.statusText}`;
      
      console.warn(`[apiClient] ${response.status} error:`, errorMessage);
      
      // Return error response instead of throwing
      // This allows fallback data in frontend hooks
      return {
        status: response.status,
        error: errorMessage,
        data: null
      } as any;
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
