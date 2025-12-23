import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("[BFF] Calling migration endpoint to fix scholarship students");

    const response = await fetch(`${BACKEND_URL}/api/students/fix-scholarship-enrollments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${authToken}`,
      },
    });

    const data = await response.json();

    console.log("[BFF] Migration response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[BFF] Migration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to run migration", error: error.message },
      { status: 500 }
    );
  }
}
