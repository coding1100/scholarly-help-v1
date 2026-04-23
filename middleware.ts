import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for a sub-tool page (not the main /tools page)
  const pathname = request.nextUrl.pathname;
  
  // Allow /tools page without authentication, but require auth for sub-tools like /tools/paraphraser-tool
  // Only check paths that have a sub-path after /tools/
  if (pathname.startsWith('/tools/') && pathname !== '/tools' && pathname !== '/tools/') {
    // Check for token in cookies (we'll set this after successful login)
    const token = request.cookies.get('access_token')?.value
    
    // If no token, redirect to sign-in
    if (!token) {
      const signInUrl = new URL('/sign-in', request.url)
      // Preserve marketing params (utm_*, fbclid, etc.) while adding returnUrl.
      request.nextUrl.searchParams.forEach((value, key) => {
        signInUrl.searchParams.set(key, value)
      })
      signInUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/tools/:path*'
}