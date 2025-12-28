import { NextRequest, NextResponse } from 'next/server';
import { extractJwtToken, getBackendUrl, createBackendHeaders } from '@/lib/bff-jwt-helper';

const BACKEND_URL = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const token = extractJwtToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const timeRange = searchParams.get('timeRange') || 'today';

    const response = await fetch(
      `${BACKEND_URL}/api/analytics/phase1/bounce-rate?timeRange=${timeRange}`,
      {
        method: "GET",
        headers: createBackendHeaders(token),
        cache: "no-store",
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Bounce rate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
