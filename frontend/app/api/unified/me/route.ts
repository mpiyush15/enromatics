/**
 * BFF Unified Auth Validation Endpoint
 * 
 * GET /api/unified/me
 * 
 * Validates JWT token and returns authenticated user
 * Works for BOTH SuperAdmin and Tenant users
 * 
 * Reads JWT from:
 * 1. Authorization header (primary) - "Bearer <token>"
 * 2. localStorage (via frontend) - sent in Authorization header
 * 
 * Returns user with role + tenantId for dashboard to decide what data to load
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Extract JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No Authorization header or invalid format');
      return NextResponse.json(
        { success: false, message: 'No authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token) {
      console.warn('⚠️ Empty token in Authorization header');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2️⃣ Get backend URL
    const expressUrl = process.env.EXPRESS_BACKEND_URL || 
                      process.env.NEXT_PUBLIC_BACKEND_URL || 
                      'http://localhost:5050';

    if (!expressUrl) {
      console.error('❌ EXPRESS_BACKEND_URL not configured');
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    // 3️⃣ Forward token validation to Express backend
    // Express will validate JWT and return user
    const expressResponse = await fetch(
      `${expressUrl}/api/auth/validate-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!expressResponse.ok) {
      console.warn('⚠️ Token validation failed:', expressResponse.status);
      
      // If 401, token is invalid or expired
      if (expressResponse.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Other errors
      const data = await expressResponse.json();
      return NextResponse.json(
        { success: false, message: data.message || 'Token validation failed' },
        { status: expressResponse.status }
      );
    }

    // 4️⃣ Token is valid, return user data
    const data = await expressResponse.json();

    console.log('✅ Token validated for user:', data.user?.email);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name,
        role: data.user?.role,
        tenantId: data.user?.tenantId,
        subdomain: data.user?.subdomain,
        tenant: data.user?.tenant,
        trialEndDate: data.user?.trialEndDate,
        plan: data.user?.plan,
        subscriptionStatus: data.user?.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('❌ Unified auth validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
