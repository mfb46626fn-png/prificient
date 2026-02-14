'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function RoasCalculatorPage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [calculated, setCalculated] = useState(false)

    // Inputs
    const [adSpend, setAdSpend] = useState('')
    const [revenue, setRevenue] = useState('')
    const [cogs, setCogs] = useState('')
    const [shippingCost, setShippingCost] = useState('')
    const [returnRate, setReturnRate] = useState('')
    const [commissionRate, setCommissionRate] = useState('')

    // Results
    const [results, setResults] = useState<{
        standardRoas: number
        realRoas: number
        netProfit: number
        profitMargin: number
        costPerOrder: number
        returnLoss: number
        effectiveRevenue: number
    } | null>(null)

    // Restore saved state from localStorage (survives Magic Link redirect)
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })
        const saved = localStorage.getItem('prf_roas_state')
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setAdSpend(s.adSpend || '')
                setRevenue(s.revenue || '')
                setCogs(s.cogs || '')
                setShippingCost(s.shippingCost || '')
                setReturnRate(s.returnRate || '')
                setCommissionRate(s.commissionRate || '')
                if (s.results) {
                    setResults(s.results)
                    setCalculated(true)
                }
            } catch { /* ignore */ }
            localStorage.removeItem('prf_roas_state')
        }
    }, [])

    const handleCalculate = () => {
        const ad = parseFloat(adSpend) || 0
        const rev = parseFloat(revenue) || 0
        const cost = parseFloat(cogs) || 0
        const ship = parseFloat(shippingCost) || 0
        const ret = (parseFloat(returnRate) || 0) / 100
        const comm = (parseFloat(commissionRate) || 0) / 100

        const returnLoss = rev * ret
        const effectiveRevenue = rev - returnLoss
        const commissionCost = effectiveRevenue * comm
        const totalCosts = cost + ship + ad + commissionCost + returnLoss
        const netProfit = effectiveRevenue - cost - ship - ad - commissionCost

        const standardRoas = ad > 0 ? rev / ad : 0
        const realRoas = ad > 0 ? effectiveRevenue / (ad + commissionCost) : 0
        const profitMargin = effectiveRevenue > 0 ? (netProfit / effectiveRevenue) * 100 : 0
        const costPerOrder = totalCosts

        setResults({
            standardRoas: Math.round(standardRoas * 100) / 100,
            realRoas: Math.round(realRoas * 100) / 100,
            netProfit: Math.round(netProfit),
            profitMargin: Math.round(profitMargin * 10) / 10,
            costPerOrder: Math.round(costPerOrder),
            returnLoss: Math.round(returnLoss),
            effectiveRevenue: Math.round(effectiveRevenue),
        })
        setCalculated(true)
    }

    const saveStateBeforeAuth = () => {
        localStorage.setItem('prf_roas_state', JSON.stringify({
            adSpend, revenue, cogs, shippingCost, returnRate, commissionRate, results,
        }))
    }

    const handleSoftGateAuth = async (provider: 'google' | 'email') => {
        setAuthLoading(true)
        saveStateBeforeAuth()
        if (provider === 'google') {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                },
            })
        }
        setAuthLoading(false)
    }

    const handleEmailAuth = async (email: string) => {
        setAuthLoading(true)
        saveStateBeforeAuth()
        await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.href,
                data: { source: 'tools', tool_used: 'roas_calculator' },
            },
        })
        setAuthLoading(false)
        alert('E-postanıza giriş linki gönderildi!')
    }

    const [emailInput, setEmailInput] = useState('')
    const [showEmailForm, setShowEmailForm] = useState(false)

    return (
        <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-2">
                        Ücretsiz Araç
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                        ROAS Simülatörü
                    </h1>
                    <p className="text-sm text-gray-500">
                        Reklam harcamalarınızın gerçek geri dönüşünü hesaplayın. İade, kargo ve komisyon maliyetleri dahil.
                    </p>
                </div>

                {/* Calculator Form */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-8">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <InputField label="Aylık Reklam Harcaması (₺)" value={adSpend} onChange={setAdSpend} placeholder="10.000" />
                        <InputField label="Aylık Gelir / Ciro (₺)" value={revenue} onChange={setRevenue} placeholder="50.000" />
                        <InputField label="Ürün Maliyeti / COGS (₺)" value={cogs} onChange={setCogs} placeholder="20.000" />
                        <InputField label="Kargo Maliyeti (₺)" value={shippingCost} onChange={setShippingCost} placeholder="3.000" />
                        <InputField label="İade Oranı (%)" value={returnRate} onChange={setReturnRate} placeholder="5" />
                        <InputField label="Platform Komisyonu (%)" value={commissionRate} onChange={setCommissionRate} placeholder="3" />
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="mt-6 w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                        Hesapla
                    </button>
                </div>

                {/* Results */}
                {calculated && results && (
                    <>
                        {/* Basic Result (Open) */}
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Sonuçlar</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <ResultCard
                                    label="Standart ROAS"
                                    value={`${results.standardRoas}x`}
                                    color={results.standardRoas >= 3 ? 'green' : results.standardRoas >= 2 ? 'yellow' : 'red'}
                                />
                                <ResultCard
                                    label="Gerçek ROAS"
                                    value={`${results.realRoas}x`}
                                    color={results.realRoas >= 2.5 ? 'green' : results.realRoas >= 1.5 ? 'yellow' : 'red'}
                                    highlight
                                />
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-sm text-gray-600">
                                    {results.realRoas < results.standardRoas * 0.7
                                        ? `⚠️ Gerçek ROAS'ınız standart ROAS'ınızdan %${Math.round((1 - results.realRoas / results.standardRoas) * 100)} daha düşük. Gizli maliyetleriniz kârlılığınızı ciddi şekilde etkiliyor.`
                                        : `✓ Standart ve gerçek ROAS arasında makul bir fark var.`}
                                </p>
                            </div>
                        </div>

                        {/* Deep Analysis (Gated) */}
                        <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 overflow-hidden">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Detaylı Kârlılık Analizi</h2>

                            {/* Content — visible or blurred */}
                            <div className={!user ? 'blur-md select-none pointer-events-none' : ''}>
                                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                                    <ResultCard label="Net Kâr" value={`₺${results.netProfit.toLocaleString('tr-TR')}`} color={results.netProfit > 0 ? 'green' : 'red'} />
                                    <ResultCard label="Kâr Marjı" value={`%${results.profitMargin}`} color={results.profitMargin > 15 ? 'green' : results.profitMargin > 5 ? 'yellow' : 'red'} />
                                    <ResultCard label="İade Kaybı" value={`₺${results.returnLoss.toLocaleString('tr-TR')}`} color="red" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Brüt Gelir</span>
                                        <span className="text-sm font-semibold text-gray-900">₺{parseFloat(revenue).toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">İade Sonrası Efektif Gelir</span>
                                        <span className="text-sm font-semibold text-gray-900">₺{results.effectiveRevenue.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Toplam Maliyet</span>
                                        <span className="text-sm font-semibold text-red-600">₺{results.costPerOrder.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                                        <span className="text-sm font-semibold text-gray-700">NET KÂR</span>
                                        <span className={`text-lg font-bold ${results.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            ₺{results.netProfit.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-200/50">
                                    <p className="text-sm text-violet-800 font-medium mb-1">💡 Prificient Önerisi</p>
                                    <p className="text-xs text-violet-600 leading-relaxed">
                                        {results.profitMargin < 5
                                            ? 'Kâr marjınız kritik seviyede düşük. Ürün maliyetlerinizi veya fiyatlandırmanızı gözden geçirmenizi öneriyoruz.'
                                            : results.profitMargin < 15
                                                ? 'Kâr marjınız kabul edilebilir ancak iyileştirme alanı var. İade oranını düşürmek en hızlı kazanım olabilir.'
                                                : 'Kâr marjınız sağlıklı görünüyor. Ölçeklendirme için reklam bütçenizi artırabilirsiniz.'}
                                    </p>
                                </div>
                            </div>

                            {/* Soft-Gate Overlay */}
                            {!user && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                                    <div className="text-center max-w-sm px-6">
                                        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Bu ROAS ile Ay Sonunda Cebinize Ne Kalır?
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Detaylı kârlılık analizini görmek için ücretsiz giriş yapın.
                                        </p>

                                        <button
                                            onClick={() => handleSoftGateAuth('google')}
                                            disabled={authLoading}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 shadow-sm"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google ile Giriş Yap
                                        </button>

                                        {!showEmailForm ? (
                                            <button
                                                onClick={() => setShowEmailForm(true)}
                                                className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                                            >
                                                E-posta ile Giriş Yap
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    placeholder="ornek@email.com"
                                                    value={emailInput}
                                                    onChange={(e) => setEmailInput(e.target.value)}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                                                />
                                                <button
                                                    onClick={() => handleEmailAuth(emailInput)}
                                                    disabled={authLoading || !emailInput}
                                                    className="px-4 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
                                                >
                                                    Gönder
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-[11px] text-gray-400 mt-4">
                                            Ücretsiz. Ana uygulamaya yönlendirilmezsiniz.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── Reusable Components ──────────────────────

function InputField({ label, value, onChange, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
        </div>
    )
}

function ResultCard({ label, value, color, highlight }: {
    label: string; value: string; color: 'green' | 'yellow' | 'red'; highlight?: boolean
}) {
    const colorClasses = {
        green: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
        yellow: 'text-amber-600 bg-amber-50 border-amber-200/60',
        red: 'text-red-600 bg-red-50 border-red-200/60',
    }
    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'ring-2 ring-violet-200' : ''} ${colorClasses[color]}`}>
            <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    )
}
