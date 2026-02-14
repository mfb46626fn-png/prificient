import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let hostname = request.headers.get('host') || ''
  hostname = hostname.split(':')[0] // Handle localhost:3000

  // Define Subdomains
  const isApp = hostname.startsWith('app')
  const isTools = hostname.startsWith('tools')
  const isMarketing = !isApp && !isTools

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: You *must* run `getUser()` or `getSession()` to refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()


  // --- ROUTING LOGIC ---

  const url = request.nextUrl;
  const path = url.pathname;

  // 1. App Subdomain
  if (isApp) {
    // Auth Guard
    const isPublicRoute =
      path.startsWith('/login') ||
      path.startsWith('/signup') ||
      path.startsWith('/auth') ||
      path.startsWith('/forgot-password') ||
      path.startsWith('/new-password') ||
      path.startsWith('/update-password') ||
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path.includes('.') ||
      path === '/legal/privacy' ||
      path === '/legal/terms';

    if (!user && !isPublicRoute && path !== '/') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      // We must return the response that sets cookies!
      // But redirects are a new Response. 
      // So we generally can't set cookies *and* redirect in same middleware step easily for auth refresh
      // WITH Supabase SSR, usually we don't block refresh.
      return NextResponse.redirect(loginUrl)
    }

    if (path === '/') {
      if (user) {
        return NextResponse.rewrite(new URL('/(app)/dashboard', request.url))
      }
      return NextResponse.rewrite(new URL('/(app)/login', request.url))
    }

    // Rewrite to (app)
    return NextResponse.rewrite(new URL(`/(app)${path}`, request.url))
  }

  // 2. Tools Subdomain
  if (isTools) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/(tools)', request.url))
    }
    return NextResponse.rewrite(new URL(`/(tools)${path}`, request.url))
  }

  // 3. Marketing (Root)
  if (isMarketing) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/(marketing)', request.url))
    }
    return NextResponse.rewrite(new URL(`/(marketing)${path}`, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
