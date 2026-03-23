/**
 * FRESH LOGIN ROUTE - Clean implementation from scratch
 * Simple proxy to Express backend with minimal processing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔓 [LOGIN-V2] Fresh route started');
    console.log('='.repeat(80));

    // 1️⃣ Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('❌ Invalid JSON:', e);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password ? '✅ Provided' : '❌ Missing');

    // 2️⃣ Validate inputs
    if (!email || !password) {
      console.error('❌ Missing email or password');
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      );
    }

    // 3️⃣ Get subdomain from hostname
    const hostname = request.headers.get('host') || '';
    console.log('🌐 Hostname:', hostname);
    
    let subdomain = '';
    const parts = hostname.split('.');
    
    // If we have enromatics.com domain
    if (hostname.includes('enromatics.com')) {
      // Extract everything before .enromatics.com
      const subdomainMatch = hostname.match(/^([^.]+)\.enromatics\.com/);
      subdomain = subdomainMatch ? subdomainMatch[1].toLowerCase() : '';
      console.log('✅ Extracted subdomain:', subdomain || '(main domain)');
    } else if (hostname.includes('lvh.me')) {
      // Local development with lvh.me
      const subdomainMatch = hostname.match(/^([^.]+)\.lvh\.me/);
      subdomain = subdomainMatch ? subdomainMatch[1].toLowerCase() : '';
      console.log('✅ [Local] Extracted subdomain from lvh.me:', subdomain || '(main domain)');
    } else {
      console.log('⚠️ Not an enromatics.com or lvh.me domain, main domain login');
    }

    // 4️⃣ Get backend URL
    const expressUrl = process.env.EXPRESS_BACKEND_URL;
    if (!expressUrl) {
      console.error('❌ EXPRESS_BACKEND_URL not configured');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }
    console.log('🔗 Backend URL:', expressUrl);

    // 5️⃣ Call Express backend - SIMPLE & DIRECT
    console.log('📤 Calling backend...');
    const loginUrl = `${expressUrl}/api/auth/login`;
    console.log('   Target:', loginUrl);

    const fetchResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(subdomain && { 'X-Tenant-Subdomain': subdomain }),
      },
      body: JSON.stringify({
        email,
        password,
        subdomain,
      }),
    });

    console.log('📥 Backend response status:', fetchResponse.status);

    // 6️⃣ Parse backend response
    let backendData;
    const responseText = await fetchResponse.text();
    console.log('📄 Backend response length:', responseText.length, 'bytes');

    try {
      backendData = JSON.parse(responseText);
      console.log('✅ Parsed JSON successfully');
    } catch (parseErr) {
      console.error('❌ Failed to parse backend response');
      console.error('   Response:', responseText.substring(0, 200));
      return NextResponse.json(
        { message: 'Invalid backend response' },
        { status: 502 }
      );
    }

    // 7️⃣ Check if login succeeded
    if (!fetchResponse.ok) {
      console.error('❌ Backend login failed:', fetchResponse.status);
      console.error('   Message:', backendData.message);
      return NextResponse.json(
        backendData,
        { status: fetchResponse.status }
      );
    }

    console.log('✅ Backend login successful!');
    console.log('   Token:', backendData.token ? '✅ Present' : '❌ Missing');
    console.log('   User:', backendData.user?.email);

    // ✅ Normalize role to lowercase for consistency
    if (backendData.user && backendData.user.role) {
      backendData.user.role = backendData.user.role.toLowerCase();
      console.log('✅ Role normalized to lowercase:', backendData.user.role);
    }

    // 8️⃣ Return success response directly
    const response = NextResponse.json(backendData, { status: 200 });

    // 9️⃣ Set cookie if token exists
    if (backendData.token) {
      console.log('🍪 Setting JWT cookie on response');
      response.cookies.set('jwt', backendData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      console.log('✅ Cookie set successfully');
    } else {
      console.warn('⚠️ No token in response, cookie not set');
    }

    console.log('✅ [LOGIN-V2] Returning success response');
    console.log('='.repeat(80) + '\n');
    return response;

  } catch (error: any) {
    console.error('\n❌ [LOGIN-V2] ERROR:', error.message);
    console.error('Stack:', error.stack);
    console.log('='.repeat(80) + '\n');
    
    return NextResponse.json(
      { message: error.message || 'Login error' },
      { status: 500 }
    );
  }
}
