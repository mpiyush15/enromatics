import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";
const FETCH_TIMEOUT = 20000; // 20 second timeout

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🎯 Applying offer:", code);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers/apply/${code}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
          "User-Agent": "Pixels-BFF/1.0",
        },
        body: JSON.stringify(body),
        credentials: "include",
      },
      FETCH_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to apply offer",
        },
        { status: response.status }
      );
    }

    console.log("[BFF] ✅ Offer applied successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error applying offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to apply offer",
      },
      { status: 500 }
    );
  }
}
