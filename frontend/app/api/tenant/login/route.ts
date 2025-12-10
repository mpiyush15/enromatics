import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, subdomain } = body;

    if (!email || !password || !subdomain) {
      return NextResponse.json(
        { error: 'Email, password, and subdomain are required' },
        { status: 400 }
      );
    }

    // Call backend to authenticate tenant user
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tenants/authenticate`;
    const options = buildBackendFetchOptions(req, 'POST', {
      email,
      password,
      subdomain,
    });

    const res = await fetch(backendUrl, options);

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Tenant login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
