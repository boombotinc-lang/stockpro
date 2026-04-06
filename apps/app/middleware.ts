import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']
const PUBLIC_PREFIXES = ['/invite/', '/api/stripe/webhook']

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isDashboardRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length >= 1 && !pathname.startsWith('/api') && !isPublicRoute(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always refresh the Supabase session
  const { response, user } = await updateSession(request)

  // Public routes: let through
  if (isPublicRoute(pathname)) {
    return response
  }

  // Protected routes: require authentication
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Dashboard routes: extract orgSlug and set header for API routes
  if (isDashboardRoute(pathname)) {
    const orgSlug = pathname.split('/').filter(Boolean)[0]
    if (orgSlug) {
      response.headers.set('x-org-slug', orgSlug)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
