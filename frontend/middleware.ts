import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = getSubdomain(host);
  
  // Handle main domain (no subdomain)
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // Handle admin subdomain pattern
  if (subdomain.startsWith('admin.')) {
    const tenantSubdomain = subdomain.replace('admin.', '');
    return handleAdminSubdomain(request, tenantSubdomain);
  }

  // Handle staff subdomain pattern  
  if (subdomain.startsWith('staff.')) {
    const tenantSubdomain = subdomain.replace('staff.', '');
    return handleStaffSubdomain(request, tenantSubdomain);
  }

  // Handle tenant subdomain (e.g., clientname.enromatics.com)
  return handleTenantSubdomain(request, subdomain);
}

function getSubdomain(host: string | null): string | null {
  if (!host) return null;
  
  // Remove port if present
  const hostname = host.split(':')[0];
  
  // For localhost development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // Split by dots and check for subdomain
  const parts = hostname.split('.');
  
  // For enromatics.com, we expect at least 3 parts for a subdomain
  // subdomain.enromatics.com = 3 parts
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'enromatics.com') {
    // Handle nested subdomains (admin.client.enromatics.com)
    if (parts.length > 3) {
      return parts.slice(0, -2).join('.');
    }
    return parts[0];
  }
  
  return null;
}

function handleAdminSubdomain(request: NextRequest, tenantSubdomain: string) {
  // Redirect to admin dashboard with tenant context
  const url = request.nextUrl.clone();
  
  // Add tenant info to search params
  url.searchParams.set('tenant', tenantSubdomain);
  url.searchParams.set('mode', 'admin');
  
  // Redirect to appropriate admin route
  if (request.nextUrl.pathname === '/') {
    url.pathname = '/dashboard';
  }
  
  const response = NextResponse.rewrite(url);
  
  // Set tenant cookie for easy access - with domain for cross-subdomain sharing
  response.cookies.set('tenant-context', tenantSubdomain, {
    domain: isProduction ? '.enromatics.com' : undefined, // Wildcard subdomain support
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return response;
}

function handleStaffSubdomain(request: NextRequest, tenantSubdomain: string) {
  // Similar to admin but with staff-specific routing
  const url = request.nextUrl.clone();
  
  url.searchParams.set('tenant', tenantSubdomain);
  url.searchParams.set('mode', 'staff');
  
  if (request.nextUrl.pathname === '/') {
    url.pathname = '/dashboard/staff';
  }
  
  const response = NextResponse.rewrite(url);
  
  response.cookies.set('tenant-context', tenantSubdomain, {
    domain: isProduction ? '.enromatics.com' : undefined, // Wildcard subdomain support
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  return response;
}

function handleTenantSubdomain(request: NextRequest, subdomain: string) {
  // Handle regular tenant subdomain (student/public portal)
  const url = request.nextUrl.clone();
  
  // Add tenant context
  url.searchParams.set('tenant', subdomain);
  url.searchParams.set('mode', 'tenant');
  
  // Route to tenant-specific pages
  if (request.nextUrl.pathname === '/') {
    // Redirect to tenant landing page
    url.pathname = '/tenant-portal';
  } else if (request.nextUrl.pathname === '/register') {
    // Handle student registration with tenant context
    url.pathname = '/tenant-register';
  } else if (request.nextUrl.pathname === '/login') {
    // Handle student login with tenant context  
    url.pathname = '/tenant-login';
  }
  
  const response = NextResponse.rewrite(url);
  
  // Set tenant context cookie with domain for cross-subdomain sharing
  response.cookies.set('tenant-context', subdomain, {
    domain: isProduction ? '.enromatics.com' : undefined, // Wildcard subdomain support
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
  
  // Set branding context cookie (will be populated by API)
  response.cookies.set('tenant-branding-needed', 'true', {
    domain: isProduction ? '.enromatics.com' : undefined, // Wildcard subdomain support
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5 // 5 minutes (short-lived flag)
  });
  
  return response;
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