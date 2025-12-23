import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { extractCookies } from "@/lib/bff-client";

const EXPRESS_URL = process.env.EXPRESS_BACKEND_URL;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: "Backend not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${EXPRESS_URL}/api/students/${params.id}/reset-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cookie": extractCookies(request),
          "X-Tenant-Guard": "true",
        },
        body: JSON.stringify({}), // REQUIRED
      }
    );

    let data: any = {};
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Reset failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      newPassword: data.newPassword,
    });

  } catch (err) {
    console.error("❌ BFF reset-password crash:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
