import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow access to login page
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  // Check for the secure token
  const token = request.cookies.get('aetheria_admin_token')?.value
  
  if (!token) {
    // Redirect unauthorized users to the login screen
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  return NextResponse.next()
}

// Protect CMS route and entire admin namespace
export const config = {
  matcher: ['/upload', '/admin/:path*']
}
