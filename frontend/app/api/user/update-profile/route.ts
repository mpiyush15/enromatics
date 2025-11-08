import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  await db.collection("users").updateOne(
    { email: session.user.email },
    {
      $set: {
        facebookPage: data.facebookPage,
        instagramHandle: data.instagramHandle,
        whatsappNumber: data.whatsappNumber,
      },
    }
  );

  return NextResponse.json({ success: true });
}