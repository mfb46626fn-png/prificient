'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { EmailService } from '@/lib/email'
import { headers } from 'next/headers'

// Admin client for privileged operations
const getSupabaseAdmin = () => {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function completeOnboarding(userId: string) {
  const supabase = await createClient()

  // 1. Update Profile (DB)
  const { error: profileError } = await supabase.from('profiles').update({ is_onboarding_completed: true }).eq('id', userId)

  if (profileError) {
    console.error('Onboarding Update Error (Profile):', profileError)
    return { error: profileError.message }
  }

  // 2. Update Auth Metadata (Session/Middleware)
  const { error: authError } = await supabase.auth.updateUser({
    data: { is_onboarding_completed: true }
  })

  if (authError) {
    console.error('Onboarding Update Error (Auth):', authError)
  }

  return { success: true }
}

// --- PASSWORD RESET FLOW ---

export async function forgotPassword(email: string) {
  const supabaseAdmin = getSupabaseAdmin()

  try {
    // Generate recovery link via Admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`
      }
    })

    if (error) {
      console.error('Generate Link Error:', error)
      // Don't reveal if email exists or not for security
      return { success: true, message: 'E-postanızı kontrol edin' }
    }

    if (data?.properties?.action_link) {
      // Get user name from profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('email', email)
        .single()

      // Send branded email via Resend
      await EmailService.sendResetPassword(
        email,
        data.properties.action_link,
        profile?.full_name || undefined
      )
    }

    return { success: true, message: 'E-postanızı kontrol edin' }
  } catch (err) {
    console.error('Forgot Password Error:', err)
    return { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.' }
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  const headerList = await headers()
  const ipAddress = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'Bilinmiyor'

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Update Password Error:', error)
    return { success: false, error: error.message }
  }

  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Send security alert email
  await EmailService.sendSecurityAlert(
    user.email!,
    'password_changed',
    profile?.full_name || undefined,
    ipAddress
  )

  return { success: true, message: 'Şifreniz başarıyla güncellendi' }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const supabaseAdmin = getSupabaseAdmin()
  const headerList = await headers()
  const ipAddress = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'Bilinmiyor'

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'Oturum bulunamadı' }
  }

  const userEmail = user.email!

  // Get user profile for name before deletion
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || undefined

  // Send security alert BEFORE deletion (email won't be accessible after)
  await EmailService.sendSecurityAlert(
    userEmail,
    'account_deleted',
    userName,
    ipAddress
  )

  // Delete user via Admin API
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Delete Account Error:', deleteError)
    return { success: false, error: 'Hesap silinemedi. Lütfen destek ile iletişime geçin.' }
  }

  // Sign out locally
  await supabase.auth.signOut()

  return { success: true, message: 'Hesabınız silindi' }
}

// --- SIGNUP WITH WELCOME EMAIL ---

export async function signUpWithWelcome(email: string, password: string, fullName: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Send welcome email (only if user was created, not if email already exists)
  if (data.user && !data.user.identities?.length) {
    // User already exists
    return { success: false, error: 'Bu e-posta adresi zaten kayıtlı' }
  }

  if (data.user) {
    await EmailService.sendWelcome(email, fullName)
  }

  return { success: true, message: 'Hesabınız oluşturuldu' }
}