import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

// DELETE /api/scholarship-rewards/[rewardId] - Delete reward
export async function DELETE(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
  try {
    // Headers now built with buildBFFHeaders() including subdomain
    const { rewardId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/scholarship-rewards/${rewardId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship reward delete BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete reward" },
      { status: 500 }
    );
  }
}
