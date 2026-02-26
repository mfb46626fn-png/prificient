'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getAuditHistory, type FinancialAuditRecord } from '@/lib/tools/lobby'
import { toolRegistry } from '@/lib/tools/registry'
import { ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react'

const toolTitleMap: Record<string, string> = {}
toolRegistry.forEach((t) => { toolTitleMap[t.slug] = t.title })

export default function VaultClient() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [history, setHistory] = useState<FinancialAuditRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const fetchUserAndHistory = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                if (isMounted) setLoading(false)
                return
            }

            if (isMounted) setUser(session.user)

            const h = await getAuditHistory(supabase, session.user.id, 50)
            if (isMounted) {
                setHistory(h)
                setLoading(false)
            }
        }

        fetchUserAndHistory()

        return () => { isMounted = false }
    }, [supabase])

    // Generate dynamic profiles based on history
    const generateProfiles = () => {
        const tags = new Set<string>()
        let totalDanger = 0

        history.forEach(audit => {
            // Check for ROAS focus
            if (audit.tool_slug.includes('roas') || audit.tool_slug.includes('ads')) {
                tags.add('Trafik & Reklam Odaklı')
            }

            // Check for high return rates (assuming keys like returnRate, iadeOrani etc)
            const returns = parseFloat(audit.inputs['returnRate'] || audit.inputs['iadeOrani'] || audit.inputs['iade'] || '0')
            if (returns >= 15) {
                tags.add('Yüksek İade Riskli')
            }

            // Check for danger severity
            if (audit.severity_level === 'danger') {
                totalDanger++
            }
        })

        if (totalDanger >= 2) {
            tags.add('Kritik Kâr Erimesi Bölgesinde')
        } else if (history.length > 0 && totalDanger === 0) {
            tags.add('Stabil Kârlılık')
        }

        if (tags.size === 0) {
            tags.add('Yeni Analist')
        }

        return Array.from(tags)
    }

    const profiles = generateProfiles()

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Finansal Kasanız Kilitli</h1>
                <p className="text-gray-500 mb-6 max-w-sm">
                    Geçmiş analizlerinizi ve profilinizi görmek için lütfen giriş yapın.
                </p>
                <a href="/tools-home" className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors">
                    Araçlara Dön
                </a>
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const getSeverityDetails = (severity: string) => {
        switch (severity) {
            case 'danger': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Kritik Risk' }
            case 'warning': return { icon: Info, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Potansiyel Risk' }
            case 'success': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Stabil' }
            default: return { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Bilgi' }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <a href="/tools-home" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-violet-600" />
                        <h1 className="text-lg font-bold text-gray-900">Kasam</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* Profile Tags Section */}
                <section>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Prificient Profiliniz</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                <span className="text-xl font-bold text-violet-700">
                                    {(user.user_metadata?.full_name || user.email || 'K').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı'}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {profiles.map((profile, i) => (
                                <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                                    {profile}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Silent Nurture Soft CTA */}
                <section>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black p-6 sm:p-8 border border-gray-800 shadow-xl">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Geliştirme Aşamasında
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Prificient İşletim Sistemi</h2>
                            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mb-6">
                                Bu hesaplamaları her gün manuel yapmak yerine; mağazanızı API ile bağlayıp,
                                anlık sızıntıları saniyesinde tespit edeceğiniz tam sürüm için tetikte kalın.
                                Kasanızdaki veriler, size en uygun özellikleri sunmamıza yardımcı oluyor.
                            </p>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 shadow-inner">
                                <ShieldCheck className="w-4 h-4 text-violet-400" />
                                Profiliniz Erken Erişim İçin İşaretlendi
                            </div>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                    </div>
                </section>

                {/* Audit History */}
                <section>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Finansal Sicilim</h2>

                    {history.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Henüz Siciliniz Boş</h3>
                            <p className="text-sm text-gray-500 mb-4">Kâr hesaplama araçlarımızı kullanarak ilk izinizi bırakın.</p>
                            <a href="/tools-home" className="inline-block px-5 py-2.5 bg-violet-50 text-violet-700 font-semibold text-sm rounded-xl hover:bg-violet-100 transition-colors">
                                Araçları Keşfet
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((audit) => {
                                const details = getSeverityDetails(audit.severity_level)
                                const Icon = details.icon
                                const toolTitle = toolTitleMap[audit.tool_slug] || audit.tool_slug

                                // Create a query string from inputs to pre-fill the tool when clicked
                                const params = new URLSearchParams()
                                Object.entries(audit.inputs).forEach(([k, v]) => params.append(k, v))
                                const href = `/tools/${audit.tool_slug}?${params.toString()}`

                                return (
                                    <a
                                        key={audit.id}
                                        href={href}
                                        className="group block bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-violet-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${details.bg}`}>
                                                <Icon className={`w-5 h-5 ${details.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        {formatDate(audit.created_at)}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className={`text-[10px] items-center gap-1 font-bold ${details.color} uppercase tracking-wider hidden sm:flex`}>
                                                        {details.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                                                    {toolTitle} Analizi
                                                </h3>
                                                {audit.insight_title && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        Teşhis: {audit.insight_title}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 flex items-center self-center pl-2">
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    </a>
                                )
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
