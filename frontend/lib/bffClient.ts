/**
 * BFF Client Utility
 * 
 * Handles all calls from BFF routes to Express backend
 * Automatically forwards cookies and headers
 * Used ONLY on server-side (BFF routes)
 */

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

if (!EXPRESS_BACKEND_URL) {
  throw new Error('EXPRESS_BACKEND_URL environment variable is required');
}

interface BFFRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cookies?: string;
}

/**
 * Call Express backend from BFF route
 * 
 * @param endpoint - Express API endpoint (e.g., '/api/auth/login')
 * @param options - Request options
 * @returns Response from Express backend
 */
export async function callExpressBackend(
  endpoint: string,
  options: BFFRequestOptions = {}
) {
  const {
    method = 'GET',
    headers = {},
    body,
    cookies = '',
  } = options;

  const url = `${EXPRESS_BACKEND_URL}${endpoint}`;

  // Build headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Forward cookies if provided
  if (cookies) {
    finalHeaders['Cookie'] = cookies;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Include cookies in backend calls
    });

    return response;
  } catch (error) {
    console.error(`❌ BFF Error calling ${url}:`, error);
    throw error;
  }
}

/**
 * Extract cookies from incoming request
 */
export function extractCookies(request: Request): string {
  return request.headers.get('cookie') || '';
}

/**
 * Forward response cookies from Express to browser
 */
export function forwardResponseCookies(response: Response): Response {
  // Get all Set-Cookie headers from Express response
  const setCookieHeaders = response.headers.getSetCookie?.();
  
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    // Create new response with original body
    const newResponse = new Response(response.body, response);
    
    // Add all Set-Cookie headers to new response
    setCookieHeaders.forEach((cookie) => {
      newResponse.headers.append('Set-Cookie', cookie);
    });
    
    return newResponse;
  }

  return response;
}
