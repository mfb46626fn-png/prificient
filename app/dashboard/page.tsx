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
import { LayoutDashboard, BarChart3, TrendingDown } from 'lucide-react'
import DeepScanTrigger from '@/components/DeepScanTrigger'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import GhostExpenseCard from '@/components/GhostExpenseCard'

// Helper to Fetch Financial Autopsy Data with Filters
async function getFinancialData(user: any, supabase: any, startDate: Date, endDate: Date) {
    await LedgerService.initializeAccounts(user.id, supabase)

    // 1. Get Currency
    const { data: settings } = await supabase.from('store_settings').select('currency').eq('user_id', user.id).single()
    const currency = settings?.currency || 'TRY'

    // Aggregates
    let grossRevenue = 0
    let returns = 0
    let cogs = 0
    let ads = 0
    let fees = 0

    // We filter by CREATED AT for simplicity in MVP, or Transaction Date if strictly accounting.
    // Ledger Entries link to Transactions.
    // Supabase filtering on joined table:
    const { data: entries } = await supabase
        .from('ledger_entries')
        .select(`
            amount, 
            direction, 
            account:ledger_accounts!inner(code),
            transaction:ledger_transactions!inner(transaction_date)
        `)
        .eq('user_id', user.id)
        .gte('transaction.transaction_date', startDate.toISOString())
        .lte('transaction.transaction_date', endDate.toISOString())

    const trendMap: Record<string, { revenue: number, profit: number }> = {}

    // Init Trend Map (fill empty days)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0]
        trendMap[key] = { revenue: 0, profit: 0 }
    }

    if (entries) {
        entries.forEach((entry: any) => {
            const code = entry.account.code
            const amt = Number(entry.amount)
            const isDebit = entry.direction === 'DEBIT'
            const dateKey = entry.transaction?.transaction_date ? entry.transaction.transaction_date.split('T')[0] : null

            // Values
            let revenueImpact = 0
            let profitImpact = 0

            if (code === '600') { // Sales
                if (!isDebit) {
                    grossRevenue += amt
                    revenueImpact += amt
                    profitImpact += amt
                } else {
                    grossRevenue -= amt
                    revenueImpact -= amt
                    profitImpact -= amt
                }
            }
            if (code === '610') { // Returns
                const val = isDebit ? amt : -amt
                returns += val
                profitImpact -= val
            }
            if (code === '621') { // COGS
                const val = isDebit ? amt : -amt
                cogs += val
                profitImpact -= val
            }
            if (code === '760') { // Marketing
                const val = isDebit ? amt : -amt
                ads += val
                profitImpact -= val
            }
            if (['780', '740', '770'].includes(code)) { // Fees
                const val = isDebit ? amt : -amt
                fees += val
                profitImpact -= val
            }

            // Update Trend
            if (dateKey && trendMap[dateKey]) {
                trendMap[dateKey].revenue += revenueImpact
                trendMap[dateKey].profit += profitImpact
            }
        })
    }

    const netProfit = grossRevenue - returns - cogs - ads - fees
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

    // Convert Trend Map to Array
    const trend = Object.entries(trendMap).map(([date, val]) => ({
        date: new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        revenue: val.revenue,
        profit: val.profit
    }))

    return {
        currency,
        kpi: {
            revenue: grossRevenue,
            profit: netProfit,
            margin,
            cogs,
            ads,
            returns
        },
        trend
    }
}


export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const view = params.view || 'action'
    const syncStart = params.sync_start === 'true'

    // Date Logic
    const range = (params.range as string) || '30d'
    const now = new Date()
    const startDate = new Date()

    if (range === '7d') startDate.setDate(now.getDate() - 7)
    else if (range === '30d') startDate.setDate(now.getDate() - 30)
    else if (range === 'this_month') startDate.setDate(1)
    else if (range === 'last_month') {
        startDate.setMonth(startDate.getMonth() - 1)
        startDate.setDate(1)
        now.setDate(0) // Last day of previous month
    } else if (range === 'all') {
        startDate.setFullYear(2020) // Way back
    }

    // --- FETCH DATA ---

    // 1. Action Data (Diagnosis)
    let diagnosis
    let polarity: { heroes: any[], villains: any[] } = { heroes: [], villains: [] }
    let autopsy = null

    if (view === 'action') {
        try {
            diagnosis = await PainEngine.diagnose(user.id)
            polarity = await ProductAnalysis.getProductsByProfitability(user.id)

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            autopsy = await LedgerService.getDailyAutopsy(user.id, yesterday)
        } catch (e) {
            console.error("Action Data Error", e)
        }
    }

    // 2. Analytics Data (Financial)
    let analyticsData = null
    let productPerformance = []
    let analyticsError = null

    if (view === 'analytics') {
        try {
            const finData = await getFinancialData(user, supabase, startDate, now)

            // Product Data
            const prodData = await ProductAnalysis.getProductsByProfitability(user.id)
            productPerformance = [...prodData.heroes, ...prodData.villains].sort((a, b) => b.profit - a.profit)

            analyticsData = {
                ...finData,
                products: productPerformance
            }
        } catch (err: any) {
            console.error("Analytics Fetch Error:", err)
            analyticsError = "Veri çekilirken bir hata oluştu: " + (err.message || "Bilinmeyen Hata")
        }
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

            {/* VIEW: ACTION */}
            {view === 'action' && diagnosis && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
                        <div className="flex-1">
                            <RiskGauge
                                score={diagnosis.score}
                                level={diagnosis.level}
                                context="İşletme risk analizi güncel."
                            />
                        </div>
                        <div className="shrink-0">
                            <DeepScanTrigger autoTrigger={syncStart} />
                        </div>
                    </div>

                    <DecisionDesk diagnosis={diagnosis} userName={user.email || ''} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2">
                            <ProfitabilityPolarity heroes={polarity.heroes} villains={polarity.villains} />
                        </div>
                        <div className="xl:col-span-1 grid grid-cols-1 gap-8">
                            <DailyAutopsy data={autopsy} />
                            <GhostExpenseCard amount={diagnosis.financials.fees} />
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: ANALYTICS (NEW) */}
            {view === 'analytics' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {analyticsError ? (
                        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 mb-6 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2">
                                <TrendingDown size={20} />
                                Veri Yüklenemedi
                            </h3>
                            <p className="text-sm mt-2 font-medium">{analyticsError}</p>
                            <p className="text-xs mt-4 opacity-75">Lütfen "Analizi Yenile" butonunu kullanarak verilerinizi güncellemeyi deneyin veya destek ekibiyle iletişime geçin.</p>
                            <div className="mt-4">
                                <DeepScanTrigger autoTrigger={false} />
                            </div>
                        </div>
                    ) : analyticsData ? (
                        <>
                            <div className="flex justify-end mb-4 md:hidden">
                                <DeepScanTrigger autoTrigger={syncStart} />
                            </div>
                            <AnalyticsDashboard
                                currency={analyticsData.currency}
                                data={analyticsData}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                            <p className="text-gray-500 font-medium">Verileriniz analiz ediliyor...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
