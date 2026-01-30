import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Force Deploy: Timestamp 2026-01-30 22:05
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Authenticate User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;

  // === RULE 1: Admin & Login Redirects ===
  if (user && path.startsWith('/login') && !path.startsWith('/demo')) {
    // Basic redirect for logged-in users trying to access login
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // === RULE 2: Protected Routes ===
  // Explicit List of protected areas
  const protectedPrefixes = ['/dashboard', '/data-entry', '/settings', '/onboarding', '/connect']
  const isProtected = protectedPrefixes.some(prefix => path.startsWith(prefix)) && !path.startsWith('/demo')

  if (isProtected) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // A. Subscription Check
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_end_date')
      .eq('user_id', user.id)
      .maybeSingle()

    if (
      subscription && (
        subscription.status === 'expired' ||
        (subscription.status === 'trial' && new Date(subscription.trial_end_date) < new Date())
      )
    ) {
      if (!path.startsWith('/subscription-ended')) {
        return NextResponse.redirect(new URL('/subscription-ended', request.url))
      }
    }

    // B. Onboarding Check (Profile Completion)
    if (!user.user_metadata?.is_onboarding_completed && !path.startsWith('/onboarding') && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // C. SYNC CHECK (Strictly for Dashboard)
    // We only block /dashboard access. access to /connect or /onboarding is ALLOWED to fix issues.
    if (path.startsWith('/dashboard')) {
      const { data: integration } = await supabase
        .from('integrations')
        .select('sync_status')
        .eq('user_id', user.id)
        .eq('platform', 'shopify')
        .maybeSingle()

      // If integration exists, enforce sync status
      if (integration) {
        const syncStatus = integration.sync_status || 'pending'

        if (syncStatus !== 'completed') {
          // Redirect to sync page
          return NextResponse.redirect(new URL('/onboarding/sync', request.url))
        }
      }
    }
  }

  return response
}