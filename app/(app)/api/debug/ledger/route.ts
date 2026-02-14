import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createAdminClient();
        const userId = user.id;

        // 1. Count financial_event_log entries
        const { count: eventCount } = await supabaseAdmin
            .from('financial_event_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // 2. Get event types breakdown
        const { data: events } = await supabaseAdmin
            .from('financial_event_log')
            .select('event_type')
            .eq('user_id', userId);

        const eventTypes: Record<string, number> = {};
        events?.forEach(e => {
            eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
        });

        // 3. Count ledger_transactions
        const { count: txCount } = await supabaseAdmin
            .from('ledger_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // 4. Get ledger entries by account
        const { data: entries } = await supabaseAdmin
            .from('ledger_entries')
            .select(`
                amount,
                account:ledger_accounts!inner(code, name)
            `)
            .eq('user_id', userId);

        const accountTotals: Record<string, number> = {};
        entries?.forEach((e: any) => {
            const key = `${e.account.code} - ${e.account.name}`;
            accountTotals[key] = (accountTotals[key] || 0) + Number(e.amount);
        });

        // 5. Calculate what diagnosis shows (revenue from code 600)
        let totalRevenue = 0;
        let totalCogs = 0;
        let lineItemCount = 0;

        entries?.forEach((e: any) => {
            const code = e.account.code;
            const amt = Number(e.amount);
            if (code === '600') {
                totalRevenue += amt;
                lineItemCount++;
            }
            if (code === '621') {
                totalCogs += amt;
            }
        });

        // 6. Date range
        const { data: oldest } = await supabaseAdmin
            .from('ledger_transactions')
            .select('transaction_date')
            .eq('user_id', userId)
            .order('transaction_date', { ascending: true })
            .limit(1);

        const { data: newest } = await supabaseAdmin
            .from('ledger_transactions')
            .select('transaction_date')
            .eq('user_id', userId)
            .order('transaction_date', { ascending: false })
            .limit(1);

        // 7. Check integration sync status
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('sync_status, total_orders_to_sync, sync_progress, updated_at')
            .eq('user_id', userId)
            .eq('platform', 'shopify')
            .single();

        return NextResponse.json({
            summary: {
                eventLogCount: eventCount,
                transactionCount: txCount,
                lineItemCount: lineItemCount,
                totalRevenue: totalRevenue,
                totalCogs: totalCogs,
                netProfit: totalRevenue - totalCogs
            },
            eventTypes,
            accountTotals,
            dateRange: {
                oldest: oldest?.[0]?.transaction_date,
                newest: newest?.[0]?.transaction_date
            },
            syncStatus: integration
        });

    } catch (error: any) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
