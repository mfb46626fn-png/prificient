'use client'

import { AlertTriangle, ShieldCheck, Info } from 'lucide-react'

interface RiskGaugeProps {
    score: number
    level: 'safe' | 'unaware' | 'painful' | 'critical'
    context: string
}

export default function RiskGauge({ score, level, context }: RiskGaugeProps) {
    // 0 = Safe (0deg), 100 = Critical (180deg)
    const rotation = (score / 100) * 180

    let colorClass = 'text-emerald-500'
    let strokeClass = 'stroke-emerald-500'
    let shadowClass = 'shadow-emerald-500/20'
    let label = 'DÜŞÜK RİSK'

    if (score > 30) {
        colorClass = 'text-amber-500'
        strokeClass = 'stroke-amber-500'
        shadowClass = 'shadow-amber-500/20'
        label = 'ORTA RİSK'
    }
    if (score > 60) {
        colorClass = 'text-orange-500'
        strokeClass = 'stroke-orange-500'
        shadowClass = 'shadow-orange-500/20'
        label = 'YÜKSEK RİSK'
    }
    if (score > 80) {
        colorClass = 'text-red-500'
        strokeClass = 'stroke-red-600'
        shadowClass = 'shadow-red-500/30'
        label = 'KRİTİK KRİZ'
    }

    const isCritical = score > 60

    return (
        <div className={`bg-white rounded-3xl md:rounded-[2.5rem] p-4 md:p-6 border border-gray-100 shadow-sm relative overflow-hidden flex flex-row items-center gap-4 md:gap-8 group ${isCritical ? 'ring-1 ring-red-50' : ''}`}>

            {/* Visual Gauge - Compact Mobile, Normal Desktop */}
            <div className="relative w-24 h-12 md:w-32 md:h-16 shrink-0">
                {/* CSS Based Gauge */}
                <svg viewBox="0 0 100 50" className="w-full h-full transform -scale-x-100">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round" />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        className={`${strokeClass} transition-all duration-1000 ease-out`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="126"
                        strokeDashoffset={126 - (126 * (score / 100))}
                    />
                </svg>

                {/* Score */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center translate-y-1/3 z-20 leading-none">
                    <div className={`text-2xl md:text-3xl font-black ${colorClass}`}>{score}</div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider mb-1 md:mb-2 ${isCritical ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isCritical ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
                    <span className="truncate">{label}</span>
                </div>

                <h3 className="text-xs md:text-sm font-medium text-gray-500 leading-snug md:max-w-lg line-clamp-2 md:line-clamp-none">
                    {context}
                </h3>
            </div>

            {/* Pulse Decoration */}
            {isCritical && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
            )}
        </div>
    )
}
