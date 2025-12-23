import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

// PATCH /api/scholarship-rewards/[rewardId]/status - Update reward status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
  try {
    // Headers now built with buildBFFHeaders() including subdomain
    const body = await request.json();
    const { rewardId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/scholarship-rewards/${rewardId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship reward status update BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update reward status" },
      { status: 500 }
    );
  }
}
