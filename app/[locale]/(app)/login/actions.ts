'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Giriş yapılamadı. Bilgilerinizi kontrol edin.' }
  }

  // --- KRİTİK GÜNCELLEME: Onboarding Kontrolü ---
  // Giriş başarılıysa, kullanıcının onboarding'i bitirip bitirmediğine bakıyoruz.

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_onboarding_completed')
      .eq('id', user.id)
      .single()

    // Eğer onboarding bitmemişse, oraya zorla gönder
    if (profile && !profile.is_onboarding_completed) {
      redirect('/onboarding')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('fullName') as string,
    username: formData.get('username') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        username: data.username,
        // YENİ: Başlangıçta false olarak işaretliyoruz
        is_onboarding_completed: false
      },
    },
  })

  if (!error) {
    // Send Welcome Email
    // Note: We don't await this to keep the response fast, 
    // or we can wrap it in a try-catch to prevent failure if email fails.
    try {
      const { EmailService } = await import('@/lib/email');
      await EmailService.sendWelcome(data.email, data.full_name);
    } catch (e) {
      console.error('Failed to send welcome email:', e);
    }
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  // YENİ: Kayıt başarılı olduğu an Dashboard'a değil, 
  // soruları soracağımız Onboarding sayfasına yönlendiriyoruz.
  redirect('/onboarding')
}