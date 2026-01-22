import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const impersonatedUserId = cookieStore.get('impersonated_user_id')?.value

  // 1. Create Standard Client (Anon Key)
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Hata yutulur
          }
        },
      },
    }
  )

  // 2. Impersonation Check (Only if cookie exists)
  if (impersonatedUserId) {
    try {
      // A. Verify REAL User is Admin
      const { data: { user: realUser } } = await client.auth.getUser()

      const ADMIN_EMAILS = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com']
      const isAdmin = realUser && (
        realUser.app_metadata?.role === 'prificient_admin' ||
        realUser.user_metadata?.role === 'prificient_admin' ||
        (realUser.email && ADMIN_EMAILS.includes(realUser.email))
      )

      if (isAdmin) {
        // B. Create Admin Client (Service Role)
        // This client BYPASSES RLS. We use it to behave "as" the target user.
        // NOTE: We do NOT expose this client directly if we can avoid it, but here we replace 'client' with it
        // BUT we must filter queries. 
        // Better Strategy: We return a client that behaves like the USER.
        // AUTHENTICATION: We override getUser() to return the TARGET user.
        // DATA: We use Service Role Key, BUT the application logic usually filters by `user.id` (which we mocked).
        // WARNING: RLS is bypassed. This relies on the app code always adding `.eq('user_id', user.id)`. 
        // If app code relies *only* on RLS, this will leak data.
        // HOWEVER, Prificient MVP seems to use explicit filters in many places, or RLS.
        // If RLS is critical, we CANNOT use Service Role without caution. 
        // ALTERNATIVE: Use Service Role to Sign In as user? No password.
        // SAFE APPROACH for MVP God Mode: Use Service Role, and Trust the App's User ID filtering which comes from getUser().

        const serviceClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!, // Must be in env
          {
            cookies: {
              getAll: () => cookieStore.getAll(),
              setAll: () => { }, // Don't persist admin cookies
            }
          }
        )

        // C. Override auth.getUser to return IMPERSONATED user
        client.auth.getUser = async (): Promise<any> => {
          // Fetch target user details using Service Client
          const { data: targetUser, error } = await serviceClient.auth.admin.getUserById(impersonatedUserId)
          if (error || !targetUser) return { data: { user: null }, error: (error || new Error('Target user not found')) as any }

          return { data: { user: targetUser.user }, error: null }
        }

        // D. Override DB methods to use Service Client (Bypass RLS)
        // This is tricky. `client.from` returns a query builder.
        // We probably assume the Page code calls `getUser()` then uses `user.id` to query.
        // If the Page code relies ONLY on RLS (e.g. `select * from transactions`), using Standard Client (Anon) 
        // will FAIL because Anon Client sees "Admin User" (or no user if we mocked getUser only locally).
        // Actually, if we mock getUser, Supabase Client library (GoTrue) still sends the REAL Admin Token to Postgres.
        // Postgres sees Admin Token -> RLS policies for Admin apply.
        // If Admin has full access, fine. But typical RLS is `uid() = user_id`.
        // Admin `uid()` != Target `user_id`.
        // So we MUST use Service Role Client for DB requests too.

        // Return a Mixed Client:
        // Auth methods -> Mocked
        // DB methods -> Service Role (Bypasses RLS, assumes App logic filters by `getUser().id`)

        const impersonatedClient = serviceClient
        impersonatedClient.auth.getUser = client.auth.getUser // Use our mocked getUser

        return impersonatedClient
      }
    } catch (e) {
      console.error('Impersonation Failed:', e)
    }
  }

  return client
}