import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function GET(req: NextRequest) {
  try {
    const subdomain = req.nextUrl.searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Missing subdomain parameter' },
        { status: 400 }
      );
    }

    // Call backend to fetch tenant by subdomain
    const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
    const backendUrl = `${EXPRESS_BACKEND_URL}/api/tenants/by-subdomain/${subdomain}`;
    const options = buildBackendFetchOptions(req, 'GET');

    const res = await fetch(backendUrl, options);

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch branding by subdomain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
