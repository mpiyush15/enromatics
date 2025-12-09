/**
 * BFF Employees Data Route
 * 
 * GET /api/employees - List all employees
 * POST /api/employees - Create employee
 * 
 * Uses HTTP Cache-Control for Vercel CDN caching
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

// Extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    const endpoint = `/api/employees`;

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch employees' },
        { status: backendResponse.status }
      );
    }

    const cleanData = { success: true, ...data };

    // Use stale-while-revalidate for fast loads
    return NextResponse.json(cleanData, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('❌ Employees BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = `/api/employees`;

    const token = extractToken(request);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, ...data },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ Employee Create BFF Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
