'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// 8 Saat = 8 * 60 * 60 * 1000 milisaniye
const INACTIVITY_LIMIT = 8 * 60 * 60 * 1000 

export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    // Aktivite algılayıcı fonksiyon
    const updateActivity = () => {
      setLastActivity(Date.now())
      // localStorage'a da yazabiliriz ki sekmeler arası senkron olsun (Opsiyonel)
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    // Hangi olaylar "aktivite" sayılır?
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

    // Event listener'ları ekle
    events.forEach((event) => {
      window.addEventListener(event, updateActivity)
    })

    // Zamanlayıcıyı kontrol eden interval
    const checkInactivity = setInterval(async () => {
      const now = Date.now()
      // LocalStorage'dan da kontrol et (diğer sekmede hareket etmiş olabilir)
      const storedLastActivity = parseInt(localStorage.getItem('lastActivity') || '0')
      const realLastActivity = Math.max(lastActivity, storedLastActivity)

      if (now - realLastActivity > INACTIVITY_LIMIT) {
        console.log("Kullanıcı 8 saattir pasif. Oturum kapatılıyor...")
        
        // Eventleri temizle
        events.forEach((event) => window.removeEventListener(event, updateActivity))
        clearInterval(checkInactivity)

        // Çıkış yap ve yönlendir
        await supabase.auth.signOut()
        router.push('/login?reason=timeout')
      }
    }, 60000) // Her 1 dakikada bir kontrol et

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(checkInactivity)
    }
  }, [supabase, router, lastActivity])

  return <>{children}</>
}