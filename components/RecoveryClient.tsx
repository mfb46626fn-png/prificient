'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldAlert, Activity, ArrowRight, Lock, Siren, Check } from 'lucide-react'
import { PainDiagnosis } from '@/lib/scoring/pain-engine'

interface RecoveryClientProps {
    diagnosis: PainDiagnosis
}

export default function RecoveryClient({ diagnosis }: RecoveryClientProps) {
    const router = useRouter()
    const { score, level, factors, opportunity_loss } = diagnosis
    const isCritical = score >= 60

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activating, setActivating] = useState(false)
    const [activeActions, setActiveActions] = useState<string[]>([])

    const toggleAction = (id: string) => {
        setActiveActions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    // SCENARIO A: SAFE (Score < 60)
    if (!isCritical) {
        return (
            <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center p-6">
                <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={48} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Sistem Stabil</h1>
                        <p className="text-gray-500 font-medium text-lg">
                            İşletmenizin hayati değerleri şu an normal seviyede.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Durum Analizi</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Kurtarma Odası, sadece finansal sağlığı <strong className="text-emerald-700">kritik seviyeye (%60+)</strong> düşen mağazalar için bir acil müdahale alanıdır. Şu anlık büyümeye odaklanabilirsiniz.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 text-gray-400 hover:text-gray-900 font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowRight size={16} className="rotate-180" /> Karar Masasına Dön
                    </button>
                </div>
            </div>
        )
    }

    // SCENARIO B: CRITICAL (Score 60+) - THE INTERVENTION
    const handleActivate = async () => {
        setActivating(true)
        // Simulate activation delay
        await new Promise(r => setTimeout(r, 1500))
        // Redirect to actual billing flow (or handle Stripe/PayTR here directly in future)
        // For now, we redirect to 'billing' but with a query param that might auto-open the pay modal?
        // Or just redirect to billing page which we already revamped. 
        // User asked for "Modal" *on this page*. 
        // "Kullanıcı Protokolü Başlat dediğinde açılan ödeme ekranı standart billing sayfası olmamalı."
        // "Özel bir Modal veya Drawer açılmalı."

        // I will implement the modal logic below instead of redirecting immediately.
        setIsModalOpen(true)
        setActivating(false)
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* HEADER */}
                <header className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
                            <Siren size={24} className="text-red-500" />
                        </div>
                        <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">DEFCON 1: ACİL DURUM</h2>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: DIAGNOSIS DATA */}
                    <div className="space-y-8">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                            Kanamayı<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Durdur.</span>
                        </h1>

                        <div className="space-y-6 text-lg text-gray-400 font-medium">
                            <p>
                                İşletmeniz şu an <span className="text-white font-bold border-b border-red-500">kritik seviyede (%{score})</span> risk taşıyor.
                                Mevcut trendle {Math.floor(opportunity_loss) > 0 ? (100000 / opportunity_loss).toFixed(0) : '30'} gün içinde nakit krizi yaşanabilir.
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tespit Edilen Sızıntılar</h3>
                                <ul className="space-y-4">
                                    {factors.toxic_product_impact > 0 && (
                                        <li className="flex items-start gap-3">
                                            <ShieldAlert size={18} className="text-red-500 mt-1 shrink-0" />
                                            <div>
                                                <span className="block text-white font-bold">Toksik Ürünler</span>
                                                <span className="text-sm text-gray-500">Satış yapıyor ama kârı eritiyor.</span>
                                            </div>
                                        </li>
                                    )}
                                    {factors.roas_trap_impact > 0 && (
                                        <li className="flex items-start gap-3">
                                            <Activity size={18} className="text-orange-500 mt-1 shrink-0" />
                                            <div>
                                                <span className="block text-white font-bold">ROAS İllüzyonu</span>
                                                <span className="text-sm text-gray-500">Reklam harcaması kârlılığı yutuyor.</span>
                                            </div>
                                        </li>
                                    )}
                                    {/* Fallback if logic is generic */}
                                    {Object.values(factors).every(v => v === 0) && (
                                        <li className="text-sm text-gray-500">Derin analiz için protokol başlatılmalı.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ACTION CARD */}
                    <div className="bg-white text-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                        <div className="absolute -top-6 -right-6 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-lg animate-bounce">
                            ⚠️ Müdahale Şart
                        </div>

                        <h3 className="text-2xl font-black mb-6">Kurtarma Protokolü</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Bu protokol aktive edildiğinde, dashboard'daki tüm "büyüme" metrikleri gizlenecek.
                            Sadece <strong>Nakit Akışı</strong> ve <strong>Zarar Kesme</strong> araçları çalışacak.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                { id: 'toxic', label: 'Toksik Ürün Otomatik Kapatma', icon: ShieldAlert },
                                { id: 'ads', label: 'Reklam Bütçesi Koruma Kalkanı', icon: Activity },
                                { id: 'cash', label: 'Acil Nakit Akış Planı', icon: Lock }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-red-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeActions.includes(item.id) ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {activeActions.includes(item.id) ? <Check size={16} strokeWidth={4} /> : <item.icon size={16} />}
                                        </div>
                                        <span className={`font-bold text-sm ${activeActions.includes(item.id) ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleAction(item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeActions.includes(item.id)
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-black text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {activeActions.includes(item.id) ? 'AKTİF' : 'SEÇ'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleActivate}
                            disabled={activating}
                            className={`w-full py-5 text-white text-lg font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden ${activeActions.length > 0 ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                            {activating ? <Activity className="animate-spin" /> : <Siren className={activeActions.length > 0 ? "group-hover:animate-pulse" : ""} />}
                            {activating ? 'BAŞLATILIYOR...' : activeActions.length > 0 ? 'PROTOKOLÜ BAŞLAT' : 'AKSİYON SEÇİNİZ'}
                        </button>

                        <p className="text-center text-xs text-gray-400 font-bold mt-4 uppercase tracking-wide">
                            <Lock size={10} className="inline mr-1" /> Güvenli Ödeme ile Aktive Edilir
                        </p>
                    </div>

                </div>
            </div>

            {/* EMERGENCY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-gray-900 text-white rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl relative z-[201] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-red-600/10 border-b border-red-600/20 p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Siren className="text-red-500 animate-pulse" />
                                <span className="font-black text-red-500 uppercase tracking-widest text-sm">Protokol Onayı</span>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><ArrowRight className="rotate-45" /></button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-white mb-2">Acil Durum Paketi</h3>
                                <p className="text-gray-400 text-sm">Mevcut Durumunuz: <span className="text-red-500 font-bold">Kritik (%{score})</span></p>
                            </div>

                            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-gray-400 font-bold text-sm">Aylık Koruma Bedeli</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-white">499₺</span>
                                        <span className="text-xs text-gray-500 font-bold block">/ay</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10 my-4"></div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Bu tutar, işletmenizin <strong className="text-white">aylık {Math.floor(opportunity_loss * 30).toLocaleString()}₺</strong> tahmini kaybını önlemek için kullanılacaktır.
                                </p>
                            </div>

                            <button
                                onClick={() => router.push('/dashboard/settings/billing?plan=recovery')} // Or trigger checkount directly
                                className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                KURTARMAYI BAŞLAT <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
