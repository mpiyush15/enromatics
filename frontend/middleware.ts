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
 * Subdomain Routing Middleware
 * 
 * STRICT ACCESS RULES:
 * - enromatics.com/login → SuperAdmin ONLY
 * - admin.tenant.enromatics.com → TenantAdmin ONLY
 * - staff.tenant.enromatics.com → Staff/Employee ONLY
 * - tenant.enromatics.com → Students ONLY
 * 
 * Security: Each role can ONLY access their designated subdomain
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

  // Handle admin subdomain pattern (admin.tenant.enromatics.com)
  if (subdomain.startsWith('admin.')) {
    const tenantSubdomain = subdomain.replace('admin.', '');
    return handleAdminSubdomain(request, tenantSubdomain);
  }

  // Handle staff subdomain pattern (staff.tenant.enromatics.com)
  if (subdomain.startsWith('staff.')) {
    const tenantSubdomain = subdomain.replace('staff.', '');
    return handleStaffSubdomain(request, tenantSubdomain);
  }

  // Handle tenant subdomain (tenant.enromatics.com - student portal)
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
  // prasamagar.lvh.me = 3 parts, admin.prasamagar.lvh.me = 4 parts
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'lvh.me') {
    // Handle nested subdomains (admin.prasamagar.lvh.me)
    if (parts.length > 3) {
      return parts.slice(0, -2).join('.');
    }
    return parts[0];
  }
  
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
  // Admin subdomain (admin.tenant.enromatics.com)
  // ✅ Allow /login and /dashboard/* - Block public pages
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const cookieDomain = getCookieDomain(host);
  
  console.log(`🔧 Admin subdomain: ${tenantSubdomain}, pathname: ${pathname}`);
  
  // Block public pages (about, contact, services, etc.)
  const publicPages = ['/about', '/contact', '/services', '/privacy', '/terms', '/privacy-policy', '/terms-of-service', '/plans', '/subscribe', '/home', '/lead-form', '/leads'];
  if (publicPages.some(page => pathname.startsWith(page))) {
    console.log(`❌ Blocking public page ${pathname} on admin subdomain → Redirecting to /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Redirect root to dashboard
  if (pathname === '/') {
    console.log(`✅ Redirecting root to /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Allow /login, /dashboard/*, and other authenticated routes
  const response = NextResponse.next();
  
  response.cookies.set('tenant-context', tenantSubdomain, {
    domain: cookieDomain,
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  response.cookies.set('subdomain-type', 'admin', {
    domain: cookieDomain,
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  return response;
}

function handleStaffSubdomain(request: NextRequest, tenantSubdomain: string) {
  // Staff subdomain (staff.tenant.enromatics.com)
  // ✅ Allow /login and /dashboard/* - Block public pages
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const cookieDomain = getCookieDomain(host);
  
  console.log(`👥 Staff subdomain: ${tenantSubdomain}, pathname: ${pathname}`);
  
  // Block public pages (about, contact, services, etc.)
  const publicPages = ['/about', '/contact', '/services', '/privacy', '/terms', '/privacy-policy', '/terms-of-service', '/plans', '/subscribe', '/home', '/lead-form', '/leads'];
  if (publicPages.some(page => pathname.startsWith(page))) {
    console.log(`❌ Blocking public page ${pathname} on staff subdomain → Redirecting to /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Redirect root to dashboard
  if (pathname === '/') {
    console.log(`✅ Redirecting root to /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Allow /login, /dashboard/*, and other authenticated routes
  const response = NextResponse.next();
  
  response.cookies.set('tenant-context', tenantSubdomain, {
    domain: cookieDomain,
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  response.cookies.set('subdomain-type', 'staff', {
    domain: cookieDomain,
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  
  return response;
}

function handleTenantSubdomain(request: NextRequest, subdomain: string) {
  // Handle regular tenant subdomain (student portal)
  // ✅ ONLY ALLOW /login - Block ALL other routes (about, contact, services, etc.)
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const cookieDomain = getCookieDomain(host);
  
  console.log(`🌐 Tenant subdomain detected: ${subdomain}, pathname: ${pathname}`);
  
  // STRICT: Only allow /login route for tenant subdomain
  if (pathname !== '/login') {
    console.log(`❌ Blocking ${pathname} on tenant subdomain → Redirecting to /login`);
    
    // Redirect everything else to /login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    
    // Set cookies even on redirect
    response.cookies.set('tenant-context', subdomain, {
      domain: cookieDomain,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
    
    response.cookies.set('subdomain-type', 'tenant', {
      domain: cookieDomain,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
    
    return response;
  }
  
  console.log(`✅ Allowing /login on tenant subdomain`);
  
  // Allow /login - set cookies and proceed
  const response = NextResponse.next();
  
  response.cookies.set('tenant-context', subdomain, {
    domain: cookieDomain,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  
  response.cookies.set('subdomain-type', 'tenant', {
    domain: cookieDomain,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  
  response.cookies.set('tenant-branding-needed', 'true', {
    domain: cookieDomain,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5
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