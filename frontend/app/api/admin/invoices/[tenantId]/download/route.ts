import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    // Get cookie header from request
    const cookieHeader = request.headers.get('cookie');

    if (!cookieHeader || !cookieHeader.includes('jwt=')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/invoices/${tenantId}/download`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Return the PDF blob
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${tenantId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice download API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
