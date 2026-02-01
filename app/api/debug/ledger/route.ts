import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Fetch ledger_transactions for today
        const { data: transactions, error: txError } = await supabase
            .from('ledger_transactions')
            .select('*')
            .eq('user_id', user.id)
            .gte('transaction_date', startOfDay.toISOString())
            .lte('transaction_date', endOfDay.toISOString())
            .limit(20);

        // Fetch all transactions (last 10)
        const { data: allTransactions } = await supabase
            .from('ledger_transactions')
            .select('id, description, transaction_date')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        // Fetch ledger_entries count
        const { count: entryCount } = await supabase
            .from('ledger_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Fetch accounts
        const { data: accounts } = await supabase
            .from('ledger_accounts')
            .select('code, name')
            .eq('user_id', user.id);

        return NextResponse.json({
            user_id: user.id,
            today_range: {
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString()
            },
            today_transactions: transactions || [],
            today_tx_count: transactions?.length || 0,
            all_recent_transactions: allTransactions || [],
            total_entry_count: entryCount || 0,
            accounts: accounts || [],
            tx_error: txError?.message || null
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
