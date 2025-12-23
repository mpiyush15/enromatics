/**
 * BFF Route: /api/accounts/receipts/generate/[paymentId]
 * Proxies to Express backend: POST /api/accounts/receipts/generate/:paymentId
 * 
 * Purpose: Generate receipt for existing payment
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { invalidateAccountsCache } from '@/lib/redis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId') || '';
    const paymentId = params.paymentId;

    const backendUrl = new URL(`/api/accounts/receipts/generate/${paymentId}`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    console.log('[BFF] Generate Receipt - Payment ID:', paymentId);

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
    
    // Invalidate cache after mutation
    if (backendResponse.ok && tenantId) {
      await invalidateAccountsCache(tenantId);
      console.log('[BFF] Receipts cache invalidated after generate');
    }
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Generate Receipt error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
