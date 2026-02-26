'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getToolUsageHistory, getLobbyProfile, type ToolUsageRecord } from '@/lib/tools/lobby'
import { toolRegistry } from '@/lib/tools/registry'

// Build slug → title map
const toolTitleMap: Record<string, string> = {}
toolRegistry.forEach((t) => { toolTitleMap[t.slug] = t.title })

const levelConfig: Record<string, { label: string; color: string; dot: string }> = {
    danger: { label: 'Kritik', color: 'text-red-600', dot: 'bg-red-500' },
    warning: { label: 'Uyarı', color: 'text-amber-600', dot: 'bg-amber-500' },
    success: { label: 'Stabil', color: 'text-emerald-600', dot: 'bg-emerald-500' },
}

export default function ToolsUserMenu() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [displayName, setDisplayName] = useState<string>('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [history, setHistory] = useState<ToolUsageRecord[]>([])
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (data.user) {
                setUser(data.user)
                // Fetch display_name from profiles
                const profile = await getLobbyProfile(supabase)
                const name = profile?.display_name
                    || data.user.user_metadata?.full_name
                    || data.user.email?.split('@')[0]
                    || 'Kullanıcı'
                setDisplayName(name)
            }
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                const profile = await getLobbyProfile(supabase)
                const name = profile?.display_name
                    || session.user.user_metadata?.full_name
                    || session.user.email?.split('@')[0]
                    || 'Kullanıcı'
                setDisplayName(name)
            }
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    // Load history on first dropdown open
    const loadHistory = useCallback(async () => {
        if (historyLoaded) return
        const h = await getToolUsageHistory(supabase, 3)
        setHistory(h)
        setHistoryLoaded(true)
    }, [supabase, historyLoaded])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    if (!user) return null

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
    }

    const toggleDropdown = () => {
        const next = !dropdownOpen
        setDropdownOpen(next)
        if (next) loadHistory()
    }

    return (
        <div className="flex items-center gap-2.5">
            {/* User Info */}
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

            {/* Lobby Link */}
            <a
                href="/lobby"
                className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.704 6.023 6.023 0 01-2.77-.704" />
                </svg>
                Lobim
            </a>

            {/* Recent Scenarios Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Geçmişim
                    <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-xl shadow-gray-200/40 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-900">Son Teşhislerim</p>
                        </div>

                        {!historyLoaded ? (
                            <div className="p-4 text-center">
                                <div className="w-4 h-4 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-gray-400">Henüz teşhis kaydınız yok.</p>
                                <a
                                    href="/tools-home"
                                    className="inline-block mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
                                >
                                    İlk teşhisini yap →
                                </a>
                            </div>
                        ) : (
                            <div>
                                {history.map((record) => {
                                    const lc = levelConfig[record.result_level] || levelConfig.success
                                    const toolTitle = toolTitleMap[record.tool_slug] || record.tool_slug
                                    return (
                                        <a
                                            key={record.id}
                                            href={`/tools/${record.tool_slug}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${lc.dot} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate">
                                                    {toolTitle}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    <span className={`font-medium ${lc.color}`}>{lc.label}</span>
                                                    {' · '}
                                                    {formatDate(record.created_at)}
                                                </p>
                                            </div>
                                            <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </a>
                                    )
                                })}
                                <a
                                    href="/lobby"
                                    className="flex items-center justify-center gap-1 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:bg-gray-100 transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Tüm Geçmişi Gör
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sign Out */}
            <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                Çıkış
            </button>
        </div>
    )
}
