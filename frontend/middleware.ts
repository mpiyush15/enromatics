import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get cookie domain based on environment
 * Production: .enromatics.com (cross-subdomain)
 * Local: .lvh.me (for subdomain testing)
 * Dev: undefined (no cross-subdomain needed)
 */
function getCookieDomain(host: string | null): string | undefined {
  if (!host) return undefined;
  
  const hostname = host.split(':')[0];
  
  // Production: .enromatics.com for wildcard subdomain support
  if (isProduction && hostname.includes('enromatics.com')) {
    return '.enromatics.com';
  }
  
  // Local testing with lvh.me
  if (hostname.includes('lvh.me')) {
    return '.lvh.me';
  }
  
  return undefined;
}

/**
 * ✅ NEW: Simplified Subdomain Routing Middleware
 * 
 * ARCHITECTURE:
 * - enromatics.com → SuperAdmin only (no subdomain)
 * - tenant.enromatics.com → All roles login here
 *   - After login, routes handle role separation:
 *     - /dashboard/admin → Admin/TenantAdmin only
 *     - /dashboard/staff → Staff roles only
 *     - /dashboard/student → Students only
 * 
 * Security: Tenant isolation via backend validation, route guards handle role separation
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|js|css|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = getSubdomain(host);
  
  // Handle main domain (no subdomain) - SuperAdmin login only
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // Handle tenant subdomain (single level: tenant.enromatics.com)
  return handleTenantSubdomain(request, subdomain);
}

function getSubdomain(host: string | null): string | null {
  if (!host) return null;
  
  // Remove port if present
  const hostname = host.split(':')[0];
  
  // For localhost development (no subdomain)
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // Split by dots and check for subdomain
  const parts = hostname.split('.');
  
  // Check for lvh.me (local testing with subdomains)
  // prasamagar.lvh.me = 3 parts
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'lvh.me') {
    return parts[0]; // Return only first part (tenant subdomain)
  }
  
  // For enromatics.com, we expect at least 3 parts for a subdomain
  // subdomain.enromatics.com = 3 parts
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'enromatics.com') {
    return parts[0]; // Return only first part (tenant subdomain)
  }
  
  return null;
}

function handleTenantSubdomain(request: NextRequest, subdomain: string) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const cookieDomain = getCookieDomain(host);
  
  console.log(`🌐 Tenant subdomain: ${subdomain}, pathname: ${pathname}`);
  
  // ✅ ONLY ALLOW: /tenant/login and /api/* routes
  // ❌ BLOCK: Everything else and redirect to /tenant/login
  
  // Allow API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.cookies.set('tenant-context', subdomain, {
      domain: cookieDomain,
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  }
  
  // Allow ONLY /tenant/login route
  if (pathname === '/tenant/login') {
    console.log(`✅ Allowing /tenant/login`);
    const response = NextResponse.next();
    response.cookies.set('tenant-context', subdomain, {
      domain: cookieDomain,
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  }
  
  // Block EVERYTHING else and redirect to /tenant/login
  console.log(`❌ Blocking ${pathname} on tenant subdomain → Redirecting to /tenant/login`);
  const url = request.nextUrl.clone();
  url.pathname = '/tenant/login';
  return NextResponse.redirect(url);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default middleware;