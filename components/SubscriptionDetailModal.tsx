'use client'

import { X, Crown, Check, Calendar, CreditCard, ShieldCheck, Zap } from 'lucide-react'
import { PLANS } from '@/config/plans'

interface SubscriptionDetailModalProps {
    isOpen: boolean
    onClose: () => void
    status: 'beta' | 'trial_active' | 'trial_expired' | 'pro_active'
    daysLeft: number
}

export default function SubscriptionDetailModal({ isOpen, onClose, status, daysLeft }: SubscriptionDetailModalProps) {
    if (!isOpen) return null

    // Determine Logic
    // We use any or a union to allow switching between plan objects with different literal IDs
    let currentPlan: typeof PLANS[keyof typeof PLANS] = PLANS.VISION
    let planLabel = "VISION"
    let statusText = "Sınırsız Erişim"
    let activeColor = "text-amber-500"
    let bgGradient = "from-gray-900 to-black"
    let expiryText = "Süresiz"

    if (status === 'beta') {
        currentPlan = PLANS.VISION
        planLabel = "VISION (BETA)"
        statusText = "Beta Sürecinde Ücretsiz"
        activeColor = "text-amber-400"
        bgGradient = "from-gray-900 to-black"
        expiryText = "Beta süresince hediye"
    } else if (status === 'trial_active') {
        currentPlan = PLANS.CONTROL // Assuming Trial mimics Control features
        planLabel = "DENEME SÜRÜMÜ"
        statusText = `${daysLeft} Gün Kaldı`
        activeColor = "text-emerald-500"
        bgGradient = "from-emerald-900/80 to-emerald-950"
        expiryText = new Date(Date.now() + daysLeft * 86400000).toLocaleDateString()
    } else if (status === 'pro_active') {
        currentPlan = PLANS.VISION // Or whatever "PRO" maps to
        planLabel = "PRO PLAN"
        statusText = "Aktif"
        activeColor = "text-amber-400"
        bgGradient = "from-gray-900 to-black"
        expiryText = "Otomatik Yenilenir"
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Click Outside to Close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">

                {/* HEAD CARD */}
                <div className={`p-8 bg-gradient-to-br ${bgGradient} text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-4 -mb-4 pointer-events-none"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <Crown size={24} className={activeColor} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white/60 tracking-wider">MEVCUT PAKET</p>
                            <h2 className={`text-2xl font-black tracking-tight ${activeColor}`}>{planLabel}</h2>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
                        <div>
                            <p className="text-xs text-white/50 mb-1">Durum</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Zap size={14} className={activeColor} fill="currentColor" /> {statusText}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/50 mb-1">Bitiş Tarihi</p>
                            <div className="flex items-center gap-2 font-bold text-sm justify-end">
                                <Calendar size={14} /> {expiryText}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FEATURE LIST */}
                <div className="p-6 bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">PAKET ÖZELLİKLERİ</h3>
                    <div className="space-y-3">
                        {currentPlan.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-1 bg-green-100 text-green-600 rounded-full">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-center pb-6">
                    <p className="text-[10px] text-gray-400 text-center max-w-xs font-medium">
                        <ShieldCheck size={12} className="inline mr-1 text-gray-400" />
                        Verileriniz uçtan uca şifrelenmektedir ve ödeme altyapısı PayTR güvencesindedir.
                    </p>
                </div>

            </div>
        </div>
    )
}
