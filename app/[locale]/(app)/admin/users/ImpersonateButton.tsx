'use client'

import { Eye, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ImpersonateButton({ userId, userEmail }: { userId: string, userEmail?: string }) {
    const [loading, setLoading] = useState(false)

    const handleImpersonate = async () => {
        if (!confirm(`DİKKAT: ${userEmail} kullanıcısı olarak sistemi görüntülemek üzeresiniz.\n\nDevam etmek istiyor musunuz?`)) return

        setLoading(true)
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                body: JSON.stringify({ targetUserId: userId })
            })

            if (res.ok) {
                // Redirect to dashboard
                window.location.href = '/dashboard'
            } else {
                alert('Hata oluştu')
                setLoading(false)
            }
        } catch (e) {
            console.error(e)
            alert('Bağlantı hatası')
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleImpersonate}
            disabled={loading}
            title="Kullanıcı Olarak Gör (God Mode)"
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all group relative"
        >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Eye size={20} />}
            <span className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                God Mode
            </span>
        </button>
    )
}
