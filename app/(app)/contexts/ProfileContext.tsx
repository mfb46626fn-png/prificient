'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ProfileContextType {
  avatarUrl: string | null;
  updateAvatarUrl: (newUrl: string | null) => void;
  loading: boolean;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Profili Çeken Ana Fonksiyon
  const fetchProfile = useCallback(async (userId?: string) => {
    let uid = userId

    // Eğer ID gelmediyse (manuel çağrılmadıysa) aktif kullanıcıyı bul
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAvatarUrl(null)
        setLoading(false)
        return
      }
      uid = user.id
    }

    if (uid) {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', uid)
        .maybeSingle() // Use maybeSingle to not error on 0 rows

      if (!data && !error) {
        // Profile missing! Restore it.
        console.warn("Profile missing for auth user. Attempting to restore...")

        // Get metadata to restore name
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Kullanıcı',
            is_onboarding_completed: false
          })

          if (insertError) {
            console.error("Failed to restore profile:", insertError)
          } else {
            console.log("Profile restored successfully.")
            // Retry fetch or just set defaults
            setAvatarUrl(null)
          }
        }
      } else if (data && data.avatar_url) {
        setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`)
      } else {
        setAvatarUrl(null)
      }
    }
    setLoading(false)
  }, [supabase])

  // 1. Sayfa ilk yüklendiğinde Session Kontrolü (Sayfa yenilenince çalışır)
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }
    initSession()
  }, [fetchProfile])

  // 2. Oturum değişikliği dinleyicisi (Çıkış/Giriş anında çalışır)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setAvatarUrl(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Manuel güncelleme
  const updateAvatarUrl = (newUrl: string | null) => {
    if (newUrl) {
      setAvatarUrl(`${newUrl}?t=${new Date().getTime()}`)
    } else {
      setAvatarUrl(null)
    }
  }

  // Tetikleyici
  const refreshProfile = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // refreshTrigger değişince de çalıştır
  useEffect(() => {
    if (refreshTrigger > 0) fetchProfile()
  }, [refreshTrigger, fetchProfile])

  return (
    <ProfileContext.Provider value={{ avatarUrl, updateAvatarUrl, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}