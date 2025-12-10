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
    const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
    const backendUrl = `${EXPRESS_BACKEND_URL}/api/tenants/${tenantId}/branding`;
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
      let error;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        error = await res.json();
      } else {
        const text = await res.text();
        console.error('Backend returned non-JSON:', text.substring(0, 500));
        error = { error: `Backend error (${res.status}): ${text.substring(0, 100)}` };
      }
      console.error('Save branding backend error:', error);
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
