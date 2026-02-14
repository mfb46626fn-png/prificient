import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let hostname = request.headers.get('host') || ''
  hostname = hostname.split(':')[0]

  const isApp = hostname.startsWith('app')
  const isTools = hostname.startsWith('tools')
  const isMarketing = !isApp && !isTools

  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. App Subdomain (Protected)
  if (isApp) {
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

    if (!user && !isPublicRoute && path !== '/') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(loginUrl)
    }

    if (path === '/') {
      if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // No rewrite needed — route groups don't affect URLs
    return supabaseResponse
  }

  // 2. Tools Subdomain (Public)
  if (isTools) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/tools-home', request.url))
    }
    return supabaseResponse
  }

  // 3. Marketing / Root (Public)
  if (isMarketing) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/marketing-home', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
