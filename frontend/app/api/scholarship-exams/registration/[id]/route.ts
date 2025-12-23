/**
 * BFF Route: /api/scholarship-exams/registration/[id]
 * Proxies to Express backend: PUT /api/scholarship-exams/registration/:id
 * 
 * Purpose: Update individual registration result
 * Cache: No caching (mutation operation)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const regId = params.id;
    const backendUrl = new URL(`/api/scholarship-exams/registration/${regId}`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    console.log(`[BFF] Updating registration ${regId}:`, body);

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Update Registration PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
