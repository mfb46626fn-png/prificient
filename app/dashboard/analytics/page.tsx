import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import { redirect } from 'next/navigation'
import FinancialAutopsy from '@/components/FinancialAutopsy'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch real analysis data
    const analysis = await generateComprehensiveAnalysis(user.id);
    const report = analysis.costBreakdown;
    const overview = analysis.overview;

    // 1. Prepare Waterfall Data
    const grossRevenue = analysis.realProfit.grossRevenue;
    const netProfit = analysis.realProfit.netProfit;

    // Waterfall: Revenue -> -Refunds -> -COGS -> -Ads -> -Fees -> Result
    // Note: analysis.costBreakdown.revenue is Net Revenue (Gross - Refunds in some contexts), 
    // let's stick to realProfit struct for consistency
    const waterfall = [
        { name: 'Brüt Ciro', value: grossRevenue, fill: '#64748b' }, // slate-500
        { name: 'İadeler', value: -report.refunds, fill: '#ef4444' }, // red-500
        { name: 'Ürün Maliyeti', value: -report.cogs, fill: '#f59e0b' }, // amber-500
        { name: 'Vergi', value: -report.tax, fill: '#ef4444' }, // red-500 (added tax)
        { name: 'Kargo', value: -report.shipping, fill: '#a855f7' }, // purple-500 (added shipping)
        { name: 'Komisyon', value: -report.platform_fees, fill: '#3b82f6' }, // blue-500
        { name: 'NET KÂR', value: netProfit, fill: netProfit >= 0 ? '#10b981' : '#dc2626' }, // emerald or red
    ]

    // 2. Prepare Trend Data
    // Use analysis.monthlyTrends
    const trend = analysis.monthlyTrends.map(t => ({
        date: t.month, // YYYY-MM format
        revenue: t.revenue,
        profit: t.profit
    }));

    // If no trends, provide empty or minimal
    if (trend.length === 0) {
        trend.push({ date: 'Veri Yok', revenue: 0, profit: 0 });
    }

    // 3. Unit Economics
    const totalOrders = overview.totalOrders || 1;
    const unitEconomics = {
        averageOrderValue: Math.round(grossRevenue / totalOrders),
        cogs: Math.round(report.cogs / totalOrders),
        ads: 0, // Currently no Ads data in comprehensive analysis, set 0
        shipping: Math.round(report.shipping / totalOrders),
        fees: Math.round(report.platform_fees / totalOrders),
        net: Math.round(netProfit / totalOrders)
    }

    // 4. Expense Treemap
    const expensesMap = [
        { name: 'İadeler', size: report.refunds, fill: '#ef4444' },
        { name: 'Maliyet (COGS)', size: report.cogs, fill: '#f59e0b' },
        { name: 'Vergi', size: report.tax, fill: '#ef4444' },
        { name: 'Kargo', size: report.shipping, fill: '#a855f7' },
        { name: 'Komisyon', size: report.platform_fees, fill: '#3b82f6' }
    ].filter(e => e.size > 0);

    const financialData = {
        waterfall,
        trend,
        unitEconomics,
        expenses: expensesMap
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <FinancialAutopsy data={financialData} />
        </div>
    )
}
