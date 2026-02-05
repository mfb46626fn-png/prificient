import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PainEngine, PainDiagnosis, PainLevel } from '@/lib/scoring/pain-engine'
import DecisionDesk from '@/components/DecisionDesk'
import RiskGauge from '@/components/RiskGauge'
import ProfitabilityPolarity from '@/components/ProfitabilityPolarity'
import DailyAutopsy from '@/components/DailyAutopsy'
import Link from 'next/link'
import { LayoutDashboard, BarChart3, TrendingDown } from 'lucide-react'
import DeepScanTrigger from '@/components/DeepScanTrigger'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import GhostExpenseCard from '@/components/GhostExpenseCard'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'

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
        startDate.setFullYear(2020)
    }

    // Fetch REAL Analysis Data
    let analysis: any = null
    try {
        const filter = range === 'all' ? undefined : { start: startDate, end: now };
        analysis = await generateComprehensiveAnalysis(user.id, filter)
    } catch (e) {
        console.error("Dashboard Analysis Error", e)
    }

    // --- VIEW LOGIC ---

    // 1. Action Data (Diagnosis)
    let diagnosis: PainDiagnosis | null = null
    let polarity: { heroes: any[], villains: any[] } = { heroes: [], villains: [] }
    let autopsy = null

    if (view === 'action' && analysis) {
        // Map Analysis to Diagnosis
        // Simple heuristic scoring based on real metrics
        let scorePenalty = 0;
        const factors = {
            toxic_product_impact: 0,
            refund_bleed_impact: 0,
            roas_trap_impact: 0,
            cash_flow_impact: 0,
            silent_fee_impact: 0
        };

        // 1. Toxic Products
        if (analysis.dangerProducts.length > 0) {
            factors.toxic_product_impact = Math.min(analysis.dangerProducts.length * 10, 30);
            scorePenalty += factors.toxic_product_impact;
        }

        // 2. Refunds (> 10%)
        const gross = analysis.realProfit.grossRevenue || 1;
        const refundRate = (analysis.costBreakdown.refunds / gross) * 100;
        if (refundRate > 10) {
            factors.refund_bleed_impact = 20;
            scorePenalty += 20;
        }

        // 3. Cash Flow (Burn Rate)
        if (analysis.cashFlow.dailyBurnRate > 0) {
            factors.cash_flow_impact = 15;
            scorePenalty += 15;
        }

        const score = Math.max(0, 100 - scorePenalty);
        let level: PainLevel = 'safe';
        if (score < 60) level = 'critical';
        else if (score < 80) level = 'painful';
        else if (score < 95) level = 'unaware';

        diagnosis = {
            score,
            level,
            factors,
            opportunity_loss: analysis.opportunityCost.lostProfit / (analysis.overview.periodDays || 1), // Exact daily avg
            financials: {
                revenue: analysis.realProfit.grossRevenue,
                expenses: analysis.realProfit.totalCosts,
                profit: analysis.realProfit.netProfit,
                toxic_count: analysis.dangerProducts.length,
                fees: analysis.costBreakdown.platform_fees + analysis.costBreakdown.shipping + analysis.costBreakdown.tax
            }
        };

        polarity = {
            heroes: analysis.topProducts,
            villains: analysis.dangerProducts
        };

        // Autopsy: Use Average Daily Stats from Analysis
        const days = analysis.overview.periodDays || 1;

        autopsy = {
            grossRevenue: analysis.realProfit.grossRevenue / days,
            returns: analysis.costBreakdown.refunds / days,
            ads: 0, // No ads data yet
            cogsAndFees: (analysis.costBreakdown.cogs + analysis.costBreakdown.platform_fees + analysis.costBreakdown.shipping + analysis.costBreakdown.tax) / days,
            netPocket: analysis.realProfit.netProfit / days,
            date: new Date().toISOString()
        };
    }

    // 2. Analytics Data (Financial)
    let analyticsData = null
    let analyticsError = null
    let analysisCurrency = 'TRY'

    if (view === 'analytics') {
        if (!analysis) {
            analyticsError = "Veri analiz edilemedi veya henüz senkronize edilmedi.";
        } else {
            // Map Analysis to AnalyticsDashboard Data Structure
            analysisCurrency = analysis.currency || 'TRY'
            analyticsData = {
                kpi: {
                    revenue: analysis.realProfit.grossRevenue,
                    profit: analysis.realProfit.netProfit,
                    margin: analysis.realProfit.profitMargin,
                    cogs: analysis.costBreakdown.cogs,
                    ads: 0,
                    returns: analysis.costBreakdown.refunds
                },
                trend: analysis.monthlyTrends.map((t: any) => ({
                    date: t.month,
                    revenue: t.revenue,
                    profit: t.profit
                })),
                products: [...analysis.topProducts, ...analysis.dangerProducts].sort((a: any, b: any) => b.profit - a.profit)
            };
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
            {view === 'action' && (
                <>
                    {diagnosis ? (
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
                                <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                                    <DailyAutopsy data={autopsy} />
                                    <div className="h-full">
                                        <GhostExpenseCard amount={diagnosis.financials.fees} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                            <p className="text-gray-500 font-medium">Verileriniz analiz ediliyor...</p>
                        </div>
                    )}
                </>
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
                                currency={analysisCurrency}
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
