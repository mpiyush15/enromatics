import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  const user = await db.collection("users").findOne(
    { email: session.user.email },
    {
      projection: {
        username: 1,
        email: 1,
        facebookPage: 1,
        instagramHandle: 1,
        whatsappNumber: 1,
        plan: 1,
        planExpiry: 1,
      },
    }
  );

  return NextResponse.json({ user });
}