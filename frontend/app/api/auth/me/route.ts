/**
 * BFF Auth Me Route
 * 
 * GET /api/auth/me
 * Returns current logged-in user from Express backend
 * Uses cookies from browser to authenticate
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function GET(request: NextRequest) {
  try {
    // Check if EXPRESS_BACKEND_URL is configured
    const expressUrl = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!expressUrl) {
      console.error('❌ EXPRESS_BACKEND_URL not configured');
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    // Call Express backend with cookies for authentication
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Not authenticated' },
        { status: expressResponse.status }
      );
    }

    // Clean response - only return safe fields
    const cleanUser = {
      success: true,
      user: {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.name || data.name,
        role: data.user?.role || data.role,
        tenantId: data.user?.tenantId || data.tenantId,
        profilePicture: data.user?.profilePicture || data.profilePicture,
      },
    };

    return NextResponse.json(cleanUser);
  } catch (error) {
    console.error('❌ BFF Get User error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
