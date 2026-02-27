'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuditHistory, type FinancialAuditRecord } from '@/lib/tools/lobby'
import { ChevronDown, History, LogOut, User as UserIcon } from 'lucide-react'
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
    const [profileOpen, setProfileOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)

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
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
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
        <div className="flex items-center gap-2 sm:gap-4">
            {/* Vault Dropdown (Finansal Sicilim) */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-2 ${dropdownOpen ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                >
                    <History size={20} />
                    <span className="hidden sm:inline-block text-sm font-bold">Finansal Sicilim</span>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-[#0A0A0A]/95 rounded-[2rem] shadow-xl border border-white/10 py-4 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right backdrop-blur-xl">
                        <div className="px-6 pb-2 border-b border-white/5 flex justify-between items-center mb-2">
                            <h4 className="font-bold text-sm text-white">Finansal Sicilim</h4>
                            <a href="/my-vault" className="text-[10px] text-neutral-400 hover:text-white font-bold transition-colors bg-white/5 px-2 py-0.5 rounded-full">Kasa →</a>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {!historyLoaded ? (
                                <div className="p-8 text-center">
                                    <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-[11px] text-neutral-400">Henüz teşhis kaydınız yok.</p>
                                    <a
                                        href="/tools-home"
                                        className="inline-block mt-2 text-xs font-bold text-white hover:text-neutral-300"
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
                                                className="flex justify-between items-start px-6 py-4 border-b border-white/5 hover:bg-white/5 cursor-pointer group transition-colors last:border-0"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full border-2 border-[#0A0A0A] ${lc.dot} ring-1 ring-white/10 flex-shrink-0`} />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                                            {toolTitle}
                                                        </p>
                                                        <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                                                            <span className={`font-medium ${lc.color}`}>{lc.label}</span>
                                                            {' · '}
                                                            {formatDate(record.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                        )
                                    })}
                                    <a
                                        href="/lobby"
                                        className="block mt-2 mx-6 py-2.5 bg-white/5 rounded-xl text-center text-[11px] font-bold text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Tüm Geçmişi Gör
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 text-white rounded-full flex items-center justify-center font-bold">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-white line-clamp-1">{displayName}</p>
                        <p className="text-xs text-neutral-500 font-medium">{user.email?.split('@')[0] || 'Hesap'}</p>
                    </div>
                    <ChevronDown size={16} className={`text-neutral-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-[#0A0A0A]/95 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-6 py-4 border-b border-white/5 mb-2">
                            <p className="text-sm font-black text-white truncate">{displayName}</p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>

                        <a href="/tools-profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 mx-2 rounded-xl transition-colors">
                            <UserIcon size={18} /> Profil & Ayarlar
                        </a>

                        <div className="h-px bg-white/5 my-2 mx-4"></div>

                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-rose-500 hover:bg-rose-500/10 mx-2 rounded-xl transition-colors"
                        >
                            <LogOut size={18} /> Çıkış Yap
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
