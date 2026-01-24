import { createClient } from '@/utils/supabase/server'; // Or client? This runs on server (Cron or API)
import { LedgerService } from '@/lib/ledger';

export const BenchmarkEngine = {

    // 1. Calculate Daily Stats for a User
    // Usually called daily via Cron or on-demand
    async calculateUserStats(userId: string, date: Date) {
        // We define "Day" as Start 00:00 to End 23:59
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Get Financials for that Day
        const dayStats = await LedgerService.getWeeklyFinancials(userId, startOfDay, endOfDay);
        // dayStats returns { revenue (Sales-Returns), expense, netProfit... }

        const revenue = dayStats.revenue;
        const netProfit = dayStats.netProfit;
        // Margin
        const profitMargin = revenue > 0 ? (netProfit / revenue) : 0;

        // Refund Rate? 
        // LedgerService doesn't explicitly return Refund Amount in summary. 
        // We might need to query Ledger for Account 610.
        const supabase = await createClient();
        const { data: refundEntries } = await supabase.from('ledger_entries')
            .select('amount')
            .eq('user_id', userId)
            .eq('account_code_id', (await getAccountId(supabase, '610'))) // Need to find ID or join.
            // Simplified: Join account code.
            .gte('transaction_date', startOfDay.toISOString())
            .lte('transaction_date', endOfDay.toISOString());

        // Wait, 'getWeeklyFinancials' abstraction is good but might hide details.
        // Let's implement a lighter "getMetric" helper or just query ledger raw for efficiency.
        /*
           For MVP efficiency:
           Let's rely on stored stats or simple queries.
        */

        // --- COHORT DETERMINATION (Last 30 Days Revenue) ---
        const thirtyDaysAgo = new Date(date);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthStats = await LedgerService.getWeeklyFinancials(userId, thirtyDaysAgo, endOfDay);
        const monthlyRevenue = monthStats.revenue;

        let cohort = '0-10k';
        if (monthlyRevenue > 200000) cohort = '200k+';
        else if (monthlyRevenue > 50000) cohort = '50k-200k';
        else if (monthlyRevenue > 10000) cohort = '10k-50k';

        // Insert/Update Daily Stats
        const { error } = await supabase.from('merchant_daily_stats').upsert({
            user_id: userId,
            date: startOfDay.toISOString().split('T')[0], // YYYY-MM-DD
            revenue: revenue,
            net_profit: netProfit,
            profit_margin: profitMargin,
            refund_rate: 0, // Pending implementation of Refund ID lookup
            cohort_tag: cohort,
            ad_spend_ratio: 0 // Pending Marketing integration
        }, { onConflict: 'user_id, date' });

        if (error) console.error('Error saving stats:', error);
    },

    // 2. Aggregate Global Benchmarks
    // Calculates p10, p50, p90 for each cohort for a specific date
    async updateGlobalBenchmarks(date: Date) {
        const supabase = await createClient();
        const dateStr = date.toISOString().split('T')[0];

        // Fetch all stats for that day
        const { data: stats } = await supabase
            .from('merchant_daily_stats')
            .select('*')
            .eq('date', dateStr);

        if (!stats || stats.length === 0) return;

        // Group by Cohort
        const cohorts = ['0-10k', '10k-50k', '50k-200k', '200k+'];
        const metrics = ['profit_margin', 'net_profit', 'revenue']; // Add refund_rate later

        for (const cohort of cohorts) {
            const cohortStats = stats.filter(s => s.cohort_tag === cohort);
            if (cohortStats.length < 3) continue; // Need minimum data for privacy/stat sig

            for (const metric of metrics) {
                // Extract values and Sort
                const values = cohortStats.map(s => Number(s[metric])).sort((a, b) => a - b);

                const p10 = getValueAtPercentile(values, 10);
                const p25 = getValueAtPercentile(values, 25);
                const p50 = getValueAtPercentile(values, 50);
                const p75 = getValueAtPercentile(values, 75);
                const p90 = getValueAtPercentile(values, 90);

                // Save Benchmarks
                await supabase.from('global_benchmarks').upsert({
                    date: dateStr,
                    cohort_tag: cohort,
                    metric_name: metric,
                    p10, p25, p50, p75, p90
                }, { onConflict: 'date, cohort_tag, metric_name' });
            }
        }
    },

    // 3. Get User Standing (AI Tool Helper)
    async getUserStanding(userId: string, metric: string = 'profit_margin') {
        const supabase = await createClient();
        // Get User's Latest Stat
        const { data: userStat } = await supabase
            .from('merchant_daily_stats')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (!userStat) return null;

        // Get Benchmark for that Cohort (Latest available)
        const { data: benchmark } = await supabase
            .from('global_benchmarks')
            .select('*')
            .eq('cohort_tag', userStat.cohort_tag)
            .eq('metric_name', metric)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (!benchmark) return { userValue: userStat[metric], cohort: userStat.cohort_tag, percentile: 'Unknown' };

        const val = Number(userStat[metric]);

        // Determine Percentile Bracket
        let percentile = 0;
        if (val >= benchmark.p90) percentile = 95; // Top 10%
        else if (val >= benchmark.p75) percentile = 80;
        else if (val >= benchmark.p50) percentile = 60;
        else if (val >= benchmark.p25) percentile = 40;
        else if (val >= benchmark.p10) percentile = 20;
        else percentile = 5;

        return {
            user_value: val,
            cohort: userStat.cohort_tag,
            percentile_rank: percentile,
            benchmark_median: benchmark.p50,
            benchmark_top10: benchmark.p90
        };
    }
};

// Helper
function getValueAtPercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

// Helper for Account ID lookup (memoize in real app)
async function getAccountId(supabase: any, code: string) {
    const { data } = await supabase.from('ledger_accounts').select('id').eq('code', code).single();
    return data?.id;
}
