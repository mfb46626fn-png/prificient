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
        try {
            const h = await getAuditHistory(supabase, user.id, 3)
            setHistory(h || [])
        } catch (error) {
            console.error('Failed to load history:', error)
            setHistory([])
        } finally {
            setHistoryLoaded(true)
        }
    }, [supabase, historyLoaded, user])

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
        <div className="flex items-center gap-2">

            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                    onClick={toggleDropdown}
                    className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all ${dropdownOpen
                            ? 'bg-white/10 border-white/20'
                            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                        }`}
                >
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                        <span className="text-xs font-semibold text-white max-w-[100px] truncate leading-tight">
                            {displayName}
                        </span>
                        <span className="text-[9px] font-medium tracking-wider text-neutral-500 uppercase leading-tight">
                            Analist
                        </span>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-neutral-500 transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Box */}
                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-xl shadow-black/50 z-50 overflow-hidden flex flex-col">

                        {/* Header: Quick Links */}
                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Hızlı Erişim</span>
                            <div className="flex items-center gap-3">
                                <a href="/tools-profile" className="text-[11px] font-medium text-neutral-300 hover:text-white transition-colors">Profil</a>
                                <a href="/my-vault" className="text-[11px] font-medium text-neutral-300 hover:text-white transition-colors">Kasam</a>
                            </div>
                        </div>

                        {/* Recent History Section */}
                        <div className="px-4 py-2 bg-transparent border-b border-white/5">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Son Analizler</span>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {!historyLoaded ? (
                                <div className="p-6 text-center">
                                    <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-xs text-neutral-400 mb-2">Henüz analiz geçmişiniz yok.</p>
                                    <a href="/tools-home" className="text-xs font-semibold text-white hover:underline">
                                        Araçları Keşfet
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col">
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
                                                    <p className="text-[10px] text-neutral-500 mt-0.5">
                                                        <span className={`font-medium ${lc.color}`}>{lc.label}</span>
                                                        {' · '}
                                                        {formatDate(record.created_at)}
                                                    </p>
                                                </div>
                                                <svg className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer: See All & Logout */}
                        {history.length > 0 && (
                            <div className="border-t border-white/5">
                                <a
                                    href="/lobby"
                                    className="flex items-center justify-center py-2.5 text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Tüm Analiz Geçmişi
                                </a>
                            </div>
                        )}
                        <div className="border-t border-white/5 bg-black/20">
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-3 text-[11px] font-semibold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
