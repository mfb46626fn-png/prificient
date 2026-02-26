'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuditHistory, type FinancialAuditRecord } from '@/lib/tools/lobby'
import { toolRegistry } from '@/lib/tools/registry'

// Build slug → title map
const toolTitleMap: Record<string, string> = {}
toolRegistry.forEach((t) => { toolTitleMap[t.slug] = t.title })

const levelConfig: Record<string, { label: string; color: string; dot: string }> = {
    danger: { label: 'Kritik', color: 'text-red-400', dot: 'bg-red-500' },
    warning: { label: 'Uyarı', color: 'text-amber-400', dot: 'bg-amber-500' },
    success: { label: 'Stabil', color: 'text-emerald-400', dot: 'bg-emerald-500' },
}

export default function ToolsUserMenu() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [displayName, setDisplayName] = useState<string>('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [history, setHistory] = useState<FinancialAuditRecord[]>([])
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (data.user) {
                setUser(data.user)
                const name = data.user.user_metadata?.full_name
                    || data.user.email?.split('@')[0]
                    || 'Kullanıcı'
                setDisplayName(name)
            }
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                const name = session.user.user_metadata?.full_name
                    || session.user.email?.split('@')[0]
                    || 'Kullanıcı'
                setDisplayName(name)
            }
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    // Load history on first dropdown open
    const loadHistory = useCallback(async () => {
        if (historyLoaded || !user) return
        const h = await getAuditHistory(supabase, user.id, 3)
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
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <span className="text-xs text-neutral-400 max-w-[120px] truncate">
                    {displayName}
                </span>
            </div>

            {/* Vault Link */}
            <a
                href="/my-vault"
                className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Kasam
            </a>

            {/* Vault Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Finansal Sicilim
                    <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-xl shadow-black/50 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                            <p className="text-xs font-semibold text-white">Finansal Sicilim</p>
                            <a href="/my-vault" className="text-[10px] text-neutral-400 hover:text-white transition-colors underline">Kasaya Git</a>
                        </div>

                        {!historyLoaded ? (
                            <div className="p-4 text-center">
                                <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-neutral-400">Henüz teşhis kaydınız yok.</p>
                                <a
                                    href="/tools-home"
                                    className="inline-block mt-2 text-xs font-semibold text-neutral-400 hover:text-white"
                                >
                                    İlk teşhisini yap →
                                </a>
                            </div>
                        ) : (
                            <div>
                                {history.map((record) => {
                                    const lc = levelConfig[record.severity_level] || levelConfig.success
                                    const toolTitle = toolTitleMap[record.tool_slug] || record.tool_slug
                                    return (
                                        <a
                                            key={record.id}
                                            href={`/tools/${record.tool_slug}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${lc.dot} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">
                                                    {toolTitle}
                                                </p>
                                                <p className="text-[10px] text-neutral-500">
                                                    <span className={`font-medium ${lc.color}`}>{lc.label}</span>
                                                    {' · '}
                                                    {formatDate(record.created_at)}
                                                </p>
                                            </div>
                                            <svg className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </a>
                                    )
                                })}
                                <a
                                    href="/lobby"
                                    className="flex items-center justify-center gap-1 px-4 py-2.5 bg-white/5 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
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
                className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
                Çıkış
            </button>
        </div>
    )
}
