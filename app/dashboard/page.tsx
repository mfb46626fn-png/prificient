import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PainEngine } from '@/lib/scoring/pain-engine'
import DecisionDesk from '@/components/DecisionDesk'
import RiskGauge from '@/components/RiskGauge'
import ProfitabilityPolarity from '@/components/ProfitabilityPolarity'
import DailyAutopsy from '@/components/DailyAutopsy'
import { ProductAnalysis } from '@/lib/analysis/product-profitability'
import { LedgerService } from '@/lib/ledger'
import Link from 'next/link'
import { LayoutDashboard, BarChart3, TrendingDown, Users } from 'lucide-react'
import DashboardClient from '@/components/DashboardClient'
import { BenchmarkEngine } from '@/lib/benchmarks'
import GhostExpenseCard from '@/components/GhostExpenseCard'
import FinancialAutopsy from '@/components/FinancialAutopsy'
import DeepScanTrigger from '@/components/DeepScanTrigger'

// Reusing Analytics Fetch Logic for the "Analytics" Tab


// Helper to Fetch Financial Autopsy Data
async function getFinancialData(user: any, supabase: any) {
    await LedgerService.initializeAccounts(user.id, supabase)

    // Aggregates
    let grossRevenue = 0
    let returns = 0
    let cogs = 0
    let ads = 0
    let fees = 0
    let shipping = 0

    const { data: entries } = await supabase
        .from('ledger_entries')
        .select(`amount, direction, account:ledger_accounts!inner(code)`)
        .eq('user_id', user.id)

    if (entries) {
        entries.forEach((entry: any) => {
            const code = entry.account.code
            const amt = Number(entry.amount)
            const isDebit = entry.direction === 'DEBIT'

            if (code === '600') {
                if (!isDebit) grossRevenue += amt
                else grossRevenue -= amt
            }
            if (code === '610') isDebit ? returns += amt : returns -= amt
            if (code === '621') isDebit ? cogs += amt : cogs -= amt
            if (code === '760') isDebit ? ads += amt : ads -= amt
            if (['780', '740', '770'].includes(code)) isDebit ? fees += amt : fees -= amt
        })
    }

    const netProfit = grossRevenue - returns - cogs - ads - fees - shipping

    const waterfall = [
        { name: 'Brüt Ciro', value: grossRevenue, fill: '#64748b' },
        { name: 'İadeler', value: -returns, fill: '#ef4444' },
        { name: 'Ürün Maliyeti', value: -cogs, fill: '#f59e0b' },
        { name: 'Reklam', value: -ads, fill: '#3b82f6' },
        { name: 'Giderler', value: -fees, fill: '#a855f7' },
        { name: 'NET KÂR', value: netProfit, fill: netProfit >= 0 ? '#10b981' : '#dc2626' },
    ]

    const trend = Array.from({ length: 30 }).map((_, i) => ({
        date: `Gün ${i + 1}`,
        revenue: Math.floor(grossRevenue / 30 * (0.8 + Math.random() * 0.4)),
        profit: Math.floor(netProfit / 30 * (0.8 + Math.random() * 0.4))
    }))

    const estimatedOrders = Math.max(1, Math.round(grossRevenue / 1500))
    const unitEconomics = {
        averageOrderValue: Math.round(grossRevenue / estimatedOrders),
        cogs: Math.round(cogs / estimatedOrders),
        ads: Math.round(ads / estimatedOrders),
        shipping: Math.round(shipping / estimatedOrders),
        fees: Math.round(fees / estimatedOrders),
        net: Math.round(netProfit / estimatedOrders)
    }

    const expensesMap = [
        { name: 'İadeler', size: returns, fill: '#ef4444' },
        { name: 'Maliyet (COGS)', size: cogs, fill: '#f59e0b' },
        { name: 'Reklam', size: ads, fill: '#3b82f6' },
        { name: 'Komisyon & Hizmet', size: fees, fill: '#a855f7' }
    ].filter(e => e.size > 0)

    return {
        waterfall,
        trend,
        unitEconomics,
        expenses: expensesMap
    }
}


