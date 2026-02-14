'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function BfcmPlannerPage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [calculated, setCalculated] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [showEmailForm, setShowEmailForm] = useState(false)

    const [avgOrderValue, setAvgOrderValue] = useState('')
    const [discountPercent, setDiscountPercent] = useState('')
    const [expectedOrders, setExpectedOrders] = useState('')
    const [productCostPercent, setProductCostPercent] = useState('')
    const [adBudget, setAdBudget] = useState('')
    const [returnRate, setReturnRate] = useState('')

    const [results, setResults] = useState<{
        grossRevenue: number; discountLoss: number; netRevenue: number
        productCost: number; returnLoss: number; totalCosts: number
        netProfit: number; profitMargin: number; roasNeeded: number
        revenuePerOrder: number
    } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        const saved = localStorage.getItem('prf_bfcm_state')
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setAvgOrderValue(s.avgOrderValue || ''); setDiscountPercent(s.discountPercent || '')
                setExpectedOrders(s.expectedOrders || ''); setProductCostPercent(s.productCostPercent || '')
                setAdBudget(s.adBudget || ''); setReturnRate(s.returnRate || '')
                if (s.results) { setResults(s.results); setCalculated(true) }
            } catch { /* ignore */ }
            localStorage.removeItem('prf_bfcm_state')
        }
    }, [])

    const handleCalculate = () => {
        const aov = parseFloat(avgOrderValue) || 0
        const disc = (parseFloat(discountPercent) || 0) / 100
        const orders = parseFloat(expectedOrders) || 0
        const cogsPct = (parseFloat(productCostPercent) || 0) / 100
        const ad = parseFloat(adBudget) || 0
        const ret = (parseFloat(returnRate) || 0) / 100

        const grossRevenue = aov * orders
        const discountLoss = grossRevenue * disc
        const discountedRevenue = grossRevenue - discountLoss
        const returnLoss = discountedRevenue * ret
        const netRevenue = discountedRevenue - returnLoss
        const productCost = netRevenue * cogsPct
        const totalCosts = productCost + ad + returnLoss
        const netProfit = netRevenue - productCost - ad
        const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0
        const roasNeeded = ad > 0 ? totalCosts / ad : 0

        setResults({
            grossRevenue: Math.round(grossRevenue),
            discountLoss: Math.round(discountLoss),
            netRevenue: Math.round(netRevenue),
            productCost: Math.round(productCost),
            returnLoss: Math.round(returnLoss),
            totalCosts: Math.round(totalCosts),
            netProfit: Math.round(netProfit),
            profitMargin: Math.round(profitMargin * 10) / 10,
            roasNeeded: Math.round(roasNeeded * 100) / 100,
            revenuePerOrder: Math.round((aov * (1 - disc)) * 100) / 100,
        })
        setCalculated(true)
    }

    const saveState = () => {
        localStorage.setItem('prf_bfcm_state', JSON.stringify({
            avgOrderValue, discountPercent, expectedOrders, productCostPercent, adBudget, returnRate, results,
        }))
    }

    const authGoogle = async () => {
        setAuthLoading(true)
        saveState()
        await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })
        setAuthLoading(false)
    }
    const authEmail = async (email: string) => {
        setAuthLoading(true)
        saveState()
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: window.location.href, data: { source: 'tools', tool_used: 'bfcm_planner' } } })
        setAuthLoading(false)
        alert('E-postanıza giriş linki gönderildi!')
    }

    return (
        <div className="py-12 px-6"><div className="max-w-2xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-600 mb-2">Ücretsiz Araç</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">BFCM Kâr Planlayıcı</h1>
                <p className="text-sm text-gray-500">Black Friday ve Cyber Monday kampanyalarınızın kârlılığını önceden simüle edin. İndirim oranı, iade ve reklam bütçesini hesaba katın.</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-8">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Inp label="Ortalama Sipariş Değeri (₺)" value={avgOrderValue} onChange={setAvgOrderValue} ph="350" />
                    <Inp label="İndirim Oranı (%)" value={discountPercent} onChange={setDiscountPercent} ph="25" />
                    <Inp label="Beklenen Sipariş Adedi" value={expectedOrders} onChange={setExpectedOrders} ph="200" />
                    <Inp label="Ürün Maliyet Oranı (%)" value={productCostPercent} onChange={setProductCostPercent} ph="40" />
                    <Inp label="BFCM Reklam Bütçesi (₺)" value={adBudget} onChange={setAdBudget} ph="15.000" />
                    <Inp label="İade Oranı (%)" value={returnRate} onChange={setReturnRate} ph="8" />
                </div>
                <button onClick={handleCalculate} className="mt-6 w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors">Simüle Et</button>
            </div>

            {calculated && results && (<>
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">BFCM Sonuçları</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card label="Brüt Ciro" value={`₺${results.grossRevenue.toLocaleString('tr-TR')}`} sub="İndirim öncesi" />
                        <Card label="İndirim Kaybı" value={`₺${results.discountLoss.toLocaleString('tr-TR')}`} sub="Verilen indirim" warn />
                        <Card label="İndirimli Sipariş Değeri" value={`₺${results.revenuePerOrder}`} sub="Birim başına" />
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-sm text-gray-600">Kampanya boyunca <strong>₺{results.discountLoss.toLocaleString('tr-TR')}</strong> indirim maliyeti oluşacak. Bu, brüt cironuzun <strong>%{parseFloat(discountPercent) || 0}</strong>&apos;i anlamına geliyor.</p>
                    </div>
                </div>

                {/* Gated */}
                <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Detaylı Kârlılık Analizi</h2>
                    <div className={!user ? 'blur-md select-none pointer-events-none' : ''}>
                        <div className="space-y-3">
                            <Row label="Net Gelir (İade Sonrası)" value={results.netRevenue} />
                            <Row label="Ürün Maliyeti" value={-results.productCost} />
                            <Row label="Reklam Harcaması" value={-parseFloat(adBudget || '0')} />
                            <Row label="İade Kaybı" value={-results.returnLoss} />
                            <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-2">
                                <span className="text-sm font-semibold text-gray-700">NET KÂR</span>
                                <span className={`text-lg font-bold ${results.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>₺{results.netProfit.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 mt-6">
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-center">
                                <p className="text-xs text-amber-600/70 mb-1">Kâr Marjı</p>
                                <p className={`text-2xl font-bold ${results.profitMargin > 10 ? 'text-emerald-600' : 'text-red-600'}`}>%{results.profitMargin}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-center">
                                <p className="text-xs text-amber-600/70 mb-1">Gereken Min. ROAS</p>
                                <p className="text-2xl font-bold text-amber-700">{results.roasNeeded}x</p>
                            </div>
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/50">
                            <p className="text-sm text-amber-800 font-medium mb-1">💡 BFCM Önerisi</p>
                            <p className="text-xs text-amber-700 leading-relaxed">{results.netProfit < 0 ? 'Bu kampanya kârsız görünüyor. İndirim oranını düşürmeyi veya reklam bütçesini azaltmayı deneyin.' : results.profitMargin < 10 ? 'Kampanya dar marjlı. İade oranı beklenenden yüksek çıkarsa zarara dönebilir.' : 'Kampanya kârlı görünüyor. İndirim ve reklam dengesi iyi.'}</p>
                        </div>
                    </div>
                    {!user && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                            <div className="text-center max-w-sm px-6">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Bu Kampanya Gerçekten Kârlı mı?</h3>
                                <p className="text-sm text-gray-500 mb-6">Detaylı analizi görmek için ücretsiz giriş yapın.</p>
                                <button onClick={authGoogle} disabled={authLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 shadow-sm">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    Google ile Giriş Yap
                                </button>
                                {!showEmailForm ? <button onClick={() => setShowEmailForm(true)} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors">E-posta ile Giriş Yap</button> : <div className="flex gap-2"><input type="email" placeholder="ornek@email.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" /><button onClick={() => authEmail(emailInput)} disabled={authLoading || !emailInput} className="px-4 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-50">Gönder</button></div>}
                                <p className="text-[11px] text-gray-400 mt-4">Ücretsiz. Ana uygulamaya yönlendirilmezsiniz.</p>
                            </div>
                        </div>
                    )}
                </div>
            </>)}
        </div></div>
    )
}

function Inp({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph: string }) {
    return (<div><label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label><input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={ph} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" /></div>)
}
function Card({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
    return (<div className={`p-4 rounded-xl border text-center ${warn ? 'bg-red-50 border-red-200/60' : 'bg-gray-50 border-gray-200/60'}`}><p className="text-xs text-gray-500 mb-1">{label}</p><p className={`text-xl font-bold ${warn ? 'text-red-600' : 'text-gray-800'}`}>{value}</p><p className="text-[11px] text-gray-400 mt-0.5">{sub}</p></div>)
}
function Row({ label, value }: { label: string; value: number }) {
    return (<div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-500">{label}</span><span className={`text-sm font-semibold ${value >= 0 ? 'text-gray-900' : 'text-red-600'}`}>₺{Math.abs(value).toLocaleString('tr-TR')}</span></div>)
}
