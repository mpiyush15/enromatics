import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * POST /api/whatsapp/templates/sync
 * Sync WhatsApp templates from Meta platform
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Syncing templates from WhatsApp Platform for tenant: ${tenantId}`);

    const backendUrl = getApiUrl('/api/whatsapp/templates/sync');
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Pass auth and cookies from request
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tenantId }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Backend returned ${response.status}:`, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`✅ Synced ${data.syncedCount || 0} templates from WhatsApp Platform`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error syncing templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
