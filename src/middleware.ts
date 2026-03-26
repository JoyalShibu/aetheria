import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase Auth session first
  let { supabaseResponse: response, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname;
  
  const isLoginRoute = pathname === '/login';
  const isProfilesRoute = pathname === '/profiles';
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/upload');
  const isAdminLoginRoute = pathname === '/admin/login';

  // 1. Unauthenticated users can only access login and admin login
  if (!user && !isLoginRoute && !isAdminLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Admin routes protection
  if (isAdminRoute && !isAdminLoginRoute) {
    const token = request.cookies.get('aetheria_admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 3. User is authenticated
  if (user) {
    if (isLoginRoute) {
      // Redirect away from login if already authenticated
      return NextResponse.redirect(new URL('/profiles', request.url));
    }

    // Must select a profile before accessing main content
    if (!isProfilesRoute && !isAdminRoute) {
      const profileCookie = request.cookies.get('aetheria_profile')?.value;
      if (!profileCookie) {
        return NextResponse.redirect(new URL('/profiles', request.url));
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Images and static assets don't need auth checks.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
