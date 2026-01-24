'use client'

import { useState } from 'react'
import { Check, ShieldAlert, Sparkles, Zap, Lock } from 'lucide-react'
import { PLANS } from '@/config/plans'

export default function BillingSettings() {
    const [loading, setLoading] = useState(false)
    const [iframeToken, setIframeToken] = useState<string | null>(null)
    const [recommendedPlan, setRecommendedPlan] = useState<string>('control') // Fetch dynamically in V2

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
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-in fade-in space-y-6">
            <div className="flex items-start gap-4 mb-2">
                <div className="p-3 bg-gray-100 rounded-xl text-gray-500"><Lock size={24} /></div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Abonelik & Paketler</h2>
                    <p className="text-sm text-gray-500 font-medium">İşletme ihtiyaçlarınıza uygun paketi yönetin.</p>
                </div>
            </div>

            {/* PayTR Modal/Overlay Context */}
            {iframeToken && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-sm flex items-center gap-2"><Lock size={16} className="text-green-600" /> PayTR Güvenli Ödeme</span>
                            <button onClick={() => setIframeToken(null)} className="text-gray-400 hover:text-black font-bold">Kapat</button>
                        </div>
                        <iframe
                            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                            className="flex-1 w-full border-0"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PLANS).map(([key, plan]) => {
                    const isRecommended = plan.id === recommendedPlan;
                    return (
                        <div
                            key={key}
                            className={`relative p-5 rounded-2xl border transition-all ${isRecommended
                                ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-100'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            {isRecommended && (
                                <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                    <Sparkles size={10} /> ÖNERİLEN
                                </div>
                            )}

                            <h3 className="text-base font-black text-gray-900 mb-1">{plan.name}</h3>
                            <div className="text-2xl font-black text-gray-900 mb-3 flex items-baseline gap-1">
                                {plan.price}₺ <span className="text-xs text-gray-400 font-bold">/ay</span>
                            </div>

                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                    <Check size={12} className="text-emerald-500" />
                                    {plan.specs.platform_count} Platform
                                </li>
                                <li className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                    <Check size={12} className="text-emerald-500" />
                                    {plan.specs.history_months} Ay Geçmiş Veri
                                </li>
                                {plan.specs.advanced_simulation && (
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                                        <Zap size={12} /> CFO Simülasyonu
                                    </li>
                                )}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={loading}
                                className={`w-full py-2.5 rounded-lg font-bold text-xs transition-colors ${isRecommended
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {loading ? '...' : (isRecommended ? 'Yükselt' : 'Seç')}
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 font-medium flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <p>Güvenli ödeme altyapısı PayTR tarafından sağlanmaktadır. Kredi kartı bilgileriniz Prificient sunucularında saklanmaz.</p>
            </div>
        </div>
    )
}
