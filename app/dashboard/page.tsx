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
import { LayoutDashboard, BarChart3, TrendingDown, Users, Activity } from 'lucide-react'
import DashboardClient from '@/components/DashboardClient'
import { BenchmarkEngine } from '@/lib/benchmarks'
import GhostExpenseCard from '@/components/GhostExpenseCard'
import FinancialAutopsy from '@/components/FinancialAutopsy'
import DeepScanTrigger from '@/components/DeepScanTrigger'

// Reusing Analytics Fetch Logic for the "Analytics" Tab


// Helper to Fetch Financial Autopsy Data
// Helper to Fetch Financial Autopsy Data (Updated with Date Filter)
async function getFinancialData(user: any, supabase: any, startDate: string, endDate: string) {
    await LedgerService.initializeAccounts(user.id, supabase)

    let grossRevenue = 0
    let returns = 0
    let cogs = 0
    let ads = 0
    let fees = 0
    let shipping = 0

    // Fetch entries with date filter via transaction join
    const { data: entries } = await supabase
        .from('ledger_entries')
        .select(`
            amount, direction, account:ledger_accounts!inner(code),
            transaction:ledger_transactions!inner(created_at)
        `)
        .eq('user_id', user.id)
        .gte('transaction.created_at', startDate)
        .lte('transaction.created_at', endDate)

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
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

    return {
        grossRevenue,
        netProfit,
        margin,
        cogs,
        ads,
        returns,
        fees
    }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const view = (params.view as string) || 'overview' // Default to new Clean Overview

    // Date Filtering
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const fromParam = params.from as string
    const toParam = params.to as string

    const startDate = fromParam ? new Date(fromParam).toISOString() : startOfMonth.toISOString()
    const endDate = toParam ? new Date(toParam).toISOString() : now.toISOString()

    // Fetch User Currency Preference
    const currency = user.user_metadata?.currency || 'TRY'
    const currencyFormat = user.user_metadata?.currency_format || '{{amount}} TL'

    // Fetch Financial Data
    const financials = await getFinancialData(user, supabase, startDate, endDate)

    // Fetch Product Performance (Mock for now, or real if we had products table)
    // For MVP, we'll use Polarity data if 'overview' is selected, but polarity is complex.
    // Let's create a simple product list from Polarity's getProductsByProfitability logic if possible,
    // Or just show placeholders until we implement full product analytics.
    // Actually, let's use the existing ProductAnalysis engine but simplified.
    let topProducts: any[] = []
    if (view === 'overview') {
        const polarity = await ProductAnalysis.getProductsByProfitability(user.id)
        // Merge and sort by profit (ensure property access is safe)
        const allProducts = [...polarity.heroes, ...polarity.villains]
        topProducts = allProducts.sort((a: any, b: any) => {
            const profitA = a.net_profit || a.profit || 0
            const profitB = b.net_profit || b.profit || 0
            return profitB - profitA
        }).slice(0, 5)
    }

    // --- OLD DATA FETCHING (Conditional) ---
    let diagnosis, polarity, autopsy
    if (view === 'advanced') {
        diagnosis = await PainEngine.diagnose(user.id)
        const rawPolarity = await ProductAnalysis.getProductsByProfitability(user.id)

        // Fix types for Polarity Component (title?: string -> title: string)
        polarity = {
            heroes: rawPolarity.heroes.map((h: any) => ({ ...h, title: h.title || 'Bilinmeyen Ürün' })),
            villains: rawPolarity.villains.map((v: any) => ({ ...v, title: v.title || 'Bilinmeyen Ürün' }))
        }

        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        autopsy = await LedgerService.getDailyAutopsy(user.id, yesterday)
    }

    return (
        <div className="space-y-8 pb-20">
            {/* TABS */}
            <div className="w-full flex justify-center mb-8">
                <div className="bg-white p-1 rounded-2xl inline-flex shadow-sm border border-gray-100">
                    <Link
                        href="/dashboard?view=overview"
                        scroll={false}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${view === 'overview' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        <LayoutDashboard size={18} /> Genel Bakış
                    </Link>
                    <Link
                        href="/dashboard?view=advanced"
                        scroll={false}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${view === 'advanced' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        <BarChart3 size={18} /> Detaylı Analiz
                    </Link>
                </div>
            </div>

            {/* DATE FILTER & SYNC TRIGGER (Always Visible) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500">Tarih Aralığı:</span>
                    <div className="flex gap-2">
                        {/* Simple Date Presets using Links */}
                        <Link href={`/dashboard?view=${view}&from=${new Date(Date.now() - 7 * 86400000).toISOString()}&to=${now.toISOString()}`} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium hover:bg-gray-100">Son 7 Gün</Link>
                        <Link href={`/dashboard?view=${view}&from=${new Date(Date.now() - 30 * 86400000).toISOString()}&to=${now.toISOString()}`} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium hover:bg-gray-100">Son 30 Gün</Link>
                        <Link href={`/dashboard?view=${view}&from=${startOfMonth.toISOString()}&to=${now.toISOString()}`} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium hover:bg-gray-100">Bu Ay</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-mono">Para Birimi: {currency}</span>
                    <DeepScanTrigger autoTrigger={params['sync_start'] === 'true'} />
                </div>
            </div>

            {/* VIEW: OVERVIEW (NEW SIMPLIFIED DASHBOARD) */}
            {view === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Toplam Ciro" value={financials.grossRevenue} currency={currency} icon={BarChart3} color="blue" />
                        <KPICard title="Net Kâr" value={financials.netProfit} currency={currency} icon={TrendingDown} color={financials.netProfit >= 0 ? "emerald" : "red"} />
                        <KPICard title="Kâr Marjı" value={financials.margin} percent icon={Activity} color="indigo" />
                        <KPICard title="Reklam Harcaması" value={financials.ads} currency={currency} icon={Users} color="purple" />
                    </div>

                    {/* CHARTS (Simplify Financial Autopsy Logic here or Reuse) */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Kâr & Zarar Dağılımı</h3>
                        {/* We can reuse FinancialAutopsy or simpler chart here. For now simpler text visualization */}
                        <div className="flex flex-col gap-4">
                            <ProgressBar label="Ürün Maliyeti" value={financials.cogs} total={financials.grossRevenue} color="bg-orange-400" currency={currency} />
                            <ProgressBar label="Reklam" value={financials.ads} total={financials.grossRevenue} color="bg-blue-400" currency={currency} />
                            <ProgressBar label="Operasyon & İade" value={financials.fees + financials.returns} total={financials.grossRevenue} color="bg-purple-400" currency={currency} />
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-600">Net Kalan</span>
                                <span className={`font-bold text-xl ${financials.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(financials.netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TOP PRODUCTS */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Ürün Performansı (Tahmini)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-gray-400 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="pb-3">Ürün</th>
                                        <th className="pb-3 text-right">Adet</th>
                                        <th className="pb-3 text-right">Ciro</th>
                                        <th className="pb-3 text-right">Kâr</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topProducts.map((p: any, i: number) => (
                                        <tr key={i} className="group hover:bg-gray-50">
                                            <td className="py-3 font-medium text-gray-700">{p.title}</td>
                                            <td className="py-3 text-right text-gray-500">{p.sold}</td>
                                            <td className="py-3 text-right text-gray-600 font-mono">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(p.revenue)}
                                            </td>
                                            <td className="py-3 text-right font-bold font-mono text-emerald-600">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(p.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">Veri bulunamadı.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: ADVANCED (OLD UI) */}
            {view === 'advanced' && diagnosis && polarity && autopsy && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <RiskGauge score={diagnosis.score} level={diagnosis.level} context="Detaylı analiz görünümü." />
                    <DecisionDesk diagnosis={diagnosis} userName={user.email || ''} />
                    <ProfitabilityPolarity heroes={polarity.heroes} villains={polarity.villains} />
                    <DailyAutopsy data={autopsy} />
                </div>
            )}

        </div>
    )
}

// --- MICRO COMPONENTS ---
function KPICard({ title, value, currency, percent, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:border-gray-200 transition-colors">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</span>
                <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                    <Icon size={16} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                    {percent
                        ? `%${value.toFixed(1)}`
                        : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(value)
                    }
                </div>
            </div>
        </div>
    )
}

function ProgressBar({ label, value, total, color, currency }: any) {
    const pct = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="text-gray-900 font-mono">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(value)}
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    )
}
