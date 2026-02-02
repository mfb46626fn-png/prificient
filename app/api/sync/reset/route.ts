import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createAdminClient();
        const userId = user.id;

        console.log(`[Sync Reset] Starting data reset for user: ${userId}`);

        // 1. Delete ledger_entries (references ledger_transactions)
        const { error: entriesError } = await supabaseAdmin
            .from('ledger_entries')
            .delete()
            .eq('user_id', userId);

        if (entriesError) {
            console.error('[Sync Reset] Error deleting ledger_entries:', entriesError);
        }

        // 2. Delete ledger_transactions
        const { error: txError } = await supabaseAdmin
            .from('ledger_transactions')
            .delete()
            .eq('user_id', userId);

        if (txError) {
            console.error('[Sync Reset] Error deleting ledger_transactions:', txError);
        }

        // 3. Delete financial_event_log
        const { error: eventError } = await supabaseAdmin
            .from('financial_event_log')
            .delete()
            .eq('user_id', userId);

        if (eventError) {
            console.error('[Sync Reset] Error deleting financial_event_log:', eventError);
        }

        // 4. Reset integration sync status and cursor
        const { error: integrationError } = await supabaseAdmin
            .from('integrations')
            .update({
                sync_status: 'pending',
                sync_progress: 0,
                last_cursor: null,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('platform', 'shopify');

        if (integrationError) {
            console.error('[Sync Reset] Error resetting integration:', integrationError);
        }

        // 5. Delete ledger_accounts to force re-initialization
        const { error: accountsError } = await supabaseAdmin
            .from('ledger_accounts')
            .delete()
            .eq('user_id', userId);

        if (accountsError) {
            console.error('[Sync Reset] Error deleting ledger_accounts:', accountsError);
        }

        console.log(`[Sync Reset] Reset complete for user: ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'All financial data has been reset. You can now start a fresh sync.'
        });

    } catch (error: any) {
        console.error('[Sync Reset] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
