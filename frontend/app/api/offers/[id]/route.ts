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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🔍 Fetching offer:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
          "User-Agent": "Pixels-BFF/1.0",
        },
        credentials: "include",
      },
      FETCH_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to fetch offer",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch offer",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 📝 Updating offer:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers/${id}`,
      {
        method: "PUT",
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
          message: data.message || "Failed to update offer",
        },
        { status: response.status }
      );
    }

    console.log("[BFF] ✅ Offer updated successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error updating offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update offer",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🗑️ Deleting offer:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
          "User-Agent": "Pixels-BFF/1.0",
        },
        credentials: "include",
      },
      FETCH_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to delete offer",
        },
        { status: response.status }
      );
    }

    console.log("[BFF] ✅ Offer deleted successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error deleting offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to delete offer",
      },
      { status: 500 }
    );
  }
}
