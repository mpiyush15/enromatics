/**
 * Tenant Me Route - Token Verification
 * Simple endpoint that returns user data from token
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // If not provided in header, allow token via query param (safer when headers
    // might be stripped by proxies). Example: /api/tenant/me?token=...
    try {
      const url = new URL(request.url);
      const qToken = url.searchParams.get('token');
      if (!token && qToken) {
        token = qToken;
        console.log('[/api/tenant/me] Token received via query param');
      }
    } catch (e) {
      // ignore URL parse issues
    }

    console.log('[/api/tenant/me] Token received:', token ? '✅ YES' : '❌ NO');

    if (!token) {
      console.log('[/api/tenant/me] ❌ No token - returning null user');
      return NextResponse.json(
        { success: true, user: null, tenant: null },
        { status: 200 }
      );
    }

    // Decode JWT locally to extract user data
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('[/api/tenant/me] ❌ Invalid JWT format (not 3 parts), token:', token.substring(0, 50));
        return NextResponse.json(
          { success: true, user: null, tenant: null },
          { status: 200 }
        );
      }

      // Decode payload
      const payload = parts[1];
      const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decoded = JSON.parse(Buffer.from(padded, 'base64').toString());
      
      console.log('[/api/tenant/me] ✅ JWT decoded:', JSON.stringify(decoded));

      // Build user object from JWT claims - be flexible with field names
      const user = {
        id: decoded.userId || decoded.id || decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.userName || decoded.fullName,
        role: decoded.role || decoded.userRole || 'user',
        tenant: {
          id: decoded.tenantId || decoded.tenant_id,
          instituteName: decoded.subdomain || decoded.instituteName || decoded.institute_name,
        },
      };

      // Make sure we have at least an ID and email
      if (!user.id || !user.email) {
        console.log('[/api/tenant/me] ❌ JWT missing required fields:', { hasId: !!user.id, hasEmail: !!user.email });
        return NextResponse.json(
          { success: true, user: null, tenant: null },
          { status: 200 }
        );
      }

      console.log('[/api/tenant/me] ✅ Returning user:', { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenant.id 
      });

      return NextResponse.json({
        success: true,
        user,
        tenant: {
          id: user.tenant.id,
          subdomain: decoded.subdomain,
          instituteName: user.tenant.instituteName,
        },
      });
    } catch (error) {
      console.error('[/api/tenant/me] ❌ Error decoding JWT:', error);
      console.log('[/api/tenant/me] Token (first 100 chars):', token.substring(0, 100));
      return NextResponse.json(
        { success: true, user: null, tenant: null },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[/api/tenant/me] Error:', error);
    return NextResponse.json(
      { success: true, user: null, tenant: null },
      { status: 200 }
    );
  }
}
