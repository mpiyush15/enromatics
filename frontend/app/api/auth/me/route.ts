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

    // Extract cookies from incoming request
    const cookies = extractCookies(request);
    console.log('🔍 Auth Me - Extracted cookies:', cookies ? '✅ Present' : '❌ Missing');

    // Call Express backend with cookies for authentication
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(cookies && { 'Cookie': cookies }), // Only add if cookies exist
        },
        // CRITICAL: This ensures cookies are sent by the browser to the backend
        credentials: 'include',
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      // If 401 (unauthorized), return null user instead of error status
      // This prevents infinite redirects and lets frontend handle gracefully
      if (expressResponse.status === 401) {
        console.log('⚠️ Auth Me - User not authenticated (401)');
        return NextResponse.json(
          { success: true, user: null },
          { status: 200 } // Return 200 with null user instead of 401
        );
      }
      
      console.error('❌ Auth Me - Backend error:', expressResponse.status, data.message);
      return NextResponse.json(
        { success: false, message: data.message || 'Authentication failed' },
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
        tenant: data.user?.tenant || data.tenant, // Include tenant info
      },
    };

    console.log('✅ Auth Me - User authenticated:', cleanUser.user.email);
    return NextResponse.json(cleanUser);
  } catch (error) {
    console.error('❌ BFF Get User error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
