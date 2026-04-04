import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'

function getSlug(host: string): string | null {
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')
  if (parts.length < 3) return null
  if (parts[0] === 'www') return null
  if (hostname.endsWith('.vercel.app')) return null
  if (hostname.endsWith('.localhost')) return parts[0]
  return parts[0]
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Extract cargo slug from subdomain and pass to pages
  const host = req.headers.get('host') ?? ''
  const slug = getSlug(host)
  const res = NextResponse.next()
  if (slug) res.headers.set('x-cargo-slug', slug)

  // Protect /orders and sub-routes
  if (pathname.startsWith('/orders')) {
    const user = getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (slug) res.headers.set('x-cargo-slug', slug)
    return res
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
    if (slug) res.headers.set('x-cargo-slug', slug)
    return res
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.webp).*)'],
}
