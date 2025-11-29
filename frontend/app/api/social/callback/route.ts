import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://enromatics.com';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');

    console.log('🔵 Facebook Callback - Received:', { code: !!code, state, error });

    // If user denied permission
    if (error) {
      console.log('🔴 User denied permission:', error);
      return NextResponse.redirect(
        `${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(error)}`
      );
    }

    // If no code, error
    if (!code) {
      console.log('🔴 No code received from Facebook');
      return NextResponse.redirect(
        `${FRONTEND_URL}/dashboard/social?error=no_code`
      );
    }

    // Get cookies from request
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('token')?.value;
    const cookieString = request.headers.get('cookie') || '';

    console.log('🔵 Forwarding callback to backend with code...');
    console.log('🔵 Auth cookie present:', !!authCookie);

    // Forward callback to backend with full cookie header
    // Backend will exchange code for access token and save connection
    const backendCallbackUrl = new URL(`${BACKEND_URL}/api/facebook/callback`);
    backendCallbackUrl.searchParams.set('code', code);
    if (state) {
      backendCallbackUrl.searchParams.set('state', state);
    }

    console.log('🔵 Calling backend callback:', backendCallbackUrl.toString());

    const response = await fetch(backendCallbackUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieString,
        'User-Agent': request.headers.get('user-agent') || 'axios',
      },
      redirect: 'manual', // Don't follow redirects from backend
    });

    console.log('🔵 Backend response status:', response.status);

    // Backend might redirect on success or error
    if (response.status >= 300 && response.status < 400) {
      const redirectLocation = response.headers.get('location');
      if (redirectLocation) {
        console.log('✅ Backend redirecting to:', redirectLocation);
        return NextResponse.redirect(redirectLocation);
      }
    }

    // Parse response
    let data: any;
    try {
      data = await response.json();
    } catch {
      console.log('🔵 Could not parse response as JSON');
      data = { message: 'Connection processed' };
    }

    if (!response.ok) {
      console.error('🔴 Backend callback failed:', data);
      return NextResponse.redirect(
        `${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(
          data.message || 'Connection failed'
        )}`
      );
    }

    console.log('✅ Facebook connection successful!');

    // Redirect back to dashboard with success message
    return NextResponse.redirect(`${FRONTEND_URL}/dashboard/social?success=connected`);
  } catch (error: any) {
    console.error('🔴 Callback Error:', error.message);
    return NextResponse.redirect(
      `${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(
        error.message || 'Connection failed'
      )}`
    );
  }
}
