import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("forteStudioz"); // Make sure this matches your DB name

    // Optional: list collections in this DB
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      status: "connected",
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { status: "error", message: "MongoDB connection failed" },
      { status: 500 }
    );
  }
}