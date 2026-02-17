'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getToolBySlug } from '@/lib/tools/registry'
import { saveCalculation } from '@/lib/tools/calculations'
import CalculationHistory from './CalculationHistory'

interface CalculatorEngineProps {
    slug: string
}

export default function CalculatorEngine({ slug }: CalculatorEngineProps) {
    const config = getToolBySlug(slug)!
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [calculated, setCalculated] = useState(false)
    const [historyRefresh, setHistoryRefresh] = useState(0)
    const [authMode, setAuthMode] = useState<'idle' | 'email-input' | 'otp-verify' | 'google-waiting'>('idle')
    const [emailInput, setEmailInput] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [authEmail, setAuthEmail] = useState('')

    // Dynamic input values from config defaults
    const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = {}
        config.inputs.forEach((input) => { defaults[input.id] = '' })
        return defaults
    })

    const [computedResults, setComputedResults] = useState<Record<string, number | string>>({})

    // ─── Auth ──────────────────────────────
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
        await supabase.auth.signInWithOtp({ email: emailInput, options: { shouldCreateUser: true, data: { source: 'tools', tool_used: config.slug } } })
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

    // ─── Calculate ─────────────────────────
    const handleCalculate = () => {
        // Parse numeric values
        const numericInputs: Record<string, number> = {}
        config.inputs.forEach((input) => {
            numericInputs[input.id] = parseFloat(inputValues[input.id]) || input.defaultValue
        })

        // Compute results
        const results: Record<string, number | string> = {}
        config.results.forEach((result) => {
            results[result.id] = result.formula(numericInputs)
        })
        setComputedResults(results)
        setCalculated(true)

        // Save to history
        if (user) {
            saveCalculation(supabase, config.slug, inputValues, results as Record<string, number>)
                .then(() => setHistoryRefresh((p) => p + 1))
        }
    }

    const loadFromHistory = (inputs: Record<string, string>, histResults: Record<string, number>) => {
        setInputValues(inputs)
        setComputedResults(histResults)
        setCalculated(true)
    }

    // Helpers
    const updateInput = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }))
    }

    const colorMap: Record<string, { primary: string; bg: string; border: string; ring: string; text: string; light: string }> = {
        violet: { primary: 'bg-violet-600 hover:bg-violet-700', bg: 'bg-violet-50', border: 'border-violet-200/60', ring: 'focus:ring-violet-500/20 focus:border-violet-400', text: 'text-violet-600', light: 'bg-violet-100 text-violet-700' },
        blue: { primary: 'bg-blue-600 hover:bg-blue-700', bg: 'bg-blue-50', border: 'border-blue-200/60', ring: 'focus:ring-blue-500/20 focus:border-blue-400', text: 'text-blue-600', light: 'bg-blue-100 text-blue-700' },
        emerald: { primary: 'bg-emerald-600 hover:bg-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200/60', ring: 'focus:ring-emerald-500/20 focus:border-emerald-400', text: 'text-emerald-600', light: 'bg-emerald-100 text-emerald-700' },
        amber: { primary: 'bg-amber-600 hover:bg-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', ring: 'focus:ring-amber-500/20 focus:border-amber-400', text: 'text-amber-600', light: 'bg-amber-100 text-amber-700' },
        rose: { primary: 'bg-rose-600 hover:bg-rose-700', bg: 'bg-rose-50', border: 'border-rose-200/60', ring: 'focus:ring-rose-500/20 focus:border-rose-400', text: 'text-rose-600', light: 'bg-rose-100 text-rose-700' },
        sky: { primary: 'bg-sky-600 hover:bg-sky-700', bg: 'bg-sky-50', border: 'border-sky-200/60', ring: 'focus:ring-sky-500/20 focus:border-sky-400', text: 'text-sky-600', light: 'bg-sky-100 text-sky-700' },
        orange: { primary: 'bg-orange-600 hover:bg-orange-700', bg: 'bg-orange-50', border: 'border-orange-200/60', ring: 'focus:ring-orange-500/20 focus:border-orange-400', text: 'text-orange-600', light: 'bg-orange-100 text-orange-700' },
    }
    const c = colorMap[config.color] || colorMap.violet

    // Separate public & locked results
    const publicResults = config.results.filter((r) => !r.isLocked)
    const lockedResults = config.results.filter((r) => r.isLocked)

    const formatValue = (value: number | string, type: string) => {
        if (typeof value === 'string') return value
        switch (type) {
            case 'currency': return `₺${value.toLocaleString('tr-TR')}`
            case 'percent': return `%${value}`
            case 'number': return `${value}`
            default: return `${value}`
        }
    }

    const getSentimentColor = (result: (typeof config.results)[0], value: number | string) => {
        if (!result.sentiment) return 'text-gray-900'
        const s = result.sentiment(value)
        if (s === 'positive') return 'text-emerald-700'
        if (s === 'negative') return 'text-red-600'
        return 'text-amber-600'
    }

    // ─── Render ────────────────────────────
    return (
        <div className="py-12 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                            <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={config.icon} />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${c.light}`}>
                            {config.category === 'finance' ? 'Finans' : config.category === 'marketing' ? 'Pazarlama' : config.category === 'operations' ? 'Operasyon' : 'Araç'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                        {config.title}
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                        {config.content.intro}
                    </p>
                </div>

                {/* Main Layout: Side by Side on Desktop */}
                <div className="grid gap-8 lg:grid-cols-5">
                    {/* ─── Left: Input Panel ─── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 lg:sticky lg:top-20">
                            <h2 className="text-sm font-semibold text-gray-700 mb-5">Verilerinizi Girin</h2>
                            <div className="space-y-4">
                                {config.inputs.map((input) => (
                                    <div key={input.id}>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                            {input.label}
                                            {input.tooltip && (
                                                <span className="group relative cursor-help">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.008v.008H12v-.008z" />
                                                    </svg>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-[11px] text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                        {input.tooltip}
                                                    </span>
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            {input.type === 'currency' && (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
                                            )}
                                            <input
                                                type="number"
                                                value={inputValues[input.id]}
                                                onChange={(e) => updateInput(input.id, e.target.value)}
                                                placeholder={input.placeholder || String(input.defaultValue)}
                                                className={`w-full py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 ${c.ring} transition-all ${input.type === 'currency' ? 'pl-8 pr-4' : input.type === 'percent' ? 'pl-4 pr-8' : 'px-4'
                                                    }`}
                                            />
                                            {input.type === 'percent' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleCalculate}
                                className={`mt-6 w-full py-3 rounded-xl ${c.primary} text-white text-sm font-semibold transition-all hover:shadow-lg`}
                            >
                                Hesapla
                            </button>
                        </div>
                    </div>

                    {/* ─── Right: Results Panel ─── */}
                    <div className="lg:col-span-3 space-y-6">
                        {!calculated ? (
                            /* Empty State */
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                                <div className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mx-auto mb-4`}>
                                    <svg className={`w-7 h-7 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={config.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Sonuçlar Burada Görünecek</h3>
                                <p className="text-xs text-gray-400">Soldaki formu doldurup &quot;Hesapla&quot; butonuna basın</p>
                            </div>
                        ) : (
                            <>
                                {/* Public Results */}
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-5">Sonuçlar</h2>
                                    <div className={`grid gap-4 ${publicResults.length > 2 ? 'sm:grid-cols-2' : ''}`}>
                                        {publicResults.map((result) => {
                                            const value = computedResults[result.id]
                                            if (value === undefined) return null
                                            return (
                                                <div
                                                    key={result.id}
                                                    className="p-4 rounded-xl bg-gray-50 border border-gray-200/60"
                                                >
                                                    <p className="text-xs font-medium text-gray-500 mb-1">{result.label}</p>
                                                    <p className={`text-2xl font-bold ${getSentimentColor(result, value)}`}>
                                                        {formatValue(value, result.type)}
                                                    </p>
                                                    {result.description && (
                                                        <p className="text-[11px] text-gray-400 mt-1">{result.description}</p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Locked Results */}
                                {lockedResults.length > 0 && (
                                    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 overflow-hidden">
                                        <div className="flex items-center gap-2 mb-5">
                                            <h2 className="text-lg font-semibold text-gray-900">Detaylı Analiz</h2>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.light}`}>PRO</span>
                                        </div>

                                        <div className={!user ? 'blur-md select-none pointer-events-none' : ''}>
                                            <div className="space-y-4">
                                                {lockedResults.map((result) => {
                                                    const value = computedResults[result.id]
                                                    if (value === undefined) return null
                                                    return (
                                                        <div
                                                            key={result.id}
                                                            className={`p-5 rounded-xl ${c.bg} border ${c.border}`}
                                                        >
                                                            <p className="text-xs font-medium text-gray-500 mb-1">{result.label}</p>
                                                            <p className={`text-2xl font-bold ${getSentimentColor(result, value)}`}>
                                                                {formatValue(value, result.type)}
                                                            </p>
                                                            {result.description && (
                                                                <p className="text-[11px] text-gray-400 mt-1.5">{result.description}</p>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Soft-Gate Overlay */}
                                        {!user && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                                                <div className="text-center max-w-sm px-6">
                                                    <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center mx-auto mb-4`}>
                                                        <svg className={`w-6 h-6 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Detaylı Analizi Görmek İçin</h3>
                                                    <p className="text-sm text-gray-500 mb-6">Ücretsiz giriş yapın ve ileri seviye sonuçlara erişin.</p>

                                                    {authMode !== 'otp-verify' && (
                                                        <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 shadow-sm">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                            Google ile Giriş Yap
                                                        </button>
                                                    )}
                                                    {authMode === 'google-waiting' && <p className={`text-xs ${c.text} mb-3 animate-pulse`}>Yeni sekmede giriş yapın, bu sayfa otomatik güncellenecek...</p>}
                                                    {authMode === 'idle' && <button onClick={() => setAuthMode('email-input')} className={`w-full py-3 rounded-xl ${c.primary} text-white text-sm font-semibold transition-colors`}>E-posta ile Giriş Yap</button>}
                                                    {authMode === 'email-input' && (
                                                        <div className="flex gap-2">
                                                            <input type="email" placeholder="ornek@email.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()} className={`flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 ${c.ring}`} />
                                                            <button onClick={handleEmailSubmit} disabled={authLoading || !emailInput} className={`px-4 py-3 rounded-xl ${c.primary} text-white text-sm font-semibold disabled:opacity-50`}>Gönder</button>
                                                        </div>
                                                    )}
                                                    {authMode === 'otp-verify' && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-3"><strong>{authEmail}</strong> adresine 8 haneli kod gönderildi.</p>
                                                            <div className="flex gap-2">
                                                                <input type="text" maxLength={8} placeholder="00000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleOtpVerify()} className={`flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 ${c.ring}`} />
                                                                <button onClick={handleOtpVerify} disabled={authLoading || otpCode.length < 8} className={`px-4 py-3 rounded-xl ${c.primary} text-white text-sm font-semibold disabled:opacity-50`}>Doğrula</button>
                                                            </div>
                                                            <button onClick={() => { setAuthMode('email-input'); setOtpCode('') }} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Farklı e-posta kullan</button>
                                                        </div>
                                                    )}
                                                    <p className="text-[11px] text-gray-400 mt-4">Ücretsiz. Ana uygulamaya yönlendirilmezsiniz.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* History Panel */}
                        {user && (
                            <CalculationHistory
                                supabase={supabase}
                                toolName={config.slug}
                                onLoad={loadFromHistory}
                                refreshKey={historyRefresh}
                                formatSummary={(r) => {
                                    const firstResult = config.results[0]
                                    if (!firstResult) return ''
                                    const val = r[firstResult.id]
                                    return `${firstResult.label}: ${formatValue(val, firstResult.type)}`
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-16 max-w-3xl">
                    <div className="prose prose-sm prose-gray">
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(config.content.details) }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Simple Markdown to HTML ──────────────────
function markdownToHtml(md: string): string {
    return md
        .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-gray-800 mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\d+\.\s(.*$)/gm, '<li class="text-sm text-gray-600 ml-4 mb-1">$1</li>')
        .replace(/^- (.*$)/gm, '<li class="text-sm text-gray-600 ml-4 mb-1 list-disc">$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '\n')
}
