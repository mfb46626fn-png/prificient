'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { toolRegistry } from '@/lib/tools/registry'
import type { PlatformType } from '@/lib/tools/types'

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    // Override previously colored icons with true dark neutral styles
    default: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white', badge: 'bg-white/10 text-white' }
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
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-3">
                        Ücretsiz Araçlar
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                        E-Ticaretin Hangi Alanındasınız?
                    </h1>
                    <p className="text-base text-neutral-400 max-w-xl mx-auto">
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
                                ? 'bg-white text-black shadow-md shadow-white/10'
                                : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10'
                                }`}
                        >
                            <span className="text-sm">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Tool Count */}
                <p className="text-xs font-semibold text-neutral-500 mb-6 text-center">
                    {filteredTools.length} ARAÇ GÖSTERİLİYOR
                </p>

                {/* Tool Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {filteredTools.map((tool) => {
                        const isNew = tool.platforms.some((p) => p !== 'global')
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="group relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-7 hover:bg-white/[0.04] hover:border-white/20 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {/* Platform Badges */}
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    {isNew && (
                                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
                                            YENİ
                                        </span>
                                    )}
                                    {tool.platforms.filter((p) => p !== 'global').map((p) => (
                                        <span
                                            key={p}
                                            className="text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300"
                                        >
                                            {platformLabels[p] || p}
                                        </span>
                                    ))}
                                </div>

                                {/* Category */}
                                <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 mb-4 block">
                                    {categoryLabels[tool.category] || tool.category}
                                </span>

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-5`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} />
                                    </svg>
                                </div>

                                {/* Content */}
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-neutral-400 leading-relaxed mb-5">
                                    {tool.description}
                                </p>

                                {/* Arrow */}
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-400 group-hover:text-white transition-colors uppercase">
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
                <div className="mt-16 rounded-2xl bg-[#0A0A0A] border border-white/10 p-8 sm:p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Daha Fazlasını mı İstiyorsun?</h3>
                    <p className="text-sm text-neutral-400 mb-6 relative z-10">
                        Prificient Dashboard ile tüm e-ticaret finansal verilerini tek panelden yönet.
                    </p>
                    <a
                        href="https://prificient.com"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors relative z-10"
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
