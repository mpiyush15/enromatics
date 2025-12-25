/**
 * BFF Route: /api/accounts/expenses-trend
 * Proxies to Express backend: GET /api/accounts/expenses-trend
 * 
 * Purpose: Fetch expense trend data grouped by period (monthly/quarterly/annual)
 * Cache: No cache (real-time data)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enromatics.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const url = `${API_URL}/api/accounts/expenses-trend${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Return with no-cache headers for real-time data
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('BFF Error fetching expenses trend:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to fetch expenses trend data',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
