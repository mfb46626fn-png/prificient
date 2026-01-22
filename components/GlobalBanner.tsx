'use client'

import { createClient } from '@/utils/supabase/client'
import { AlertCircle, AlertTriangle, Info, X, Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function GlobalBanner() {
    const [announcement, setAnnouncement] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false) // Start invisible for animation
    const [isModalOpen, setIsModalOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const { data } = await supabase
                .from('system_announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                // Check if expired
                if (data.expires_at && new Date(data.expires_at) < new Date()) return

                // Check LocalStorage for dismissal
                const dismissedId = localStorage.getItem('prificient_dismissed_announcement')
                if (dismissedId === data.id) return

                setAnnouncement(data)
                // Small delay for animation trigger
                setTimeout(() => setIsVisible(true), 100)
            }
        }

        fetchAnnouncement()

        // Realtime subscription could be added here
        const channel = supabase.channel('system_announcements_global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_announcements' }, () => {
                fetchAnnouncement()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        if (announcement) {
            localStorage.setItem('prificient_dismissed_announcement', announcement.id)
        }
    }

    if (!announcement) return null

    const styles = {
        info: {
            wrapper: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 shadow-indigo-200',
            iconBg: 'bg-white/20',
            icon: Info
        },
        warning: {
            wrapper: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-orange-200',
            iconBg: 'bg-white/20',
            icon: AlertTriangle
        },
        error: {
            wrapper: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 shadow-rose-200',
            iconBg: 'bg-white/20',
            icon: AlertCircle
        }
    }

    const style = styles[announcement.type as keyof typeof styles] || styles.info
    const Icon = style.icon

    return (
        <>
            {/* Banner */}
            <div
                className={`
                    relative z-[9999] overflow-hidden transition-all duration-500 ease-in-out
                    ${isVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className={`
                    ${style.wrapper} 
                    text-white shadow-md border-b border-white/10 relative
                `}>
                    <div className="container mx-auto px-4 py-3 sm:py-2.5 flex items-center justify-center max-w-7xl relative">

                        <div className="flex items-center gap-3 justify-center text-center">
                            {/* Clickable Icon for Details */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className={`p-1.5 rounded-full ${style.iconBg} shrink-0 hidden sm:flex transition-colors`}
                                title="Detayları Gör"
                            >
                                <Icon size={18} className="text-white" />
                            </button>

                            <div className="text-sm sm:text-[15px] font-medium leading-tight text-white/95 text-shadow-sm">
                                {announcement.title || announcement.message}
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="absolute right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors group"
                            aria-label="Kapat"
                        >
                            <X size={18} className="text-white/80 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className={`px-6 py-4 flex items-center justify-between ${style.wrapper} text-white`}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Icon size={20} />
                                {announcement.title || "Duyuru Detayı"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-6">
                            <div className="prose prose-sm prose-indigo text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {announcement.details || announcement.message}
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-3 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
