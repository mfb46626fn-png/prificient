'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function ToolsUserMenu() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    if (!user) return null

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı'

    return (
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-violet-600">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <span className="text-xs text-gray-500 max-w-[120px] truncate">
                    {displayName}
                </span>
            </div>
            <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                Çıkış
            </button>
        </div>
    )
}
