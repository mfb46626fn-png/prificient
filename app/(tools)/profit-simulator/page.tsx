'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { saveCalculation } from '@/lib/tools/calculations'
import CalculationHistory from '@/components/tools/CalculationHistory'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

// ─── Types ──────────────────────────────────────
interface SimResults {
    grossRevenue: number
    totalCogs: number
    totalShipping: number
    totalAdSpend: number
    returnLoss: number
    grossProfit: number
    netProfit: number
    profitMargin: number
    estimatedOrders: number
    // Scenario
    scenarioReturnReduction: number
    scenarioNewNetProfit: number
    scenarioProfitIncrease: number
    // Risk
    riskLevel: 'low' | 'medium' | 'high'
    riskPercent: number
    riskMessage: string
}

export default function ProfitSimulatorPage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [calculated, setCalculated] = useState(false)
    const [historyRefresh, setHistoryRefresh] = useState(0)
    const [authMode, setAuthMode] = useState<'idle' | 'email-input' | 'otp-verify' | 'google-waiting'>('idle')
    const [emailInput, setEmailInput] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [authEmail, setAuthEmail] = useState('')

    // Inputs
    const [targetRevenue, setTargetRevenue] = useState('')
    const [avgCostPercent, setAvgCostPercent] = useState('')
    const [avgShippingCost, setAvgShippingCost] = useState('')
    const [adBudget, setAdBudget] = useState('')
    const [returnRate, setReturnRate] = useState('')

    const [results, setResults] = useState<SimResults | null>(null)

    // ─── Auth ──────────────────────────────────
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
        await supabase.auth.signInWithOtp({ email: emailInput, options: { shouldCreateUser: true, data: { source: 'tools', tool_used: 'profit_simulator' } } })
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

    // ─── Calculation Engine ────────────────────
    const handleSimulate = () => {
        const rev = parseFloat(targetRevenue) || 0
        const costPct = (parseFloat(avgCostPercent) || 0) / 100
        const shipPerOrder = parseFloat(avgShippingCost) || 0
        const ad = parseFloat(adBudget) || 0
        const retPct = (parseFloat(returnRate) || 0) / 100

        // Estimate order count from avg order value assumption (₺250)
        const avgOrderValue = 250
        const estimatedOrders = rev > 0 ? Math.round(rev / avgOrderValue) : 0

        const totalCogs = rev * costPct
        const totalShipping = estimatedOrders * shipPerOrder
        const returnLoss = rev * retPct
        const effectiveRevenue = rev - returnLoss
        const grossProfit = effectiveRevenue - totalCogs
        const netProfit = grossProfit - totalShipping - ad
        const profitMargin = effectiveRevenue > 0 ? (netProfit / effectiveRevenue) * 100 : 0

        // Scenario: 5% return rate reduction
        const scenarioReturnReduction = 5
        const newRetPct = Math.max(0, retPct - 0.05)
        const newReturnLoss = rev * newRetPct
        const newEffRevenue = rev - newReturnLoss
        const newGrossProfit = newEffRevenue - totalCogs
        const scenarioNewNetProfit = newGrossProfit - totalShipping - ad
        const scenarioProfitIncrease = netProfit !== 0 ? ((scenarioNewNetProfit - netProfit) / Math.abs(netProfit)) * 100 : 0

        // Risk assessment
        const adToRevRatio = rev > 0 ? ad / rev : 0
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        let riskPercent = 15
        let riskMessage = ''

        if (profitMargin < 0) {
            riskLevel = 'high'
            riskPercent = 90
            riskMessage = 'Mevcut senaryoda zarar ediyorsunuz. Maliyetlerinizi acilen gözden geçirin.'
        } else if (profitMargin < 5 || adToRevRatio > 0.3) {
            riskLevel = 'high'
            riskPercent = 70
            riskMessage = `Bu reklam bütçesiyle zarar etme riskiniz %${riskPercent}. Reklam harcaması cironun %${Math.round(adToRevRatio * 100)}'ini oluşturuyor.`
        } else if (profitMargin < 15 || adToRevRatio > 0.2) {
            riskLevel = 'medium'
            riskPercent = 40
            riskMessage = `Kâr marjınız dar. İade oranındaki küçük bir artış sizi zarara çevirebilir.`
        } else {
            riskLevel = 'low'
            riskPercent = 15
            riskMessage = 'Finansal yapınız sağlıklı görünüyor. Ölçeklendirme için uygun.'
        }

        const newResults: SimResults = {
            grossRevenue: Math.round(rev),
            totalCogs: Math.round(totalCogs),
            totalShipping: Math.round(totalShipping),
            totalAdSpend: Math.round(ad),
            returnLoss: Math.round(returnLoss),
            grossProfit: Math.round(grossProfit),
            netProfit: Math.round(netProfit),
            profitMargin: Math.round(profitMargin * 10) / 10,
            estimatedOrders,
            scenarioReturnReduction,
            scenarioNewNetProfit: Math.round(scenarioNewNetProfit),
            scenarioProfitIncrease: Math.round(scenarioProfitIncrease),
            riskLevel, riskPercent, riskMessage,
        }
        setResults(newResults)
        setCalculated(true)

        if (user) {
            saveCalculation(supabase, 'profit_simulator',
                { targetRevenue, avgCostPercent, avgShippingCost, adBudget, returnRate },
                newResults as unknown as Record<string, number>
            ).then(() => setHistoryRefresh(p => p + 1))
        }
    }

    const loadFromHistory = (inputs: Record<string, string>, histResults: Record<string, number>) => {
        setTargetRevenue(inputs.targetRevenue || ''); setAvgCostPercent(inputs.avgCostPercent || '')
        setAvgShippingCost(inputs.avgShippingCost || ''); setAdBudget(inputs.adBudget || '')
        setReturnRate(inputs.returnRate || '')
        setResults(histResults as unknown as SimResults)
        setCalculated(true)
    }

    // ─── Waterfall Chart Data ──────────────────
    const waterfallData = useMemo(() => {
        if (!results) return []
        return [
            { name: 'Brüt Ciro', value: results.grossRevenue, fill: '#6d28d9' },
            { name: 'Ürün Maliyeti', value: -results.totalCogs, fill: '#ef4444' },
            { name: 'Kargo', value: -results.totalShipping, fill: '#f97316' },
            { name: 'Reklam', value: -results.totalAdSpend, fill: '#f59e0b' },
            { name: 'İade Kaybı', value: -results.returnLoss, fill: '#ec4899' },
            { name: 'Net Kâr', value: results.netProfit, fill: results.netProfit >= 0 ? '#10b981' : '#ef4444' },
        ]
    }, [results])

    // ─── Render ────────────────────────────────
    return (
        <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Premium Araç
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                        E-Ticaret Kâr Simülatörü
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Hedef cironuzun gerçekte ne kadar kâr getireceğini simüle edin.
                        İade oranı dahil tüm gizli maliyetleri hesaba katarak net kârlılığınızı görün.
                    </p>
                </div>

                {/* Calculator Form */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-8">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputField
                                label="Hedef Aylık Ciro (₺)"
                                value={targetRevenue}
                                onChange={setTargetRevenue}
                                placeholder="100.000"
                                hint="Ulaşmak istediğiniz aylık satış hedefi"
                            />
                        </div>
                        <InputField
                            label="Ortalama Ürün Maliyeti (%)"
                            value={avgCostPercent}
                            onChange={setAvgCostPercent}
                            placeholder="40"
                            hint="Satış fiyatının kaç %'i ürün maliyeti?"
                        />
                        <InputField
                            label="Sipariş Başına Kargo (₺)"
                            value={avgShippingCost}
                            onChange={setAvgShippingCost}
                            placeholder="25"
                            hint="Ortalama kargo gideri"
                        />
                        <InputField
                            label="Aylık Reklam Bütçesi (₺)"
                            value={adBudget}
                            onChange={setAdBudget}
                            placeholder="15.000"
                            hint="Toplam dijital reklam harcaması"
                        />
                        <InputField
                            label="Tahmini İade Oranı (%)"
                            value={returnRate}
                            onChange={setReturnRate}
                            placeholder="8"
                            hint="Çoğu araç bunu sormaz — biz soruyoruz"
                            highlight
                        />
                    </div>

                    <button
                        onClick={handleSimulate}
                        className="mt-6 w-full py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-600/20"
                    >
                        Simüle Et
                    </button>
                </div>

                {/* Results */}
                {calculated && results && (<>
                    {/* Public: Basic Results */}
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Kârlılık</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200/60">
                                <p className="text-xs font-medium text-gray-500 mb-1">Tahmini Brüt Kâr</p>
                                <p className={`text-2xl font-bold ${results.grossProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    ₺{results.grossProfit.toLocaleString('tr-TR')}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">Ürün maliyeti düşüldükten sonra</p>
                            </div>
                            <div className={`p-5 rounded-xl border ${results.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200/60' : 'bg-red-50 border-red-200/60'}`}>
                                <p className={`text-xs font-medium ${results.netProfit >= 0 ? 'text-emerald-600/70' : 'text-red-600/70'} mb-1`}>Tahmini Net Kâr</p>
                                <p className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                    ₺{results.netProfit.toLocaleString('tr-TR')}
                                </p>
                                <p className={`text-[11px] ${results.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'} mt-1`}>
                                    Kâr Marjı: %{results.profitMargin}
                                </p>
                            </div>
                        </div>

                        {/* Quick summary */}
                        <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-0.5">Tahmini Sipariş</p>
                                    <p className="text-sm font-semibold text-gray-700">{results.estimatedOrders} adet</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-0.5">İade Kaybı</p>
                                    <p className="text-sm font-semibold text-red-600">₺{results.returnLoss.toLocaleString('tr-TR')}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-0.5">Reklam/Ciro</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        %{results.grossRevenue > 0 ? Math.round((results.totalAdSpend / results.grossRevenue) * 100) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gated: Prificient Analysis */}
                    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Prificient Analizi</h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">PRO</span>
                        </div>

                        <div className={!user ? 'blur-md select-none pointer-events-none' : ''}>
                            {/* Scenario Analysis */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/50 mb-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-violet-900 mb-1">Senaryo Analizi</p>
                                        <p className="text-sm text-violet-700 leading-relaxed">
                                            İade oranınızı <strong>%{results.scenarioReturnReduction} düşürürseniz</strong>,
                                            net kârınız <strong>₺{results.scenarioNewNetProfit.toLocaleString('tr-TR')}</strong>&apos;ye çıkar
                                            {results.scenarioProfitIncrease > 0 && (
                                                <> — bu, <strong className="text-emerald-600">%{results.scenarioProfitIncrease} artış</strong> demek</>
                                            )}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Warning */}
                            <div className={`p-5 rounded-xl border mb-6 ${results.riskLevel === 'high' ? 'bg-red-50 border-red-200/50' :
                                results.riskLevel === 'medium' ? 'bg-amber-50 border-amber-200/50' :
                                    'bg-emerald-50 border-emerald-200/50'
                                }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${results.riskLevel === 'high' ? 'bg-red-100' :
                                        results.riskLevel === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'
                                        }`}>
                                        <svg className={`w-4 h-4 ${results.riskLevel === 'high' ? 'text-red-600' :
                                            results.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-sm font-semibold ${results.riskLevel === 'high' ? 'text-red-900' :
                                                results.riskLevel === 'medium' ? 'text-amber-900' : 'text-emerald-900'
                                                }`}>Risk Değerlendirmesi</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${results.riskLevel === 'high' ? 'bg-red-200 text-red-800' :
                                                results.riskLevel === 'medium' ? 'bg-amber-200 text-amber-800' :
                                                    'bg-emerald-200 text-emerald-800'
                                                }`}>
                                                %{results.riskPercent}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${results.riskLevel === 'high' ? 'text-red-700' :
                                            results.riskLevel === 'medium' ? 'text-amber-700' : 'text-emerald-700'
                                            }`}>{results.riskMessage}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Waterfall Chart */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Gelir / Gider Dağılımı</p>
                                <div className="h-72 -ml-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={waterfallData} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}K`}
                                            />
                                            <RTooltip
                                                formatter={(value?: number) => [`₺${Math.abs(value ?? 0).toLocaleString('tr-TR')}`, '']}
                                                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                                            />
                                            <ReferenceLine y={0} stroke="#d1d5db" />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                {waterfallData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="mt-6 space-y-2">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Maliyet Detayı</p>
                                <BreakdownRow label="Brüt Ciro" value={results.grossRevenue} positive />
                                <BreakdownRow label="Ürün Maliyeti (COGS)" value={-results.totalCogs} />
                                <BreakdownRow label="Kargo Giderleri" value={-results.totalShipping} />
                                <BreakdownRow label="Reklam Harcaması" value={-results.totalAdSpend} />
                                <BreakdownRow label="İade Kayıpları" value={-results.returnLoss} />
                                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-xl px-4 mt-2">
                                    <span className="text-sm font-bold text-gray-700">NET KÂR</span>
                                    <span className={`text-lg font-bold ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ₺{results.netProfit.toLocaleString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Soft-Gate Overlay */}
                        {!user && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                                <div className="text-center max-w-sm px-6">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        Bu Ciro ile Gerçekten Kâr Eder misiniz?
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Senaryo analizi, risk uyarısı ve görsel maliyet dağılımını görmek için ücretsiz giriş yapın.
                                    </p>

                                    {authMode !== 'otp-verify' && (
                                        <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 shadow-sm">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                            Google ile Giriş Yap
                                        </button>
                                    )}
                                    {authMode === 'google-waiting' && <p className="text-xs text-emerald-600 mb-3 animate-pulse">Yeni sekmede giriş yapın, bu sayfa otomatik güncellenecek...</p>}
                                    {authMode === 'idle' && <button onClick={() => setAuthMode('email-input')} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">E-posta ile Giriş Yap</button>}
                                    {authMode === 'email-input' && (
                                        <div className="flex gap-2">
                                            <input type="email" placeholder="ornek@email.com" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                            <button onClick={handleEmailSubmit} disabled={authLoading || !emailInput} className="px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">Gönder</button>
                                        </div>
                                    )}
                                    {authMode === 'otp-verify' && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-3"><strong>{authEmail}</strong> adresine 8 haneli kod gönderildi.</p>
                                            <div className="flex gap-2">
                                                <input type="text" maxLength={8} placeholder="00000000" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && handleOtpVerify()} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                                <button onClick={handleOtpVerify} disabled={authLoading || otpCode.length < 8} className="px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">Doğrula</button>
                                            </div>
                                            <button onClick={() => { setAuthMode('email-input'); setOtpCode('') }} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Farklı e-posta kullan</button>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-400 mt-4">Ücretsiz. Ana uygulamaya yönlendirilmezsiniz.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>)}

                {/* History Panel */}
                {user && (
                    <CalculationHistory
                        supabase={supabase}
                        toolName="profit_simulator"
                        onLoad={loadFromHistory}
                        refreshKey={historyRefresh}
                        formatSummary={(r) => `Net Kâr: ₺${r.netProfit?.toLocaleString('tr-TR')} — Marj: %${r.profitMargin}`}
                    />
                )}
            </div>
        </div>
    )
}

// ─── Reusable Components ──────────────────────

function InputField({ label, value, onChange, placeholder, hint, highlight }: {
    label: string; value: string; onChange: (v: string) => void
    placeholder: string; hint?: string; highlight?: boolean
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {label}
                {highlight && <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Önemli</span>}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${highlight
                    ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-400 bg-emerald-50/30'
                    : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-400'
                    }`}
            />
            {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        </div>
    )
}

function BreakdownRow({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2.5 px-1 border-b border-gray-100">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-semibold ${positive ? 'text-gray-900' : 'text-red-600'}`}>
                {positive ? '' : '-'}₺{Math.abs(value).toLocaleString('tr-TR')}
            </span>
        </div>
    )
}
