import Link from 'next/link'
import type { Metadata } from 'next'
import { toolRegistry } from '@/lib/tools/registry'

export const metadata: Metadata = {
    title: 'Ücretsiz E-Ticaret Hesaplama Araçları | Prificient',
    description: 'E-ticaret işletmeniz için ücretsiz ROAS, Kâr Simülatörü, CLTV ve daha fazla hesaplama aracı. Hemen kullanmaya başlayın.',
}

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200/60', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200/60', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200/60', text: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200/60', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200/60', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200/60', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200/60', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200/60', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
    fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200/60', text: 'text-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-700' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200/60', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' },
    lime: { bg: 'bg-lime-50', border: 'border-lime-200/60', text: 'text-lime-600', badge: 'bg-lime-100 text-lime-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200/60', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200/60', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200/60', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
    zinc: { bg: 'bg-zinc-50', border: 'border-zinc-200/60', text: 'text-zinc-600', badge: 'bg-zinc-100 text-zinc-700' },
    stone: { bg: 'bg-stone-50', border: 'border-stone-200/60', text: 'text-stone-600', badge: 'bg-stone-100 text-stone-700' },
}

const categoryLabels: Record<string, string> = {
    finance: 'Finans',
    marketing: 'Pazarlama',
    operations: 'Operasyon',
    utility: 'Araç',
}

export default function ToolsHomePage() {
    return (
        <div className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-3">
                        Ücretsiz Araçlar
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        E-Ticaret Hesaplama Araçları
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto">
                        İşletmenizin finansal kararlarını daha bilinçli almanıza yardımcı olacak
                        ücretsiz araçları hemen kullanmaya başlayın.
                    </p>
                </div>

                {/* Tool Cards — dynamically from registry */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {toolRegistry.map((tool, index) => {
                        const c = colorMap[tool.color] || colorMap.violet
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="group relative rounded-2xl border border-gray-200/80 bg-white p-7 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {/* Badge */}
                                {index === 0 && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                                        Yeni
                                    </span>
                                )}

                                {/* Category */}
                                <span className="text-[10px] font-medium tracking-wider uppercase text-gray-400 mb-3 block">
                                    {categoryLabels[tool.category] || tool.category}
                                </span>

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-5`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} />
                                    </svg>
                                </div>

                                {/* Content */}
                                <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {tool.description}
                                </p>

                                {/* Arrow */}
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-violet-600 transition-colors">
                                    Kullanmaya Başla
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* CTA Banner */}
                <div className="mt-16 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-10 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Daha Fazlasını mı İstiyorsun?</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Prificient Dashboard ile tüm e-ticaret finansal verilerini tek panelden yönet.
                    </p>
                    <a
                        href="https://prificient.com"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
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
