import { NextResponse } from "next/server";

// Deprecated: frontend-side Facebook connect handler has been removed.
// Use backend endpoints instead: GET /api/facebook/connect and GET /api/facebook/callback
// Backend will handle the OAuth flow and persist tokens securely.

export async function POST() {
  return NextResponse.json({ message: "Deprecated. Use backend /api/facebook/connect" }, { status: 410 });
}
