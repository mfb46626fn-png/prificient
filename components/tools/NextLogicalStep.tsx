'use client'

import { getNextTool } from '@/lib/tools/data'
import { getToolBySlug } from '@/lib/tools/registry'

interface NextLogicalStepProps {
    currentSlug: string
}

export default function NextLogicalStep({ currentSlug }: NextLogicalStepProps) {
    const next = getNextTool(currentSlug)
    if (!next) return null

    const nextConfig = getToolBySlug(next.slug)
    if (!nextConfig) return null

    // Color map for target tool
    const colorMap: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
        finance: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200/60', hoverBg: 'hover:bg-violet-100/60' },
        marketing: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/60', hoverBg: 'hover:bg-blue-100/60' },
        operations: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60', hoverBg: 'hover:bg-amber-100/60' },
        utility: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200/60', hoverBg: 'hover:bg-gray-100/60' },
    }

    const c = colorMap[nextConfig.category] || colorMap.finance

    return (
        <a
            href={`/tools/${next.slug}`}
            className={`group block rounded-2xl border ${c.border} ${c.bg} ${c.hoverBg} p-5 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={nextConfig.icon} />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p className={`text-[10px] font-semibold tracking-[0.15em] uppercase ${c.text} mb-1`}>
                        Sıradaki Adım
                    </p>

                    {/* Message */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {next.message}
                    </p>

                    {/* CTA */}
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} group-hover:gap-2.5 transition-all`}>
                        {next.ctaLabel}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    )
}
