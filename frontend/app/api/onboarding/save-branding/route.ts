import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, instituteName, subdomain, logoUrl, themeColor, whatsappNumber } = body;

    if (!tenantId || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend to save branding
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tenants/${tenantId}/branding`;
    const options = buildBackendFetchOptions(req, 'POST', {
      branding: {
        logoUrl,
        themeColor,
        whatsappNumber,
      },
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
    console.error('Save branding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
