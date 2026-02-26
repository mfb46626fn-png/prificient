'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toolRegistry } from '@/lib/tools/registry'
import {
    getLobbyProfile,
    getToolUsageHistory,
    getUsedToolSlugs,
    updateStoreInfo,
    updateDisplayName,
    type LobbyProfile,
    type ToolUsageRecord,
} from '@/lib/tools/lobby'

const levelConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    danger: { label: 'Tehlike', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    warning: { label: 'Uyarı', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    success: { label: 'Sağlıklı', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
}

const platformOptions = [
    { value: 'shopify', label: 'Shopify' },
    { value: 'woocommerce', label: 'WooCommerce' },
    { value: 'trendyol', label: 'Trendyol' },
    { value: 'hepsiburada', label: 'Hepsiburada' },
    { value: 'ticimax', label: 'Ticimax' },
    { value: 'ideasoft', label: 'IdeaSoft' },
    { value: 'other', label: 'Diğer' },
]

const revenueOptions = [
    { value: '0-50k', label: '0 - 50.000 ₺' },
    { value: '50k-250k', label: '50.000 - 250.000 ₺' },
    { value: '250k-1m', label: '250.000 - 1.000.000 ₺' },
    { value: '1m-5m', label: '1.000.000 - 5.000.000 ₺' },
    { value: '5m+', label: '5.000.000+ ₺' },
]

// Build a slug → tool title map from registry
const toolTitleMap: Record<string, string> = {}
toolRegistry.forEach((t) => { toolTitleMap[t.slug] = t.title })

export default function LobbyClient() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<LobbyProfile | null>(null)
    const [history, setHistory] = useState<ToolUsageRecord[]>([])
    const [usedSlugs, setUsedSlugs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Gamification state
    const [selectedPlatform, setSelectedPlatform] = useState('')
    const [selectedRevenue, setSelectedRevenue] = useState('')
    const [storeInfoSaved, setStoreInfoSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    // Settings state
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const [nameSaving, setNameSaving] = useState(false)

    const loadData = useCallback(async () => {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { setLoading(false); return }
        setUser(u)

        const [p, h, slugs] = await Promise.all([
            getLobbyProfile(supabase, u.id),
            getToolUsageHistory(supabase, u.id),
            getUsedToolSlugs(supabase, u.id),
        ])
        setProfile(p)
        setHistory(h)
        setUsedSlugs(slugs)
        if (p?.store_platform) setStoreInfoSaved(true)
        setLoading(false)
    }, [supabase])

    useEffect(() => { loadData() }, [loadData])

    const handleSaveStoreInfo = async () => {
        if (!selectedPlatform || !selectedRevenue || !user) return
        setSaving(true)
        const ok = await updateStoreInfo(supabase, user.id, selectedPlatform, selectedRevenue)
        if (ok) {
            setStoreInfoSaved(true)
            // Refresh profile for updated waitlist position
            const p = await getLobbyProfile(supabase, user.id)
            setProfile(p)
        }
        setSaving(false)
    }

    const unusedTools = toolRegistry.filter((t) => !usedSlugs.includes(t.slug))

    // Cross-sell messages based on what they already used
    const getCrossSellMessage = (slug: string): string => {
        if (usedSlugs.includes('roas-calculator') && slug === 'return-cost-calculator') {
            return 'ROAS\'ını hesapladın ama iade maliyetinin seni nasıl batırdığını henüz test etmedin.'
        }
        if (usedSlugs.includes('profit-simulator') && slug === 'cltv-calculator') {
            return 'Kâr simülasyonunu yaptın ama müşteri yaşam boyu değerini bilmeden doğru karar veremezsin.'
        }
        if (usedSlugs.includes('break-even-roas') && slug === 'bfcm-planner') {
            return 'Başa baş noktanı biliyorsun. BFCM\'de indirim yaparken bu marjı nasıl koruyacaksın?'
        }
        return `${toolTitleMap[slug] || slug} aracını henüz denemedim.`
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    // ─── Loading ────────────────────────────
    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
            </div>
        )
    }

    // ─── Not logged in ──────────────────────
    if (!user) {
        return (
            <div className="py-20 text-center max-w-md mx-auto px-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Lobiye erişmek için giriş yapın</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Herhangi bir ücretsiz aracı kullanarak giriş yaptığınızda Lobinize erişebilirsiniz.
                </p>
                <a
                    href="/tools-home"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                    Araçlara Git
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>
        )
    }

    // ─── Main Lobby ─────────────────────────
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı'

    const handleSaveName = async () => {
        if (!nameInput.trim() || !user) return
        setNameSaving(true)

        try {
            const ok = await updateDisplayName(supabase, user.id, nameInput)
            if (ok) {
                // Force a session refresh to get the new user_metadata immediately
                const { data: { session }, error } = await supabase.auth.refreshSession()
                if (session?.user && !error) {
                    setUser(session.user)
                } else {
                    // Fallback to getUser if refresh fails
                    const { data: { user: updatedUser } } = await supabase.auth.getUser()
                    if (updatedUser) setUser(updatedUser)
                }
                setEditingName(false)
            }
        } catch (err) {
            console.error('Error saving name:', err)
        } finally {
            setNameSaving(false)
        }
    }

    return (
        <div className="py-10 px-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* ── Header ──────────────────────────── */}
                <div className="text-center">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-2">
                        Prificient Lobi
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Hoş geldin, {displayName.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Prificient&apos;a adım adım yaklaşıyorsun
                    </p>

                    {/* Waitlist badge */}
                    {profile?.waitlist_position && (
                        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200/50">
                            <div className="text-left">
                                <p className="text-[10px] uppercase tracking-wider text-violet-200 font-medium">
                                    Erken Erişim Sırası
                                </p>
                                <p className="text-2xl font-bold tracking-tight">
                                    #{profile.waitlist_position.toLocaleString('tr-TR')}
                                </p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.704 6.023 6.023 0 01-2.77-.704" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* ── Gamification: Sıra Atlama ────────── */}
                {!storeInfoSaved && (
                    <div className="rounded-2xl border border-violet-200/60 bg-violet-50/50 p-6 sm:p-8">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Sırada öne geçmek ister misin?
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Mağaza bilgilerini paylaş, <span className="font-semibold text-violet-600">+500 sıra atla!</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 mb-5">
                            {/* Platform */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mağaza Platformun</label>
                                <select
                                    value={selectedPlatform}
                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {platformOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Revenue */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Aylık Ciro Aralığın</label>
                                <select
                                    value={selectedRevenue}
                                    onChange={(e) => setSelectedRevenue(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {revenueOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveStoreInfo}
                            disabled={!selectedPlatform || !selectedRevenue || saving}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet ve +500 Sıra Atla'}
                        </button>
                    </div>
                )}

                {/* ── Store info saved confirmation ───── */}
                {storeInfoSaved && (
                    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Mağaza bilgilerin kaydedildi!</p>
                            <p className="text-xs text-gray-500">+500 sıra atladın. Yeni sıran: #{profile?.waitlist_position?.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                )}

                {/* ── Referral Section ────────────────── */}
                {profile?.referral_code && (
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Arkadaşını Davet Et</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Bu linki bir e-ticaret satıcısı arkadaşınla paylaş. Üye olursa <span className="font-semibold text-violet-600">+1.000 sıra atla!</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
                                tools.prificient.com?ref={profile.referral_code}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://tools.prificient.com?ref=${profile.referral_code}`)
                                }}
                                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex-shrink-0"
                            >
                                Kopyala
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Teşhis Geçmişim ─────────────────── */}
                {history.length > 0 && (
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Teşhis Geçmişim
                        </h3>
                        <div className="space-y-3">
                            {history.map((record) => {
                                const lc = levelConfig[record.result_level] || levelConfig.success
                                const toolTitle = toolTitleMap[record.tool_slug] || record.tool_slug
                                return (
                                    <a
                                        key={record.id}
                                        href={`/tools/${record.tool_slug}`}
                                        className="flex items-center gap-4 rounded-xl border border-gray-200/80 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                    >
                                        {/* Level badge */}
                                        <div className={`w-10 h-10 rounded-xl ${lc.bg} ${lc.border} border flex items-center justify-center flex-shrink-0`}>
                                            {record.result_level === 'danger' && (
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                </svg>
                                            )}
                                            {record.result_level === 'warning' && (
                                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                            )}
                                            {record.result_level === 'success' && (
                                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                                                {toolTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {record.insight_title || lc.label} • {formatDate(record.created_at)}
                                            </p>
                                        </div>

                                        {/* Level pill */}
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${lc.bg} ${lc.color} flex-shrink-0`}>
                                            {lc.label}
                                        </span>

                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── Sıradaki Teşhisler (Cross-Sell) ─── */}
                {unusedTools.length > 0 && (
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            Sıradaki Teşhisler
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {unusedTools.slice(0, 6).map((tool) => (
                                <a
                                    key={tool.slug}
                                    href={`/tools/${tool.slug}`}
                                    className="rounded-xl border border-gray-200/80 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                >
                                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">
                                        {tool.title}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {getCrossSellMessage(tool.slug)}
                                    </p>
                                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-violet-600 group-hover:text-violet-700">
                                        Şimdi Test Et
                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Ayarlar ──────────────────────────── */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ayarlar
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Profilinizi düzenleyin</p>

                    <div className="space-y-3">
                        {/* Display Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Görünen İsim</label>
                            {editingName ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                        placeholder="Adınız Soyadınız"
                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={!nameInput.trim() || nameSaving}
                                        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {nameSaving ? '...' : 'Kaydet'}
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        İptal
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {displayName}
                                    </div>
                                    <button
                                        onClick={() => { setNameInput(user.user_metadata?.full_name || ''); setEditingName(true) }}
                                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">E-posta</label>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                {user.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CTA Banner ──────────────────────── */}
                <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-10 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Tam Sürüm Yakında 🚀</h3>
                    <p className="text-sm text-gray-400 mb-1">
                        Tüm araçlarını tek bir dashboard'da, gerçek Shopify verileriyle kullan.
                    </p>
                    <p className="text-xs text-gray-500">
                        Sen sıra listesinde beklerken biz son rötuşları yapıyoruz.
                    </p>
                </div>
            </div>
        </div>
    )
}
