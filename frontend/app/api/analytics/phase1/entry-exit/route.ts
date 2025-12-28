import { NextRequest, NextResponse } from 'next/server';
import { extractJwtToken, getBackendUrl, createBackendHeaders } from '@/lib/bff-jwt-helper';

const BACKEND_URL = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = extractJwtToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const timeRange = searchParams.get('timeRange') || 'today';
    const limit = searchParams.get('limit') || '10';

    const response = await fetch(
      `${BACKEND_URL}/api/analytics/phase1/entry-exit?timeRange=${timeRange}&limit=${limit}`,
      {
        method: "GET",
        headers: createBackendHeaders(token),
        cache: "no-store",
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Entry/exit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
