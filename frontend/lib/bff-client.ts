/**
 * BFF Client Utility
 * Handles internal Express backend calls from BFF routes
 * This is ONLY used by BFF routes (backend), not by frontend components
 */

interface BFFCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cookies?: string;
}

/**
 * Call Express backend from BFF routes
 * Automatically forwards cookies for authentication
 */
export async function callExpressBackend(
  endpoint: string,
  options: BFFCallOptions = {}
) {
  const {
    method = 'GET',
    headers = {},
    body,
    cookies = ''
  } = options;

  const expressUrl = process.env.EXPRESS_BACKEND_URL;
  if (!expressUrl) {
    throw new Error('EXPRESS_BACKEND_URL not configured');
  }

  const url = `${expressUrl}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      // Forward cookies for authentication
      ...(cookies && { 'Cookie': cookies })
    }
  };

  // Add body if present
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Get response data
    const data = await response.json();

    // If error from Express, throw it
    if (!response.ok) {
      const error = new Error(data.message || `Express error: ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`BFF Error calling ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Extract cookies from request headers
 * Used to forward cookies to Express backend
 */
export function extractCookies(req: Request): string {
  return req.headers.get('cookie') || '';
}
