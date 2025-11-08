import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accessToken, facebookUserId } = await req.json();

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  // Update user with Facebook Business connection
  await db.collection("users").updateOne(
    { tenantId: session.user.tenantId },
    {
      $set: {
        "facebookBusiness.connected": true,
        "facebookBusiness.facebookUserId": facebookUserId,
        "facebookBusiness.accessToken": accessToken, // TODO: Encrypt this
        "facebookBusiness.tokenExpiry": new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        "facebookBusiness.permissions": session.facebookPermissions || [],
        "facebookBusiness.connectedAt": new Date(),
      }
    }
  );

  return NextResponse.json({ success: true });
}
