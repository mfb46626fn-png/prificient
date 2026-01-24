'use client'

import { PainDiagnosis, PainLevel } from '@/lib/scoring/pain-engine'
import { AlertTriangle, ArrowRight, Skull, TrendingDown, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface DecisionDeskProps {
    diagnosis: PainDiagnosis
    userName: string
}

const LEVEL_COLORS: Record<PainLevel, string> = {
    'safe': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'unaware': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'painful': 'bg-orange-100 text-orange-800 border-orange-200',
    'critical': 'bg-red-50 text-red-900 border-red-200'
}

const LEVEL_LABELS: Record<PainLevel, string> = {
    'safe': 'GÜVENLİ',
    'unaware': 'RİSK ALTINDA',
    'painful': 'ACİL MÜDAHALE',
    'critical': 'KRİTİK KRİZ'
}

export default function DecisionDesk({ diagnosis, userName }: DecisionDeskProps) {
    const { score, level, factors, opportunity_loss } = diagnosis

    const factorEntries = Object.entries(factors).sort(([, a], [, b]) => b - a)
    const [topFactor, topFactorScore] = factorEntries[0] || ['none', 0]

    // -- ZERO STATE CHECKS --
    const isClean = score === 0 || topFactorScore === 0
    const isSafe = opportunity_loss === 0

    const getWoundText = (factor: string) => {
        if (isClean) return { title: 'Temiz', desc: 'Sistemsel bir risk bulunamadı.' }
        switch (factor) {
            case 'toxic_product_impact': return { title: 'Toksik Ürünler', desc: 'Zarar edenleri kapat.' }
            case 'refund_bleed_impact': return { title: 'İade Kanaması', desc: 'İade oranlarını düşür.' }
            case 'roas_trap_impact': return { title: 'ROAS Tuzağı', desc: 'Reklam bütçeni kıs.' }
            case 'cash_flow_impact': return { title: 'Nakit Krizi', desc: 'Giderleri kontrol et.' }
            case 'silent_fee_impact': return { title: 'Gizli Kesintiler', desc: 'Komisyonları incele.' }
            default: return { title: 'Temiz', desc: 'Belirgin sorun yok.' }
        }
    }

    const wound = getWoundText(topFactor)

    const getAdviceText = (factor: string) => {
        if (isClean) return 'Büyüme stratejilerine odaklan.'
        switch (factor) {
            case 'toxic_product_impact': return 'Zarar eden ürünleri satışa kapat.'
            case 'refund_bleed_impact': return 'İade politikanı sıkılaştır.'
            case 'roas_trap_impact': return 'Reklam bütçesini %20 kıs.'
            case 'cash_flow_impact': return 'Gider kalemlerini tek tek denetle.'
            case 'silent_fee_impact': return 'Komisyon oranlarını gözden geçir.'
            default: return 'Finansal tablolarını detaylı incele.'
        }
    }

    const advice = getAdviceText(topFactor)

    return (
        <div className="font-sans space-y-4 md:space-y-8">

            {/* Stack on Mobile | Grid on Desktop */}
            <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-8">

                {/* 1. DIAGNOSTIC CARD */}
                <div className={`bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 border ${isClean ? 'border-emerald-100' : 'border-red-100'} shadow-sm relative overflow-hidden group min-h-[160px] flex flex-row items-center gap-4 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        {isClean ? <div className="w-24 h-24 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div> : <Skull size={80} className="md:w-[120px] md:h-[120px]" />}
                    </div>

                    <div className="relative z-10 flex-1">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${isClean ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-full text-[10px] font-black uppercase tracking-wider mb-2 md:mb-6`}>
                            <AlertTriangle size={10} /> {isClean ? 'GÜVENLİ' : 'Kanayan Yara'}
                        </div>
                        <h3 className="text-xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2 leading-tight">{wound.title}</h3>
                        <p className="text-gray-500 font-medium text-xs md:text-lg leading-relaxed mb-0 md:mb-8 line-clamp-2 md:line-clamp-none">
                            {isClean ? (
                                <span className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Analiz devam ediyor. Şu an stabil.
                                </span>
                            ) : (
                                <>
                                    {wound.desc} Acı skorunun <span className="text-red-600 font-bold">{topFactorScore} puanı</span> buradan.
                                </>
                            )}
                        </p>

                        {!isClean && (
                            <div className="hidden md:block p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Tahmini Çözüm Etkisi</div>
                                <div className="text-2xl font-black text-gray-900">
                                    +{topFactorScore} Puan <span className="text-sm font-medium text-gray-400">İyileşme</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. ACTION PLAN */}
                <div className="bg-black text-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl flex flex-row md:flex-col items-center md:items-start justify-between relative overflow-hidden min-h-[160px] gap-4">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    <div className="relative z-10 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2 md:mb-6">
                            <RefreshCw size={10} className="animate-spin" /> Aksiyon
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest block">Prificient Önerisi:</h3>

                        <div className="text-sm md:text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-0 md:mb-8">
                            "{advice}"
                        </div>

                        <Link href="/simulation" className="hidden md:flex w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors items-center justify-center gap-2">
                            {isClean ? 'Simülasyon Modu' : 'Simüle Et'} <ArrowRight size={18} />
                        </Link>
                    </div>
                    {/* Mobile Button Icon Only */}
                    <Link href="/simulation" className="md:hidden w-10 h-10 flex items-center justify-center bg-white text-black rounded-full shadow-lg shrink-0">
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* 3. COST OF INACTION */}
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 border border-gray-100 shadow-sm relative flex flex-row md:flex-col items-center md:items-start justify-between min-h-[160px] gap-4">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 md:mb-6">
                            <TrendingDown size={10} /> Kayıp
                        </div>
                        <h3 className={`text-2xl md:text-4xl font-black ${isSafe ? 'text-emerald-600' : 'text-gray-900'} mb-1 md:mb-2`}>
                            {isSafe ? 'Kayıp Yok' : `-${Math.floor(opportunity_loss * 3).toLocaleString('tr-TR')}₺`}
                        </h3>
                        <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wide">Son 72 Saat</p>
                    </div>
                    {/* Mobile Link Icon */}
                    <Link href="/dashboard/settings/billing" className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 text-indigo-600 rounded-full shrink-0">
                        <ArrowRight size={16} />
                    </Link>

                    <div className="hidden md:block mt-8 pt-8 border-t border-gray-100 w-full">
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            Günlük kayıp: <span className="text-gray-900 font-bold">{Math.floor(opportunity_loss).toLocaleString('tr-TR')}₺</span>
                        </p>
                        <Link href="/dashboard/settings/billing" className="text-indigo-600 font-black text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Kurtarma Planına Geç <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}
