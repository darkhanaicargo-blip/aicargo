import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /orders and sub-routes
  if (pathname.startsWith('/orders')) {
    const user = getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const user = getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/orders/:path*', '/admin/:path*'],
}
