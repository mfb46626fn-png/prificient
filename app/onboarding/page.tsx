'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GlobalLoader from '@/components/GlobalLoader'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // V2 Geçişi: Eski onboarding devre dışı.
    // Kullanıcıyı direkt dashboard'a veya entegrasyon ekranına alıyoruz.
    router.replace('/dashboard')
  }, [router])

  return <GlobalLoader />
}