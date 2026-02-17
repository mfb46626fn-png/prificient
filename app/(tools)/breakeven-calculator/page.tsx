'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { saveCalculation } from '@/lib/tools/calculations'
import CalculationHistory from '@/components/tools/CalculationHistory'

export default function BreakevenCalculatorPage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [calculated, setCalculated] = useState(false)
    const [historyRefresh, setHistoryRefresh] = useState(0)
    const [authMode, setAuthMode] = useState<'idle' | 'email-input' | 'otp-verify' | 'google-waiting'>('idle')
    const [emailInput, setEmailInput] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [authEmail, setAuthEmail] = useState('')

    const [sellingPrice, setSellingPrice] = useState('')
    const [productCost, setProductCost] = useState('')
    const [fixedCosts, setFixedCosts] = useState('')
    const [shippingPerUnit, setShippingPerUnit] = useState('')
    const [adSpendMonthly, setAdSpendMonthly] = useState('')

    const [results, setResults] = useState<{
        breakevenUnits: number; breakevenRevenue: number; contributionMargin: number
        contributionMarginPercent: number; profitAt100: number; profitAt500: number
    } | null>(null)

    const checkUser = useCallback(async () => {
        const { data } = await supabase.auth.getUser()
        if (data.user) setUser(data.user)
    }, [supabase])

    useEffect(() => {
        checkUser()
        const handleVisibility = () => { if (document.visibilityState === 'visible') checkUser() }
        document.addEventListener('visibilitychange', handleVisibility)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) { setUser(session.user); setAuthMode('idle') }
        })
        return () => { document.removeEventListener('visibilitychange', handleVisibility); subscription.unsubscribe() }
    }, [checkUser, supabase])

    const handleCalculate = () => {
        const price = parseFloat(sellingPrice) || 0
        const cost = parseFloat(productCost) || 0
        const fixed = parseFloat(fixedCosts) || 0
        const ship = parseFloat(shippingPerUnit) || 0
        const ad = parseFloat(adSpendMonthly) || 0
        const cm = price - cost - ship
        const totalFixed = fixed + ad
        const beu = cm > 0 ? Math.ceil(totalFixed / cm) : 0
        const newResults = {
            breakevenUnits: beu, breakevenRevenue: Math.round(beu * price),
            contributionMargin: Math.round(cm * 100) / 100,
            contributionMarginPercent: price > 0 ? Math.round((cm / price) * 1000) / 10 : 0,
            profitAt100: Math.round(100 * cm - totalFixed), profitAt500: Math.round(500 * cm - totalFixed),
        }
        setResults(newResults)
        setCalculated(true)
        if (user) {
            saveCalculation(supabase, 'breakeven_calculator',
                { sellingPrice, productCost, fixedCosts, shippingPerUnit, adSpendMonthly },
                newResults
            ).then(() => setHistoryRefresh(p => p + 1))
        }
    }

    const loadFromHistory = (inputs: Record<string, string>, histResults: Record<string, number>) => {
        setSellingPrice(inputs.sellingPrice || ''); setProductCost(inputs.productCost || '')
        setFixedCosts(inputs.fixedCosts || ''); setShippingPerUnit(inputs.shippingPerUnit || '')
        setAdSpendMonthly(inputs.adSpendMonthly || '')
        setResults(histResults as typeof results)
        setCalculated(true)
    }

    const handleGoogleAuth = async () => {
        setAuthLoading(true); setAuthMode('google-waiting')
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`, skipBrowserRedirect: true },
        })
        if (data?.url && !error) window.open(data.url, '_blank')
        setAuthLoading(false)
    }
    const handleEmailSubmit = async () => {
        if (!emailInput) return
        setAuthLoading(true); setAuthEmail(emailInput)
        await supabase.auth.signInWithOtp({ email: emailInput, options: { shouldCreateUser: true, data: { source: 'tools', tool_used: 'breakeven_calculator' } } })
        setAuthLoading(false); setAuthMode('otp-verify')
    }
    const handleOtpVerify = async () => {
        if (!otpCode || otpCode.length < 8) return
        setAuthLoading(true)
        const { data, error } = await supabase.auth.verifyOtp({ email: authEmail, token: otpCode, type: 'email' })
        setAuthLoading(false)
        if (error) alert('Kod geçersiz veya süresi dolmuş.')
        else if (data.user) { setUser(data.user); setAuthMode('idle') }
    }

    return (
        <div className="py-12 px-6"><div className="max-w-2xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-blue-600 mb-2">Ücretsiz Araç</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">Başa Baş Hesaplayıcı</h1>
                <p className="text-sm text-gray-500">Ürününüzün maliyetlerini karşılaması için minimum kaç adet satmanız gerektiğini öğrenin.</p>
            </div>
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-8">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Satış Fiyatı (₺)" value={sellingPrice} onChange={setSellingPrice} ph="250" />
                    <Field label="Ürün Maliyeti (₺)" value={productCost} onChange={setProductCost} ph="100" />
                    <Field label="Aylık Sabit Giderler (₺)" value={fixedCosts} onChange={setFixedCosts} ph="5.000" />
                    <Field label="Birim Kargo Maliyeti (₺)" value={shippingPerUnit} onChange={setShippingPerUnit} ph="15" />
                    <Field label="Aylık Reklam Bütçesi (₺)" value={adSpendMonthly} onChange={setAdSpendMonthly} ph="3.000" />
                </div>
                <button onClick={handleCalculate} className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Hesapla</button>
            </div>
            {calculated && results && (<>
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Sonuçlar</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-5 rounded-xl bg-blue-50 border border-blue-200/60 text-center"><p className="text-xs font-medium text-blue-600/70 mb-1">Başa Baş Noktası</p><p className="text-3xl font-bold text-blue-700">{results.breakevenUnits}</p><p className="text-xs text-blue-500 mt-1">adet / ay</p></div>
                        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200/60 text-center"><p className="text-xs font-medium text-gray-500 mb-1">Gerekli Ciro</p><p className="text-3xl font-bold text-gray-800">₺{results.breakevenRevenue.toLocaleString('tr-TR')}</p><p className="text-xs text-gray-400 mt-1">/ ay</p></div>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-sm text-gray-600">Her birim satıştan <strong>₺{results.contributionMargin}</strong> katkı payı (%{results.contributionMarginPercent}) kazanıyorsunuz. Ayda en az <strong>{results.breakevenUnits} adet</strong> satmalısınız.</p>
                    </div>
                </div>
                {/* Gated */}
                <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Kâr Senaryoları</h2>
                    <div className={!user ? 'blur-md select-none pointer-events-none' : ''}>
                        <div className="space-y-4">
                            <ScenarioRow label="100 adet satarsanız" value={results.profitAt100} />
                            <ScenarioRow label="500 adet satarsanız" value={results.profitAt500} />
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200/50">
                            <p className="text-sm text-blue-800 font-medium mb-1">💡 Prificient Önerisi</p>
                            <p className="text-xs text-blue-600 leading-relaxed">{results.contributionMarginPercent < 30 ? 'Katkı payı marjınız düşük. Fiyat artışı veya maliyet düşürme değerlendirin.' : 'Katkı payı marjınız sağlıklı. Reklam bütçesi artışıyla ölçeklenebilirsiniz.'}</p>
                        </div>
                    </div>
                    {!user && <SoftGate color="blue" title="Farklı Senaryolarda Ne Kazanırsınız?" desc="Kâr senaryolarını görmek için ücretsiz giriş yapın." authMode={authMode} authLoading={authLoading} emailInput={emailInput} setEmailInput={setEmailInput} otpCode={otpCode} setOtpCode={setOtpCode} authEmail={authEmail} onGoogle={handleGoogleAuth} onEmailSubmit={handleEmailSubmit} onOtpVerify={handleOtpVerify} setAuthMode={setAuthMode} />}
                </div>
            </>)}

            {/* History Panel */}
            {user && (
                <CalculationHistory
                    supabase={supabase}
                    toolName="breakeven_calculator"
                    onLoad={loadFromHistory}
                    refreshKey={historyRefresh}
                    formatSummary={(r) => `Başa Baş: ${r.breakevenUnits} adet — Ciro: ₺${r.breakevenRevenue?.toLocaleString('tr-TR')}`}
                />
            )}
        </div></div>
    )
}

function Field({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph: string }) {
    return (<div><label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label><input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={ph} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" /></div>)
}
function ScenarioRow({ label, value }: { label: string; value: number }) {
    return (<div className="p-4 rounded-xl border border-gray-200/60 flex justify-between items-center"><p className="text-sm font-medium text-gray-700">{label}</p><p className={`text-lg font-bold ${value > 0 ? 'text-emerald-600' : 'text-red-600'}`}>₺{value.toLocaleString('tr-TR')}</p></div>)
}
function SoftGate({ color, title, desc, authMode, authLoading, emailInput, setEmailInput, otpCode, setOtpCode, authEmail, onGoogle, onEmailSubmit, onOtpVerify, setAuthMode }: {
    color: string; title: string; desc: string
    authMode: string; authLoading: boolean
    emailInput: string; setEmailInput: (v: string) => void
    otpCode: string; setOtpCode: (v: string) => void
    authEmail: string
    onGoogle: () => void; onEmailSubmit: () => void; onOtpVerify: () => void
    setAuthMode: (v: 'idle' | 'email-input' | 'otp-verify' | 'google-waiting') => void
}) {
    return (<div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl"><div className="text-center max-w-sm px-6">
        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-4`}><svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{desc}</p>
        {authMode !== 'otp-verify' && <button onClick={onGoogle} disabled={authLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 shadow-sm"><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Google ile Giriş Yap</button>}
        {authMode === 'google-waiting' && <p className="text-xs text-blue-600 mb-3 animate-pulse">Yeni sekmede giriş yapın, bu sayfa otomatik güncellenecek...</p>}
        {authMode === 'idle' && <button onClick={() => setAuthMode('email-input')} className={`w-full py-3 rounded-xl bg-${color}-600 text-white text-sm font-semibold hover:bg-${color}-700 transition-colors`}>E-posta ile Giriş Yap</button>}
        {authMode === 'email-input' && <div className="flex gap-2"><input type="email" placeholder="ornek@email.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onEmailSubmit()} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /><button onClick={onEmailSubmit} disabled={authLoading || !emailInput} className={`px-4 py-3 rounded-xl bg-${color}-600 text-white text-sm font-semibold disabled:opacity-50`}>Gönder</button></div>}
        {authMode === 'otp-verify' && <div><p className="text-xs text-gray-500 mb-3"><strong>{authEmail}</strong> adresine 8 haneli kod gönderildi.</p><div className="flex gap-2"><input type="text" maxLength={8} placeholder="00000000" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && onOtpVerify()} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" /><button onClick={onOtpVerify} disabled={authLoading || otpCode.length < 8} className={`px-4 py-3 rounded-xl bg-${color}-600 text-white text-sm font-semibold disabled:opacity-50`}>Doğrula</button></div><button onClick={() => { setAuthMode('email-input'); setOtpCode('') }} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Farklı e-posta kullan</button></div>}
        <p className="text-[11px] text-gray-400 mt-4">Ücretsiz. Ana uygulamaya yönlendirilmezsiniz.</p>
    </div></div>)
}
