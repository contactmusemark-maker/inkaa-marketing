import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllowedRolesForPath, normalizeRole } from '@/lib/rbacCore';

// Protected routes that require both auth AND subscription
const PROTECTED_PREFIXES = [
  '/profile',
  '/help',
  '/dashboard',
  '/client-management',
  '/crm',
  '/projects',
  '/pricing-estimator',
  '/quotations',
  '/invoices',
  '/payments',
  '/campaigns',
  '/analytics',
  '/ai-tools',
  '/reports',
  '/team',
  '/tasks',
  '/calendar',
  '/documents',
  '/settings',
  '/billing',
  '/integrations',
  '/super-admin',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read auth cookies
  const authToken = request.cookies.get('inkaa_auth')?.value;
  const hasSubscription = request.cookies.get('inkaa_subscription')?.value;
  const role = normalizeRole(request.cookies.get('inkaa_role')?.value);

  // Root "/" — redirect based on auth state
  if (pathname === '/') {
    if (!authToken) {
      return NextResponse.redirect(new URL('/landing', request.url));
    }
    if (authToken && !hasSubscription) {
      return NextResponse.redirect(new URL('/plans', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing a protected route without auth → redirect to login
  if (isProtectedRoute(pathname) && !authToken) {
    const loginUrl = new URL('/sign-up-login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but no subscription and trying to access protected dashboard routes → redirect to plans
  if (isProtectedRoute(pathname) && authToken && !hasSubscription) {
    return NextResponse.redirect(new URL('/plans', request.url));
  }

  const allowedRoles = getAllowedRolesForPath(pathname);
  if (isProtectedRoute(pathname) && authToken && allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If already authenticated with subscription and visiting login page → redirect to dashboard
  if (pathname === '/sign-up-login' && authToken && hasSubscription) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
