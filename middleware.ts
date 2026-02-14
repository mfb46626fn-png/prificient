import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  let hostname = req.headers.get('host') || ''

  // Localhost support: Handle port numbers
  hostname = hostname.split(':')[0]

  // Define Subdomains
  const isApp = hostname.startsWith('app')
  const isTools = hostname.startsWith('tools')

  // Root domain (prificient.com or localhost or www.prificient.com)
  // If not app and not tools, it's root/www.
  const isMarketing = !isApp && !isTools

  // 1. App Subdomain Logic (Protected + Dashboard)
  if (isApp) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Auth Guard
    // Allow public routes on app subdomain (login, signup, etc.)
    // Also allow api routes
    const isPublicRoute =
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/forgot-password') ||
      url.pathname.startsWith('/new-password') || // Fix: new-password was missing
      url.pathname.startsWith('/update-password') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/_next') ||
      url.pathname.includes('.') || // static files
      url.pathname === '/legal/privacy' || // legal pages might be needed on app too?
      url.pathname === '/legal/terms';

    if (!session && !isPublicRoute && url.pathname !== '/') {
      // Redirect to Login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectedFrom', url.pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (url.pathname === '/') {
      // Root of app.prificient.com
      if (session) {
        return NextResponse.rewrite(new URL('/(app)/dashboard', req.url))
      }
      return NextResponse.rewrite(new URL('/(app)/login', req.url)) // Or redirect to login page path
    }

    // Default Rewrite to (app) folder
    // E.g. /dashboard -> /(app)/dashboard
    return NextResponse.rewrite(new URL(`/(app)${url.pathname}`, req.url))
  }

  // 2. Tools Subdomain Logic
  if (isTools) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/(tools)', req.url))
    }
    return NextResponse.rewrite(new URL(`/(tools)${url.pathname}`, req.url))
  }

  // 3. Marketing (Root) Logic
  if (isMarketing) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/(marketing)', req.url))
    }
    // Rewrites for other marketing pages if they exist
    return NextResponse.rewrite(new URL(`/(marketing)${url.pathname}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
