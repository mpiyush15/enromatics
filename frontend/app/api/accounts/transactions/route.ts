import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function GET(request: NextRequest) {
  try {
    console.log("[BFF] 🔍 Fetching all transactions...");

    // Get cookies from request headers (same as overview route)
    const cookies = request.headers.get('cookie') || '';
    
    console.log("[BFF] Cookies present:", !!cookies);

    const response = await fetch(
      `${BACKEND_URL}/api/accounts/transactions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    console.log("[BFF] Transactions response:", {
      status: response.status,
      success: data.success,
      count: data.transactions?.length || 0,
      total: data.total || 0,
    });

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", {
        status: response.status,
        message: data.message
      });
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch transactions" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching transactions:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
