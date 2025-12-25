/**
 * BFF Route: /api/scholarship-exams/[id]/upload-results
 * Proxies to Express backend: POST /api/scholarship-exams/:id/upload-results
 * 
 * Purpose: Upload exam results via CSV
 * Cache: No caching (mutation operation)
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const backendUrl = new URL(`/api/scholarship-exams/${examId}/upload-results`, BACKEND_URL);
    const cookies = request.headers.get('cookie') || '';
    
    // Get the form data from the request
    const formData = await request.formData();

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Cookie': cookies,
      },
      body: formData, // Pass formData directly for file upload
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error: any) {
    console.error('❌ BFF Upload Results POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
