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

    console.log("[BFF] ✅ Validating offer:", code);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers/validate/${code}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          message: data.message || "Failed to validate offer",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error validating offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to validate offer",
      },
      { status: 500 }
    );
  }
}
