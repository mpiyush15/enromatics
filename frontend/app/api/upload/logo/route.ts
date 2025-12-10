import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Forward the multipart form data to backend
  const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
  // Backend's upload route is mounted under /api/tenants (see backend/src/server.js -> app.use('/api/tenants', tenantRoutes))
  // So the full backend path for logo upload is /api/tenants/upload/logo
  const backendUrl = `${EXPRESS_BACKEND_URL}/api/tenants/upload/logo`;
    
    const headers: HeadersInit = {};
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      // Try to parse as JSON, fallback to text if HTML error
      let errorData;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await res.json();
      } else {
        const text = await res.text();
        console.error('Backend returned non-JSON response:', text.substring(0, 500));
        errorData = { error: `Upload failed with status ${res.status}: ${text.substring(0, 100)}` };
      }
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
