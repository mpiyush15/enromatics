/**
 * BFF Leads Dashboard Route
 * 
 * GET /api/leads/dashboard - Get lead dashboard stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const endpoint = '/api/leads/dashboard';

    console.log('📤 Calling Backend:', `${BACKEND_URL}${endpoint}`);

    const backendResponse = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
          'X-Tenant-Guard': 'true',
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch dashboard', status: backendResponse.status },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Backend returned dashboard data');
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('❌ BFF Leads Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
