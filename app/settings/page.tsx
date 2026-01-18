'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import SettingsClient from '@/components/SettingsClient'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<{ full_name: string, username: string, email?: string } | null>(null)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .maybeSingle()

        if (profileData) {
            setProfile({ ...profileData, email: user.email })
        } else {
            setProfile({ full_name: '', username: '', email: user.email })
        }

        setLoading(false)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>
    if (!profile) return null

    // Real save logic handled here or passed down. For now, reusing the basic structure.
    return <SettingsClient initialProfile={profile} />
}