/**
 * BFF Auth Signup Route
 * 
 * This route:
 * 1. Receives signup request from frontend (free trial flow)
 * 2. Forwards to Express backend /api/auth/signup
 * 3. Returns user data and token
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, instituteName, email, phone, password, planId, isTrial } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!name || !instituteName) {
      return NextResponse.json(
        { message: 'Name and institute name are required' },
        { status: 400 }
      );
    }

    console.log('📤 Calling Express backend for signup:', `${BACKEND_URL}/api/auth/signup`);
    console.log('📝 Signup payload:', { name, instituteName, email, phone, planId, isTrial });

    // Call Express backend
    const expressResponse = await fetch(
      `${BACKEND_URL}/api/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          instituteName,
          email,
          phone,
          password,
          planId: planId || 'trial',
          isTrial: isTrial !== false, // Default to true for free trial flow
        }),
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      console.error('❌ Express returned error:', expressResponse.status, data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || data.error || 'Signup failed',
        },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Signup successful for:', email);

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: data.message || 'Account created successfully',
      token: data.token,
      user: data.user,
      tenant: data.tenant,
    });

  } catch (error) {
    console.error('❌ Signup route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Signup failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
