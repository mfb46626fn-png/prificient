import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use Admin Client for Deletions to bypass any RLS strictness
        const supabaseAdmin = createAdminClient();

        // 1. Get the integration
        const { data: integration, error: fetchError } = await supabaseAdmin
            .from('integrations')
            .select('id, shop_domain')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .maybeSingle()

        if (fetchError) {
            console.error('Fetch Integration Error:', fetchError)
            return NextResponse.json({ error: 'Bağlantı bilgisi alınamadı' }, { status: 500 })
        }

        if (!integration) {
            return NextResponse.json({ error: 'Aktif Shopify bağlantısı bulunamadı' }, { status: 404 })
        }

        console.log(`[Disconnect] Disconnecting store ${integration.shop_domain} for user ${user.id}`);

        // 2. Find all related Event IDs FIRST (before deleting them)
        const { data: events } = await supabaseAdmin
            .from('financial_event_log')
            .select('event_id')
            .eq('user_id', user.id)
            .in('stream_type', ['shopify_history_scan', 'shopify_webhook', 'debug_simulation', 'debug_test']); // Added debug types too

        const eventIds = events?.map(e => e.event_id) || [];
        console.log(`[Disconnect] Found ${eventIds.length} events to clean up.`);

        if (eventIds.length > 0) {
            // 3. Delete Ledger Transactions (Entries usually cascade delete on transaction delete, but let's be safe)
            // Find transactions linked to these events
            const { data: txs } = await supabaseAdmin
                .from('ledger_transactions')
                .select('id')
                .in('event_id', eventIds);

            const txIds = txs?.map(t => t.id) || [];

            if (txIds.length > 0) {
                // Delete entries first
                await supabaseAdmin.from('ledger_entries').delete().in('transaction_id', txIds);
                // Delete transactions
                await supabaseAdmin.from('ledger_transactions').delete().in('id', txIds);
                console.log(`[Disconnect] Deleted ${txIds.length} transactions and their entries.`);
            }

            // 4. Delete Events
            await supabaseAdmin.from('financial_event_log').delete().in('event_id', eventIds);
            console.log(`[Disconnect] Deleted ${eventIds.length} event logs.`);
        }

        // 5. Delete the integration record
        const { error: deleteError } = await supabaseAdmin
            .from('integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('platform', 'shopify')

        if (deleteError) {
            console.error('Delete Integration Error:', deleteError)
            return NextResponse.json({ error: 'Bağlantı iptal edilemedi' }, { status: 500 })
        }

        console.log(`[Shopify Disconnect] Complete.`)

        return NextResponse.json({
            success: true,
            message: 'Shopify bağlantısı ve tüm geçmiş veriler başarıyla silindi.'
        })

    } catch (error: any) {
        console.error('Shopify Disconnect Error:', error)
        return NextResponse.json({ error: error.message || 'Bir hata oluştu' }, { status: 500 })
    }
}
