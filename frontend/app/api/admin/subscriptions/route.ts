import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    // Get Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    console.log('🔐 BFF subscriptions - Token present:', !!token);

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized - no token' }, { status: 401 });
    }

    console.log('📤 Forwarding to backend:', `${EXPRESS_BACKEND_URL}/api/payments/admin/subscriptions`);

    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/payments/admin/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // ✅ Forward Bearer token to backend
      },
    });

    console.log('📥 Backend response status:', response.status);
    
    const data = await response.json();
    console.log('📥 Backend response data:', { success: data.success, paymentCount: data.payments?.length });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Admin subscriptions API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
