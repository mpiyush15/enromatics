import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Make sure you get the session

    if (!session || !session.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      facebookFollowers,
      facebookLikes,
      instagramFollowers,
      instagramLikes,
    } = await req.json();

    const client = await clientPromise;
    const db = client.db("forteStudioz");

    await db.collection("socialStats").updateOne(
      { tenantId: session.user.tenantId, userId }, // <-- Use both tenantId and userId
      {
        $set: {
          facebook: {
            followers: Number(facebookFollowers),
            likes: Number(facebookLikes),
          },
          instagram: {
            followers: Number(instagramFollowers),
            likes: Number(instagramLikes),
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}