export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // --- V7.0 SUBSCRIPTION CHECK ---
    // In production, we check DB: SELECT is_blind_mode FROM subscriptions...
    // For Prototype/Demo: Let's trigger "Blind Mode" if ?mode=blind query param exists or if user has high risk/expired trial.
    // Let's rely on a mock check for now to enable the UI work.

    // const { data: sub } = await supabase.from('subscriptions').select('is_blind_mode').eq('user_id', user.id).single()
    // const isBlindMode = sub?.is_blind_mode || false

    const params = await searchParams
    const view = params.view || 'action'
    const isBlindMode = params.view === 'blind' // Temporary trigger for manual testing

    // Update Params handling to include blind check in URL for demo purposes or logic
    // Actually user said: "Beta bittiğinde...". I will assume standard flow but allow ?blind=true to see effect.
    const forceBlind = (await searchParams)['blind'] === 'true'

    // --- TABS UI ---
    // We render this Client Side or Server Side? Server Side is fine with Links.
    // UX: "Sayfa yenilenmeden, anlık geçiş" -> Use Link with scroll={false} or Client Component for Tabs.
    // User requested: "Sayfa yenilenmeden...". Standard Next.js Link usually does hard nav unless intercepted. 
    // True "Tabs" usually imply Client State. BUT User also said "URL Query Parametresi ile yönet".
    // Next.js App Router query params changes ARE navigations, but they are soft if using <Link>.
    // So separate page content is okay as long as layout preserves.
    // I will use a simple Tab Navigation Component on top.

    // --- FETCH DATA ---
    // 1. Diagnosis (Action View)
    let diagnosis
    let polarity: { heroes: any[], villains: any[] } = { heroes: [], villains: [] }
    let autopsy = null

    if (view === 'action') {
        try {
            diagnosis = await PainEngine.diagnose(user.id)
            polarity = await ProductAnalysis.getProductsByProfitability(user.id)

            // Autopsy for Yesterday
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            autopsy = await LedgerService.getDailyAutopsy(user.id, yesterday)
        } catch (e) { console.error("Action Data Error", e) }
    }

    // 2. Financial Autopsy Data (Analytics View)
    let financialData = null
    if (view === 'analytics') {
        financialData = await getFinancialData(user, supabase)
    }

    return (
        <div className="space-y-8 pb-20">
            {/* TABS CONTAINER */}
            <div className="w-full flex justify-center mb-8">
                <div className="bg-white p-1 rounded-2xl inline-flex shadow-sm border border-gray-100">
                    <Link
                        href="/dashboard?view=action"
                        scroll={false}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${view === 'action' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        <LayoutDashboard size={18} /> Karar Masası
                    </Link>
                    <Link
                        href="/dashboard?view=analytics"
                        scroll={false}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${view === 'analytics' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        <BarChart3 size={18} /> Veri Analizi
                    </Link>
                </div>
            </div>

            {/* VIEW: ACTION (DECISION DESK) */}
            {view === 'action' && diagnosis && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* RISK HEADER & GAUGE */}
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
                        {/* Risk Gauge takes most space */}
                        <div className="flex-1">
                            <RiskGauge
                                score={diagnosis.score}
                                level={diagnosis.level}
                                context={(() => {
                                    const factors = Object.entries(diagnosis.factors).sort(([, a], [, b]) => Number(b) - Number(a)) as [string, number][]
                                    const top = factors[0]
                                    if (top && top[1] > 0) {
                                        const name = top[0] === 'toxic_product_impact' ? 'Toksik ürünler' :
                                            top[0] === 'refund_bleed_impact' ? 'İade oranlarındaki artış' :
                                                top[0] === 'roas_trap_impact' ? 'Verimsiz reklam harcamaları' :
                                                    top[0] === 'silent_fee_impact' ? 'Gizli kesintiler' : 'Nakit akış dengesizliği'
                                        return `${name} sebebiyle risk puanınız kritik seviyeye yaklaşıyor.`
                                    }
                                    return "İşletme finansallarınız şu an stabil görünüyor. Büyümeye odaklanabilirsiniz."
                                })()}
                            />
                        </div>

                        {/* Scan Trigger Button - Aligned to right/top on desktop */}
                        <div className="shrink-0">
                            <DeepScanTrigger autoTrigger={(await searchParams)['sync_start'] === 'true'} />
                        </div>
                    </div>

                    <DecisionDesk diagnosis={diagnosis} userName={user.email || ''} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* 2/3 Polarity */}
                        <div className="xl:col-span-2">
                            <ProfitabilityPolarity heroes={polarity.heroes} villains={polarity.villains} />
                        </div>

                        {/* 1/3 Autopsy & Ghost Fees */}
                        <div className="xl:col-span-1 grid grid-cols-1 gap-8">
                            <DailyAutopsy data={autopsy} />
                            <GhostExpenseCard amount={diagnosis.financials.fees} />
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: ANALYTICS (FINANCIAL AUTOPSY) */}
            {view === 'analytics' && financialData && (
                <FinancialAutopsy data={financialData} />
            )}

        </div>
    )
}
