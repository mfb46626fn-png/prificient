'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertTriangle, TrendingDown, Skull, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Hardcoded for V1 Demo removed


export default function DiagnosisPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            // Simulate "Analyzing..." delay for dramatic effect
            await new Promise(r => setTimeout(r, 2000))

            try {
                const res = await fetch('/api/analysis/diagnose')
                const json = await res.json()
                setData(json)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-6">
                <div className="w-24 h-24 border-t-4 border-red-600 rounded-full animate-spin"></div>
                <div className="text-2xl font-black tracking-widest animate-pulse">TEŞHİS YAPILIYOR...</div>
                <p className="text-gray-500 font-mono text-sm">Finansal kayıtlar inceleniyor (Forensic Scan)</p>
            </div>
        )
    }

    // SLIDE 1: THE REALITY CHECK
    if (step === 1) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-widest">Analiz Tamamlandı</h1>
                        <p className="text-6xl md:text-8xl font-black text-white mb-4">
                            {data?.financials?.revenue?.toLocaleString('tr-TR')}₺
                        </p>
                        <p className="text-gray-400 font-medium">Bu senin Shopify'da gördüğün ciro.</p>
                    </div>

                    <div className="relative py-12">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ArrowRight size={48} className="text-gray-800 rotate-90 md:rotate-0" />
                        </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-900/50 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
                        <h2 className="text-4xl md:text-6xl font-black text-red-500 mb-2">
                            {data?.financials?.profit?.toLocaleString('tr-TR')}₺
                        </h2>
                        <p className="text-red-300 font-bold uppercase tracking-wide">Gerçek Net Kâr (Tahmini)</p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-400">
                            <AlertTriangle size={14} />
                            <span>İadeler, komisyonlar ve reklam gideri düşüldü.</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full bg-white text-black font-black py-5 rounded-full text-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"
                    >
                        Neden Zarardayım? <ArrowRight />
                    </button>
                </div>
            </div>
        )
    }

    // SLIDE 2: THE CULPRITS (TOXIC PRODUCTS)
    if (step === 2) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-2xl w-full space-y-8 animate-in slide-in-from-right duration-500">
                    <div className="text-center">
                        <div className="inline-flex p-4 bg-red-900/30 rounded-full mb-6">
                            <Skull size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white">Sessiz Katiller</h2>
                        <p className="text-gray-400 mt-2">Bu ürünler ciro yapıyor gibi görünüyor ama aslında seni batırıyor.</p>
                    </div>

                    <div className="space-y-4">
                        {/* We don't have exact toxic product names here yet, so we show the count logic or generic message if count > 0 */}
                        {data?.financials?.toxic_count > 0 ? (
                            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center space-y-4">
                                <h4 className="text-2xl font-bold text-red-500">{data.financials.toxic_count} Adet Toksik Ürün Tespit Edildi</h4>
                                <p className="text-gray-400">Bu ürünler reklam bütçeni yiyor ve iade oranlarını yükseltiyor.</p>
                                <div className="text-4xl font-black text-white mt-4">
                                    -{data?.factors?.toxic_product_impact > 0 ? (data.factors.toxic_product_impact * 1000).toLocaleString('tr-TR') : '??'} puan risk
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900 p-6 rounded-2xl flex items-center justify-center border border-gray-800 h-32">
                                <p className="text-gray-400 font-bold">Şu an için çok belirgin bir toksik ürün yok. Harika!</p>
                            </div>
                        )}

                        {data?.factors?.refund_bleed_impact > 0 && (
                            <div className="bg-gray-900 p-6 rounded-2xl flex items-center justify-between border border-gray-800">
                                <div>
                                    <h4 className="font-bold text-white">Yüksek İade Oranı</h4>
                                    <p className="text-xs text-gray-500">İadeler kârını eritiyor.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-500 font-black text-xl">KRİTİK</p>
                                </div>
                            </div>
                        )}
                        {data?.factors?.roas_trap_impact > 0 && (
                            <div className="bg-gray-900 p-6 rounded-2xl flex items-center justify-between border border-gray-800">
                                <div>
                                    <h4 className="font-bold text-white">ROAS Tuzağı</h4>
                                    <p className="text-xs text-gray-500">Reklam harcamaların verimsiz.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-500 font-black text-xl">KRİTİK</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setStep(3)}
                        className="w-full bg-white text-black font-black py-5 rounded-full text-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 mt-8"
                    >
                        Geleceği Gör <TrendingDown />
                    </button>
                </div>
            </div>
        )
    }

    // SLIDE 3: FUTURE PROJECTION & CTA
    if (step === 3) {
        // Calculate raw projected loss (daily * 45)
        const projectedLoss = (data?.opportunity_loss || 0) * 45

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center space-y-12 animate-in slide-in-from-right duration-500">

                    <div>
                        <h2 className="text-4xl font-black text-white mb-6">Müdahale Edilmezse...</h2>

                        {/* Fake Chart CSS */}
                        <div className="h-64 w-full bg-gray-900 rounded-3xl relative overflow-hidden border border-gray-800 flex items-end px-8 pb-8">
                            <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]"></div>

                            {/* Line */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <path d="M0,50 C100,50 200,100 300,150 L600,250" stroke="red" strokeWidth="4" fill="none" className="drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </svg>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur px-6 py-4 rounded-2xl border border-red-900">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">45 Gün Sonraki Kümülatif Kayıp</p>
                                <p className="text-4xl font-black text-red-500">-{Math.round(projectedLoss).toLocaleString('tr-TR')}₺</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-lg">Prificient, bu kanamayı durdurmak için tasarlandı.</p>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-red-600 text-white font-black py-5 rounded-full text-xl hover:bg-red-700 hover:shadow-2xl hover:shadow-red-900/50 transition-all flex items-center justify-center gap-3"
                        >
                            Kanamayı Durdur <Activity />
                        </button>
                    </div>

                </div>
            </div>
        )
    }
    return null
}
