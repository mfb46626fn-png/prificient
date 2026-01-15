'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export type SubscriptionStatus = 'beta' | 'trial_active' | 'trial_expired' | 'pro_active'

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>('beta')
  const [daysLeft, setDaysLeft] = useState(14)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // ANAHTAR BURADA: Beta modundaysak sorgusuz sualsiz onay ver.
  const isBeta = process.env.NEXT_PUBLIC_IS_BETA === 'true'

  useEffect(() => {
    const checkStatus = async () => {
      // 1. Beta Modu Kontrolü
      if (isBeta) {
        setStatus('beta')
        setLoading(false)
        return
      }

      // 2. Normal Mod (Beta Bittiğinde Çalışacak Kısım)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end_date, subscription_plan')
        .eq('id', user.id)
        .single()

      if (profile) {
        const now = new Date()
        const end = new Date(profile.trial_end_date)
        const diffTime = Math.abs(end.getTime() - now.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (profile.subscription_plan === 'pro') {
            setStatus('pro_active')
        } else if (now > end) {
            setStatus('trial_expired')
            setDaysLeft(0)
        } else {
            setStatus('trial_active')
            setDaysLeft(diffDays)
        }
      }
      setLoading(false)
    }

    checkStatus()
  }, [])

  return { 
    status, 
    daysLeft, 
    loading, 
    // Erişim izni var mı? (Beta ise EVET, Pro ise EVET, Trial bitmediyse EVET)
    hasAccess: status === 'beta' || status === 'pro_active' || status === 'trial_active'
  }
}