import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import { LedgerService } from '@/lib/ledger'
import { redirect } from 'next/navigation'
import FinancialAutopsy from '@/components/FinancialAutopsy'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Fetch Granular Ledger Data
    // We need: 600 (Revenue), 610 (Returns), 153/621 (COGS), 760 (Ads), 740/770 (Fees/Shipping)

    // Accounts Check
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

            // Revenue (600) - Credit is positive
            if (code === '600') {
                if (!isDebit) grossRevenue += amt
                else grossRevenue -= amt
            }
            // Returns (610) - Debit is positive for expense/return
            if (code === '610') isDebit ? returns += amt : returns -= amt

            // COGS (621 or 153 logic depending on how we track cost)
            // Assuming 621 is COGS Expense
            if (code === '621') isDebit ? cogs += amt : cogs -= amt

            // Ads (760)
            if (code === '760') isDebit ? ads += amt : ads -= amt

            // Fees (780 Finansman or 770 Genel)
            // Let's group 780 + 740 + 770 as "Fees" for simplicity unless mapped strictly
            if (['780', '740', '770'].includes(code)) isDebit ? fees += amt : fees -= amt

            // Shipping (Often 760 or specific 700 account. Let's assume part of 770 or separate if defined.)
            // For now, if no specific shipping code, we might leave it 0 or standard. 
            // Let's assume 300 orders x 50TL shipping if we don't have exact data, OR just map Fees covering it.
        })
    }

    const netProfit = grossRevenue - returns - cogs - ads - fees - shipping

    // 2. Prepare Waterfall Data
    const waterfall = [
        { name: 'Brüt Ciro', value: grossRevenue, fill: '#64748b' }, // slate-500
        { name: 'İadeler', value: -returns, fill: '#ef4444' }, // red-500
        { name: 'Ürün Maliyeti', value: -cogs, fill: '#f59e0b' }, // amber-500
        { name: 'Reklam', value: -ads, fill: '#3b82f6' }, // blue-500
        { name: 'Giderler', value: -fees, fill: '#a855f7' }, // purple-500
        { name: 'NET KÂR', value: netProfit, fill: netProfit >= 0 ? '#10b981' : '#dc2626' }, // emerald or red
    ]

    // 3. Prepare Trend Data (Mock for Skeleton/MVP if no daily data yet)
    // Real data would aggregate by date. For now, creating a realistic curve based on aggregates.
    const trend = Array.from({ length: 30 }).map((_, i) => ({
        date: `Gün ${i + 1}`,
        revenue: Math.floor(grossRevenue / 30 * (0.8 + Math.random() * 0.4)),
        profit: Math.floor(netProfit / 30 * (0.8 + Math.random() * 0.4))
    }))

    // 4. Unit Economics (Derived from aggregates / order count)
    // Assume Average Order Value ~1500TL if no count available
    const estimatedOrders = Math.max(1, Math.round(grossRevenue / 1500))
    const unitEconomics = {
        averageOrderValue: Math.round(grossRevenue / estimatedOrders),
        cogs: Math.round(cogs / estimatedOrders),
        ads: Math.round(ads / estimatedOrders),
        shipping: Math.round(shipping / estimatedOrders),
        fees: Math.round(fees / estimatedOrders),
        net: Math.round(netProfit / estimatedOrders)
    }

    // 5. Expense Treemap
    const expensesMap = [
        { name: 'İadeler', size: returns, fill: '#ef4444' },
        { name: 'Maliyet (COGS)', size: cogs, fill: '#f59e0b' },
        { name: 'Reklam', size: ads, fill: '#3b82f6' },
        { name: 'Komisyon & Hizmet', size: fees, fill: '#a855f7' }
    ].filter(e => e.size > 0)

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
