'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ImpersonationBanner() {
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check cookie client-side to avoid hydration mismatch (or we can assume server rendered condition)
        // But doing it client-side is safer for now.
        const hasCookie = document.cookie.includes('impersonated_user_id=')
        setIsVisible(hasCookie)
    }, [])

    const stopImpersonation = async () => {
        try {
            await fetch('/api/admin/stop-impersonate', { method: 'POST' })
            router.refresh()
            window.location.href = '/admin/support' // Go back to admin
        } catch (error) {
            console.error('Failed to stop impersonation', error)
        }
    }

    if (!isVisible) return null

    return (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-[9999] relative">
            <div className="font-bold flex items-center gap-2">
                <span>👁️ GOD MODE: Bir kullanıcıyı görüntülüyorsunuz.</span>
            </div>
            <button
                onClick={stopImpersonation}
                className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-50 transition-colors"
            >
                <LogOut size={16} />
                Çıkış Yap
            </button>
        </div>
    )
}
