import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase Auth session first
  let response = await updateSession(request)

  const isRouteAdmin = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/upload')
  const isRouteAdminLogin = request.nextUrl.pathname.startsWith('/admin/login')

  if (isRouteAdmin && !isRouteAdminLogin) {
    const token = request.cookies.get('aetheria_admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
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
