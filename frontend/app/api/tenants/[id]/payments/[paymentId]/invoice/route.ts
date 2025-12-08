/**
 * BFF Invoice Download Route
 * GET /api/tenants/[id]/payments/[paymentId]/invoice - Download invoice PDF
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { id: tenantId, paymentId } = await params;

    if (!tenantId || !paymentId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and Payment ID are required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(
      `${BACKEND_URL}/api/tenants/${tenantId}/payments/${paymentId}/invoice`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to get invoice" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Invoice download error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download invoice" },
      { status: 500 }
    );
  }
}
