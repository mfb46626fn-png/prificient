import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Response ve Cookie ayarları (Supabase standart)
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

  // 2. Kullanıcıyı Çek
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Admin Kontrolü (Hızlı Check)
  // 1. Admin Kontrolü (Hızlı Check)
  const email = (user?.email || '').toLowerCase().trim();
  const isExplicitAdmin = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(email);

  const isAdmin = user && (
    user.app_metadata?.role === 'prificient_admin' ||
    user.user_metadata?.role === 'prificient_admin' ||
    isExplicitAdmin
  )

  // -------------------------------------------------------------
  // KURAL 1: Kullanıcı giriş yapmışsa, Login sayfasına giremesin
  if (user && request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/demo')) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // -------------------------------------------------------------
  // KURAL 1.5: Admin Sayfası Koruması
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Prevent redirect loop if impersonating: Force exit impersonation
    if (request.cookies.get('impersonated_user_id')) {
      const response = NextResponse.redirect(request.url);
      response.cookies.delete('impersonated_user_id');
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // EMERGENCY BYPASS FOR info@prificient.com
    if (user.email === 'info@prificient.com') {
      // Allow
    } else if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Admin ise geçsin
  }

  // -------------------------------------------------------------
  // KURAL 2: Korumalı Sayfalar (Dashboard & Veri Girişi)
  // -------------------------------------------------------------
  const protectedPaths = ['/dashboard', '/data-entry', '/settings', '/onboarding', '/connect']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && !request.nextUrl.pathname.startsWith('/demo')

  if (isProtected) {
    // A. Kullanıcı yoksa -> Login'e at
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // B. Kullanıcı varsa -> ABONELİK KONTROLÜ
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_end_date')
      .eq('user_id', user.id)
      .maybeSingle()

    // Eğer abonelik kaydı yoksa (yeni üyeyse) veya süresi bitmişse...
    // Not: Yeni üye kaydolduğunda subscription tetiklenmeli yoksa buraya takılır.
    // Şimdilik subscription varsa kontrol edelim, yoksa trial varsayalım (veya logic'e göre değişir).
    if (
      subscription && (
        subscription.status === 'expired' ||
        (subscription.status === 'trial' && new Date(subscription.trial_end_date) < new Date())
      )
    ) {
      return NextResponse.redirect(new URL('/subscription-ended', request.url))
    }

    // C. ONBOARDING KONTROLÜ
    if (!user.user_metadata?.is_onboarding_completed && !request.nextUrl.pathname.startsWith('/onboarding') && !request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}