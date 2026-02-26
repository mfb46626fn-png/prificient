'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { toolRegistry } from '@/lib/tools/registry'
import type { PlatformType } from '@/lib/tools/types'

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
    sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-300' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
    fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500/20 text-fuchsia-300' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300' },
    lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-400', badge: 'bg-lime-500/20 text-lime-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
    zinc: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400', badge: 'bg-zinc-500/20 text-zinc-300' },
    stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/20', text: 'text-stone-400', badge: 'bg-stone-500/20 text-stone-300' },
}

const categoryLabels: Record<string, string> = {
    finance: 'Finans',
    marketing: 'Pazarlama',
    operations: 'Operasyon',
    utility: 'Araç',
}

const platformLabels: Record<string, string> = {
    amazon: 'Amazon',
    shopify: 'Shopify',
    trendyol: 'Trendyol',
    hepsiburada: 'Hepsiburada',
    etsy: 'Etsy',
    global: 'Global',
}

const platformFilters = [
    { id: 'all', label: 'Tümü', icon: '🌍' },
    { id: 'global', label: 'Shopify / Global', icon: '🛒' },
    { id: 'amazon', label: 'Amazon', icon: '📦' },
    { id: 'trendyol-hb', label: 'Trendyol & HB', icon: '🛍️' },
    { id: 'etsy', label: 'Etsy', icon: '🎨' },
]

export default function ToolsHomeClient() {
    const [activeFilter, setActiveFilter] = useState('all')

    const filteredTools = useMemo(() => {
        if (activeFilter === 'all') return toolRegistry
        if (activeFilter === 'trendyol-hb') {
            return toolRegistry.filter((t) =>
                t.platforms.includes('trendyol') || t.platforms.includes('hepsiburada')
            )
        }
        return toolRegistry.filter((t) =>
            t.platforms.includes(activeFilter as PlatformType)
        )
    }, [activeFilter])

    return (
        <div className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-violet-500 mb-3">
                        Ücretsiz Araçlar
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                        E-Ticaretin Hangi Alanındasınız?
                    </h1>
                    <p className="text-base text-slate-400 max-w-xl mx-auto">
                        Kârınızı gerçek verilerle hesaplayın. Platformunuzu seçin, size özel araçları keşfedin.
                    </p>
                </div>

                {/* Platform Filter Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {platformFilters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter.id
                                ? 'bg-white text-slate-900 shadow-md shadow-white/10'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                        >
                            <span className="text-sm">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Tool Count */}
                <p className="text-xs font-semibold text-slate-500 mb-6 text-center">
                    {filteredTools.length} ARAÇ GÖSTERİLİYOR
                </p>

                {/* Tool Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {filteredTools.map((tool) => {
                        const c = colorMap[tool.color] || colorMap.violet
                        const isNew = tool.platforms.some((p) => p !== 'global')
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="group relative rounded-2xl border border-white/10 bg-slate-900/50 p-7 hover:bg-slate-900 hover:border-white/20 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {/* Platform Badges */}
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    {isNew && (
                                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                                            YENİ
                                        </span>
                                    )}
                                    {tool.platforms.filter((p) => p !== 'global').map((p) => (
                                        <span
                                            key={p}
                                            className="text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300"
                                        >
                                            {platformLabels[p] || p}
                                        </span>
                                    ))}
                                </div>

                                {/* Category */}
                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-4 block">
                                    {categoryLabels[tool.category] || tool.category}
                                </span>

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-5`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} />
                                    </svg>
                                </div>

                                {/* Content */}
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                    {tool.description}
                                </p>

                                {/* Arrow */}
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 group-hover:text-violet-400 transition-colors uppercase">
                                    Kullanmaya Başla
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* CTA Banner */}
                <div className="mt-16 rounded-2xl bg-gradient-to-br from-violet-900/30 to-slate-900 border border-white/10 p-8 sm:p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Daha Fazlasını mı İstiyorsun?</h3>
                    <p className="text-sm text-slate-400 mb-6 relative z-10">
                        Prificient Dashboard ile tüm e-ticaret finansal verilerini tek panelden yönet.
                    </p>
                    <a
                        href="https://prificient.com"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-slate-200 transition-colors relative z-10"
                    >
                        Erken Erişim Talep Et
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    )
}
