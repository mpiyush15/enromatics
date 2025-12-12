/**
 * useJWTFetch - Custom hook for authenticated API calls with JWT
 * Automatically adds JWT token to Authorization header
 * Works for BFF routes (/api/*) and direct backend calls
 */

export function useJWTFetch() {
  /**
   * Fetch with JWT authorization
   * @param url - API endpoint
   * @param options - Fetch options
   * @returns Response
   */
  async function fetchWithJWT(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Get JWT from localStorage
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('jwt_token')
      : null;

    // Prepare headers
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    // Add JWT if available
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('🔐 JWT token added to request');
    } else {
      console.warn('⚠️ No JWT token found');
    }

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      console.log('⚠️ Token expired or invalid');
      localStorage.removeItem('jwt_token');
      // Could trigger redirect to login here
    }

    return response;
  }

  return { fetchWithJWT };
}
