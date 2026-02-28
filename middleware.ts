import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  let hostname = request.headers.get('host') || ''
  hostname = hostname.split(':')[0]

  const isApp = hostname.startsWith('app')
  const isTools = hostname.startsWith('tools')
  const isMarketing = !isApp && !isTools

  const path = request.nextUrl.pathname

  // 1. Run next-intl middleware for locale handling
  let response = handleI18nRouting(request)

  if (response.status >= 300 && response.status < 400) {
    // If next-intl is redirecting (e.g. from / to /en), do not interfere
  } else {
    // 2. Intercept and adjust rewrites for Subdomains
    const rewriteUrl = response.headers.get('x-middleware-rewrite')
    const currentPath = rewriteUrl ? new URL(rewriteUrl).pathname : path

    if (isTools && (currentPath === '/tr' || currentPath === '/en' || currentPath === '/')) {
      const base = currentPath === '/' ? '' : currentPath;
      const targetPath = `${base}/tools-home`;

      if (rewriteUrl) {
        const parsed = new URL(rewriteUrl)
        parsed.pathname = targetPath
        response.headers.set('x-middleware-rewrite', parsed.toString())
      } else {
        const parsed = new URL(request.url)
        parsed.pathname = targetPath
        response.headers.delete('x-middleware-next')
        response.headers.set('x-middleware-rewrite', parsed.toString())
      }
    } else if (isMarketing && (currentPath === '/tr' || currentPath === '/en' || currentPath === '/')) {
      const base = currentPath === '/' ? '' : currentPath;
      const targetPath = `${base}/marketing-home`;

      if (rewriteUrl) {
        const parsed = new URL(rewriteUrl)
        parsed.pathname = targetPath
        response.headers.set('x-middleware-rewrite', parsed.toString())
      } else {
        const parsed = new URL(request.url)
        parsed.pathname = targetPath
        response.headers.delete('x-middleware-next')
        response.headers.set('x-middleware-rewrite', parsed.toString())
      }
    }
  }

  // 3. Subdomain / Auth Protections
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isPublicRoute =
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/auth') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/new-password') ||
    path.startsWith('/update-password') ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.')

  if (!isTools && !isMarketing) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !isPublicRoute && path !== '/') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(loginUrl)
    }

    if (path === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
