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

  // -------------------------------------------------------------
  // KURAL 1: Kullanıcı giriş yapmışsa, Login sayfasına giremesin
  // -------------------------------------------------------------
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // -------------------------------------------------------------
  // KURAL 2: Korumalı Sayfalar (Dashboard & Veri Girişi)
  // -------------------------------------------------------------
  const protectedPaths = ['/dashboard', '/data-entry']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

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
      .single()

    // Eğer abonelik kaydı yoksa, süresi bitmişse ('expired') 
    // veya deneme süresindeyken tarih geçmişse -> İçeri alma
    if (
      !subscription || 
      subscription.status === 'expired' ||
      (subscription.status === 'trial' && new Date(subscription.trial_end_date) < new Date())
    ) {
       return NextResponse.redirect(new URL('/subscription-ended', request.url))
    }
  }

  return response
}