'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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