import { NextRequest, NextResponse } from 'next/server';
import { extractJwtToken, getBackendUrl, createBackendHeaders } from '@/lib/bff-jwt-helper';

export async function GET(request: NextRequest) {
  try {
    // ✅ Extract JWT token (from Authorization header or cookies)
    const token = extractJwtToken(request);
    
    if (!token) {
      console.warn('❌ No JWT token found');
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // ✅ Get backend URL and forward request
    const backendUrl = `${getBackendUrl()}/api/analytics/dashboard`;
    console.log('📤 Forwarding to backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: createBackendHeaders(token),
      credentials: 'include',
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Backend returned error:', response.status, data);
    } else {
      console.log('✅ Analytics data fetched successfully');
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ BFF Analytics Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
