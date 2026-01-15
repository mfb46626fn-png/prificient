import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Server component'lerde cookie yazarken cookie yazımı bazen hata verebilir,
            // bunu yutuyoruz (görmezden geliyoruz).
          }
        },
        remove(name: string, options?: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {
            // Cookie silme sırasında oluşan hataları da yutuyoruz.
          }
        },
      },
    }
  )
}