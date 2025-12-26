import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";
const FETCH_TIMEOUT = 20000;

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

// GET /api/subscription-plans/[id] - Get single plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🔍 Fetching plan:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans/${id}`,
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
          message: data.message || "Plan not found",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching plan:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch plan",
      },
      { status: 500 }
    );
  }
}

// PUT /api/subscription-plans/[id] - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] ✏️ Updating plan:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans/${id}`,
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
          message: data.message || "Failed to update plan",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error updating plan:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update plan",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/subscription-plans/[id] - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🗑️ Deleting plan:", id);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans/${id}`,
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
          message: data.message || "Failed to delete plan",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error deleting plan:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to delete plan",
      },
      { status: 500 }
    );
  }
}
