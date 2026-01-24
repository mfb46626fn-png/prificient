'use client'

import { useState, useEffect } from 'react'
import { Check, ShieldAlert, Sparkles, Zap, Lock } from 'lucide-react'
import Script from 'next/script'
import { PLANS, PlanId } from '@/config/plans'

export default function BillingPage() {
    const [loading, setLoading] = useState(false)
    const [painData, setPainData] = useState<any>(null)
    const [iframeToken, setIframeToken] = useState<string | null>(null)
    const [recommendedPlan, setRecommendedPlan] = useState<string>('clear')

    useEffect(() => {
        // Fetch Diagnosis to determine Risk Profile
        async function loadRisk() {
            try {
                const res = await fetch('/api/analysis/diagnose')
                if (res.ok) {
                    const data = await res.json()
                    setPainData(data)

                    // High Risk -> Force Control Plan
                    if (data.score > 60) setRecommendedPlan('control')
                }
            } catch (e) { console.error(e) }
        }
        loadRisk()
    }, [])

    // Risk-Based Naming Strategy
    const getPlanDisplayName = (originalName: string, score: number) => {
        if (!score) return originalName

        if (score > 80) { // CRITICAL
            if (originalName === 'Clear') return 'Basic Recovery'
            if (originalName === 'Control') return 'Emergency Recovery' // The one we want them to buy
            if (originalName === 'Vision') return 'Crisis Management'
        } else if (score > 50) { // PAINFUL
            if (originalName === 'Clear') return 'Start Healing'
            if (originalName === 'Control') return 'Pain Relief'
            if (originalName === 'Vision') return 'Full Health'
        } else { // SAFE / UNAWARE
            if (originalName === 'Control') return 'Growth Monitor'
        }
        return originalName
    }

    const handleSelectPlan = async (planId: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/payment/start', {
                method: 'POST',
                body: JSON.stringify({ planId }),
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            if (data.token) {
                setIframeToken(data.token)
            } else {
                alert('Ödeme başlatılamadı: ' + data.error)
            }
        } catch (e) {
            console.error(e)
            alert('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

            {/* LEFT: Plans Selection */}
            <div className={`flex-1 p-6 md:p-8 lg:p-12 transition-all duration-500 ${iframeToken ? 'lg:w-1/2 opacity-50 pointer-events-none' : 'lg:w-full'}`}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Yatırım Getirisi (ROI)</h1>
                    <p className="text-gray-500 font-medium mb-10">
                        {painData && painData.score > 60
                            ? <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md">DİKKAT: Acı Skorunuz {painData.score}/100. Acil önlem paketi öneriliyor.</span>
                            : "İşletmeniz için en yüksek değeri üretecek paketi algoritma belirledi."
                        }
                    </p>

                    {/* Mobile: Horizontal Carousel | Desktop: Grid */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {Object.entries(PLANS).map(([key, plan]) => {
                            const isRecommended = plan.id === recommendedPlan;
                            const displayName = getPlanDisplayName(plan.name, painData?.score || 0)

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`relative p-6 rounded-[2rem] border-2 text-left transition-all hover:scale-[1.02] group min-w-[85vw] md:min-w-0 snap-center
                                        ${isRecommended
                                            ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50 scale-105 z-10'
                                            : 'border-white bg-white hover:border-gray-200 shadow-sm opacity-80 hover:opacity-100'
                                        }
                                    `}
                                >
                                    {isRecommended && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 w-max">
                                            <Sparkles size={12} /> {painData?.score > 60 ? 'KURTARMA PLANI' : 'SİZE ÖZEL ÖNERİ'}
                                        </div>
                                    )}

                                    <h3 className="text-lg font-black text-gray-900 mb-2">{displayName}</h3>
                                    <div className="text-3xl font-black text-gray-900 mb-4 flex items-baseline gap-1">
                                        {plan.price}₺ <span className="text-sm text-gray-400 font-medium">/ay</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium min-h-[40px] mb-6">{plan.description}</p>

                                    {painData?.score > 60 && isRecommended && (
                                        <div className="mb-4 text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                                            Bu yatırımı yapmazsanız tahmini aylık kaybınız: {Math.floor(painData.opportunity_loss * 30).toLocaleString()}₺
                                        </div>
                                    )}

                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                            <Check size={14} className="text-emerald-500" />
                                            {plan.specs.platform_count} Platform
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                            <Check size={14} className="text-emerald-500" />
                                            {plan.specs.history_months} Ay Geçmiş Veri
                                        </li>
                                        {plan.specs.advanced_simulation && (
                                            <li className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                                                <Zap size={14} />
                                                CFO Simülasyonu
                                            </li>
                                        )}
                                    </ul>

                                    <div className={`w-full py-3 rounded-xl font-bold text-center text-sm transition-colors
                                        ${isRecommended ? 'bg-indigo-600 text-white group-hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 group-hover:bg-gray-200'}
                                    `}>
                                        {isRecommended ? (painData?.score > 60 ? 'Kurtarmayı Başlat' : 'Yatırımı Başlat') : 'Seç'}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: PayTR Iframe (Embedded Side Panel) */}
            <div className={`fixed inset-y-0 right-0 bg-white shadow-2xl transition-all duration-500 transform 
                ${iframeToken ? 'translate-x-0 w-full lg:w-1/2' : 'translate-x-full w-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                            <Lock size={16} /> 256-bit SSL Güvenli Ödeme
                        </div>
                        <button onClick={() => setIframeToken(null)} className="text-gray-400 hover:text-black font-bold text-sm">
                            İptal
                        </button>
                    </div>
                    <div className="flex-1 bg-gray-50 relative">
                        {iframeToken && (
                            <iframe
                                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                                className="w-full h-full border-0 absolute inset-0"
                                id="paytr-iframe"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
