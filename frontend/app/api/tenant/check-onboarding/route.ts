import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    // Call backend to check onboarding status
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tenants/${tenantId}/check-onboarding`;
    const options = buildBackendFetchOptions(req, 'GET');

    const res = await fetch(backendUrl, options);

    if (!res.ok) {
      // If tenant not found, assume it needs onboarding
      if (res.status === 404) {
        return NextResponse.json({ needsOnboarding: true });
      }
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Check onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
