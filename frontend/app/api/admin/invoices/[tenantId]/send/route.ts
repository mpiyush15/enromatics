import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    // Headers now built with buildBFFHeaders() including subdomain

    if (!cookieHeader || !cookieHeader.includes('token=')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/invoices/${tenantId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Invoice send API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
