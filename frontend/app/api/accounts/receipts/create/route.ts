/**
 * BFF Route: /api/accounts/receipts/create
 * Proxies to Express backend: POST /api/accounts/receipts/create
 * 
 * Purpose: Create payment with receipt
 */

import { NextRequest, NextResponse } from "next/server";
import { invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';

    const backendUrl = new URL("/api/accounts/receipts/create", BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    console.log('[BFF] Create Payment with Receipt - Request:', { 
      tenantId, 
      studentId: body.studentId,
      amount: body.amount 
    });

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    
    console.log('[BFF] Backend response:', { 
      status: backendResponse.status, 
      success: data.success,
      message: data.message 
    });
    
    // Invalidate cache after mutation
    if (backendResponse.ok && tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Receipts cache invalidated after create');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Create Receipt error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
